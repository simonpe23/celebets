export const SPORTS = [
  "Football",
  "American Football",
  "Basketball",
  "Baseball",
  "Ice Hockey",
  "Tennis",
  "Golf",
  "esports",
  "Crypto",
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
] as const;

export type Sport =
  | (typeof SPORTS)[number]
  | (typeof KALSHI_CATEGORIES)[number];

// What counts as Not Sports for the Performance filter. Crypto is
// here by the owner's ruling (20 August 2026): the app is sports
// first, and a BTC price bet is not a sport, however much he trades
// it. Other is here too: an unrecognised market is by definition not
// one of the named sports.
export const NOT_SPORTS: ReadonlySet<Sport> = new Set([
  "Crypto",
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
