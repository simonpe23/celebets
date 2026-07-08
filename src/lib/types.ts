export const SPORTS = [
  "Football",
  "American Football",
  "Basketball",
  "Baseball",
  "Ice Hockey",
] as const;

export type Sport = (typeof SPORTS)[number];

export const SPORT_EMOJI: Record<Sport, string> = {
  Football: "⚽",
  "American Football": "\u{1F3C8}",
  Basketball: "\u{1F3C0}",
  Baseball: "⚾",
  "Ice Hockey": "\u{1F3D2}",
};

export type BetStatus = "pending" | "won" | "lost";
export type LegResult = "pending" | "won" | "lost";

export interface Leg {
  id: string;
  sport: Sport;
  description: string;
  odds: number | null;
  result: LegResult;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
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
  legs: Leg[];
}
