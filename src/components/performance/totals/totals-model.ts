// Totals' numbers. Every figure is computed from the same fixture and
// the same engine Lab and Compare use, so the four pages never
// disagree. Nothing here decides how anything looks.

import type { BetWithLegs } from "@/lib/types";
import { betProfit, legShares, legStakeShares } from "@/lib/stats";
import { MUTED, type Chip, type Engine, type Stats } from "@/lib/performance-engine";

export type Row = {
  key: string;
  label: string;
  wins: number;
  losses: number;
  profit: number;
  staked: number;
};

const empty = (key: string, label: string): Row => ({
  key,
  label,
  wins: 0,
  losses: 0,
  profit: 0,
  staked: 0,
});

// One pass per dimension, so a sport's profit and its staked come
// from the same leg split that src/lib/stats.ts uses everywhere.
function rowsBy(
  bets: BetWithLegs[],
  of: (bet: BetWithLegs, leg: BetWithLegs["legs"][number]) => string | null,
  wonOf: (bet: BetWithLegs, leg: BetWithLegs["legs"][number]) => boolean | null
): Row[] {
  const map = new Map<string, Row>();
  for (const bet of bets) {
    const shares = legShares(bet);
    const stakes = legStakeShares(bet);
    bet.legs.forEach((leg, i) => {
      const key = of(bet, leg);
      if (key === null || MUTED.has(key)) return;
      const row = map.get(key) ?? empty(key, key);
      const won = wonOf(bet, leg);
      if (won === true) row.wins += 1;
      if (won === false) row.losses += 1;
      row.profit += shares[i] ?? 0;
      row.staked += stakes[i] ?? 0;
      map.set(key, row);
    });
  }
  return [...map.values()];
}

const legWon = (bet: BetWithLegs, leg: BetWithLegs["legs"][number]) =>
  leg.result === "pending" ? null : leg.result === "won";

export function sportRows(bets: BetWithLegs[]): Row[] {
  return rowsBy(bets, (_b, leg) => leg.sport, legWon).sort(
    (a, b) => b.profit - a.profit
  );
}

export function categoryRows(bets: BetWithLegs[]): Row[] {
  return rowsBy(bets, (_b, leg) => leg.subcategory, legWon).sort(
    (a, b) => b.profit - a.profit
  );
}

// The odds bands, with the canonical boundaries from
// src/lib/stats.ts: low to 1.80, medium to 3.00, high above.
export const BANDS = [
  { key: "Low odds", label: "Low", range: "(1.01-1.80)" },
  { key: "Medium odds", label: "Medium", range: "(1.81-3.00)" },
  { key: "High odds", label: "High", range: "(3.01+)" },
] as const;

export function bandRows(bets: BetWithLegs[]): Row[] {
  const band = (leg: BetWithLegs["legs"][number]) => {
    if (leg.odds === null) return null;
    const o = Number(leg.odds);
    return o <= 1.8 ? "Low odds" : o <= 3 ? "Medium odds" : "High odds";
  };
  const rows = rowsBy(bets, (_b, leg) => band(leg), legWon);
  return BANDS.map(
    (b) => rows.find((r) => r.key === b.key) ?? empty(b.key, b.key)
  );
}

export function typeRows(bets: BetWithLegs[]): Row[] {
  const rows = rowsBy(
    bets,
    (bet) => (bet.legs.length > 1 ? "Parlays" : "Singles"),
    legWon
  );
  return ["Singles", "Parlays"].map(
    (k) => rows.find((r) => r.key === k) ?? empty(k, k)
  );
}

// The whole record, and the two figures the KPI strip adds to Lab's
// four: the average decimal odds a pick was taken at, and the money
// that came back.
export function overall(engine: Engine): Stats & {
  avgOdds: number | null;
  returned: number;
  picks: number;
} {
  const s = engine.statsFor([] as Chip[]);
  let oddsSum = 0;
  let oddsCount = 0;
  for (const bet of engine.settled)
    for (const leg of bet.legs) {
      if (leg.odds === null) continue;
      oddsSum += Number(leg.odds);
      oddsCount += 1;
    }
  return {
    ...s,
    picks: s.wins + s.losses,
    avgOdds: oddsCount > 0 ? oddsSum / oddsCount : null,
    returned: s.staked + s.profit,
  };
}

export type RecentBet = {
  id: string;
  when: number;
  sport: string;
  league: string | null;
  pick: string;
  legs: number;
  odds: number | null;
  profit: number;
};

// The ledger at the foot of the page, newest first.
export function recentBets(bets: BetWithLegs[], n: number): RecentBet[] {
  return [...bets]
    .sort(
      (a, b) =>
        new Date(b.settled_at ?? 0).getTime() -
        new Date(a.settled_at ?? 0).getTime()
    )
    .slice(0, n)
    .map((bet) => ({
      id: bet.id,
      when: new Date(bet.settled_at as string).getTime(),
      sport: bet.legs[0]?.sport ?? "Other",
      league: bet.legs[0]?.competition ?? null,
      pick:
        bet.legs.length > 1
          ? `${bet.legs.length} pick parlay`
          : (bet.legs[0]?.description ?? "Pick"),
      legs: bet.legs.length,
      odds: bet.total_odds === null ? null : Number(bet.total_odds),
      profit: betProfit(bet),
    }));
}

export const hitOf = (r: { wins: number; losses: number }) =>
  r.wins + r.losses > 0 ? r.wins / (r.wins + r.losses) : null;
