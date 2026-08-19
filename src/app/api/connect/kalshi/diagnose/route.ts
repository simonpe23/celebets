import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/connectCrypto";
import { kalshiGet } from "@/lib/kalshi";
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
  });
}
