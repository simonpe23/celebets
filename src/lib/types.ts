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
  // Everything Kalshi trades that is not a sport: politics, weather,
  // economics, culture. The owner ruled imported bets from those
  // markets count too ("I want users to be able to track
  // everything"), and phase 3 of the sync project splits Other into
  // real categories with a Sports / everything filter above them.
  "Other",
] as const;

export type Sport = (typeof SPORTS)[number];

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
