import { formatMoney, formatSignedMoney, round2 } from "./format";
import { SPORTS, type BetWithLegs, type Sport } from "./types";

// Realized profit of a settled bet.
// Won: payout minus stake. Lost: minus the stake.
export function betProfit(bet: BetWithLegs): number {
  if (bet.status === "won") {
    return Number(bet.payout ?? 0) - Number(bet.stake);
  }
  if (bet.status === "lost") {
    return -Number(bet.stake);
  }
  return 0;
}

// Splits a settled bet's profit across its legs, by index.
// Won bets: odds-weighted split. Each leg's share follows its risk
// (odds minus 1). If any leg has no odds, fall back to an even split.
// Lost bets: the losing leg(s) carry the whole loss, split evenly
// among them. Legs that were right in a lost bet get exactly zero.
export function legShares(bet: BetWithLegs): number[] {
  const profit = betProfit(bet);
  const n = bet.legs.length;
  if (n === 0) return [];

  if (bet.status === "won") {
    const odds = bet.legs.map((leg) =>
      leg.odds === null ? null : Number(leg.odds)
    );
    if (odds.every((o) => o !== null && o > 1)) {
      const weights = odds.map((o) => (o as number) - 1);
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      if (totalWeight > 0) {
        return weights.map((w) => (profit * w) / totalWeight);
      }
    }
    return bet.legs.map(() => profit / n);
  }

  if (bet.status === "lost") {
    const losers = bet.legs.filter((leg) => leg.result === "lost").length;
    if (losers > 0) {
      return bet.legs.map((leg) =>
        leg.result === "lost" ? profit / losers : 0
      );
    }
    return bet.legs.map(() => profit / n);
  }

  return bet.legs.map(() => 0);
}

export interface SportRow {
  sport: Sport;
  wins: number;
  losses: number;
  profit: number;
}

// Per-sport record and money over a set of settled bets.
export function sportRows(bets: BetWithLegs[]): SportRow[] {
  const map = new Map<Sport, SportRow>(
    SPORTS.map((sport) => [sport, { sport, wins: 0, losses: 0, profit: 0 }])
  );

  for (const bet of bets) {
    const shares = legShares(bet);
    bet.legs.forEach((leg, i) => {
      const row = map.get(leg.sport);
      if (!row) return;
      if (leg.result === "won") row.wins += 1;
      if (leg.result === "lost") row.losses += 1;
      row.profit += shares[i];
    });
  }

  return [...map.values()];
}

export interface TypeRow {
  label: string;
  betsWon: number;
  betsTotal: number;
  profit: number;
}

// Singles vs parlays over a set of settled bets.
export function typeRows(bets: BetWithLegs[]): TypeRow[] {
  const rows: TypeRow[] = [
    { label: "Singles", betsWon: 0, betsTotal: 0, profit: 0 },
    { label: "Parlays", betsWon: 0, betsTotal: 0, profit: 0 },
  ];

  for (const bet of bets) {
    const row = bet.legs.length > 1 ? rows[1] : rows[0];
    row.betsTotal += 1;
    if (bet.status === "won") row.betsWon += 1;
    row.profit += betProfit(bet);
  }

  return rows;
}

export const ODDS_BUCKETS = [
  { label: "Low (1.01-1.80)", min: 1.01, max: 1.8 },
  { label: "Medium (1.81-3.00)", min: 1.81, max: 3.0 },
  { label: "High (3.01+)", min: 3.01, max: Infinity },
] as const;

export interface BucketRow {
  label: string;
  wins: number;
  total: number;
}

// Settled legs with known odds, grouped by how risky the pick was.
// Legs without odds cannot be grouped and are left out here.
export function bucketRows(
  bets: BetWithLegs[],
  sportFilter: Sport | null
): BucketRow[] {
  const rows: BucketRow[] = ODDS_BUCKETS.map((b) => ({
    label: b.label,
    wins: 0,
    total: 0,
  }));

  for (const bet of bets) {
    for (const leg of bet.legs) {
      if (leg.result === "pending") continue;
      if (leg.odds === null) continue;
      if (sportFilter !== null && leg.sport !== sportFilter) continue;
      const odds = Number(leg.odds);
      const index = odds <= 1.8 ? 0 : odds <= 3.0 ? 1 : 2;
      rows[index].total += 1;
      if (leg.result === "won") rows[index].wins += 1;
    }
  }

  return rows;
}

export interface Totals {
  staked: number;
  returned: number;
  roi: number | null;
}

export function totals(bets: BetWithLegs[]): Totals {
  const staked = bets.reduce((sum, b) => sum + Number(b.stake), 0);
  const returned = bets
    .filter((b) => b.status === "won")
    .reduce((sum, b) => sum + Number(b.payout ?? 0), 0);
  const roi = staked > 0 ? ((returned - staked) / staked) * 100 : null;
  return { staked, returned, roi };
}

function pct(wins: number, total: number): number {
  return Math.round((wins / total) * 100);
}

function usd(amount: number): string {
  return formatSignedMoney(round2(amount));
}

export interface Insight {
  // Statements are grouped by category so one mix shows variety
  // instead of four statements of the same kind.
  category: string;
  text: string;
}

// Advice: judgment calls that need at least 5 settled bets or picks
// behind every group they compare. Less data would mislead.
function adviceInsights(settledBets: BetWithLegs[]): Insight[] {
  const out: Insight[] = [];
  const MIN = 5;

  // 1. Best and worst sport by money.
  const bySport = sportRows(settledBets).filter(
    (r) => r.wins + r.losses >= MIN
  );
  if (bySport.length >= 2) {
    const sorted = [...bySport].sort((a, b) => b.profit - a.profit);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    out.push({
      category: "advice-sport",
      text:
        `${best.sport} is your best sport: ${usd(best.profit)} over ` +
        `${best.wins + best.losses} picks. ${worst.sport} is your worst: ` +
        `${usd(worst.profit)} over ${worst.wins + worst.losses} picks.`,
    });
  }

  // 2. Singles vs parlays.
  const [singles, parlays] = typeRows(settledBets);
  if (singles.betsTotal >= MIN && parlays.betsTotal >= MIN) {
    const sPct = pct(singles.betsWon, singles.betsTotal);
    const pPct = pct(parlays.betsWon, parlays.betsTotal);
    let verdict = "Both types are performing about the same.";
    if (singles.profit > 0 && parlays.profit < 0) {
      verdict = "Singles are making you money, parlays are not.";
    } else if (parlays.profit > 0 && singles.profit < 0) {
      verdict = "Parlays are making you money, singles are not.";
    } else if (singles.profit < 0 && parlays.profit < 0) {
      verdict = "Both types are losing you money right now.";
    } else if (singles.profit > 0 && parlays.profit > 0) {
      verdict = "Both types are profitable. Nice.";
    }
    out.push({
      category: "advice-type",
      text:
        `Your singles hit ${sPct}% (${singles.betsWon} of ${singles.betsTotal}) ` +
        `vs ${pPct}% (${parlays.betsWon} of ${parlays.betsTotal}) on parlays. ` +
        verdict,
    });
  }

  // 3. Odds groups: compare your strongest and weakest group.
  const buckets = bucketRows(settledBets, null).filter((b) => b.total >= MIN);
  if (buckets.length >= 2) {
    const sorted = [...buckets].sort(
      (a, b) => b.wins / b.total - a.wins / a.total
    );
    const hi = sorted[0];
    const lo = sorted[sorted.length - 1];
    out.push({
      category: "advice-odds",
      text:
        `You win ${pct(hi.wins, hi.total)}% of picks at ${hi.label.toLowerCase()} ` +
        `odds but only ${pct(lo.wins, lo.total)}% at ${lo.label.toLowerCase()} odds.`,
    });
  }

  // 4. Overall ROI.
  if (settledBets.length >= MIN) {
    const t = totals(settledBets);
    if (t.roi !== null) {
      out.push({
        category: "advice-roi",
        text:
          `All time you have staked ${formatMoney(round2(t.staked))} ` +
          `and collected ${formatMoney(round2(t.returned))}. ` +
          `That is an ROI of ${t.roi.toFixed(1)}%.`,
      });
    }
  }

  return out;
}

// Observations: plain facts. Any true fact qualifies, no minimum.
function observationInsights(settledBets: BetWithLegs[]): Insight[] {
  const out: Insight[] = [];

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceMonday = (startToday.getDay() + 6) % 7;
  const startWeek = new Date(startToday);
  startWeek.setDate(startToday.getDate() - daysSinceMonday);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const periods: { label: string; from: Date | null }[] = [
    { label: "this week", from: startWeek },
    { label: "this month", from: startMonth },
    { label: "overall", from: null },
  ];

  // Per sport, per period: a record fact and a money fact.
  for (const { label, from } of periods) {
    const bets =
      from === null
        ? settledBets
        : settledBets.filter(
            (b) => b.settled_at && new Date(b.settled_at) >= from
          );
    for (const row of sportRows(bets)) {
      const picks = row.wins + row.losses;
      if (picks === 0) continue;
      out.push({
        category: `record-${row.sport}`,
        text: `You have picked right on ${row.wins} of ${picks} ${row.sport} picks ${label}.`,
      });
      const profit = round2(row.profit);
      if (profit > 0) {
        out.push({
          category: `money-${row.sport}`,
          text: `${row.sport} has made you ${formatMoney(profit)} ${label}.`,
        });
      } else if (profit < 0) {
        out.push({
          category: `money-${row.sport}`,
          text: `${row.sport} has cost you ${formatMoney(-profit)} ${label}.`,
        });
      }
    }
  }

  // Current streak of won or lost bets, newest first.
  const byDate = [...settledBets].sort(
    (a, b) =>
      new Date(b.settled_at ?? 0).getTime() -
      new Date(a.settled_at ?? 0).getTime()
  );
  if (byDate.length >= 2) {
    const streakStatus = byDate[0].status;
    let streak = 0;
    for (const bet of byDate) {
      if (bet.status !== streakStatus) break;
      streak += 1;
    }
    if (streak >= 2) {
      out.push({
        category: "streak",
        text: `You have ${streakStatus} your last ${streak} bets.`,
      });
    }
  }

  // Biggest win and biggest loss.
  const wonBets = settledBets.filter((b) => b.status === "won");
  if (wonBets.length > 0) {
    const biggest = wonBets.reduce((a, b) =>
      betProfit(b) > betProfit(a) ? b : a
    );
    out.push({
      category: "biggest-win",
      text:
        `Your biggest win so far: ${usd(betProfit(biggest))} ` +
        `(${formatMoney(Number(biggest.stake))} at odds ${Number(
          biggest.total_odds
        ).toFixed(2)}).`,
    });
  }
  const lostBets = settledBets.filter((b) => b.status === "lost");
  if (lostBets.length > 0) {
    const biggest = lostBets.reduce((a, b) =>
      betProfit(b) < betProfit(a) ? b : a
    );
    out.push({
      category: "biggest-loss",
      text: `Your biggest loss so far: ${usd(betProfit(biggest))}.`,
    });
  }

  return out;
}

// The full pool of statements that are currently true.
export function buildInsightPool(settledBets: BetWithLegs[]): Insight[] {
  return [...adviceInsights(settledBets), ...observationInsights(settledBets)];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Picks a random mix, at most one statement per category per round,
// so one tap never shows four facts of the same kind.
export function pickInsights(pool: Insight[], count = 4): string[] {
  const byCategory = new Map<string, Insight[]>();
  for (const insight of shuffle(pool)) {
    const list = byCategory.get(insight.category) ?? [];
    list.push(insight);
    byCategory.set(insight.category, list);
  }

  const categories = shuffle([...byCategory.keys()]);
  const picked: string[] = [];
  let round = 0;
  while (picked.length < count) {
    let added = false;
    for (const category of categories) {
      if (picked.length >= count) break;
      const list = byCategory.get(category) ?? [];
      if (round < list.length) {
        picked.push(list[round].text);
        added = true;
      }
    }
    if (!added) break;
    round += 1;
  }

  return picked;
}
