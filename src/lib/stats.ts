import { formatMoney, formatSignedMoney, round2 } from "./format";
import {
  TOPICS,
  type BetWithLegs,
  type Leg,
  type LegResult,
  type Sport,
} from "./types";

// A pick's result for the records. Picks that were still open when
// the bet was cashed out inherit the cash out outcome: profit means
// won picks, loss means lost picks.
// Where a calendar period begins, on the clock of whoever calls it.
// Weeks start on Monday. One function, used by the Performance page's
// period chips AND the balance band's Today/Week/Month/Year strip, so
// the same label can never mean two different date ranges.
export function periodStart(
  period: "today" | "week" | "month" | "year"
): Date {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "today") return startToday;
  if (period === "week") {
    const daysSinceMonday = (startToday.getDay() + 6) % 7;
    const monday = new Date(startToday);
    monday.setDate(startToday.getDate() - daysSinceMonday);
    return monday;
  }
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), 0, 1);
}

export function effectiveResult(bet: BetWithLegs, leg: Leg): LegResult {
  if (leg.result !== "pending") return leg.result;
  if (bet.cashed_out && bet.status !== "pending") return bet.status;
  return "pending";
}

// Every buy on a single bet counts as its own pick. Falls back to 1
// for bets that predate the buys table.
function pickCount(bet: BetWithLegs): number {
  return Math.max(1, (bet.bet_buys ?? []).length);
}

// Realized profit of a settled bet. A payout exists on won bets and
// on cashed out bets (even lost ones), so the formula is the same
// everywhere: payout minus stake. A plain lost bet has no payout.
export function betProfit(bet: BetWithLegs): number {
  if (bet.status === "pending") return 0;
  return Number(bet.payout ?? 0) - Number(bet.stake);
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
    const losers = bet.legs.filter(
      (leg) => effectiveResult(bet, leg) === "lost"
    ).length;
    if (losers > 0) {
      return bet.legs.map((leg) =>
        effectiveResult(bet, leg) === "lost" ? profit / losers : 0
      );
    }
    return bet.legs.map(() => profit / n);
  }

  return bet.legs.map(() => 0);
}

// Splits a settled bet's STAKE across its legs, on exactly the weights
// legShares uses for the profit. That pairing is the whole point: a
// sport's staked and a sport's profit have to come from one rule or
// the ROI built on them is nonsense.
//
// Won bets: odds-weighted, so every sport in the bet shows the bet's
// own ROI. Lost bets: the whole stake sits on the losing leg(s), the
// same legs that carry the whole loss. A leg that came in inside a
// lost parlay is charged nothing, because it earned nothing: charging
// it would punish a pick that was right.
//
// This is the rule the owner had never been asked for, and without it
// per-sport ROI was a dash. Written down August 2026.
export function legStakeShares(bet: BetWithLegs): number[] {
  const stake = Number(bet.stake);
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
        return weights.map((w) => (stake * w) / totalWeight);
      }
    }
    return bet.legs.map(() => stake / n);
  }

  if (bet.status === "lost") {
    const losers = bet.legs.filter(
      (leg) => effectiveResult(bet, leg) === "lost"
    ).length;
    if (losers > 0) {
      return bet.legs.map((leg) =>
        effectiveResult(bet, leg) === "lost" ? stake / losers : 0
      );
    }
    return bet.legs.map(() => stake / n);
  }

  return bet.legs.map(() => 0);
}

// One settled bet's stake as a single sport carries it.
export function betStakedFor(bet: BetWithLegs, sport: Sport | null): number {
  if (sport === null) return Number(bet.stake);
  const shares = legStakeShares(bet);
  let sum = 0;
  bet.legs.forEach((leg, i) => {
    if (leg.sport === sport) sum += shares[i] ?? 0;
  });
  return sum;
}

// One settled bet's money as the profit chart counts it. With no
// sport chosen that is the whole bet. With a sport chosen it is only
// that sport's share, the same split the Per sport table uses.
export function betProfitFor(bet: BetWithLegs, sport: Sport | null): number {
  if (sport === null) return betProfit(bet);
  const shares = legShares(bet);
  let sum = 0;
  bet.legs.forEach((leg, i) => {
    if (leg.sport === sport) sum += shares[i] ?? 0;
  });
  return sum;
}

export interface SportRow {
  sport: Sport;
  wins: number;
  losses: number;
  profit: number;
}

// Per-sport record and money over a set of settled bets.
export function sportRows(bets: BetWithLegs[]): SportRow[] {
  // Seeded from TOPICS, not SPORTS: a leg whose topic has no row
  // here is dropped silently by the `if (!row)` guards below, so
  // seeding from SPORTS alone would have made every Crypto bet
  // vanish from this table the moment Crypto stopped being a sport.
  // Callers decide which rows to SHOW using NOT_SPORTS; this
  // function's job is only to count what exists.
  const map = new Map<Sport, SportRow>(
    TOPICS.map((sport) => [sport, { sport, wins: 0, losses: 0, profit: 0 }])
  );

  for (const bet of bets) {
    const shares = legShares(bet);
    if (bet.legs.length === 1) {
      // Singles: every buy counts as its own pick, all sharing the
      // bet's outcome (they are the same pick, bought several times).
      const leg = bet.legs[0];
      const row = map.get(leg.sport);
      if (!row) continue;
      const result = effectiveResult(bet, leg);
      if (result === "won") row.wins += pickCount(bet);
      if (result === "lost") row.losses += pickCount(bet);
      row.profit += shares[0] ?? 0;
    } else {
      bet.legs.forEach((leg, i) => {
        const row = map.get(leg.sport);
        if (!row) return;
        const result = effectiveResult(bet, leg);
        if (result === "won") row.wins += 1;
        if (result === "lost") row.losses += 1;
        row.profit += shares[i];
      });
    }
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

// Singles vs parlays seen from one sport's perspective: counts only
// that sport's picks, and only that sport's share of the money.
export function sportTypeRows(
  bets: BetWithLegs[],
  sport: Sport
): SportRow[] {
  const rows: SportRow[] = [
    { sport, wins: 0, losses: 0, profit: 0 },
    { sport, wins: 0, losses: 0, profit: 0 },
  ];

  for (const bet of bets) {
    const shares = legShares(bet);
    if (bet.legs.length === 1) {
      const leg = bet.legs[0];
      if (leg.sport !== sport) continue;
      const result = effectiveResult(bet, leg);
      if (result === "won") rows[0].wins += pickCount(bet);
      if (result === "lost") rows[0].losses += pickCount(bet);
      rows[0].profit += shares[0] ?? 0;
    } else {
      bet.legs.forEach((leg, i) => {
        if (leg.sport !== sport) return;
        const result = effectiveResult(bet, leg);
        if (result === "won") rows[1].wins += 1;
        if (result === "lost") rows[1].losses += 1;
        rows[1].profit += shares[i];
      });
    }
  }

  return rows;
}

export interface CategoryRow {
  label: string;
  wins: number;
  losses: number;
  profit: number;
}

// Picks grouped by canonical category (Moneyline, Match Props...),
// across every sport when none is chosen. A manual pick whose user
// never chose a category groups under "No category", a distinct fact
// from Unclassified (classification attempted and failed).
export function categoryRows(
  bets: BetWithLegs[],
  sport: Sport | null
): CategoryRow[] {
  const map = new Map<string, CategoryRow>();

  for (const bet of bets) {
    const shares = legShares(bet);
    const isSingle = bet.legs.length === 1;
    bet.legs.forEach((leg, i) => {
      if (sport !== null && leg.sport !== sport) return;
      const label = leg.subcategory ?? "No category";
      const row = map.get(label) ?? { label, wins: 0, losses: 0, profit: 0 };
      const result = effectiveResult(bet, leg);
      const picks = isSingle ? pickCount(bet) : 1;
      if (result === "won") row.wins += picks;
      if (result === "lost") row.losses += picks;
      row.profit += shares[i];
      map.set(label, row);
    });
  }

  return [...map.values()].sort(
    (a, b) => b.wins + b.losses - (a.wins + a.losses)
  );
}

// The drill-down inside one category: its picks grouped by the
// controlled market (Match Winner, To Advance, BTTS...), same money
// rules. Period joins the label where one exists, so a first-half
// winner reads "Match Winner · 1st Half".
export function marketRows(
  bets: BetWithLegs[],
  category: string,
  sport: Sport | null
): CategoryRow[] {
  const map = new Map<string, CategoryRow>();

  for (const bet of bets) {
    const shares = legShares(bet);
    const isSingle = bet.legs.length === 1;
    bet.legs.forEach((leg, i) => {
      if (sport !== null && leg.sport !== sport) return;
      if ((leg.subcategory ?? "No category") !== category) return;
      const base = leg.market ?? "Unspecified";
      const label = leg.period ? `${base} · ${leg.period}` : base;
      const row = map.get(label) ?? { label, wins: 0, losses: 0, profit: 0 };
      const result = effectiveResult(bet, leg);
      const picks = isSingle ? pickCount(bet) : 1;
      if (result === "won") row.wins += picks;
      if (result === "lost") row.losses += picks;
      row.profit += shares[i];
      map.set(label, row);
    });
  }

  return [...map.values()].sort(
    (a, b) => b.wins + b.losses - (a.wins + a.losses)
  );
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

  const add = (odds: number, won: boolean) => {
    if (!(odds > 1)) return;
    const index = odds <= 1.8 ? 0 : odds <= 3.0 ? 1 : 2;
    rows[index].total += 1;
    if (won) rows[index].wins += 1;
  };

  for (const bet of bets) {
    if (bet.legs.length === 1) {
      // Singles: each buy is its own pick, at that buy's own odds
      // (its payout divided by its amount).
      const leg = bet.legs[0];
      if (sportFilter !== null && leg.sport !== sportFilter) continue;
      const result = effectiveResult(bet, leg);
      if (result === "pending") continue;
      const buys = bet.bet_buys ?? [];
      if (buys.length > 0) {
        for (const buy of buys) {
          add(Number(buy.payout) / Number(buy.amount), result === "won");
        }
      } else if (leg.odds !== null) {
        add(Number(leg.odds), result === "won");
      }
    } else {
      for (const leg of bet.legs) {
        if (leg.odds === null) continue;
        if (sportFilter !== null && leg.sport !== sportFilter) continue;
        const result = effectiveResult(bet, leg);
        if (result === "pending") continue;
        add(Number(leg.odds), result === "won");
      }
    }
  }

  return rows;
}

export interface Totals {
  staked: number;
  returned: number;
  roi: number | null;
}

// With no sport chosen these are whole bets. With a sport chosen they
// are that sport's share of every bet it appears in, split by
// betStakedFor and betProfitFor, which run on one set of weights.
//
// This used to ignore the sport entirely, so picking Football showed
// the FULL stake of every parlay with a Football leg in it. Staked
// $4,525 and Returned $4,728 sat two lines under a headline of
// +$527.09, and the two numbers did not subtract to the third. The ROI
// tile showed a dash rather than admit it.
export function totals(bets: BetWithLegs[], sport: Sport | null = null): Totals {
  const staked = bets.reduce((sum, b) => sum + betStakedFor(b, sport), 0);
  // Returned is what came back, so it is the staked money plus the
  // profit on it. On a whole bet that is exactly the payout.
  const returned = bets.reduce(
    (sum, b) => sum + betStakedFor(b, sport) + betProfitFor(b, sport),
    0
  );
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

// Every statement that is currently true about ONE sport.
export function buildSportInsightPool(
  settledBets: BetWithLegs[],
  sport: Sport
): Insight[] {
  // Records and money for this sport, per period, from the full pool.
  const out = buildInsightPool(settledBets).filter(
    (i) => i.category === `record-${sport}` || i.category === `money-${sport}`
  );

  // This sport's picks in singles vs in parlays.
  const [singles, parlays] = sportTypeRows(settledBets, sport);
  const typeLabels = ["singles", "parlays"];
  [singles, parlays].forEach((row, i) => {
    const picks = row.wins + row.losses;
    if (picks === 0) return;
    out.push({
      category: `sport-type-${typeLabels[i]}`,
      text:
        `Your ${sport} picks in ${typeLabels[i]}: picked right on ` +
        `${row.wins} of ${picks}, money result ${usd(row.profit)}.`,
    });
  });

  // This sport's picks per odds group.
  for (const bucket of bucketRows(settledBets, sport)) {
    if (bucket.total === 0) continue;
    out.push({
      category: `sport-odds-${bucket.label}`,
      text:
        `At ${bucket.label.toLowerCase()} odds you have picked right on ` +
        `${bucket.wins} of ${bucket.total} ${sport} picks.`,
    });
  }

  // This sport's picks per sub-category.
  for (const row of categoryRows(settledBets, sport)) {
    if (row.label === "No category") continue;
    const picks = row.wins + row.losses;
    if (picks === 0) continue;
    out.push({
      category: `sport-cat-${row.label}`,
      text:
        `${sport}, ${row.label}: picked right on ${row.wins} of ${picks}, ` +
        `money result ${usd(row.profit)}.`,
    });
  }

  return out;
}

// ---------------------------------------------------------------
// KEY INSIGHTS: the three statements at the top of Performance.
//
// These are not the rotating pool. They are fixed, they always say the
// same thing for the same data, and they answer three questions in
// order: what am I good at, what is costing me, which way am I going.
//
// Everything here speaks in MONEY, never in a percentage. Ruled by the
// owner (August 2026): a parlay's stake covers several sports, so
// there is no honest per-sport or per-category ROI. Profit has no such
// problem, because betProfitFor already splits a bet's money across
// its picks by their odds.
// ---------------------------------------------------------------

export interface KeyInsight {
  kind: "strength" | "weakness" | "trend";
  // The thing itself: a sport, a category, a direction.
  headline: string;
  // The money or the movement behind it.
  value: string;
  // One line of plain English under it.
  detail: string;
  tone: "up" | "down" | "flat";
}

// A group needs this many settled picks before it is allowed to be
// called a strength or a weakness. Below it, one lucky bet decides.
const KEY_MIN_PICKS = 5;

interface Group {
  label: string;
  wins: number;
  losses: number;
  profit: number;
  // Set when the group is a whole sport, so the statement can name the
  // sub-category most of that money came from.
  sport?: Sport;
}

// Sports and sub-categories compete in one list, because the owner's
// own example mixed them: "MLB Favorites" beside "Player Props".
//
// A sport almost always beats its own sub-categories on absolute money,
// because it contains them. That is why the sport keeps a pointer back
// to itself: the headline stays the sport, and the detail line names
// the category that drove it. Ranking a part above its whole would
// need a rule nobody has agreed.
function keyGroups(settledBets: BetWithLegs[]): Group[] {
  const out: Group[] = [];

  for (const row of sportRows(settledBets)) {
    if (row.wins + row.losses < KEY_MIN_PICKS) continue;
    out.push({
      label: row.sport,
      wins: row.wins,
      losses: row.losses,
      profit: row.profit,
      sport: row.sport,
    });
  }

  // TOPICS, so "Crypto Price Direction" can still surface as an
  // insight now that Crypto is not a sport.
  for (const sport of TOPICS) {
    for (const row of categoryRows(settledBets, sport)) {
      if (row.label === "No category") continue;
      if (row.wins + row.losses < KEY_MIN_PICKS) continue;
      out.push({
        label: `${sport} ${row.label}`,
        wins: row.wins,
        losses: row.losses,
        profit: row.profit,
      });
    }
  }

  return out;
}

// The sub-category that drove a sport's result, named only when it
// carries most of the money. "Mostly Player Props" is worth saying;
// "mostly a category holding 8% of it" is noise.
function drivingCategory(
  settledBets: BetWithLegs[],
  group: Group
): string | null {
  if (!group.sport) return null;
  const rows = categoryRows(settledBets, group.sport).filter(
    (r) => r.label !== "No category"
  );
  if (rows.length === 0) return null;
  const wanted = group.profit >= 0 ? 1 : -1;
  const best = rows
    .filter((r) => Math.sign(r.profit) === wanted)
    .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))[0];
  if (!best) return null;
  if (Math.abs(best.profit) < Math.abs(group.profit) * 0.5) return null;
  return best.label;
}

// Profit per calendar week, oldest first, over the last `weeks` weeks.
function weeklyProfit(settledBets: BetWithLegs[], weeks: number): number[] {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceMonday = (startToday.getDay() + 6) % 7;
  const thisMonday = new Date(startToday);
  thisMonday.setDate(startToday.getDate() - daysSinceMonday);

  const out: number[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(thisMonday);
    from.setDate(thisMonday.getDate() - i * 7);
    const to = new Date(from);
    to.setDate(from.getDate() + 7);
    const inWeek = settledBets.filter((b) => {
      const settled = new Date(b.settled_at as string);
      return settled >= from && settled < to;
    });
    out.push(inWeek.reduce((sum, b) => sum + betProfit(b), 0));
  }
  return out;
}

export function keyInsights(settledBets: BetWithLegs[]): KeyInsight[] {
  const out: KeyInsight[] = [];
  const groups = keyGroups(settledBets);

  const winners = groups
    .filter((g) => g.profit > 0)
    .sort((a, b) => b.profit - a.profit);
  const losers = groups
    .filter((g) => g.profit < 0)
    .sort((a, b) => a.profit - b.profit);

  if (winners.length > 0) {
    const g = winners[0];
    const picks = g.wins + g.losses;
    const driver = drivingCategory(settledBets, g);
    out.push({
      kind: "strength",
      headline: g.label,
      value: usd(g.profit),
      detail: driver
        ? `Right on ${g.wins} of ${picks} picks, mostly ${driver}.`
        : `Right on ${g.wins} of ${picks} picks. Your best earner.`,
      tone: "up",
    });
  }

  if (losers.length > 0) {
    const g = losers[0];
    const picks = g.wins + g.losses;
    const driver = drivingCategory(settledBets, g);
    out.push({
      kind: "weakness",
      headline: g.label,
      value: usd(g.profit),
      detail: driver
        ? `Right on ${g.wins} of ${picks} picks, mostly ${driver}.`
        : `Right on ${g.wins} of ${picks} picks. Costing you the most.`,
      tone: "down",
    });
  }

  // Trending: the last three finished weeks, ignoring the week in
  // progress, because a Monday would otherwise always look like a
  // collapse. A run of three needs three finished weeks of data.
  const weeks = weeklyProfit(settledBets, 4).slice(0, 3);
  const hasWeeks = weeks.some((w) => w !== 0);
  if (hasWeeks) {
    const rising = weeks[0] < weeks[1] && weeks[1] < weeks[2];
    const falling = weeks[0] > weeks[1] && weeks[1] > weeks[2];
    const last = weeks[2];
    if (rising) {
      out.push({
        kind: "trend",
        headline: "Trending up",
        value: usd(last),
        detail: "Three weeks in a row of better results.",
        tone: "up",
      });
    } else if (falling) {
      out.push({
        kind: "trend",
        headline: "Trending down",
        value: usd(last),
        detail: "Three weeks in a row of worse results.",
        tone: "down",
      });
    } else {
      out.push({
        kind: "trend",
        headline: "Last full week",
        value: usd(last),
        detail: "No clear run up or down over the last three weeks.",
        tone: last > 0 ? "up" : last < 0 ? "down" : "flat",
      });
    }
  }

  return out;
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

// ---------------------------------------------------------------
// THE FRESH START LINE.
//
// A user who wants to "start over" does not want their bets deleted.
// They want their record to begin again. So Actuals stores a date, and
// everything before it stops counting toward profit while staying in
// the history.
//
// A bet belongs to the current period if it was NOT already settled
// before the line. That single rule carries pending bets over, which is
// what the owner wanted: a bet still riding when you draw the line is
// still live money, so it belongs to the new record, not the old one.
//
// The date lives in the auth user's metadata next to their name, so
// this needed no migration.
export function sinceLine(
  bets: BetWithLegs[],
  trackingSince: string | null
): BetWithLegs[] {
  if (!trackingSince) return bets;
  const line = new Date(trackingSince).getTime();
  if (Number.isNaN(line)) return bets;
  return bets.filter((b) => {
    if (!b.settled_at) return true;
    return new Date(b.settled_at).getTime() > line;
  });
}

// Net profit over a set of bets, using the app's ONE definition:
// everything paid out minus everything staked, money still riding
// included. All time this equals balance + removals minus additions,
// which is why the two agree on every screen.
export function netProfitOf(bets: BetWithLegs[]): number {
  return bets.reduce(
    (sum, b) => sum + Number(b.payout ?? 0) - Number(b.stake),
    0
  );
}
