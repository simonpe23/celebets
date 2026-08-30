// THE PORTFOLIO ENGINE, shared by every view of the living preview.
// Pure computation, no UI. Extracted so Home, Fact Page, Compare,
// Map and the rest all speak identical numbers.
//
// Ranking = meaningfulness: money x evidence x actionability x
// recency. See PORTFOLIO-VIEWS.md for the rulings behind it.

import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";

export type GroupKey = "sport" | "what" | "where" | "when" | "how" | "risk";
export type Chip = {
  group: GroupKey;
  kind: "category" | "market" | "plain";
  value: string;
};

export const GROUP_ORDER: GroupKey[] = [
  "sport",
  "what",
  "where",
  "when",
  "how",
  "risk",
];
export const MUTED = new Set([
  "No category",
  "Unclassified",
  "No competition set",
]);

const DIM_WEIGHT: Record<GroupKey, number> = {
  what: 1,
  where: 1,
  sport: 0.9,
  how: 0.85,
  when: 0.8,
  risk: 0.6,
};

export const ICONS: Record<string, string> = {
  Football: "⚽",
  Baseball: "⚾",
  Tennis: "\u{1F3BE}",
  Crypto: "\u{1FA99}",
  "Ice Hockey": "\u{1F3D2}",
  "American Football": "\u{1F3C8}",
  esports: "\u{1F3AE}",
  Basketball: "\u{1F3C0}",
  Moneyline: "\u{1F3AF}",
  "Spread / Handicap": "⚖️",
  "Match Props": "\u{1F9E9}",
  BTTS: "\u{1F945}",
  "Totals (Over/Under)": "\u{1F522}",
  Corners: "\u{1F6A9}",
  "First to Score": "⚡",
  "Player Props": "\u{1F3C3}",
  "Price Direction": "\u{1F4C8}",
  "Premier League":
    "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "Champions League": "\u{1F3C6}",
  "La Liga": "\u{1F1EA}\u{1F1F8}",
  Eredivisie: "\u{1F1F3}\u{1F1F1}",
  "Ligue 1": "\u{1F1EB}\u{1F1F7}",
  Bundesliga: "\u{1F1E9}\u{1F1EA}",
  "Serie A": "\u{1F1EE}\u{1F1F9}",
  MLB: "⚾",
  NBA: "\u{1F3C0}",
  NHL: "\u{1F3D2}",
  NFL: "\u{1F3C8}",
  ATP: "\u{1F3BE}",
  WTA: "\u{1F3BE}",
  Wimbledon: "\u{1F3BE}",
  "Roland Garros": "\u{1F3BE}",
  "US Open": "\u{1F3BE}",
  CS2: "\u{1F3AE}",
  "League of Legends": "\u{1F3AE}",
  "Full time": "⏱️",
  "1st Half": "\u{1F551}",
  Singles: "\u{1F3AB}",
  Parlays: "\u{1F9FE}",
  "Low odds": "\u{1F7E2}",
  "Medium odds": "\u{1F7E1}",
  "High odds": "\u{1F534}",
};

export function iconFor(value: string): string {
  return ICONS[value] ?? "\u{1F4CA}";
}

function riskOf(leg: Leg): string | null {
  if (leg.odds === null) return null;
  const o = Number(leg.odds);
  if (o <= 1.8) return "Low odds";
  if (o <= 3) return "Medium odds";
  return "High odds";
}

function valueOf(bet: BetWithLegs, leg: Leg, g: GroupKey): string | null {
  if (g === "sport") return leg.sport;
  if (g === "what") return leg.subcategory ?? "No category";
  if (g === "where") return leg.competition ?? "No competition set";
  if (g === "when") return leg.period ?? "Full time";
  if (g === "how") return bet.legs.length > 1 ? "Parlays" : "Singles";
  return riskOf(leg);
}

function chipMatches(bet: BetWithLegs, leg: Leg, c: Chip): boolean {
  if (c.group === "what" && c.kind === "market")
    return (leg.market ?? "") === c.value;
  return valueOf(bet, leg, c.group) === c.value;
}

function pickCount(bet: BetWithLegs): number {
  return Math.max(1, (bet.bet_buys ?? []).length);
}

export interface Stats {
  wins: number;
  losses: number;
  profit: number;
  staked: number;
  bets: number;
}

export interface Fact {
  chip: Chip;
  s: Stats;
  score: number;
  recent: number;
  spark: number[];
}

export function money(v: number): string {
  const r = Math.round(v);
  return `${r < 0 ? "-" : "+"}$${Math.abs(r).toLocaleString("en-US")}`;
}

export function hitOf(s: Stats): string {
  return s.wins + s.losses > 0
    ? `${Math.round((s.wins / (s.wins + s.losses)) * 100)}%`
    : "-";
}

export function roiOf(s: Stats): string {
  return s.staked > 0 ? `${((s.profit / s.staked) * 100).toFixed(1)}%` : "-";
}

// TWINS: two facts covering exactly the same bets.
//
// In a real record this happens constantly. Every one of the owner's
// American Football bets is an NFL bet, so "American Football" and
// "NFL" are the same set under two names, with the same record and
// the same profit to the dollar. Same for Baseball and MLB, Ice
// Hockey and NHL, Basketball and NBA.
//
// THIS USED TO BE APPLIED TO EVERYTHING, AND IT SILENTLY DELETED
// EVERY ONE OF THOSE SPORTS. Caught by the owner on 23 August 2026:
// "i can not filter on sport... i can compare leagues but not
// sports." He was exactly right, and the cause was here. A league
// scores slightly higher than a sport (DIM_WEIGHT), so the league
// always won and the sport vanished from search, from the compare
// picker and from the builder. His own starting question for this
// whole design was "where am I leaking, baseball, hockey or
// football", and the tool had quietly removed two of the three
// words.
//
// THE RULE NOW: a twin is only hidden where showing both would be a
// LIE about size, which is a ranked list or a treemap (two tiles for
// one set of bets double-counts the area). It is never hidden in the
// vocabulary: search, the tabs, the compare picker and the Explore
// grid all offer every fact the record contains.
export function dedupeFacts(facts: Fact[]): Fact[] {
  const seen = new Set<string>();
  return facts.filter(({ s }) => {
    const sig = `${s.wins}|${s.losses}|${Math.round(s.profit)}`;
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });
}

export type SortMode = "impact" | "profit" | "roi" | "hit";
export const SORT_LABELS: Record<SortMode, string> = {
  impact: "By impact",
  profit: "By profit",
  roi: "By ROI",
  hit: "By hit rate",
};

const WEEK = 7 * 86400000;

export interface Engine {
  settled: BetWithLegs[];
  now: number;
  statsFor: (filters: Chip[], before?: number, after?: number) => Stats;
  sparkFor: (filters: Chip[]) => number[];
  seriesFor: (filters: Chip[]) => { t: number; v: number }[];
  // Cumulative totals after each settled bet that touches the
  // filters, so any metric (profit, ROI, hit rate) can be drawn as a
  // line without a second pass over the data.
  runningFor: (filters: Chip[]) => {
    t: number;
    profit: number;
    staked: number;
    wins: number;
    losses: number;
  }[];
  rankedFacts: (context: Chip[], minPicks: number, before?: number) => Fact[];
  sortFacts: (facts: Fact[], mode: SortMode) => Fact[];
  // The bets behind a selection, newest first, for the All Bets page.
  // It lives here rather than in that page so there is ONE matcher:
  // a list that disagreed with the record above it would be worse
  // than no list.
  betsFor: (filters: Chip[]) => MatchedBet[];
}

export type MatchedBet = {
  bet: BetWithLegs;
  // How many of the slip's picks the selection actually covers. A
  // three pick parlay with one Football leg is a Football bet, but
  // saying so without saying "1 of 3" overstates it.
  matched: number;
  legs: number;
};

export function makeEngine(bets: BetWithLegs[]): Engine {
  const settled = bets.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );
  const now = Math.max(
    ...settled.map((b) => new Date(b.settled_at as string).getTime())
  );

  function statsFor(filters: Chip[], before?: number, after?: number): Stats {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const s: Stats = { wins: 0, losses: 0, profit: 0, staked: 0, bets: 0 };
    for (const bet of settled) {
      const t = new Date(bet.settled_at as string).getTime();
      if (before !== undefined && t >= before) continue;
      if (after !== undefined && t < after) continue;
      const shares = legShares(bet);
      const stakes = legStakeShares(bet);
      const isSingle = bet.legs.length === 1;
      let any = false;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        any = true;
        const result = effectiveResult(bet, leg);
        const picks = isSingle ? pickCount(bet) : 1;
        if (result === "won") s.wins += picks;
        if (result === "lost") s.losses += picks;
        s.profit += shares[i] ?? 0;
        s.staked += stakes[i] ?? 0;
      });
      if (any) s.bets += 1;
    }
    return s;
  }

  function betsFor(filters: Chip[]): MatchedBet[] {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const out: MatchedBet[] = [];
    for (const bet of settled) {
      let matched = 0;
      bet.legs.forEach((leg) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        matched += 1;
      });
      if (matched > 0) out.push({ bet, matched, legs: bet.legs.length });
    }
    return out.sort(
      (a, b) =>
        new Date(b.bet.settled_at ?? 0).getTime() -
        new Date(a.bet.settled_at ?? 0).getTime()
    );
  }

  function seriesFor(filters: Chip[]): { t: number; v: number }[] {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const rows: { t: number; v: number }[] = [];
    let run = 0;
    const ordered = [...settled].sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );
    for (const bet of ordered) {
      const shares = legShares(bet);
      let touched = false;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        run += shares[i] ?? 0;
        touched = true;
      });
      if (touched)
        rows.push({ t: new Date(bet.settled_at as string).getTime(), v: run });
    }
    if (rows.length > 0) rows.unshift({ t: rows[0].t - 86400000, v: 0 });
    return rows;
  }

  function sparkFor(filters: Chip[]): number[] {
    return seriesFor(filters)
      .map((p) => p.v)
      .slice(-14);
  }

  const board: Chip[] = (() => {
    const out: Chip[] = [];
    const seen = new Set<string>();
    for (const bet of settled) {
      for (const leg of bet.legs) {
        for (const g of GROUP_ORDER) {
          const v = valueOf(bet, leg, g);
          if (v === null) continue;
          const key = `${g}|${v}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            group: g,
            kind: g === "what" ? "category" : "plain",
            value: v,
          });
        }
        if (leg.market && leg.market !== leg.subcategory) {
          const key = `what|m:${leg.market}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push({ group: "what", kind: "market", value: leg.market });
          }
        }
      }
    }
    return out;
  })();

  function rankedFacts(
    context: Chip[],
    minPicks: number,
    before?: number
  ): Fact[] {
    const whole = statsFor(context, before);
    const facts: Fact[] = [];
    for (const chip of board) {
      if (context.some((c) => c.group === chip.group)) continue;
      if (MUTED.has(chip.value)) continue;
      const s = statsFor([...context, chip], before);
      const picks = s.wins + s.losses;
      if (picks < minPicks) continue;
      if (picks > 0.85 * (whole.wins + whole.losses)) continue;
      const recentStats = statsFor(
        [...context, chip],
        before,
        (before ?? now + 1) - WEEK
      );
      const recentPicks = recentStats.wins + recentStats.losses;
      const recentShare = picks > 0 ? recentPicks / picks : 0;
      const score =
        Math.abs(s.profit) *
        Math.sqrt(picks / (picks + 10)) *
        DIM_WEIGHT[chip.group] *
        (1 + 0.4 * recentShare);
      facts.push({ chip, s, score, recent: recentStats.profit, spark: [] });
    }
    facts.sort((a, b) => b.score - a.score);
    return facts;
  }

  function sortFacts(facts: Fact[], mode: SortMode): Fact[] {
    const arr = [...facts];
    if (mode === "impact") return arr.sort((a, b) => b.score - a.score);
    if (mode === "profit")
      return arr.sort((a, b) => b.s.profit - a.s.profit);
    if (mode === "roi")
      return arr.sort(
        (a, b) =>
          (b.s.staked > 0 ? b.s.profit / b.s.staked : -9) -
          (a.s.staked > 0 ? a.s.profit / a.s.staked : -9)
      );
    return arr.sort(
      (a, b) =>
        b.s.wins / Math.max(1, b.s.wins + b.s.losses) -
        a.s.wins / Math.max(1, a.s.wins + a.s.losses)
    );
  }

  function runningFor(filters: Chip[]) {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const out: {
      t: number;
      profit: number;
      staked: number;
      wins: number;
      losses: number;
    }[] = [];
    let profit = 0;
    let staked = 0;
    let wins = 0;
    let losses = 0;
    const ordered = [...settled].sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );
    for (const bet of ordered) {
      const shares = legShares(bet);
      const stakes = legStakeShares(bet);
      const isSingle = bet.legs.length === 1;
      let touched = false;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        const result = effectiveResult(bet, leg);
        const picks = isSingle ? pickCount(bet) : 1;
        if (result === "won") wins += picks;
        if (result === "lost") losses += picks;
        profit += shares[i] ?? 0;
        staked += stakes[i] ?? 0;
        touched = true;
      });
      if (touched)
        out.push({
          t: new Date(bet.settled_at as string).getTime(),
          profit,
          staked,
          wins,
          losses,
        });
    }
    return out;
  }

  return {
    settled,
    now,
    statsFor,
    sparkFor,
    seriesFor,
    runningFor,
    betsFor,
    rankedFacts,
    sortFacts,
  };
}
