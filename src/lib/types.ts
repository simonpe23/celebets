export const SPORTS = [
  "Football",
  "American Football",
  "Basketball",
  "Baseball",
  "Ice Hockey",
  "Tennis",
  "Golf",
  "esports",
  // Added 21 August 2026, from Kalshi's catalog audit: they carry
  // real volume in these and the owner ruled them in.
  "Cricket",
  "MMA",
  "Rugby",
  "Motorsport",
  "Boxing",
  "Table Tennis",
  "Other",
] as const;

// THE NOT-SPORTS CATEGORIES (phase 3 of the sync project). Everything
// Kalshi trades that is not a sport gets a real name instead of
// "Other": the names mirror Kalshi's own category field, normalised
// in kalshiSync.ts, so any user's markets resolve the same way and a
// category we have never seen still lands safely in Other. These are
// import-only for now: manual entry keeps the SPORTS picker above.
export const KALSHI_CATEGORIES = [
  "Politics",
  "Economics",
  "Entertainment",
  "Weather",
  "Companies",
  "Tech & Science",
  "Health",
  "World",
  // CRYPTO IS NOT A SPORT. It sat in SPORTS from phase 8, when Crypto
  // was added as "a new top-level option" before the taxonomy
  // existed. The taxonomy has said Economics for a while
  // (LEVEL_TWO_DOMAINS, and SPORTS_DOMAIN never listed it), so the
  // SPORTS entry was the last place still disagreeing. Moved by the
  // owner's ruling, 24 August 2026: "sports only fall under the
  // sports category. crypto can only fall under the economics
  // category."
  //
  // No migration: legs_sport_check already accepts all of these
  // words, and Sport is the union of both lists, so every stored row
  // stays valid.
  "Crypto",
] as const;

export type Sport =
  | (typeof SPORTS)[number]
  | (typeof KALSHI_CATEGORIES)[number];

// EVERY VALUE leg.sport is allowed to hold, sports and non-sports
// together. It mirrors the legs_sport_check constraint exactly.
//
// It exists because SPORTS was doing two jobs: naming the sports,
// and standing in for "any valid subject". That was harmless while
// Crypto sat inside SPORTS, and became wrong the moment it moved:
// three separate places validated a subject against SPORTS and
// would now silently reject a Crypto pick.
export const SUBJECTS = [...SPORTS, ...KALSHI_CATEGORIES] as const;

export function isSubject(value: unknown): value is Sport {
  return (
    typeof value === "string" && (SUBJECTS as readonly string[]).includes(value)
  );
}

// What counts as Not Sports for the Performance filter. Crypto used
// to be listed here by name; it now arrives through KALSHI_CATEGORIES
// like every other non-sport. Other stays explicit: an unrecognised
// market is by definition not one of the named sports.
export const NOT_SPORTS: ReadonlySet<Sport> = new Set([
  "Other",
  ...KALSHI_CATEGORIES,
]);

export const SPORT_EMOJI: Record<Sport, string> = {
  Football: "⚽",
  "American Football": "\u{1F3C8}",
  Basketball: "\u{1F3C0}",
  Baseball: "⚾",
  "Ice Hockey": "\u{1F3D2}",
  Tennis: "\u{1F3BE}",
  Golf: "⛳",
  esports: "\u{1F3AE}",
  Cricket: "\u{1F3CF}",
  MMA: "\u{1F94B}",
  Rugby: "\u{1F3C9}",
  Motorsport: "\u{1F3CE}",
  Boxing: "\u{1F94A}",
  "Table Tennis": "\u{1F3D3}",
  Crypto: "\u{1FA99}",
  Other: "\u{1F4CA}",
  Politics: "\u{1F3DB}",
  Economics: "\u{1F4C8}",
  Entertainment: "\u{1F3AC}",
  Weather: "⛅",
  Companies: "\u{1F3E2}",
  "Tech & Science": "\u{1F52C}",
  Health: "\u{1FA7A}",
  World: "\u{1F30D}",
};

// The curated SUBCATEGORIES list that used to live here was the
// pre-taxonomy category system, superseded on 21 August 2026 by
// src/lib/taxonomy.ts (categories registered per domain, controlled
// markets, sport-appropriate periods). phase12.sql migrated the
// stored labels; keep exactly one vocabulary.

export type BetStatus = "pending" | "won" | "lost";
export type LegResult = "pending" | "won" | "lost";

export interface Leg {
  id: string;
  sport: Sport;
  description: string | null;
  odds: number | null;
  result: LegResult;
  // The canonical Actuals category (a registered skill from
  // src/lib/taxonomy.ts, or "Unclassified"). Null means a manual bet
  // whose user never picked one: a different fact, kept distinct.
  subcategory: string | null;
  // The taxonomy's other dimensions. Older rows may predate them.
  market: string | null;
  period: string | null;
  competition: string | null;
  // The provider's own market name, the explainability trail.
  provider_market: string | null;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  created_at: string;
}

export interface BetBuy {
  id: string;
  amount: number;
  payout: number;
  created_at: string;
}

export interface BetWithLegs {
  id: string;
  stake: number;
  total_odds: number;
  status: BetStatus;
  placed_at: string;
  settled_at: string | null;
  payout: number | null;
  cashed_out: boolean;
  legs: Leg[];
  bet_buys: BetBuy[];
}
