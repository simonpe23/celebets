// Generates lab-data.ts, the Lab preview's demo fixture.
//
// Run: node src/app/preview/performance-lab/gen.mjs
//
// The whole point: Lab must tell the SAME story as the accepted Home.
// Home's static top list says Moneyline 30-16 (+$2,658), Premier
// League 14-8 (+$743), Low odds 18-11 (+$612), Singles 24-18 (+$440),
// Player Props 7-11 (-$440), and the hero says +$2,637 net, 49-38,
// 87 bets, about 24% ROI. This script builds a bet list whose records
// hit those figures EXACTLY and whose dollars land within a dollar,
// so a user flicking between Home and Lab never catches the two pages
// disagreeing. Records are constructed; dollars are solved by
// iterating stakes (profit is linear in stake, so it converges).
//
// The profit and stake split for parlays mirrors legShares and
// legStakeShares in src/lib/stats.ts: won bets split odds-weighted,
// lost bets put the whole loss on the losing legs. If stats.ts ever
// changes that rule, regenerate and re-verify against the page.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Deterministic PRNG so the fixture is stable run to run.
let seed = 20260829;
function rnd() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pickFrom = (arr) => arr[Math.floor(rnd() * arr.length)];

// ---------------------------------------------------------------
// 1. The leg plan. Every leg: sport, competition, category, market,
// period, won, risk band. Records per block are the design targets.
// ---------------------------------------------------------------

const legs = [];
function addLegs(n, wins, tpl) {
  for (let i = 0; i < n; i++) legs.push({ ...tpl, won: i < wins });
}

// FOOTBALL, 40 legs, 24-16.
addLegs(14, 10, { sport: "Football", comp: "Premier League", cat: "Moneyline", market: "Match Winner" });
addLegs(3, 1, { sport: "Football", comp: "Premier League", cat: "Player Props", market: "Goalscorer" });
addLegs(2, 1, { sport: "Football", comp: "Premier League", cat: "Spread / Handicap", market: "Spread" });
addLegs(1, 1, { sport: "Football", comp: "Premier League", cat: "Totals (Over/Under)", market: "Match Total" });
addLegs(2, 1, { sport: "Football", comp: "Premier League", cat: "Match Props", market: "BTTS" });
addLegs(6, 4, { sport: "Football", comp: "La Liga", cat: "Moneyline", market: "Match Winner" });
addLegs(1, 0, { sport: "Football", comp: "La Liga", cat: "Player Props", market: "Shots" });
addLegs(1, 1, { sport: "Football", comp: "La Liga", cat: "Match Props", market: "Corners" });
addLegs(4, 2, { sport: "Football", comp: "Champions League", cat: "Moneyline", market: "To Advance" });
addLegs(1, 1, { sport: "Football", comp: "Champions League", cat: "Spread / Handicap", market: "Spread" });
addLegs(1, 0, { sport: "Football", comp: "Champions League", cat: "Totals (Over/Under)", market: "Match Total" });
addLegs(2, 1, { sport: "Football", comp: "International", cat: "Moneyline", market: "Match Winner" });
addLegs(2, 1, { sport: "Football", comp: "International", cat: "Player Props", market: "Goalscorer" });

// BASKETBALL, 14 legs, 5-9. The leak.
addLegs(6, 3, { sport: "Basketball", comp: "NBA", cat: "Moneyline", market: "Match Winner" });
addLegs(8, 2, { sport: "Basketball", comp: "NBA", cat: "Player Props", market: "Points" });

// TENNIS, 10 legs, 7-3.
addLegs(8, 6, { sport: "Tennis", comp: "ATP", cat: "Moneyline", market: "Match Winner" });
addLegs(2, 1, { sport: "Tennis", comp: "ATP", cat: "Totals (Over/Under)", market: "Match Total" });

// BASEBALL, 7 legs, 4-3.
addLegs(4, 3, { sport: "Baseball", comp: "MLB", cat: "Moneyline", market: "Match Winner" });
addLegs(3, 1, { sport: "Baseball", comp: "MLB", cat: "Spread / Handicap", market: "Spread" });

// ICE HOCKEY, 5 legs, 3-2.
addLegs(2, 1, { sport: "Ice Hockey", comp: "NHL", cat: "Moneyline", market: "Match Winner" });
addLegs(3, 2, { sport: "Ice Hockey", comp: "NHL", cat: "Totals (Over/Under)", market: "Match Total" });

// AMERICAN FOOTBALL, 4 legs, 3-1.
addLegs(4, 3, { sport: "American Football", comp: "NFL", cat: "Player Props", market: "Passing Yards" });

// CRYPTO (Economics domain), 7 legs, 3-4.
addLegs(7, 3, { sport: "Crypto", comp: null, cat: "Price Direction", market: "Price Direction" });

// Sanity: 87 legs, 49-38.
const W = legs.filter((l) => l.won).length;
if (legs.length !== 87 || W !== 49) {
  throw new Error(`leg plan off: ${legs.length} legs, ${W} wins`);
}

// ---------------------------------------------------------------
// 2. Risk bands. Low must land exactly 18-11 (29 legs). High takes
// the wild prop losses. Everything else is Medium. Odds boundaries
// are the canonical ones from src/lib/stats.ts ODDS_BUCKETS:
// Low <= 1.80, Medium <= 3.00, High > 3.00.
// ---------------------------------------------------------------

function take(filter, won, n, band) {
  let got = 0;
  for (const l of legs) {
    if (got === n) break;
    if (l.band || l.won !== won || !filter(l)) continue;
    l.band = band;
    got += 1;
  }
  if (got !== n) throw new Error(`could not band ${n} ${band} won=${won}`);
}
const is = (sport, cat) => (l) => l.sport === sport && (!cat || l.cat === cat);

// Low: 18 wins, 11 losses.
take(is("Football", "Moneyline"), true, 6, "low");
take(is("Football", "Moneyline"), false, 3, "low");
take(is("Tennis", "Moneyline"), true, 5, "low");
take(is("Tennis", "Moneyline"), false, 1, "low");
take(is("Baseball", "Moneyline"), true, 2, "low");
take(is("Baseball", "Moneyline"), false, 1, "low");
take(is("Ice Hockey", "Totals (Over/Under)"), true, 1, "low");
take(is("Ice Hockey", "Totals (Over/Under)"), false, 1, "low");
take((l) => l.comp === "Premier League" && l.cat === "Totals (Over/Under)", true, 1, "low");
take(is("Basketball", "Moneyline"), false, 2, "low");
take(is("Football", "Moneyline"), true, 3, "low");
take(is("Football", "Moneyline"), false, 1, "low");
take(is("Crypto"), false, 2, "low");

// High: 5 wins, 10 losses.
take(is("Basketball", "Player Props"), true, 1, "high");
take(is("Basketball", "Player Props"), false, 5, "high");
take(is("Football", "Player Props"), true, 1, "high");
take(is("Football", "Player Props"), false, 3, "high");
take(is("American Football", "Player Props"), true, 2, "high");
take(is("Football", "Moneyline"), false, 1, "high");
take(is("Crypto"), true, 1, "high");
take(is("Crypto"), false, 1, "high");

for (const l of legs) if (!l.band) l.band = "medium";
const lowLegs = legs.filter((l) => l.band === "low");
if (lowLegs.length !== 29 || lowLegs.filter((l) => l.won).length !== 18) {
  throw new Error("low band off target");
}

function oddsFor(band) {
  if (band === "low") return 1.3 + Math.round(rnd() * 48) / 100;
  if (band === "medium") return 1.85 + Math.round(rnd() * 110) / 100;
  return 3.05 + Math.round(rnd() * 180) / 100;
}
for (const l of legs) l.odds = Math.round(oddsFor(l.band) * 100) / 100;

// ---------------------------------------------------------------
// 3. Periods, sport-aware and sparse, per SPORT_PERIODS vocabulary.
// ---------------------------------------------------------------

// Each quota is split across wins and losses, so no period chip
// reads as an unbeaten streak the data never earned.
function givePeriods(filter, period, nWon, nLost) {
  for (const wantWon of [true, false]) {
    let got = 0;
    const n = wantWon ? nWon : nLost;
    for (const l of legs) {
      if (got === n) break;
      if (l.period !== undefined || l.won !== wantWon || !filter(l)) continue;
      l.period = period;
      got += 1;
    }
  }
}
givePeriods((l) => l.comp === "Premier League" && l.cat === "Moneyline", "1st Half", 3, 1);
givePeriods((l) => l.comp === "La Liga" && l.cat === "Moneyline", "1st Half", 1, 1);
givePeriods((l) => l.comp === "Champions League" && l.cat === "Moneyline", "1st Half", 1, 0);
givePeriods((l) => l.comp === "Premier League" && l.cat === "Moneyline", "2nd Half", 1, 1);
givePeriods((l) => l.comp === "International" && l.cat === "Moneyline", "2nd Half", 1, 0);
givePeriods(is("Basketball", "Moneyline"), "1st Half", 1, 1);
givePeriods(is("Basketball", "Player Props"), "3rd Quarter", 1, 1);
givePeriods(is("Basketball", "Player Props"), "4th Quarter", 0, 1);
givePeriods(is("Tennis", "Moneyline"), "1st Set", 1, 1);
for (const l of legs) if (l.period === undefined) l.period = null;

// ---------------------------------------------------------------
// 4. Singles and parlays. Parlay legs must land 25-20 so singles
// land 24-18. Parlays stay inside one sport (mixed-sport splits
// make per-sport dollars unsolvable by hand; the shared fixture
// learned this first).
// ---------------------------------------------------------------

function grab(filter, won, n) {
  const out = [];
  for (const l of legs) {
    if (out.length === n) break;
    if (l.used || l.won !== won || !filter(l)) continue;
    l.used = true;
    out.push(l);
  }
  if (out.length !== n) throw new Error(`grab failed: need ${n} won=${won}`);
  return out;
}

const parlays = [];
// Won parlays: 15 winning legs.
parlays.push(grab(is("Football", "Moneyline"), true, 3));
parlays.push([...grab(is("Football", "Moneyline"), true, 2), ...grab(is("Football", "Match Props"), true, 1)]);
parlays.push(grab(is("Tennis", "Moneyline"), true, 3));
parlays.push(grab(is("Baseball", "Moneyline"), true, 2));
parlays.push(grab(is("Ice Hockey", "Totals (Over/Under)"), true, 2));
parlays.push(grab(is("American Football", "Player Props"), true, 2));
// Lost parlays: 30 legs, 10 won + 20 lost, two losers per parlay.
const lostParlayPlans = [
  [is("Football", "Moneyline"), is("Football")],
  [is("Football", "Moneyline"), is("Football")],
  [is("Football"), is("Football")],
  [is("Football"), is("Football")],
  [is("Basketball"), is("Basketball")],
  [is("Basketball"), is("Basketball")],
  [is("Basketball"), is("Basketball")],
  [is("Tennis"), is("Tennis")],
  [is("Baseball"), is("Baseball")],
  [is("Crypto"), is("Crypto")],
];
for (const [wf, lf] of lostParlayPlans) {
  parlays.push([...grab(wf, true, 1), ...grab(lf, false, 2)]);
}
const singles = legs.filter((l) => !l.used);
if (singles.length !== 42) throw new Error(`singles: ${singles.length}`);
const sw = singles.filter((l) => l.won).length;
if (sw !== 24) throw new Error(`single wins: ${sw}`);

// ---------------------------------------------------------------
// 5. Bets, dates, and descriptions.
// ---------------------------------------------------------------

const D = {
  "Match Winner": {
    "Premier League": ["Arsenal to win", "Liverpool to win", "Man City to win", "Newcastle to win", "Chelsea to win", "Spurs to win", "Villa to win", "Brighton to win", "Everton to win", "Fulham to win", "West Ham to win", "Wolves to win", "Brentford to win", "Palace to win"],
    "La Liga": ["Real Madrid to win", "Barcelona to win", "Atletico to win", "Sevilla to win", "Betis to win", "Villarreal to win"],
    International: ["England to win", "France to win", "Spain to win"],
    NBA: ["Celtics to win", "Nuggets to win", "Bucks to win", "Thunder to win", "Knicks to win", "Suns to win"],
    ATP: ["Alcaraz to win", "Sinner to win", "Djokovic to win", "Zverev to win", "Rune to win", "Medvedev to win", "Fritz to win", "Ruud to win"],
    MLB: ["Dodgers to win", "Yankees to win", "Braves to win", "Astros to win"],
    NHL: ["Oilers to win", "Panthers to win"],
  },
  "To Advance": { "Champions League": ["Bayern to advance", "Inter to advance", "Arsenal to advance", "PSG to advance"] },
  Goalscorer: { any: ["Haaland to score", "Salah to score", "Isak to score", "Kane to score", "Mbappe to score"] },
  Shots: { any: ["Vinicius 2+ shots on target"] },
  Points: { any: ["Tatum over 27.5 points", "Jokic over 26.5 points", "Doncic over 30.5 points", "Giannis over 29.5 points", "Brunson over 25.5 points", "Curry over 24.5 points", "Booker over 23.5 points", "SGA over 28.5 points"] },
  "Passing Yards": { any: ["Mahomes over 270.5 yards", "Allen over 250.5 yards", "Burrow over 265.5 yards", "Hurts over 230.5 yards"] },
  Spread: {
    Football: ["Bayern -1.5", "Porto -1", "City -1"],
    Baseball: ["Dodgers -1.5", "Yankees -1.5", "Braves -1.5"],
  },
  "Match Total": {
    Football: ["Over 2.5 goals", "Under 2.5 goals"],
    "Ice Hockey": ["Over 5.5 goals", "Under 6.5 goals", "Over 6.5 goals"],
    Tennis: ["Over 22.5 games", "Under 21.5 games"],
  },
  BTTS: { any: ["Both teams to score", "BTTS: yes"] },
  Corners: { any: ["Over 9.5 corners"] },
  "Price Direction": { any: ["BTC up this week", "ETH up today", "BTC above 100K by Friday", "SOL up this week", "ETH down today", "BTC down this week", "Gold up this week"] },
};
function describe(l) {
  const pool =
    D[l.market]?.[l.comp] ?? D[l.market]?.[l.sport] ?? D[l.market]?.any ?? [`${l.sport} pick`];
  if (pool.length === 0) return `${l.sport} pick`;
  const i = Math.floor(rnd() * pool.length);
  return pool.splice(i, 1)[0] ?? `${l.sport} pick`;
}
for (const l of legs) l.description = describe(l);

const bets = [];
for (const l of singles) bets.push({ legs: [l], stake: 120 });
for (const p of parlays) bets.push({ legs: p, stake: 45 });

// Dates: about 13 weeks, oldest first. Losses lean slightly early,
// wins slightly late, so the line dips into the red before it
// climbs, the way the accepted Home's chart does. The noise keeps
// the lean gentle: a hard sort would draw a canyon of losses first.
const shuffled = [...bets].sort(() => rnd() - 0.5);
shuffled.sort((a, b) => {
  const won = (x) => (x.legs.every((l) => l.won) ? 1 : 0);
  return won(a) - won(b) + (rnd() - 0.5) * 5.5;
});
shuffled.forEach((b, i) => {
  b.day = 90 - Math.round((i / (shuffled.length - 1)) * 88);
});

// ---------------------------------------------------------------
// 6. Solve stakes for the dollar targets. Profit is linear in stake,
// so a proportional update per target converges fast. Mirrors
// legShares from src/lib/stats.ts.
// ---------------------------------------------------------------

function betStatus(b) {
  return b.legs.every((l) => l.won) ? "won" : "lost";
}
function betOdds(b) {
  return b.legs.reduce((acc, l) => acc * l.odds, 1);
}
function betProfit(b) {
  return betStatus(b) === "won" ? b.stake * (betOdds(b) - 1) : -b.stake;
}
function shares(b) {
  const profit = betProfit(b);
  if (betStatus(b) === "won") {
    const wts = b.legs.map((l) => l.odds - 1);
    const tot = wts.reduce((s, w) => s + w, 0);
    return wts.map((w) => (profit * w) / tot);
  }
  const losers = b.legs.filter((l) => !l.won).length;
  return b.legs.map((l) => (!l.won ? profit / losers : 0));
}

const TARGETS = [
  { name: "moneyline", want: 2658, hits: (l) => l.cat === "Moneyline" },
  { name: "epl", want: 743, hits: (l) => l.comp === "Premier League" },
  { name: "low", want: 612, hits: (l) => l.band === "low" },
  { name: "props", want: -440, hits: (l) => l.cat === "Player Props" },
];

function profitOf(hits) {
  let sum = 0;
  for (const b of bets) {
    const sh = shares(b);
    b.legs.forEach((l, i) => {
      if (hits(l)) sum += sh[i];
    });
  }
  return sum;
}
function singlesProfit() {
  return bets.filter((b) => b.legs.length === 1).reduce((s, b) => s + betProfit(b), 0);
}

for (let round = 0; round < 4000; round++) {
  let maxErr = 0;
  for (const t of TARGETS) {
    const err = t.want - profitOf(t.hits);
    maxErr = Math.max(maxErr, Math.abs(err));
    const movers = bets.filter((b) => b.legs.length === 1 && t.hits(b.legs[0]));
    if (movers.length === 0) continue;
    for (const b of movers) {
      const d = betStatus(b) === "won" ? betOdds(b) - 1 : -1;
      b.stake = Math.min(320, Math.max(12, b.stake + (0.25 * err) / movers.length / d));
    }
  }
  // Singles at +$440 total: steer with singles that touch no named
  // target, so the named ones stay put. Parlays then carry the rest
  // of the +$2,637 total: 2637 - 440 = +$2,197 across the parlays.
  const neutral = bets.filter(
    (b) => b.legs.length === 1 && TARGETS.every((t) => !t.hits(b.legs[0]))
  );
  const errS = 440 - singlesProfit();
  for (const b of neutral) {
    const d = betStatus(b) === "won" ? betOdds(b) - 1 : -1;
    b.stake = Math.min(320, Math.max(12, b.stake + (0.3 * errS) / neutral.length / d));
  }
  const parlayBets = bets.filter((b) => b.legs.length > 1);
  const errP =
    2197 - parlayBets.reduce((s, b) => s + betProfit(b), 0);
  for (const b of parlayBets) {
    const d = betStatus(b) === "won" ? betOdds(b) - 1 : -1;
    b.stake = Math.min(200, Math.max(10, b.stake + (0.3 * errP) / parlayBets.length / d));
  }
  // Total staked toward $10.9K: scale parlay stakes only would break
  // the singles target, so nudge ALL stakes and let the loop re-fix.
  if (round % 25 === 24) {
    const staked = bets.reduce((s, b) => s + b.stake, 0);
    const k = Math.min(1.02, Math.max(0.98, 10942 / staked));
    for (const b of bets) b.stake = Math.min(320, Math.max(12, b.stake * k));
  }
  if (round > 200 && maxErr < 0.4 && Math.abs(errS) < 0.6 && Math.abs(errP) < 0.6) break;
}

for (const b of bets) b.stake = Math.round(b.stake * 100) / 100;

const report = {};
for (const t of TARGETS) report[t.name] = profitOf(t.hits).toFixed(2);
report.singles = singlesProfit().toFixed(2);
report.staked = bets.reduce((s, b) => s + b.stake, 0).toFixed(2);
console.log("solved:", report);

// ---------------------------------------------------------------
// 7. Emit lab-data.ts.
// ---------------------------------------------------------------

const esc = (s) => (s === null ? "null" : JSON.stringify(s));
const rows = shuffled
  .map((b) => {
    const legLits = b.legs
      .map(
        (l) =>
          `l(${esc(l.sport)}, ${esc(l.description)}, ${l.odds}, ${l.won}, ${esc(l.cat)}, ${esc(l.market)}, ${esc(l.period)}, ${esc(l.comp)})`
      )
      .join(", ");
    return `  bet(${b.stake}, ${b.day}, [${legLits}]),`;
  })
  .join("\n");

const out = `// GENERATED BY gen.mjs in this folder. Edit that, not this, or the
// records stop matching the accepted Home's list. Regenerate with:
// node src/app/preview/performance-lab/gen.mjs
//
// 87 settled picks, 49-38, engineered so Lab's chips read the exact
// records Home's top list shows: Moneyline 30-16, Premier League
// 14-8, Low odds 18-11, Singles 24-18, Player Props 7-11, and the
// dollars land on Home's figures to within a dollar. Demo data only,
// never real user data: the previews are public.

import type { BetWithLegs, Leg } from "@/lib/types";

function daysAgo(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let n = 0;
function l(
  sport: Leg["sport"],
  description: string,
  odds: number,
  won: boolean,
  subcategory: string,
  market: string,
  period: string | null,
  competition: string | null
): Omit<Leg, "id"> {
  return {
    sport,
    description,
    odds,
    result: won ? "won" : "lost",
    subcategory,
    market,
    period,
    competition,
    provider_market: null,
  };
}

function bet(stake: number, days: number, legs: Omit<Leg, "id">[]): BetWithLegs {
  n += 1;
  const won = legs.every((x) => x.result === "won");
  const odds =
    Math.round(legs.reduce((acc, x) => acc * (x.odds ?? 1), 1) * 10000) / 10000;
  return {
    id: \`lab\${n}\`,
    stake,
    total_odds: odds,
    status: won ? "won" : "lost",
    placed_at: daysAgo(days, 9),
    settled_at: daysAgo(days),
    payout: won ? Math.round(stake * odds * 100) / 100 : 0,
    cashed_out: false,
    bet_buys: [],
    legs: legs.map((x, i) => ({ ...x, id: \`lab\${n}-\${i}\` })),
  };
}

export const labBets: BetWithLegs[] = [
${rows}
];
`;

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(here, "lab-data.ts"), out);
console.log(`wrote lab-data.ts: ${bets.length} bets, ${legs.length} legs`);
