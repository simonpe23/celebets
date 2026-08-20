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

// A sub-category is either a plain label or a group that opens a
// third row of choices (stored as "Group: Choice").
export type SubcategoryItem =
  | string
  | { label: string; children: string[] };

// Sub-categories per sport. Sports not listed here have none yet.
// Adding more is a code change only, the database accepts any text.
export const SUBCATEGORIES: Partial<Record<Sport, SubcategoryItem[]>> = {
  Football: [
    "Win-bet / Moneyline",
    "Goal Difference",
    "Points Total",
    "1st half / 2nd half",
    "Team Points Total",
    "BTTS (Both Teams to Score)",
    "Correct Score",
    "Corners",
    "First team to score",
    {
      label: "Player Props",
      children: ["Goalscorer", "Assists", "Score or Assist"],
    },
  ],
};

export type BetStatus = "pending" | "won" | "lost";
export type LegResult = "pending" | "won" | "lost";

export interface Leg {
  id: string;
  sport: Sport;
  description: string | null;
  odds: number | null;
  result: LegResult;
  subcategory: string | null;
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
