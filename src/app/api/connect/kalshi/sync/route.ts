import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/connectCrypto";
import {
  KalshiError,
  kalshiGetAll,
  kalshiMarket,
} from "@/lib/kalshi";
import {
  deriveBets,
  type KalshiFill,
  type KalshiSettlement,
  type KalshiMarketMeta,
} from "@/lib/kalshiSync";

// THE SYNC. Reads the user's Kalshi activity, translates it with
// kalshiSync.ts, and makes the bets table match: new markets become
// new bets, changed ones (a settlement, a sell, more buys) are
// replaced with their newly derived shape. Kalshi is the source of
// truth for a Kalshi bet, so re-deriving and replacing beats keeping
// bookkeeping about what changed; running it twice in a row changes
// nothing the second time.
//
// The fresh start rule (the owner's): only markets with activity
// since the day the account was connected come in. A position opened
// BEFORE that day but still open on it belongs to the record, the
// same ruling as the app's own fresh start line, so once a market
// qualifies, ALL its fills are fetched, even older ones, or its
// stake would be missing its early buys. { history: true } drops the
// date line entirely: the quiet full-history import.

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { history } = await request
    .json()
    .catch(() => ({ history: false }));

  const { data: conn } = await supabase
    .from("connected_accounts")
    .select("access_key, encrypted_secret, connected_at")
    .eq("platform", "kalshi")
    .maybeSingle();
  if (!conn)
    return NextResponse.json(
      { error: "Kalshi is not connected." },
      { status: 404 }
    );

  const key = conn.access_key;
  let pem: string;
  try {
    pem = decryptSecret(conn.encrypted_secret);
  } catch {
    return NextResponse.json(
      { error: "The stored key could not be unlocked. Reconnect Kalshi." },
      { status: 500 }
    );
  }

  const line = history === true ? null : (conn.connected_at as string);

  try {
    // 1. Recent fills decide WHICH markets are in scope.
    const recentFills = await kalshiGetAll<KalshiFill>(
      key,
      pem,
      "/portfolio/fills",
      "fills",
      {},
      line ? { field: "created_time", iso: line } : undefined
    );
    const inScope = new Set(
      recentFills
        .filter((f) => !line || f.created_time >= line)
        .map((f) => f.ticker)
    );

    // Guard against a first sync of a very heavy account.
    const tickers = [...inScope].slice(0, 60);

    // 2. For each market in scope, the FULL fill history, so a
    // position that started before the line still has its whole
    // stake. Plus settlements and titles.
    const fills: KalshiFill[] = [];
    const meta = new Map<string, KalshiMarketMeta>();
    for (const ticker of tickers) {
      const all = await kalshiGetAll<KalshiFill>(
        key,
        pem,
        "/portfolio/fills",
        "fills",
        { ticker }
      );
      fills.push(...all);
      const m = await kalshiMarket(key, pem, ticker);
      if (m) meta.set(ticker, m);
    }

    const settlements = (
      await kalshiGetAll<KalshiSettlement>(
        key,
        pem,
        "/portfolio/settlements",
        "settlements"
      )
    ).filter((s) => inScope.has(s.ticker));

    // 3. Translate.
    const drafts = deriveBets(fills, settlements, meta);

    // 4. Reconcile: replace what changed, leave what did not.
    const { data: existing } = await supabase
      .from("bets")
      .select("id, external_id, status, stake, payout")
      .in(
        "external_id",
        drafts.map((d) => d.externalId)
      );
    const byExternal = new Map(
      (existing ?? []).map((b) => [b.external_id as string, b])
    );

    let imported = 0;
    let updated = 0;
    for (const draft of drafts) {
      const old = byExternal.get(draft.externalId);
      if (old) {
        const same =
          old.status === draft.status &&
          Number(old.stake) === draft.stake &&
          Number(old.payout ?? 0) === Number(draft.payout ?? 0);
        if (same) continue;
        await supabase.from("bets").delete().eq("id", old.id);
        updated++;
      } else {
        imported++;
      }

      const { data: inserted, error: betError } = await supabase
        .from("bets")
        .insert({
          user_id: user.id,
          stake: draft.stake,
          total_odds: draft.totalOdds,
          status: draft.status,
          placed_at: draft.placedAt,
          settled_at: draft.settledAt,
          payout: draft.payout,
          cashed_out: draft.cashedOut,
          source: "kalshi",
          external_id: draft.externalId,
        })
        .select("id")
        .single();
      if (betError || !inserted) {
        return NextResponse.json(
          { error: `Could not save a bet: ${betError?.message}` },
          { status: 500 }
        );
      }

      const { error: legError } = await supabase.from("legs").insert({
        bet_id: inserted.id,
        sport: draft.sport,
        description: draft.description,
        odds: draft.totalOdds,
        result: draft.cashedOut ? "pending" : draft.status,
      });
      if (legError) {
        return NextResponse.json(
          { error: `Could not save a pick: ${legError.message}` },
          { status: 500 }
        );
      }

      const { error: buyError } = await supabase.from("bet_buys").insert(
        draft.buys.map((b) => ({
          bet_id: inserted.id,
          amount: b.amount,
          payout: b.payout,
          created_at: b.createdAt,
        }))
      );
      if (buyError) {
        return NextResponse.json(
          { error: `Could not save a buy: ${buyError.message}` },
          { status: 500 }
        );
      }
    }

    await supabase
      .from("connected_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("platform", "kalshi");

    return NextResponse.json({
      ok: true,
      imported,
      updated,
      pending: drafts.filter((d) => d.status === "pending").length,
      total: drafts.length,
    });
  } catch (e) {
    if (e instanceof KalshiError) {
      return NextResponse.json(
        {
          error:
            e.status === 401 || e.status === 403
              ? "Kalshi refused the stored key. Reconnect Kalshi."
              : `Kalshi could not be reached (${e.status}). Try again in a minute.`,
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong during the sync. Try again." },
      { status: 500 }
    );
  }
}
