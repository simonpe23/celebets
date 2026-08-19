import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/connectCrypto";
import {
  KalshiError,
  kalshiGetAll,
  kalshiMarket,
  kalshiMarketsBatch,
  kalshiOpenTickers,
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

// A sync walks several Kalshi lists and a market per ticker; give it
// room on deployments that allow more than the default.
export const maxDuration = 60;

// Opening the app more often than this does not re-ask Kalshi.
// Manual presses of Sync now always go through.
const AUTO_THROTTLE_MS = 3 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { history, auto } = await request
    .json()
    .catch(() => ({ history: false, auto: false }));

  const { data: conn } = await supabase
    .from("connected_accounts")
    .select("access_key, encrypted_secret, connected_at, last_synced_at")
    .eq("platform", "kalshi")
    .maybeSingle();
  if (!conn)
    return NextResponse.json(
      { error: "Kalshi is not connected." },
      { status: 404 }
    );

  // The automatic sync on app open is throttled HERE, on the server,
  // so three open tabs cannot triple-ask Kalshi. A skipped auto sync
  // is a success with nothing in it, never an error.
  if (
    auto === true &&
    conn.last_synced_at &&
    Date.now() - new Date(conn.last_synced_at).getTime() < AUTO_THROTTLE_MS
  ) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      imported: 0,
      updated: 0,
      pending: 0,
      total: 0,
    });
  }

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
    // 1. EVERY fill, once. The old shape fetched a recent window and
    // then re-fetched fills one market at a time, which forced a cap
    // of 60 markets per sync, and the owner's full-history import
    // silently stopped at 59 bets out of hundreds. One paginated walk
    // brings the whole trade history in a handful of requests (200 a
    // page), and the grouping happens here instead of on Kalshi.
    const allFills = await kalshiGetAll<KalshiFill>(
      key,
      pem,
      "/portfolio/fills",
      "fills",
      {},
      undefined,
      60 // pages: room for 12,000 fills before truncation
    );

    // 2. Which markets are in scope: everything with activity since
    // the line, PLUS every currently open position. An open position
    // is live money and belongs to the record even when all its fills
    // predate the connect date, the same ruling as the app's own
    // fresh start line. A full-history import takes everything.
    const inScope = new Set(
      line
        ? [
            ...allFills
              .filter((f) => f.created_time >= line)
              .map((f) => f.ticker),
            ...(await kalshiOpenTickers(key, pem)),
          ]
        : allFills.map((f) => f.ticker)
    );
    // Fills of out-of-scope markets must not leak into the
    // translation, or the fresh start line would mean nothing.
    const fills = allFills.filter((f) => inScope.has(f.ticker));

    // 3. The markets themselves, batched: titles, results, and which
    // ones are parlays. A parlay's legs may be missing from the batch
    // shape, so those markets get one follow-up call each, and their
    // leg markets are fetched in small parallel groups for their own
    // titles and results.
    const meta = new Map<string, KalshiMarketMeta>();
    for (const m of await kalshiMarketsBatch(key, pem, [...inScope])) {
      meta.set(m.ticker, m);
    }

    const needLegs: string[] = [];
    for (const ticker of inScope) {
      const m = meta.get(ticker);
      const looksMve = ticker.toUpperCase().includes("MVE");
      if ((looksMve || !m) && !m?.mveLegs) needLegs.push(ticker);
    }
    for (let i = 0; i < needLegs.length; i += 8) {
      const chunk = needLegs.slice(i, i + 8);
      const found = await Promise.all(
        chunk.map((t) => kalshiMarket(key, pem, t))
      );
      for (const m of found) if (m) meta.set(m.ticker, m);
    }

    const legTickers = [
      ...new Set(
        [...meta.values()]
          .flatMap((m) => m.mveLegs ?? [])
          .map((l) => l.market_ticker)
      ),
    ].filter((t) => !meta.has(t));
    for (const m of await kalshiMarketsBatch(key, pem, legTickers)) {
      meta.set(m.ticker, m);
    }

    const settlements = (
      await kalshiGetAll<KalshiSettlement>(
        key,
        pem,
        "/portfolio/settlements",
        "settlements",
        {},
        undefined,
        60
      )
    ).filter((s) => inScope.has(s.ticker));

    // 4. Translate.
    const drafts = deriveBets(fills, settlements, meta);

    // 5. Reconcile: replace what changed, leave what did not.
    const { data: existing } = await supabase
      .from("bets")
      .select("id, external_id, status, stake, payout, legs (result)")
      .in(
        "external_id",
        drafts.map((d) => d.externalId)
      );
    const byExternal = new Map(
      (existing ?? []).map((b) => [b.external_id as string, b])
    );

    let imported = 0;
    let updated = 0;
    const toWrite: typeof drafts = [];
    const toDelete: string[] = [];
    for (const draft of drafts) {
      const old = byExternal.get(draft.externalId);
      if (old) {
        // A bet with no picks is damaged, whatever its numbers say:
        // it has no sport and no description. Always replace it. And
        // a parlay's leg RESULTS can change while the bet's own
        // numbers stand still (one game decides, the combo rides on),
        // so the legs are part of what "unchanged" means.
        const oldLegs = ((old.legs ?? []) as { result: string }[])
          .map((l) => l.result)
          .sort()
          .join(",");
        const newLegs = draft.legs
          .map((l) => l.result)
          .sort()
          .join(",");
        const same =
          oldLegs === newLegs &&
          draft.legs.length === ((old.legs ?? []) as unknown[]).length &&
          old.status === draft.status &&
          Number(old.stake) === draft.stake &&
          Number(old.payout ?? 0) === Number(draft.payout ?? 0);
        if (same) continue;
        toDelete.push(old.id as string);
        updated++;
      } else {
        imported++;
      }
      toWrite.push(draft);
    }

    // 6. Write in bulk: one delete, one insert per table. The old
    // per-bet loop was three round trips per bet, which on a full
    // history import of hundreds of bets would outlive the request.
    if (toDelete.length > 0) {
      await supabase.from("bets").delete().in("id", toDelete);
    }

    if (toWrite.length > 0) {
      const { data: insertedBets, error: betError } = await supabase
        .from("bets")
        .insert(
          toWrite.map((draft) => ({
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
          }))
        )
        .select("id, external_id");
      if (betError || !insertedBets) {
        return NextResponse.json(
          { error: `Could not save the bets: ${betError?.message}` },
          { status: 500 }
        );
      }
      const idByExternal = new Map(
        insertedBets.map((b) => [b.external_id as string, b.id as string])
      );

      // Bets and their picks have to arrive together. Postgres gives
      // no transaction across these calls, so a failed pick insert
      // takes every bet of this run with it: a headless bet is worse
      // than no bet, and one reached the owner's Track page reading
      // "0 legs".
      //
      // A single's leg carries the bet's odds; a parlay's legs carry
      // none, because Kalshi prices the combo, not the picks, the
      // same as a manual parlay without a Chance %.
      const legRows = toWrite.flatMap((draft) =>
        draft.legs.map((leg) => ({
          bet_id: idByExternal.get(draft.externalId),
          sport: leg.sport,
          description: leg.description,
          odds: draft.legs.length === 1 ? draft.totalOdds : null,
          result: leg.result,
        }))
      );
      const { error: legError } = await supabase.from("legs").insert(legRows);
      if (legError) {
        await supabase
          .from("bets")
          .delete()
          .in("id", [...idByExternal.values()]);
        return NextResponse.json(
          { error: `Could not save the picks: ${legError.message}` },
          { status: 500 }
        );
      }

      const buyRows = toWrite.flatMap((draft) =>
        draft.buys.map((b) => ({
          bet_id: idByExternal.get(draft.externalId),
          amount: b.amount,
          payout: b.payout,
          created_at: b.createdAt,
        }))
      );
      const { error: buyError } = await supabase
        .from("bet_buys")
        .insert(buyRows);
      if (buyError) {
        await supabase
          .from("bets")
          .delete()
          .in("id", [...idByExternal.values()]);
        return NextResponse.json(
          { error: `Could not save the buys: ${buyError.message}` },
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
