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
export function leakInsight(engine: Engine, ranked?: Fact[]): string | null {
  const facts =
    ranked ?? engine.sortFacts(dedupeFacts(engine.rankedFacts([], 5)), "profit");
  const losing = facts.filter((f) => f.s.profit < 0);
  if (losing.length === 0) return null;
  const worst = losing.reduce((a, b) => (a.s.profit <= b.s.profit ? a : b));
  return `${worst.chip.value} is your biggest leak at ${money(worst.s.profit)}.`;
}

export function buildHomeView(engine: Engine): HomeView {
  const whole = engine.statsFor([]);
  const running = engine.runningFor([]);
  const series = running.map((r) => r.profit);

  const facts: Fact[] = engine.sortFacts(
    dedupeFacts(engine.rankedFacts([], 5)),
    "profit"
  );

  const rows: HomeRow[] = facts.slice(0, 5).map((f) => ({
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
  }));

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
    insight: leakInsight(engine, facts),
    series,
    chartTop: scale.top,
    chartBottom: scale.bottom,
    yLabels: scale.labels,
    xLabels,
  };
}
