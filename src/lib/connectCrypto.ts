import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Encrypts a connected platform's credential before it touches the
// database, so a database leak alone does not leak Kalshi keys. The
// encryption key lives in ONE Vercel setting and nowhere else:
//   CONNECT_ENC_KEY  64 hex characters (32 bytes)
// Rotating it means reconnecting every account, which is acceptable:
// reconnecting is a two minute task and key rotation should be rare.
//
// AES-256-GCM, the boring standard choice: authenticated, so a
// tampered ciphertext fails loudly instead of decrypting to garbage.
// Server only: importing this from a client component fails the
// build, which is the point.

function key(): Buffer {
  const hex = process.env.CONNECT_ENC_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("CONNECT_ENC_KEY is not set (64 hex characters).");
  }
  return Buffer.from(hex, "hex");
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, body]).toString("base64");
}

export function decryptSecret(stored: string): string {
  const raw = Buffer.from(stored, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const body = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString(
    "utf8"
  );
}
