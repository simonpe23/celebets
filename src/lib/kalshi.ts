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
  stopBefore?: { field: string; iso: string }
): Promise<T[]> {
  const out: T[] = [];
  let cursor = "";
  for (let page = 0; page < 25; page++) {
    const data = (await kalshiGet(accessKey, privateKeyPem, path, {
      ...query,
      limit: "200",
      ...(cursor ? { cursor } : {}),
    })) as Record<string, unknown>;
    const rows = (data[listKey] ?? []) as T[];
    out.push(...rows);

    if (stopBefore && rows.length > 0) {
      const oldest = rows[rows.length - 1] as Record<string, unknown>;
      const t = oldest[stopBefore.field];
      if (typeof t === "string" && t < stopBefore.iso) break;
    }
    cursor = typeof data.cursor === "string" ? data.cursor : "";
    if (!cursor || rows.length === 0) break;
  }
  return out;
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

// One market's public details, for its human title. Public endpoint,
// but sent signed like everything else, which Kalshi accepts.
export async function kalshiMarket(
  accessKey: string,
  privateKeyPem: string,
  ticker: string
): Promise<{ ticker: string; title?: string; event_ticker?: string } | null> {
  try {
    const data = (await kalshiGet(
      accessKey,
      privateKeyPem,
      `/markets/${encodeURIComponent(ticker)}`
    )) as { market?: { ticker: string; title?: string; event_ticker?: string } };
    return data.market ?? null;
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
