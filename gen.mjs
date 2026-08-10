// Builds the marketing fixture. The owner pinned four figures:
//   tracking balance  $3,851
//   net profit        +$2,387
//   best sport        Football, +$757
//   stakes            sized against the balance, not against a fantasy
// Everything else is solved backwards from those.
//
// Per-sport money is exact because every parlay keeps both legs inside
// ONE sport. A mixed parlay splits its profit by leg odds, which is
// correct but makes an exact per-sport target unsolvable by hand.

const DEPOSITS = 1464;
const BALANCE = 3851;
const NET = BALANCE - DEPOSITS;          // 2387
const PENDING = 150 + 100;               // two bets still riding
const SETTLED = NET + PENDING;           // 2637

// Football leads. Nothing else may reach 757.
const TARGETS = {
  Football: 757,
  Baseball: 690,
  Tennis: 540,
  Crypto: 415,
  "Ice Hockey": 295,
  "American Football": 230,
  esports: 150,
  Basketball: -440,
};
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
if (sum(TARGETS) !== SETTLED) throw new Error(`targets ${sum(TARGETS)} != ${SETTLED}`);

// Seeded, so the file is the same every time it is generated.
let seed = 20260810;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const STAKES = [60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260];
const ODDS = [1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.4, 2.6];
// A parlay always keeps one leg at 2.0, so the total odds stay at one
// decimal and every profit stays a whole number of dollars. Cents in a
// stake are the "odd discrepancy" the owner asked me to flatten.
const PARLAY_LEG = [1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.2];
const profitOf = (s, o, won) =>
  won ? Math.round(s * (o - 1) * 100) / 100 : -s;

// Every stake is a multiple of 10 between 50 and 400. One winner and
// one loser are left free and solved so the sport lands exactly on its
// target: a loser moves the total dollar for dollar, which makes the
// last step trivial.
const GRID = [];
for (let s = 50; s <= 300; s += 10) GRID.push(s);

function build(sport, target, plan) {
  for (let attempt = 0; attempt < 20000; attempt++) {
    const bets = plan.map((p) => {
      const odds = p.parlay
        ? Math.round(pick(PARLAY_LEG) * 2.0 * 10) / 10
        : pick(ODDS);
      return { ...p, stake: pick(STAKES), odds };
    });
    const iW = bets.findIndex((b) => b.won && !b.parlay);
    const iL = bets.findIndex((b) => !b.won && !b.parlay);
    if (iW < 0 || iL < 0) continue;
    const rest = bets.reduce(
      (t, b, i) => (i === iW || i === iL ? t : t + profitOf(b.stake, b.odds, b.won)),
      0
    );
    for (const W of GRID) {
      const L = rest + profitOf(W, bets[iW].odds, true) - target;
      if (L < 50 || L > 300 || Math.abs(L - Math.round(L / 10) * 10) > 0.001) continue;
      bets[iW].stake = W;
      bets[iL].stake = Math.round(L);
      const got = bets.reduce((t, b) => t + profitOf(b.stake, b.odds, b.won), 0);
      if (Math.abs(got - target) > 0.005) continue;
      return bets.map((b) => ({ ...b, sport }));
    }
  }
  throw new Error("no solution for " + sport);
}

// won/lost patterns. Football and Basketball carry the two Key Insight
// statements, so they get the most picks.
const PLANS = {
  Football: [
    ["Arsenal to win", "Win-bet / Moneyline", 1],
    ["Over 2.5 goals", "Over / Under", 1],
    ["Inter to win", "Win-bet / Moneyline", 0],
    ["Bayern -1.5", "Handicap", 1],
    ["Both teams to score", "BTTS", 1],
    ["Napoli to win", "Win-bet / Moneyline", 1],
    ["Over 1.5 goals", "Over / Under", 0],
    ["Real Madrid to win", "Win-bet / Moneyline", 1],
    ["PSG to win", "Win-bet / Moneyline", 0],
    ["Ajax to win", "Win-bet / Moneyline", 1],
    ["Porto -1", "Handicap", 1],
    ["Roma to win", "Win-bet / Moneyline", 0],
    ["Sevilla to win", "Win-bet / Moneyline", 1],
    [["Benfica to win", "Lyon to win"], "Win-bet / Moneyline", 1, "parlay"],
    ["Feyenoord to win", "Win-bet / Moneyline", 0],
  ],
  Baseball: [
    ["Dodgers ML", "Win-bet / Moneyline", 1],
    ["Yankees ML", "Win-bet / Moneyline", 1],
    ["Astros ML", "Win-bet / Moneyline", 1],
    ["Braves ML", "Win-bet / Moneyline", 0],
    ["Padres ML", "Win-bet / Moneyline", 1],
    ["Mets ML", "Win-bet / Moneyline", 1],
    ["Cubs ML", "Win-bet / Moneyline", 0],
    ["Giants ML", "Win-bet / Moneyline", 1],
    ["Phillies ML", "Win-bet / Moneyline", 1],
    ["Rangers ML", "Win-bet / Moneyline", 0],
    ["Mariners ML", "Win-bet / Moneyline", 1],
    ["Guardians ML", "Win-bet / Moneyline", 0],
    [["Brewers ML", "Reds ML"], "Win-bet / Moneyline", 1, "parlay"],
    ["Reds ML", "Win-bet / Moneyline", 0],
  ],
  Basketball: [
    ["Tatum over 24.5", "Player Props: Points", 0],
    ["Doncic over 29.5", "Player Props: Points", 0],
    ["Curry over 27.5", "Player Props: Points", 1],
    ["Booker over 25.5", "Player Props: Points", 0],
    ["Embiid over 30.5", "Player Props: Points", 0],
    ["Young over 26.5", "Player Props: Points", 0],
    ["Mitchell over 27.5", "Player Props: Points", 1],
    ["Brunson over 26.5", "Player Props: Points", 0],
    ["Edwards over 25.5", "Player Props: Points", 1],
    ["Haliburton over 20.5", "Player Props: Points", 0],
    ["Morant over 23.5", "Player Props: Points", 0],
    ["Sabonis over 19.5", "Player Props: Points", 1],
    [["Tatum over 24.5", "Doncic over 29.5"], "Player Props: Points", 0, "parlay"],
  ],
  Tennis: [
    ["Alcaraz to win", null, 1],
    ["Sinner in straight sets", null, 0],
    ["Sabalenka to win", null, 1],
    ["Swiatek to win", null, 1],
    ["Zverev to win", null, 0],
    ["Medvedev to win", null, 1],
    ["Rybakina to win", null, 1],
    ["Gauff to win", null, 0],
    ["Ruud to win", null, 1],
    ["Fritz to win", null, 0],
    [["Alcaraz to win", "Swiatek to win"], null, 0, "parlay"],
  ],
  Crypto: [
    ["BTC above 90k", null, 1],
    ["ETH above 4k", null, 1],
    ["SOL above 200", null, 0],
    ["BTC above 100k", null, 1],
    ["ETH above 5k", null, 0],
    ["BTC above 110k", null, 1],
    ["SOL above 250", null, 0],
    ["ETH above 4.5k", null, 1],
  ],
  "Ice Hockey": [
    ["Oilers ML", "Win-bet / Moneyline", 1],
    ["Rangers ML", "Win-bet / Moneyline", 0],
    ["Panthers ML", "Win-bet / Moneyline", 1],
    ["Bruins ML", "Win-bet / Moneyline", 1],
    ["Avalanche ML", "Win-bet / Moneyline", 0],
    ["Maple Leafs ML", "Win-bet / Moneyline", 1],
    ["Golden Knights ML", "Win-bet / Moneyline", 0],
  ],
  "American Football": [
    ["Chiefs -3", "Handicap", 1],
    ["Ravens ML", "Win-bet / Moneyline", 1],
    ["49ers -6.5", "Handicap", 0],
    ["Bills ML", "Win-bet / Moneyline", 1],
    ["Eagles -2.5", "Handicap", 0],
    ["Lions ML", "Win-bet / Moneyline", 1],
  ],
  esports: [
    ["G2 to win map 1", null, 1],
    ["FaZe to win", null, 0],
    ["T1 to win", null, 1],
    ["Navi to win", null, 1],
    ["Fnatic to win", null, 0],
  ],
};

const all = [];
for (const [sport, target] of Object.entries(TARGETS)) {
  const plan = PLANS[sport].map(([description, subcategory, won, kind]) => ({
    description,
    subcategory,
    won: !!won,
    parlay: kind === "parlay",
  }));
  all.push(...build(sport, target, plan));
}

// Dates. Two things have to come out of this, and neither is luck:
//   1. the three finished weeks each beat the one before, or the
//      "Trending up" insight silently stops appearing
//   2. the chart dips into the red early and recovers, because a line
//      that only ever climbs looks invented
// So the days are searched for, not assigned in order.
const dayFor = [];
for (let i = 0; i < all.length; i++)
  dayFor.push(2 + Math.floor((i * 25) / (all.length - 1)));

const week = (bets, lo, hi) =>
  bets.filter((b) => b.day >= lo && b.day <= hi)
      .reduce((t, b) => t + profitOf(b.stake, b.odds, b.won), 0);

let placed = false;
for (let attempt = 0; attempt < 200000 && !placed; attempt++) {
  const idx = all.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  idx.forEach((bi, i) => (all[bi].day = dayFor[i]));

  const A = week(all, 21, 27), B = week(all, 14, 20), C = week(all, 7, 13);
  if (!(A < B && B < C)) continue;

  // Running profit, oldest first.
  const byDate = [...all].sort((x, y) => y.day - x.day);
  let run = 0, low = 0, lowAt = 0;
  byDate.forEach((b, i) => {
    run += profitOf(b.stake, b.odds, b.won);
    if (run < low) { low = run; lowAt = i; }
  });
  if (low > -200) continue;                       // no visible dip
  if (lowAt > byDate.length * 0.6) continue;      // dip must be early

  // Insight of the day speaks about THIS CALENDAR MONTH. On the first
  // layout it read "Baseball has cost you $280 this month" while the
  // same page called Baseball the second best sport of the record.
  // Both true, and together they look like a bug. So every sport has
  // to be level or up inside the current month: the leaks belong to
  // the earlier part of the record, which is also the story the
  // rising weeks tell.
  const month = {};
  for (const b of all)
    if (b.day <= 9)
      month[b.sport] = (month[b.sport] ?? 0) + profitOf(b.stake, b.odds, b.won);
  if (Object.values(month).some((v) => v < 0)) continue;

  placed = true;
}
if (!placed) throw new Error("no date layout found");

const staked = all.reduce((t, b) => t + b.stake, 0) + PENDING;
const settled = all.reduce((t, b) => t + profitOf(b.stake, b.odds, b.won), 0);
const bySport = {};
for (const b of all) bySport[b.sport] = (bySport[b.sport] ?? 0) + profitOf(b.stake, b.odds, b.won);

console.log("bets        ", all.length);
console.log("settled     ", settled, "(want", SETTLED + ")");
console.log("net profit  ", settled - PENDING, "(want", NET + ")");
console.log("balance     ", DEPOSITS + settled - PENDING);
console.log("staked      ", all.reduce((t, b) => t + b.stake, 0));
console.log("ROI         ", ((settled / all.reduce((t, b) => t + b.stake, 0)) * 100).toFixed(1) + "%");
console.log("max stake   ", Math.max(...all.map((b) => b.stake)));
console.log("by sport    ", bySport);

// Weeks that the trend statement reads: A days 21-27, B 14-20, C 7-13.
const wk = (lo, hi) =>
  all.filter((b) => b.day >= lo && b.day <= hi)
     .reduce((t, b) => t + profitOf(b.stake, b.odds, b.won), 0);
console.log("weeks A B C ", wk(21, 27).toFixed(2), wk(14, 20).toFixed(2), wk(7, 13).toFixed(2));

globalThis.__fixture = { all, DEPOSITS, PENDING };

// ---- emit the fixture -------------------------------------------------
import { writeFileSync } from "fs";

const q = (v) => (v === null ? "null" : JSON.stringify(v));
const lines = all
  .sort((a, b) => b.day - a.day)
  .map((b) => {
    if (b.parlay) {
      const leg = Math.round((b.odds / 2.0) * 10) / 10;
      return (
        `  parlay(\n` +
        `    [\n` +
        `      { sport: ${q(b.sport)}, subcategory: ${q(b.subcategory)}, description: ${q(b.description[0])}, odds: ${leg}, won: ${b.won} },\n` +
        `      { sport: ${q(b.sport)}, subcategory: ${q(b.subcategory)}, description: ${q(b.description[1])}, odds: 2, won: ${b.won} },\n` +
        `    ],\n` +
        `    ${b.stake},\n    ${b.day}\n  ),`
      );
    }
    return `  single(${q(b.sport)}, ${q(b.subcategory)}, ${q(b.description)}, ${b.stake}, ${b.odds}, ${b.won}, ${b.day}),`;
  });

const roi = ((settled / all.reduce((t, b) => t + b.stake, 0)) * 100).toFixed(1);
const header = `import type { BetWithLegs } from "@/lib/types";

// GENERATED BY gen.mjs. Edit that, not this, or the totals stop adding
// up. This folder is gitignored, so none of it reaches production.
//
// THIS IS THE SHARED FIXTURE. The Track preview (../data.ts) imports it
// and adds two pending bets, so both pages describe ONE account. They
// used to be two unrelated sets, which is fine for a design check and
// useless for a product photo.
//
// The owner pinned four figures himself (August 2026) and everything
// else is solved backwards from them:
//   tracking balance   $3,851
//   net profit         +$2,387   (open stakes included, so it is $250
//                                 below the settled figure)
//   best sport         Football, +$757, nothing else may reach it
//   stakes             sized against the balance. They ran up to $1,650
//                      on a $1,464 starting bankroll, which is a bet
//                      nobody could have placed.
// Now: ${all.length} settled bets, $${all.reduce((t, b) => t + b.stake, 0).toLocaleString("en-US")} staked, ${roi}% ROI, biggest stake $${Math.max(...all.map((b) => b.stake))}.
//
// Per-sport money is exact because every parlay keeps BOTH legs inside
// one sport. A mixed parlay splits its profit across sports by leg
// odds, which is correct and makes an exact per-sport target
// unsolvable by hand.
//
// The set also carries the three Key Insight statements:
//   strength   Football, the clear winner over 15 picks
//   weakness   Basketball Player Props: Points, a clear loser
//   trend      three finished weeks, each better than the last

function daysAgo(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let n = 0;
function single(
  sport: BetWithLegs["legs"][number]["sport"],
  subcategory: string | null,
  description: string,
  stake: number,
  odds: number,
  won: boolean,
  days: number
): BetWithLegs {
  n += 1;
  const payout = won ? Math.round(stake * odds * 100) / 100 : 0;
  return {
    id: \`x\${n}\`,
    stake,
    total_odds: odds,
    status: won ? "won" : "lost",
    placed_at: daysAgo(days, 9),
    settled_at: daysAgo(days),
    payout,
    cashed_out: false,
    bet_buys: [],
    legs: [
      { id: \`x\${n}a\`, sport, description, odds, result: won ? "won" : "lost", subcategory },
    ],
  };
}

function parlay(
  legs: {
    sport: BetWithLegs["legs"][number]["sport"];
    subcategory: string | null;
    description: string;
    odds: number;
    won: boolean;
  }[],
  stake: number,
  days: number
): BetWithLegs {
  n += 1;
  const won = legs.every((l) => l.won);
  const odds = Math.round(legs.reduce((acc, l) => acc * l.odds, 1) * 10000) / 10000;
  return {
    id: \`x\${n}\`,
    stake,
    total_odds: odds,
    status: won ? "won" : "lost",
    placed_at: daysAgo(days, 9),
    settled_at: daysAgo(days),
    payout: won ? Math.round(stake * odds * 100) / 100 : 0,
    cashed_out: false,
    bet_buys: [],
    legs: legs.map((l, i) => ({
      id: \`x\${n}\${i}\`,
      sport: l.sport,
      description: l.description,
      odds: l.odds,
      result: l.won ? "won" : "lost",
      subcategory: l.subcategory,
    })),
  };
}

// Newest first. The dates are searched for, not laid out in order: the
// three finished weeks have to rise or the "Trending up" insight stops
// appearing, and the chart has to dip into the red early, because a
// line that only ever climbs looks invented.
export const performanceBets: BetWithLegs[] = [
${lines.join("\n")}
];

// Two bets still riding. They live here rather than in ../data.ts so
// the ids keep counting from the same place. Their stakes are money
// already out of the balance, which is why Track shows $250 less
// profit than Performance.
export const pendingBets: BetWithLegs[] = [
  {
    id: "p1", stake: 150, total_odds: 2.15, status: "pending",
    placed_at: daysAgo(0, 9), settled_at: null, payout: null,
    cashed_out: false, bet_buys: [],
    legs: [
      { id: "p1a", sport: "Football", description: "Arsenal to win", odds: 1.47, result: "pending", subcategory: "Win-bet / Moneyline" },
      { id: "p1b", sport: "Football", description: "Over 2.5 goals", odds: 1.46, result: "pending", subcategory: "Over / Under" },
    ],
  },
  {
    id: "p2", stake: 100, total_odds: 3.4, status: "pending",
    placed_at: daysAgo(0, 11), settled_at: null, payout: null,
    cashed_out: false, bet_buys: [],
    legs: [
      { id: "p2a", sport: "Tennis", description: "Sinner in straight sets", odds: 3.4, result: "pending", subcategory: null },
    ],
  },
];

// The only money figure typed in by hand. Balance and net profit are
// derived from it and the bets, so the three can never drift apart:
// deposits + net profit = the $3,851 the owner asked for.
export const DEPOSITS = ${DEPOSITS};
`;

writeFileSync("src/app/preview/performance/data.ts", header);
console.log("wrote src/app/preview/performance/data.ts");
