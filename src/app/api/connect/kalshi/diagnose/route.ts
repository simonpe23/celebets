import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/connectCrypto";
import { kalshiGet, kalshiGetPages } from "@/lib/kalshi";

// Walking two long lists takes a while on a heavy account.
export const maxDuration = 300;
import { deriveBets, type KalshiFill, type KalshiSettlement } from "@/lib/kalshiSync";

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

  // ROUND 3 (the history that will not go past June): measure how
  // deep Kalshi's own lists actually reach. If the fills list simply
  // ENDS in June, the older record lives only in settlements, and the
  // import needs a second source, not a better filter.
  // Orders is included because fills and settlements both END at the
  // same minute (June 13), which smells like an account-wide data
  // boundary on Kalshi's side. If orders reach past it, the older
  // record can be rebuilt from executed orders instead.
  const depth: Record<string, unknown> = {};
  for (const [name, path, listKey, timeField] of [
    ["fills", "/portfolio/fills", "fills", "created_time"],
    ["settlements", "/portfolio/settlements", "settlements", "settled_time"],
    ["orders", "/portfolio/orders", "orders", "created_time"],
  ] as const) {
    try {
      const { rows, done } = await kalshiGetPages<Record<string, unknown>>(
        key,
        pem,
        path,
        listKey,
        {},
        undefined,
        100
      );
      const oldest = rows[rows.length - 1];
      depth[name] = {
        count: rows.length,
        reachedEnd: done,
        oldest: oldest?.[timeField] ?? null,
        oldestSample: name === "fills" ? null : (oldest ?? null),
      };
    } catch (e) {
      depth[name] = {
        error: e instanceof Error ? e.message.slice(0, 120) : String(e),
      };
    }
  }

  // And what max_ts actually does, in both units, against the oldest
  // imported bet.
  const { data: oldestBet } = await supabase
    .from("bets")
    .select("placed_at")
    .eq("source", "kalshi")
    .order("placed_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (oldestBet?.placed_at) {
    const boundSec = Math.floor(
      new Date(oldestBet.placed_at as string).getTime() / 1000
    );
    const probeResults: Record<string, unknown> = { boundSec };
    for (const [label, value] of [
      ["seconds", String(boundSec)],
      ["millis", String(boundSec * 1000)],
    ]) {
      try {
        const d = (await kalshiGet(key, pem, "/portfolio/fills", {
          limit: "5",
          max_ts: value,
        })) as { fills?: Record<string, unknown>[] };
        const first = d.fills?.[0];
        probeResults[label] = {
          rows: d.fills?.length ?? 0,
          firstTs: first?.ts ?? null,
          firstTime: first?.created_time ?? null,
        };
      } catch (e) {
        probeResults[label] =
          e instanceof Error ? e.message.slice(0, 120) : String(e);
      }
    }
    depth.maxTsProbe = probeResults;
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
    depth,
  });
}
