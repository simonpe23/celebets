// WHAT A NEW USER ACTUALLY HAS. Six records, from an empty account to
// ten settled bets, so the app's first days can be looked at instead
// of argued about.
//
// Built 2 September 2026 for the silence job. His words: "Actuals says
// nothing to a new user for a long time, and I only found out by
// asking." These are the records that proved it.
//
// DEMO NUMBERS ONLY. The previews are public by his ruling of 28
// August 2026, so no real user data may ever appear here.
//
// The shapes are deliberate, not arbitrary:
//   none     an account that has done nothing at all
//   pending  the very first action, one bet still running
//   one      one settled bet, the first thing the app could talk about
//   three    three settled bets, all Football, which is what people do
//   six      SIX SETTLED FOOTBALL BETS, the case he named in the brief
//   ten      ten across two sports, which is what "some variety" means

import type { BetWithLegs, Leg, Sport } from "@/lib/types";

// DATES ARE COUNTED BACK FROM TODAY, not from a fixed day.
//
// A fixed anchor was the first attempt and it was wrong. The records
// aged as real time passed, so bets drifted out of the "this week" and
// "this month" windows that the insight cards read, and `emptytest`
// reported a different scoreboard on two runs an hour apart. A check
// that changes its answer while the code stands still is worse than no
// check.
//
// Counting back from today keeps every record the same age forever, so
// the check is stable. The cost is that date labels differ between two
// screenshots taken on different days, which is what the other demo
// data (lab-data.ts) has always done and has never mattered.
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

let n = 0;

function leg(
  sport: Sport,
  description: string,
  odds: number,
  won: boolean,
  subcategory: string,
  market: string,
  competition: string | null
): Omit<Leg, "id"> {
  return {
    sport,
    description,
    odds,
    result: won ? "won" : "lost",
    subcategory,
    market,
    period: null,
    competition,
    provider_market: null,
  };
}

function settled(stake: number, days: number, legs: Omit<Leg, "id">[]): BetWithLegs {
  n += 1;
  const won = legs.every((l) => l.result === "won");
  const odds =
    Math.round(legs.reduce((acc, l) => acc * (l.odds ?? 1), 1) * 10000) / 10000;
  return {
    id: `fb${n}`,
    stake,
    total_odds: odds,
    status: won ? "won" : "lost",
    placed_at: daysAgo(days + 1),
    settled_at: daysAgo(days),
    payout: won ? Math.round(stake * odds * 100) / 100 : 0,
    cashed_out: false,
    bet_buys: [],
    legs: legs.map((l, i) => ({ ...l, id: `fb${n}-${i}` })),
  };
}

function running(stake: number, days: number, legs: Omit<Leg, "id">[]): BetWithLegs {
  n += 1;
  const odds =
    Math.round(legs.reduce((acc, l) => acc * (l.odds ?? 1), 1) * 10000) / 10000;
  return {
    id: `fb${n}`,
    stake,
    total_odds: odds,
    status: "pending",
    placed_at: daysAgo(days),
    settled_at: null,
    payout: null,
    cashed_out: false,
    bet_buys: [],
    legs: legs.map((l, i) => ({ ...l, id: `fb${n}-${i}`, result: "pending" as const })),
  };
}

const arsenal = () =>
  leg("Football", "Arsenal to win", 1.85, true, "Moneyline", "Match Winner", "Premier League");

// ONE bet, still running. The very first thing anybody does.
const pending: BetWithLegs[] = [
  running(50, 0, [
    leg("Football", "Arsenal to win", 1.85, false, "Moneyline", "Match Winner", "Premier League"),
  ]),
];

const one: BetWithLegs[] = [settled(50, 3, [arsenal()])];

const three: BetWithLegs[] = [
  settled(50, 6, [arsenal()]),
  settled(40, 4, [
    leg("Football", "Over 2.5 goals", 2.1, false, "Totals (Over/Under)", "Match Total", "Premier League"),
  ]),
  settled(60, 2, [
    leg("Football", "Salah to score", 2.4, true, "Player Props", "Goalscorer", "Premier League"),
  ]),
];

// His own example, word for word: "someone with six settled Football
// bets". Today this record produces exactly one row, and it reads
// "Medium odds".
const six: BetWithLegs[] = [
  ...three,
  settled(30, 8, [
    leg("Football", "Chelsea to win", 1.7, false, "Moneyline", "Match Winner", "Premier League"),
  ]),
  settled(45, 1, [
    leg("Football", "Haaland to score", 2.05, true, "Player Props", "Goalscorer", "Premier League"),
  ]),
  settled(55, 5, [
    leg("Football", "Spurs to win", 2.3, false, "Moneyline", "Match Winner", "Premier League"),
  ]),
];

const ten: BetWithLegs[] = [
  settled(50, 20, [arsenal()]),
  settled(40, 18, [
    leg("Football", "Over 2.5 goals", 2.1, false, "Totals (Over/Under)", "Match Total", "Premier League"),
  ]),
  settled(60, 16, [
    leg("Football", "Salah to score", 2.4, true, "Player Props", "Goalscorer", "Premier League"),
  ]),
  settled(30, 14, [
    leg("Football", "Chelsea to win", 1.7, false, "Moneyline", "Match Winner", "Premier League"),
  ]),
  settled(45, 12, [
    leg("Basketball", "Celtics to win", 1.65, true, "Moneyline", "Match Winner", "NBA"),
  ]),
  settled(55, 10, [
    leg("Basketball", "Curry over 24.5 points", 2.3, false, "Player Props", "Points", "NBA"),
  ]),
  settled(35, 8, [
    leg("Football", "Spurs to win", 2.05, false, "Moneyline", "Match Winner", "Premier League"),
  ]),
  settled(70, 6, [
    leg("Basketball", "Lakers to win", 1.95, true, "Moneyline", "Match Winner", "NBA"),
  ]),
  settled(25, 4, [
    leg("Football", "Under 2.5 goals", 1.8, true, "Totals (Over/Under)", "Match Total", "Premier League"),
  ]),
  settled(65, 2, [
    leg("Basketball", "Jokic over 26.5 points", 2.6, false, "Player Props", "Points", "NBA"),
  ]),
];

export type FirstBetsKey = "none" | "pending" | "one" | "three" | "six" | "ten";

export const SETS: Record<FirstBetsKey, BetWithLegs[]> = {
  none: [],
  pending,
  one,
  three,
  six,
  ten,
};

export const SET_LABELS: Record<FirstBetsKey, string> = {
  none: "Nothing yet",
  pending: "1 bet, still running",
  one: "1 settled bet",
  three: "3 settled bets",
  six: "6 settled bets",
  ten: "10 settled bets",
};

export const SET_NOTES: Record<FirstBetsKey, string> = {
  none: "A brand new account. Signed up, tracked nothing.",
  pending: "Their very first action. Nothing has finished yet.",
  one: "The first thing the app could possibly talk about.",
  three: "All Football, which is what people actually do at first.",
  six: "His own example from the brief. All Football.",
  ten: "Football and Basketball. This is what “some variety” means.",
};

export const SET_ORDER: FirstBetsKey[] = ["none", "pending", "one", "three", "six", "ten"];

export function isFirstBetsKey(v: string): v is FirstBetsKey {
  return (SET_ORDER as string[]).includes(v);
}
