const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(amount: number): string {
  return usd.format(amount);
}

// Adds an explicit plus sign for positive amounts, for profit displays.
export function formatSignedMoney(amount: number): string {
  return amount > 0 ? `+${usd.format(amount)}` : usd.format(amount);
}

// Whole dollars with a sign: "+$418", not "+$418.26". The dense form
// for tight grids (the snapshot, the balance band's period strip),
// where the exact figure lives one tap away. One function, because it
// lived privately in SnapshotCard and the balance band would have been
// the second copy.
export function shortSignedMoney(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "$0";
  const sign = rounded < 0 ? "-" : "+";
  return `${sign}$${Math.abs(rounded).toLocaleString("en-US")}`;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

// Parses user input like "100", "100.50" or "100,50" into a positive
// number with at most 2 decimals. Returns null when invalid.
export function parseMoney(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = parseFloat(normalized);
  return value > 0 ? value : null;
}

// Parses decimal odds like "2.50" or "2,50". Must be greater than 1.00.
export function parseOdds(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = parseFloat(normalized);
  return value > 1 ? value : null;
}

// Rounds to 2 decimals to avoid floating point artifacts in previews.
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Rounds to 4 decimals. Used for odds derived from an exact
// To Collect amount, so payouts land on the exact cent.
export function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
