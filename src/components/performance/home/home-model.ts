// Everything Home displays, computed from bets instead of typed by
// hand. Until 31 August 2026 Home's five rows and its KPI figures were
// literals copied off the mockup, which meant Home could disagree with
// Lab and Totals about the same bets. They read one engine; Home read
// nothing. This file closes that.
//
// The money itself is never computed here. `performance-engine.ts` groups the
// facts and imports every money rule from `src/lib/stats.ts`, the
// app's one definition. This file only chooses which facts Home shows
// and formats them.
//
// His ruling, 31 August 2026, on what the ranked list contains: "the
// top 5 best performing, across all variations, based on profit." So
// no one-per-family rule and no guaranteed losing row: whatever earned
// most, in order, whichever family it comes from.

import {
  dedupeFacts,
  hitOf,
  money,
  roiOf,
  type Chip,
  type Engine,
  type GroupKey,
  type Fact,
  type Stats,
} from "@/lib/performance-engine";

export interface HomeRow {
  chip: Chip;
  name: string;
  record: string;
  hit: string;
  moneyLabel: string;
  roi: string;
  positive: boolean;
  spark: number[];
  /** The Lab door: `?sel=group~kind~value`. */
  sel: string;
}

export interface HomeView {
  netProfit: string;
  positive: boolean;
  kpis: { value: string; label: string }[];
  rows: HomeRow[];
  /**
   * True when the record cannot be ranked yet, so Home lists what the
   * record IS instead of what drives it. See buildHomeView.
   */
  thin: boolean;
  /** The thin mode's content: every fact, grouped the way Lab groups. */
  groups: { label: string; rows: HomeRow[] }[];
  /**
   * What the block is waiting for, when it has nothing at all to list.
   * His rule: "If the app cannot say something interesting yet, it
   * should say what it is waiting for."
   */
  waiting: string | null;
  /** The Actuals noticed sentence, or null when nothing is losing. */
  insight: string | null;
  series: number[];
  chartTop: number;
  chartBottom: number;
  yLabels: string[];
  xLabels: string[];
}

// A record reads "30–16" with an en dash, the app's own style.
function recordOf(s: Stats): string {
  return `${s.wins}–${s.losses}`;
}

function hitPct(s: Stats): number {
  const picks = s.wins + s.losses;
  return picks > 0 ? (s.wins / picks) * 100 : 0;
}

function roiLabel(s: Stats): string {
  if (s.staked <= 0) return "ROI -";
  const pct = Math.round((s.profit / s.staked) * 100);
  return `ROI ${pct >= 0 ? "+" : ""}${pct}%`;
}

// $13.6K, $940, -$1.2K. The KPI row and the chart axis both need money
// short enough to sit in a narrow column.
function compact(v: number): string {
  const sign = v < 0 ? "-" : "";
  const a = Math.abs(v);
  if (a >= 1000) {
    const k = a / 1000;
    const text = Number.isInteger(k) ? String(k) : k.toFixed(1);
    return `${sign}$${text}K`;
  }
  return `${sign}$${Math.round(a)}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayLabel(t: number): string {
  const d = new Date(t);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// A step a person would choose: 500, 1.5K, 2K, never 1,309.
function niceStep(rough: number): number {
  const exp = Math.floor(Math.log10(Math.max(rough, 1)));
  const base = Math.pow(10, exp);
  for (const m of [1, 1.5, 2, 2.5, 5]) {
    if (rough <= m * base) return m * base;
  }
  return 10 * base;
}

// The axis and the line share ONE scale. Four labels on round numbers,
// the top above the best point, the bottom below the worst, and zero
// always inside so a losing stretch sits below the break even line
// rather than off the chart.
function axis(series: number[]): { top: number; bottom: number; labels: string[] } {
  const lo = Math.min(0, ...series);
  const hi = Math.max(0, ...series);
  // An account with no settled bets has no range at all. Inventing one
  // produced "$0, -$1, -$2, -$3", which reads as a bug rather than as
  // an empty page. Draw the flat line with no axis instead; the real
  // empty state is still to be designed.
  if (hi === lo) return { top: 1, bottom: -1, labels: [] };
  let step = niceStep((hi - lo || 1) / 3);
  let top = Math.ceil(hi / step) * step;
  // Widen until the worst point fits under the bottom label.
  while (top - step * 3 > lo) step = niceStep(step * 1.01);
  top = Math.ceil(hi / step) * step;
  const bottom = top - step * 3;
  return {
    top,
    bottom,
    labels: [0, 1, 2, 3].map((i) => compact(top - step * i)),
  };
}

// THE "Actuals noticed" SENTENCE, AND THERE IS ONLY ONE OF IT.
//
// Home computed this from the bets. Lab printed the literal "Player
// Props are driving most of your losses" on every record, his own
// included, whether or not it was true. Two pages, two answers, one of
// them a guess, on a page whose whole argument is honesty. Both call
// this now, so they cannot disagree.
//
// The leak is the worst losing fact in the whole ranked list, not only
// the five Home draws, and the list is already filtered to the chosen
// period because the engine is built from filtered bets.
//
// `ranked` is an optimisation, nothing more: Home has already paid for
// this list, so it hands it over instead of making the engine walk
// every chip a second time.
// A LEAK WORTH NAMING HAS TO BE WORTH SOMETHING. Not an absolute
// figure, which would be wrong at both ends of the scale, but a share
// of the biggest thing the record contains. A $2 leak beside a $73
// winner is a rounding error; a $926 leak beside a $2,658 winner is
// the story.
//
// Measured 2 September 2026: on a ten bet record this sentence read
// "Medium odds is your biggest leak at -$2", which is not a leak. On
// the demo record it reads "NBA is your biggest leak at -$926", which
// is, and that sentence is unchanged by this rule.
const WORTH_NAMING = 0.05;

// THE BANNER MAY SAY SOMETHING GOOD, since 2 September 2026. Asked
// directly whether it should be allowed to, he answered "yes to
// positive insights".
//
// It still leads with the leak when there is a real one, because
// that is the whole argument of this page: his own starting question
// was "where am I leaking". It only turns positive when there is
// nothing worth calling a leak, which used to mean saying nothing at
// all.
export function leakInsight(engine: Engine, ranked?: Fact[]): string | null {
  const facts =
    ranked ?? engine.sortFacts(dedupeFacts(engine.rankedFacts([], 5)), "profit");
  if (facts.length === 0) return null;

  const biggest = facts.reduce((a, b) =>
    Math.abs(a.s.profit) >= Math.abs(b.s.profit) ? a : b
  );
  const scale = Math.abs(biggest.s.profit);
  if (scale === 0) return null;

  const losing = facts.filter((f) => f.s.profit < 0);
  if (losing.length > 0) {
    const worst = losing.reduce((a, b) => (a.s.profit <= b.s.profit ? a : b));
    if (Math.abs(worst.s.profit) >= scale * WORTH_NAMING)
      return `${worst.chip.value} is your biggest leak at ${money(worst.s.profit)}.`;
  }

  const winning = facts.filter((f) => f.s.profit > 0);
  if (winning.length === 0) return null;
  const best = winning.reduce((a, b) => (a.s.profit >= b.s.profit ? a : b));
  return `${best.chip.value} is your best earner at ${money(best.s.profit)}.`;
}

// THE GROUPS OF THE THIN MODE, and their order, are Lab's. His answer
// on 2 September 2026 to "what should Home do with its empty block":
// show the same five, its own way. Lab already lists everything a
// record contains from one bet, so Home must group it identically or
// the two pages describe the same bet differently.
const THIN_GROUPS: { key: GroupKey; label: string }[] = [
  { key: "sport", label: "Sport" },
  { key: "where", label: "League" },
  { key: "what", label: "Category" },
  { key: "when", label: "When" },
  { key: "how", label: "Bet Type" },
  { key: "risk", label: "Risk" },
];

// The app names this when a bet carries no period, so it is the
// absence of data wearing a label. Lab leaves it out of its When
// group; Home leaves it out of the same group for the same reason.
const NOT_A_CHOICE = new Set(["Full time"]);

export function buildHomeView(engine: Engine): HomeView {
  const whole = engine.statsFor([]);
  const running = engine.runningFor([]);
  const series = running.map((r) => r.profit);

  const all: Fact[] = engine.rankedFacts([], 5);

  // WHEN IS A RECORD TOO THIN TO RANK? When nothing in it clears both
  // of the ranking gates: five settled picks, and no more than 85% of
  // the whole record.
  //
  // The engine relaxes those gates rather than return nothing (see
  // rankedFacts), so this asks the question the strict way to find out
  // which mode Home is in. A record that can be ranked is ranked
  // exactly as before; nothing here can move it.
  const wholePicks = whole.wins + whole.losses;
  const strict = all.filter((f) => {
    const picks = f.s.wins + f.s.losses;
    return picks >= 5 && picks <= 0.85 * wholePicks;
  });

  // ONE ROW IS NOT A RANKING, and neither is two.
  //
  // His own example in the brief was six settled Football bets. That
  // record does clear the gates, but only for a single fact, so the
  // page used to be headed "Ranked by contribution to net profit" over
  // one row reading "Medium odds": the one thing it could say was the
  // one thing the user never chose. Passing that off as a ranking is
  // the same lie as an empty list, just harder to spot.
  //
  // Three is where a list starts being a comparison, which is what the
  // heading promises.
  const RANKABLE = 3;
  const thin = strict.length < RANKABLE && all.length > 0;

  const facts: Fact[] = engine.sortFacts(dedupeFacts(strict), "profit");

  const toRow = (f: Fact): HomeRow => ({
    chip: f.chip,
    name: f.chip.value,
    record: recordOf(f.s),
    hit: `${Math.round(hitPct(f.s))}% hit rate`,
    moneyLabel: money(f.s.profit),
    roi: roiLabel(f.s),
    positive: f.s.profit >= 0,
    // rankedFacts leaves spark empty on purpose; the series for one
    // fact is its own call.
    spark: engine.sparkFor([f.chip]),
    sel: `${f.chip.group}~${f.chip.kind}~${f.chip.value}`,
  });

  const rows: HomeRow[] = facts.slice(0, 5).map(toRow);

  // THE THIN MODE'S CONTENT. Every fact the record contains, grouped
  // and labelled the way Lab groups them.
  //
  // NOT DEDUPED, deliberately. dedupeFacts hides a fact whose record
  // matches another's, because two rows for one set of bets would
  // double count in a ranked list. Here nothing is being ranked or
  // added up: with one bet, Football and Premier League and Moneyline
  // ARE all the same bet, and showing all of them is the point. His
  // words: "a thin record should always show everything that was a
  // part of the bet."
  //
  // Markets are left out of Category for the same reason Lab leaves
  // them out: "Moneyline" and "Match Winner" are one choice described
  // twice, and a list of one bet does not need to say it twice.
  const groups = THIN_GROUPS.map(({ key, label }) => ({
    label,
    rows: engine
      .factsIn([])
      .filter(
        (f) =>
          f.chip.group === key &&
          f.chip.kind !== "market" &&
          !NOT_A_CHOICE.has(f.chip.value)
      )
      .sort((a, b) => b.s.profit - a.s.profit)
      .map(toRow),
  })).filter((g) => g.rows.length > 0);

  // Five date labels across the span the line covers.
  const xLabels =
    running.length > 1
      ? [0, 1, 2, 3, 4].map((i) =>
          dayLabel(running[Math.round(((running.length - 1) * i) / 4)].t)
        )
      : [];

  const scale = axis(series);
  const picks = whole.wins + whole.losses;

  return {
    netProfit: money(whole.profit),
    positive: whole.profit >= 0,
    // HOME'S FOUR KPIs MIRROR LAB'S, 31 August 2026. His words: "i
    // want to change the kpi row on home and mirror labs", with a
    // screenshot of Lab's row, and the four he wants named: Bets,
    // Record, Hit Rate, ROI. They were Bets, Hit rate, Wagered and
    // Returned.
    //
    // Wagered and Returned are not lost: Totals shows both. What Home
    // gains is the ROI and the record that came off the chart in the
    // edit before this one, so the two figures are back on the page.
    //
    // The formatters are the engine's own, the ones Lab calls, so the
    // two rows cannot print the same record two different ways.
    kpis: [
      { value: String(picks), label: "Bets" },
      { value: recordOf(whole), label: "Record" },
      { value: hitOf(whole), label: "Hit rate" },
      { value: picks > 0 ? roiOf(whole) : "-", label: "ROI" },
    ],
    rows,
    // A record with nothing settled has nothing to list and nothing to
    // rank, so the block says what would fill it. It is deliberately
    // true of both cases it covers: an account that has tracked
    // nothing, and one whose only bet is still running.
    thin: thin || groups.length === 0,
    groups,
    waiting:
      groups.length === 0
        ? "Nothing has settled yet. Your first result fills this in."
        : null,
    insight: leakInsight(engine, thin ? all : facts),
    series,
    chartTop: scale.top,
    chartBottom: scale.bottom,
    yLabels: scale.labels,
    xLabels,
  };
}
