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
