import { createSign, createPrivateKey, constants } from "node:crypto";

// Talking to Kalshi, server only. Read calls exclusively: Actuals
// never places, amends or cancels an order, and no function that
// could belongs in this file. That is a product promise on the
// connect screen, so it is a code rule here.
//
// Kalshi's auth (docs.kalshi.com): every request carries three
// headers, and the signature is RSA-PSS SHA-256 (salt = 32 bytes,
// the digest length) over exactly
//   {unix milliseconds}{METHOD}{path without query}
// with the /trade-api/v2 prefix INCLUDED in the path and the query
// string EXCLUDED. Both halves of that sentence are the two mistakes
// everyone makes, per Kalshi's own community docs.

const BASE = "https://api.elections.kalshi.com";
const PREFIX = "/trade-api/v2";

export class KalshiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function sign(privateKeyPem: string, message: string): string {
  const signer = createSign("sha256");
  signer.update(message);
  return signer
    .sign({
      key: createPrivateKey(privateKeyPem),
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32,
    })
    .toString("base64");
}

// One GET against Kalshi. `path` starts after the /trade-api/v2
// prefix, like "/portfolio/balance". Query params are appended to the
// URL but never signed.
export async function kalshiGet(
  accessKey: string,
  privateKeyPem: string,
  path: string,
  query?: Record<string, string>
): Promise<unknown> {
  const ts = String(Date.now());
  const signedPath = `${PREFIX}${path}`;
  const signature = sign(privateKeyPem, `${ts}GET${signedPath}`);

  const qs = query ? `?${new URLSearchParams(query)}` : "";
  const res = await fetch(`${BASE}${signedPath}${qs}`, {
    headers: {
      "KALSHI-ACCESS-KEY": accessKey,
      "KALSHI-ACCESS-TIMESTAMP": ts,
      "KALSHI-ACCESS-SIGNATURE": signature,
    },
    // Kalshi data must never be cached across users.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new KalshiError(res.status, body.slice(0, 300));
  }
  return res.json();
}

// Walks a paginated Kalshi list to the end. Every list endpoint uses
// the same shape: a cursor in, a cursor out, empty cursor when done.
// The page cap is a guard against a runaway loop, not a limit anyone
// should reach: 25 pages of 200 is five thousand records.
export async function kalshiGetAll<T>(
  accessKey: string,
  privateKeyPem: string,
  path: string,
  listKey: string,
  query: Record<string, string> = {},
  // Stop early once a page's oldest record predates this ISO time.
  // Lists come newest first, so everything after is older still.
  stopBefore?: { field: string; iso: string },
  maxPages = 25
): Promise<T[]> {
  const { rows } = await kalshiGetPages<T>(
    accessKey,
    privateKeyPem,
    path,
    listKey,
    query,
    stopBefore,
    maxPages
  );
  return rows;
}

// The same walk, but it also says whether it reached the END of the
// list or ran out of page budget. The difference matters: a
// full-history import that hits the budget has to say "there is
// more" so the next round can continue, instead of quietly calling a
// two-month slice the whole story, which is how the owner's history
// stopped at June while his first bet was in the fall.
export async function kalshiGetPages<T>(
  accessKey: string,
  privateKeyPem: string,
  path: string,
  listKey: string,
  query: Record<string, string> = {},
  stopBefore?: { field: string; iso: string },
  maxPages = 25
): Promise<{ rows: T[]; done: boolean }> {
  const rows: T[] = [];
  let cursor = "";
  for (let page = 0; page < maxPages; page++) {
    const data = (await kalshiGet(accessKey, privateKeyPem, path, {
      ...query,
      limit: "200",
      ...(cursor ? { cursor } : {}),
    })) as Record<string, unknown>;
    const pageRows = (data[listKey] ?? []) as T[];
    rows.push(...pageRows);

    if (stopBefore && pageRows.length > 0) {
      const oldest = pageRows[pageRows.length - 1] as Record<string, unknown>;
      const t = oldest[stopBefore.field];
      if (typeof t === "string" && t < stopBefore.iso)
        return { rows, done: true };
    }
    cursor = typeof data.cursor === "string" ? data.cursor : "";
    if (!cursor || pageRows.length === 0) return { rows, done: true };
  }
  return { rows, done: false };
}

// Fills strictly OLDER than a moment, for the history import's later
// rounds. Kalshi documents a max_ts filter on fills but not its unit,
// and the first live use returned nothing at all, so this trusts
// nothing: it probes seconds, then milliseconds, checks the answer
// actually IS older than the bound, and when neither works it walks
// the list from the top and discards rows a previous round already
// imported. Slower, never wrong.
export async function kalshiFillsBefore(
  accessKey: string,
  privateKeyPem: string,
  boundSec: number | null,
  pageBudget = 60
): Promise<{ rows: Record<string, unknown>[]; done: boolean }> {
  if (boundSec === null) {
    return kalshiGetPages<Record<string, unknown>>(
      accessKey,
      privateKeyPem,
      "/portfolio/fills",
      "fills",
      {},
      undefined,
      pageBudget
    );
  }

  const tsOf = (f: Record<string, unknown>): number => {
    if (typeof f.ts === "number") return f.ts;
    const parsed = Date.parse(String(f.created_time ?? ""));
    return Number.isFinite(parsed) ? parsed / 1000 : Number.MAX_SAFE_INTEGER;
  };

  for (const candidate of [String(boundSec), String(boundSec * 1000)]) {
    try {
      const probe = (await kalshiGet(
        accessKey,
        privateKeyPem,
        "/portfolio/fills",
        { limit: "200", max_ts: candidate }
      )) as { fills?: Record<string, unknown>[] };
      const rows = probe.fills ?? [];
      if (rows.length === 0) continue;
      if (tsOf(rows[0]) < boundSec) {
        // The filter is honored in this unit: walk with it.
        return kalshiGetPages<Record<string, unknown>>(
          accessKey,
          privateKeyPem,
          "/portfolio/fills",
          "fills",
          { max_ts: candidate },
          undefined,
          pageBudget
        );
      }
    } catch {
      // An unsupported parameter answering 400 just moves us along.
    }
  }

  // Neither unit worked: walk from the newest and keep only what a
  // previous round has not imported. The page ceiling is generous
  // (skipping already-covered pages costs a request each), and a
  // truly bottomless account simply takes another round.
  const out: Record<string, unknown>[] = [];
  let cursor = "";
  for (let page = 0; page < 240; page++) {
    const data = (await kalshiGet(accessKey, privateKeyPem, "/portfolio/fills", {
      limit: "200",
      ...(cursor ? { cursor } : {}),
    })) as { fills?: Record<string, unknown>[]; cursor?: string };
    const rows = data.fills ?? [];
    for (const f of rows) if (tsOf(f) < boundSec) out.push(f);
    cursor = typeof data.cursor === "string" ? data.cursor : "";
    if (!cursor || rows.length === 0) return { rows: out, done: true };
    if (out.length >= pageBudget * 200) break;
  }
  return { rows: out, done: false };
}

// The tickers the user currently holds a position in. Used by the
// sync's discovery step: an open position is live money and belongs
// to the record even when every fill predates the connect date, the
// same ruling as the app's own fresh start line. Parsed defensively
// (position vs position_fp) and a failure returns empty rather than
// sinking the sync: this step only ADDS markets to the scope.
export async function kalshiOpenTickers(
  accessKey: string,
  privateKeyPem: string
): Promise<string[]> {
  try {
    const rows = await kalshiGetAll<Record<string, unknown>>(
      accessKey,
      privateKeyPem,
      "/portfolio/positions",
      "market_positions",
      { count_filter: "position" }
    );
    return rows
      .filter((r) => {
        const held = Number(r.position ?? r.position_fp ?? 0);
        return Number.isFinite(held) && held !== 0;
      })
      .map((r) => String(r.ticker ?? ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

// One market's details: its human title, its result once decided,
// and, on a multivariate (parlay) market, the picks inside it.
// Public endpoint, but sent signed like everything else, which
// Kalshi accepts.
export type KalshiMarketDetails = {
  ticker: string;
  title?: string;
  event_ticker?: string;
  result?: string;
  mveLegs?: { market_ticker: string; side: string }[];
};

// Many markets in one call: GET /markets accepts a comma separated
// tickers filter. This is what makes a full-history import survivable:
// hundreds of markets become a handful of requests instead of one
// request each, which is why the sync used to cap itself at 60
// markets and silently import a fraction of a heavy account.
//
// The LIST shape is not guaranteed to carry mve_selected_legs the way
// the single-market endpoint does, so parlays found here may still
// need a follow-up kalshiMarket call for their legs.
export async function kalshiMarketsBatch(
  accessKey: string,
  privateKeyPem: string,
  tickers: string[]
): Promise<KalshiMarketDetails[]> {
  const out: KalshiMarketDetails[] = [];
  for (let i = 0; i < tickers.length; i += 40) {
    const batch = tickers.slice(i, i + 40);
    try {
      const rows = await kalshiGetAll<{
        ticker: string;
        title?: string;
        event_ticker?: string;
        result?: string;
        mve_selected_legs?: { market_ticker?: string; side?: string }[];
      }>(accessKey, privateKeyPem, "/markets", "markets", {
        tickers: batch.join(","),
      });
      for (const m of rows) {
        const legs = (m.mve_selected_legs ?? [])
          .map((l) => ({
            market_ticker: String(l.market_ticker ?? ""),
            side: String(l.side ?? "yes"),
          }))
          .filter((l) => l.market_ticker !== "");
        out.push({
          ticker: m.ticker,
          title: m.title,
          event_ticker: m.event_ticker,
          result: m.result,
          ...(legs.length > 0 ? { mveLegs: legs } : {}),
        });
      }
    } catch {
      // One bad batch must not sink the sync: those markets simply
      // keep their tickers as descriptions.
    }
  }
  return out;
}

export async function kalshiMarket(
  accessKey: string,
  privateKeyPem: string,
  ticker: string
): Promise<KalshiMarketDetails | null> {
  try {
    const data = (await kalshiGet(
      accessKey,
      privateKeyPem,
      `/markets/${encodeURIComponent(ticker)}`
    )) as {
      market?: {
        ticker: string;
        title?: string;
        event_ticker?: string;
        result?: string;
        mve_selected_legs?: { market_ticker?: string; side?: string }[];
      };
    };
    const m = data.market;
    if (!m) return null;
    const legs = (m.mve_selected_legs ?? [])
      .map((l) => ({
        market_ticker: String(l.market_ticker ?? ""),
        side: String(l.side ?? "yes"),
      }))
      .filter((l) => l.market_ticker !== "");
    return {
      ticker: m.ticker,
      title: m.title,
      event_ticker: m.event_ticker,
      result: m.result,
      ...(legs.length > 0 ? { mveLegs: legs } : {}),
    };
  } catch {
    // A delisted or renamed market must not sink the whole sync; the
    // bet then carries its ticker as the description.
    return null;
  }
}

// The connection test: the smallest authenticated read there is. A
// wrong key id, a wrong private key, or a revoked key all fail here,
// and nothing about the account changes.
export async function testConnection(
  accessKey: string,
  privateKeyPem: string
): Promise<{ balanceCents: number }> {
  const data = (await kalshiGet(accessKey, privateKeyPem, "/portfolio/balance")) as {
    balance?: number;
  };
  if (typeof data.balance !== "number") {
    throw new KalshiError(502, "Kalshi answered in a shape we do not know.");
  }
  return { balanceCents: data.balance };
}
