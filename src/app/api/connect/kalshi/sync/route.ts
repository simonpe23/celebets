import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/connectCrypto";
import {
  KalshiError,
  kalshiGetAll,
  kalshiFillsBefore,
  kalshiGetPages,
  kalshiMarket,
  kalshiMarketsBatch,
  kalshiOpenTickers,
  kalshiSeriesBatch,
} from "@/lib/kalshi";
import {
  clampToStart,
  deriveBets,
  sportFor,
  subcategoryFor,
  type KalshiFill,
  type KalshiSettlement,
  type KalshiMarketMeta,
} from "@/lib/kalshiSync";
import { KALSHI_HISTORY_FROM_ISO } from "@/lib/sync";

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

// A sync walks several Kalshi lists and batched market lookups; give
// it all the room the plan allows, a heavy account's history round
// needs it.
export const maxDuration = 300;

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
    // 1. EVERY fill, once, walked newest first, 200 a page. The old
    // shape fetched fills one market at a time, which forced a cap of
    // 60 markets per sync and stopped the owner's history at 59 bets.
    //
    // A HISTORY IMPORT RUNS IN ROUNDS. A heavy account's history is
    // deeper than one request should chew (the owner's reached
    // 12,000 fills inside two months), so each round walks up to 60
    // pages, imports what it saw, and answers "more: true" when the
    // walk ran out of budget before reaching the beginning. The next
    // round continues BELOW the oldest bet already imported, using
    // Kalshi's own max_ts filter, and the client keeps asking until
    // the answer is done. If max_ts is ever ignored, the already
    // covered rows are dropped here, so a round can never import the
    // same slice twice.
    let boundIso: string | null = null;
    if (!line) {
      const { data: oldest } = await supabase
        .from("bets")
        .select("placed_at")
        .eq("source", "kalshi")
        .order("placed_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      boundIso = (oldest?.placed_at as string | undefined) ?? null;
    }

    let walked: KalshiFill[];
    let walkedToEnd: boolean;
    if (line) {
      const r = await kalshiGetPages<KalshiFill>(
        key,
        pem,
        "/portfolio/fills",
        "fills",
        {},
        { field: "created_time", iso: line },
        60
      );
      walked = r.rows;
      walkedToEnd = r.done;
    } else {
      const r = await kalshiFillsBefore(
        key,
        pem,
        boundIso
          ? Math.floor(new Date(boundIso).getTime() / 1000)
          : null,
        60,
        KALSHI_HISTORY_FROM_ISO
      );
      walked = r.rows as unknown as KalshiFill[];
      walkedToEnd = r.done;
    }
    // THE HISTORY PROMISE, ENFORCED. Four screens say a history
    // import reaches back to one date, so a history round keeps only
    // markets that STARTED on or after it. clampToStart works on
    // whole markets, never on single fills, or a market straddling
    // the date would import missing its earlier buys and show the
    // wrong stake. The fresh start path is untouched: its own line is
    // the connect date, which is later still, and an open position
    // still comes in at any age, which is what the connect screen
    // promises.
    const fillsPool = line
      ? [...walked]
      : clampToStart(
          boundIso
            ? walked.filter((f) => f.created_time < boundIso)
            : walked,
          KALSHI_HISTORY_FROM_ISO
        );
    // A round that saw fills older than the promise has reached the
    // bottom of what Actuals will ever import, so there is no "more".
    const hitStart = walked.some(
      (f) => f.created_time < KALSHI_HISTORY_FROM_ISO
    );
    const more = !line && !walkedToEnd && !hitStart && fillsPool.length > 0;

    // A market can SPAN the boundary between rounds: its newest buys
    // imported last round, its older buys only surfacing now. Its bet
    // would re-derive from half the money. Those few markets get
    // their complete fill history fetched directly.
    if (!line && boundIso && fillsPool.length > 0) {
      const roundTickers = [...new Set(fillsPool.map((f) => f.ticker))];
      const { data: spanRows } = await supabase
        .from("bets")
        .select("external_id")
        .eq("source", "kalshi")
        .in(
          "external_id",
          roundTickers.flatMap((t) => [`kalshi:${t}:yes`, `kalshi:${t}:no`])
        );
      const spanTickers = [
        ...new Set(
          (spanRows ?? []).map(
            (r) => (r.external_id as string).split(":")[1]
          )
        ),
      ];
      for (const t of spanTickers.slice(0, 30)) {
        const full = await kalshiGetAll<KalshiFill>(
          key,
          pem,
          "/portfolio/fills",
          "fills",
          { ticker: t },
          undefined,
          10
        );
        for (let i = fillsPool.length - 1; i >= 0; i--) {
          if (fillsPool[i].ticker === t) fillsPool.splice(i, 1);
        }
        // Its complete history can reveal that the market started
        // before the promised date after all, in which case it does
        // not belong to the record at any stake.
        fillsPool.push(...clampToStart(full, KALSHI_HISTORY_FROM_ISO));
      }
    }

    // 2. Which markets are in scope: everything with activity since
    // the line, PLUS every currently open position. An open position
    // is live money and belongs to the record even when all its fills
    // predate the connect date, the same ruling as the app's own
    // fresh start line. A full-history round takes everything it
    // walked.
    const inScope = new Set(
      line
        ? [
            ...fillsPool
              .filter((f) => f.created_time >= line)
              .map((f) => f.ticker),
            ...(await kalshiOpenTickers(key, pem)),
          ]
        : fillsPool.map((f) => f.ticker)
    );
    // Fills of out-of-scope markets must not leak into the
    // translation, or the fresh start line would mean nothing.
    const fills = fillsPool.filter((f) => inScope.has(f.ticker));

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

    // 3b. Kalshi's own taxonomy, one series per distinct ticker
    // prefix, LEG tickers included: a cross-category parlay's tennis
    // pick gets tennis, not the parent's category. This is what
    // names the sport (via the series tags) and the bet type (via
    // the series title).
    const seriesPrefixes = [
      ...new Set(
        [
          ...[...inScope],
          ...[...meta.values()].flatMap((m) =>
            (m.mveLegs ?? []).map((l) => l.market_ticker)
          ),
        ]
          .map((t) => t.split("-")[0]?.toUpperCase() ?? "")
          .filter(Boolean)
      ),
    ];
    const series = await kalshiSeriesBatch(key, pem, seriesPrefixes);

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
    const drafts = deriveBets(fills, settlements, meta, series);

    // 5. Reconcile: replace what changed, leave what did not.
    const { data: existing } = await supabase
      .from("bets")
      .select(
        "id, external_id, status, stake, payout, legs (result, sport, subcategory)"
      )
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
        // so the legs are part of what "unchanged" means. Sport and
        // sub-category are too, since phase 3: when the taxonomy
        // improves, the first sync after the deploy upgrades every
        // bet it names better, no manual migration.
        const legKey = (l: {
          result?: string | null;
          sport?: string | null;
          subcategory?: string | null;
        }) => `${l.result}|${l.sport}|${l.subcategory ?? ""}`;
        const oldLegs = (
          (old.legs ?? []) as {
            result: string;
            sport: string;
            subcategory: string | null;
          }[]
        )
          .map(legKey)
          .sort()
          .join(",");
        const newLegs = draft.legs
          .map(legKey)
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
          subcategory: leg.subcategory,
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

    // 7. THE RELABEL PASS. The sync only re-derives markets with new
    // activity, so a bet imported before the taxonomy existed kept
    // its old labels forever: the owner's early soccer bets sat in
    // Other with no way back. Any pick still missing its bet type
    // (subcategory null marks the pre-taxonomy imports) gets its
    // series looked up and its sport and bet type fixed IN PLACE.
    // Money is never touched: this relabels, it does not re-derive.
    // Failures are swallowed on purpose, the sync itself succeeded.
    try {
      const { data: allKalshi } = await supabase
        .from("bets")
        .select("id, external_id, legs (id, sport, subcategory, description)")
        .eq("source", "kalshi");
      type LegRow = {
        id: string;
        sport: string;
        subcategory: string | null;
        description: string | null;
      };
      const needs = (allKalshi ?? [])
        .filter((b) =>
          ((b.legs ?? []) as LegRow[]).some((l) => l.subcategory === null)
        )
        .slice(0, 120);
      if (needs.length > 0) {
        const tickerOf = (b: { external_id: unknown }) =>
          String(b.external_id ?? "").split(":")[1] ?? "";
        const singles = needs.filter(
          (b) => ((b.legs ?? []) as LegRow[]).length === 1
        );
        const parlays = needs.filter(
          (b) => ((b.legs ?? []) as LegRow[]).length > 1
        );

        // Parlay legs live in their own markets; the parent knows
        // which. Parents are fetched one by one because the batch
        // shape may omit mve_selected_legs.
        const parentMeta = new Map<string, KalshiMarketMeta>();
        for (let i = 0; i < parlays.length; i += 8) {
          const chunk = parlays.slice(i, i + 8);
          const found = await Promise.all(
            chunk.map((b) => kalshiMarket(key, pem, tickerOf(b)))
          );
          for (const m of found) if (m) parentMeta.set(m.ticker, m);
        }
        const legTickers = [
          ...new Set(
            [...parentMeta.values()].flatMap((m) =>
              (m.mveLegs ?? []).map((l) => l.market_ticker)
            )
          ),
        ];
        const legMeta = new Map<string, KalshiMarketMeta>();
        for (const m of await kalshiMarketsBatch(key, pem, legTickers)) {
          legMeta.set(m.ticker, m);
        }
        const relabelSeries = await kalshiSeriesBatch(key, pem, [
          ...singles.map((b) => tickerOf(b).split("-")[0]?.toUpperCase() ?? ""),
          ...legTickers.map((t) => t.split("-")[0]?.toUpperCase() ?? ""),
        ]);

        // Group the fixes by target so a hundred legs become a
        // handful of update calls.
        const fixes = new Map<string, string[]>();
        const addFix = (
          leg: LegRow,
          sport: string,
          subcategory: string | null
        ) => {
          if (subcategory === null) return;
          if (leg.sport === sport && leg.subcategory === subcategory) return;
          const key2 = `${sport} ${subcategory}`;
          fixes.set(key2, [...(fixes.get(key2) ?? []), leg.id]);
        };
        for (const b of singles) {
          const t = tickerOf(b);
          addFix(
            ((b.legs ?? []) as LegRow[])[0],
            sportFor(t, relabelSeries),
            subcategoryFor(t, relabelSeries)
          );
        }
        for (const b of parlays) {
          const m = parentMeta.get(tickerOf(b));
          for (const mveLeg of m?.mveLegs ?? []) {
            const base = legMeta.get(mveLeg.market_ticker)?.title?.trim();
            if (!base) continue;
            const stored = ((b.legs ?? []) as LegRow[]).find(
              (l) => l.description === base || l.description === `${base} (No)`
            );
            if (!stored) continue;
            addFix(
              stored,
              sportFor(mveLeg.market_ticker, relabelSeries),
              subcategoryFor(mveLeg.market_ticker, relabelSeries)
            );
          }
        }
        for (const [key2, ids] of fixes) {
          const [sport, subcategory] = key2.split(" ");
          await supabase
            .from("legs")
            .update({ sport, subcategory })
            .in("id", ids);
        }
      }
    } catch {
      // Relabelling is a repair, never a reason to fail a sync.
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
      // A history round that ran out of page budget: the client asks
      // again and the next round continues below the oldest bet.
      more,
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
