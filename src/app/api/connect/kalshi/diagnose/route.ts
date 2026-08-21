import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/connectCrypto";
import { kalshiGet, kalshiGetPages } from "@/lib/kalshi";

// Walking two long lists takes a while on a heavy account.
export const maxDuration = 300;
import {
  classifyMarket,
  deriveBets,
  sportFor,
  type KalshiFill,
  type KalshiSeriesMeta,
  type KalshiSettlement,
} from "@/lib/kalshiSync";
import { UNCLASSIFIED } from "@/lib/taxonomy";

// WHY THIS EXISTS. Kalshi is unreachable from the machine this app is
// written on, so the fetching layer was built from documentation and
// the first real account is the first real test. When the owner's
// bets did not appear there was no way to see WHERE it broke: a wrong
// path, a different response key, an empty result, or a translation
// that dropped everything.
//
// So the app reports on itself. This walks the same steps the sync
// walks and returns what each one saw: the status, the keys Kalshi
// answered with, the counts, and one sample record. It writes
// nothing. It is the user's own account data shown back to them.
//
// Sample records are included on purpose: knowing that a fill calls
// its price "yes_price" or something else is exactly the fact that
// was missing.

async function probe(
  key: string,
  pem: string,
  path: string,
  query?: Record<string, string>
): Promise<Record<string, unknown>> {
  try {
    const data = (await kalshiGet(key, pem, path, query)) as Record<
      string,
      unknown
    >;
    const keys = Object.keys(data);
    const listKey = keys.find((k) => Array.isArray(data[k]));
    const list = listKey ? (data[listKey] as unknown[]) : [];
    return {
      path,
      ok: true,
      keys,
      listKey: listKey ?? null,
      count: list.length,
      sample: list[0] ?? null,
    };
  } catch (e) {
    return {
      path,
      ok: false,
      error: e instanceof Error ? e.message.slice(0, 200) : String(e),
      status: (e as { status?: number }).status ?? null,
    };
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });

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

  // Every candidate shape, so a wrong path names itself instead of
  // failing silently.
  const probes = [
    await probe(key, pem, "/portfolio/balance"),
    await probe(key, pem, "/portfolio/fills", { limit: "10" }),
    await probe(key, pem, "/portfolio/settlements", { limit: "10" }),
    await probe(key, pem, "/portfolio/positions", {
      count_filter: "position",
      limit: "10",
    }),
    await probe(key, pem, "/portfolio/orders", { limit: "5" }),
  ];

  // ROUND 2 (after the owner's live test): the last 40 fills in
  // compact form, because a mid-bet position close did not import and
  // only the raw trade list can say what Kalshi called it. And the
  // full market object for each recently touched ticker, because a
  // parlay imported as one strange single and somewhere in that
  // object Kalshi describes the legs.
  let recentFills: unknown[] = [];
  try {
    const data = (await kalshiGet(key, pem, "/portfolio/fills", {
      limit: "40",
    })) as { fills?: Record<string, unknown>[] };
    recentFills = (data.fills ?? []).map((f) => ({
      ticker: f.ticker,
      side: f.side,
      action: f.action,
      count_fp: f.count_fp ?? f.count,
      yes: f.yes_price_dollars ?? f.yes_price,
      no: f.no_price_dollars ?? f.no_price,
      fee: f.fee_cost,
      t: f.created_time,
    }));
  } catch (e) {
    recentFills = [
      { error: e instanceof Error ? e.message.slice(0, 120) : String(e) },
    ];
  }

  const tickers = [
    ...new Set(
      recentFills
        .map((f) => (f as { ticker?: string }).ticker)
        .filter((t): t is string => Boolean(t))
    ),
  ].slice(0, 5);
  const markets: Record<string, unknown> = {};
  for (const t of tickers) {
    try {
      markets[t] = await kalshiGet(key, pem, `/markets/${encodeURIComponent(t)}`);
    } catch (e) {
      markets[t] = e instanceof Error ? e.message.slice(0, 120) : String(e);
    }
  }

  // What the translation makes of whatever the fills probe returned.
  const fillsProbe = probes[1];
  const settleProbe = probes[2];
  const fills = (fillsProbe.ok
    ? ((fillsProbe.sample ? [fillsProbe.sample] : []) as KalshiFill[])
    : []) as KalshiFill[];
  const settlements = (settleProbe.ok
    ? ((settleProbe.sample ? [settleProbe.sample] : []) as KalshiSettlement[])
    : []) as KalshiSettlement[];
  let translated: unknown = null;
  try {
    translated = deriveBets(fills, settlements, new Map());
  } catch (e) {
    translated = { error: e instanceof Error ? e.message : String(e) };
  }

  // ROUND 5 (the mapper coverage audit, 21 August). The mapper only
  // learned series the owner traded, so an NFL or NBA bettor could
  // import straight into a pile of Unclassified. This walks Kalshi's
  // ENTIRE series catalog, runs every series through the taxonomy
  // mapper server-side, and reports only what matters: the counts,
  // the leftovers no rule covers, and the sport tags we have never
  // seen. The rules then get written against Kalshi's real
  // vocabulary and pinned by tests, never guessed. (Round 4, the
  // per-account series probe, answered its question and retired.)
  const catalog: Record<string, unknown> = {};
  try {
    // The catalog endpoint may demand a category filter; probe bare
    // first, then per candidate category, and report which door
    // worked so a failed shape names itself.
    let rows: { ticker?: string; title?: string; category?: string; tags?: string[] }[] =
      [];
    let door = "bare";
    try {
      const r = await kalshiGetPages<{
        ticker?: string;
        title?: string;
        category?: string;
        tags?: string[];
      }>(key, pem, "/series", "series", {}, undefined, 60);
      rows = r.rows;
      if (rows.length === 0) throw new Error("empty");
    } catch {
      door = "per-category";
      const candidates = [
        "Sports",
        "Crypto",
        "Politics",
        "Economics",
        "Climate and Weather",
        "Entertainment",
        "Companies",
        "Financials",
        "Science and Technology",
        "Health",
        "World",
        "Transportation",
        "Culture",
        "Elections",
        "Exotics",
      ];
      const doors: Record<string, number | string> = {};
      for (const c of candidates) {
        try {
          const r = await kalshiGetPages<{
            ticker?: string;
            title?: string;
            category?: string;
            tags?: string[];
          }>(key, pem, "/series", "series", { category: c }, undefined, 30);
          doors[c] = r.rows.length;
          rows.push(...r.rows);
        } catch (e) {
          doors[c] = e instanceof Error ? e.message.slice(0, 60) : String(e);
        }
      }
      catalog.doors = doors;
    }
    catalog.door = door;
    catalog.totalSeries = rows.length;

    // Grade every series through the same mapper the sync uses. The
    // series map keys by ticker prefix, exactly how classifyMarket
    // reads it.
    const meta = new Map<string, KalshiSeriesMeta>();
    for (const r of rows) {
      const prefix = String(r.ticker ?? "").split("-")[0]?.toUpperCase() ?? "";
      if (prefix === "") continue;
      meta.set(prefix, { category: r.category, title: r.title, tags: r.tags });
    }

    const perCategory: Record<string, number> = {};
    // Unmatched split by KALSHI's own category: most of their catalog
    // is politics, weather and economics, domains with no registered
    // Actuals categories by design, so a raw unmatched count reads as
    // catastrophic while the sports gap, the one that matters before
    // testers, hides inside it.
    const unmatchedByDomain: Record<string, number> = {};
    const unmatchedSports: {
      ticker: string;
      title: string | null;
      tags: string[] | null;
    }[] = [];
    const unknownSportTags = new Map<string, number>();
    for (const [prefix, m] of meta) {
      const cls = classifyMarket(`${prefix}-X`, meta);
      perCategory[cls.category] = (perCategory[cls.category] ?? 0) + 1;
      if (cls.category === UNCLASSIFIED) {
        const dom = m.category ?? "(none)";
        unmatchedByDomain[dom] = (unmatchedByDomain[dom] ?? 0) + 1;
        if (dom.toLowerCase() === "sports") {
          unmatchedSports.push({
            ticker: prefix,
            title: m.title ?? null,
            tags: m.tags ?? null,
          });
        }
      }
      if ((m.category ?? "").toLowerCase() === "sports") {
        const sport = sportFor(`${prefix}-X`, meta);
        if (sport === "Other") {
          for (const t of m.tags ?? []) {
            unknownSportTags.set(t, (unknownSportTags.get(t) ?? 0) + 1);
          }
        }
      }
    }
    catalog.mappedPerCategory = perCategory;
    catalog.unknownSportTags = Object.fromEntries(unknownSportTags);
    catalog.unmatchedByDomain = unmatchedByDomain;
    catalog.unmatchedSportsCount = unmatchedSports.length;
    // The review list: sports only, deduped by title so a hundred
    // variants of one market do not fill the paste, capped human-sized.
    const seenTitles = new Set<string>();
    catalog.unmatchedSports = unmatchedSports
      .filter((u) => {
        const t = (u.title ?? u.ticker).toLowerCase();
        if (seenTitles.has(t)) return false;
        seenTitles.add(t);
        return true;
      })
      .slice(0, 150);
  } catch (e) {
    catalog.error = e instanceof Error ? e.message.slice(0, 160) : String(e);
  }

  const { count: kalshiBets } = await supabase
    .from("bets")
    .select("id", { count: "exact", head: true })
    .eq("source", "kalshi");

  return NextResponse.json({
    connectedAt: conn.connected_at,
    lastSyncedAt: conn.last_synced_at,
    kalshiBetsInActuals: kalshiBets ?? 0,
    probes,
    translationOfSampleFill: translated,
    recentFills,
    markets,
    catalog,
  });
}
