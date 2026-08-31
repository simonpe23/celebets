"use client";

// VIEW 3: COMPARE, a replica of 03_compare.png. Local preview,
// gitignored. Sampled from the sheet: vs badge on #F1F1F4, the
// metric toggle's active segment a solid purple pill, and the two
// lines drawn in the app's purple and red.
//
// THE CHART RULE, the owner's wording: "Purple line for profit and
// red for losses." So each side is colored by ITS OWN sign, exactly
// as the sheet draws it (Football profitable in purple, Baseball
// losing in red). When both sides share a sign they would collide,
// so the second takes a lighter weight of the same color, and a
// coloured dot beside each name says which line is whose. That dot
// is the one thing not in the sheet; without it a two-purple chart
// is unreadable.
//
// The toggle redraws the same two series as $ Profit, ROI or Hit
// rate, all from one cumulative pass in the engine.

import { useMemo, useState } from "react";
import TabBar from "@/components/TabBar";
import {
  hitOf,
  iconFor,
  money,
  roiOf,
  type Chip,
  type Engine,
} from "@/lib/performance-engine";
import { PF_CSS, PfSegments, PfTopBar } from "./theme";
import { pageCls, type Dir } from "./motion";

const DAY = 86400000;
const PERIODS = [
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 180 },
  { key: "1Y", days: 365 },
  { key: "ALL", days: null },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];
const PERIOD_KEYS = PERIODS.map((p) => p.key);

const METRICS = ["$ Profit", "ROI", "Hit rate"] as const;
type Metric = (typeof METRICS)[number];

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

// A tick ladder on round numbers, always including zero when the
// range crosses it. Steps down the ladder until at least three
// ticks fit: a first pass once produced one tick and silently fell
// back to the series' raw extremes, which is what the sheet never
// shows.
function niceTicks(min: number, max: number): number[] {
  const span = max - min || 1;
  const mag = Math.pow(10, Math.floor(Math.log10(span / 4)));
  const ladder = [10, 5, 2.5, 2, 1, 0.5, 0.25].map((m) => m * mag);
  for (const step of ladder) {
    const out: number[] = [];
    const first = Math.ceil(min / step - 0.001) * step;
    for (let v = first; v <= max + step * 0.001; v += step) {
      out.push(Math.abs(v) < step * 0.001 ? 0 : Number(v.toFixed(6)));
    }
    if (out.length >= 3 && out.length <= 6) return out;
  }
  return [min, (min + max) / 2, max];
}

function axisLabel(v: number, metric: Metric): string {
  if (metric === "$ Profit") {
    const a = Math.abs(v);
    const body =
      a >= 1000 ? `$${(a / 1000).toFixed(a >= 10000 ? 0 : 1)}k` : `$${Math.round(a)}`;
    return v < 0 ? `-${body}` : body;
  }
  return `${Math.round(v)}%`;
}

export default function Compare({
  dir,
  engine,
  a,
  b,
  onBack,
  onOpen,
}: {
  dir: Dir;
  engine: Engine;
  a: Chip[];
  b: Chip;
  onBack: () => void;
  // Opens either side as its own fact page. Both cards are tappable
  // and the bottom button opens the RIVAL: you arrived here from
  // side A, so "Explore A" was a button that returned you to the
  // page you came from, which is what Back already does.
  onOpen: (path: Chip[]) => void;
}) {
  const [metric, setMetric] = useState<Metric>("$ Profit");
  const [period, setPeriod] = useState<PeriodKey>("ALL");

  const nameA = a.map((c) => c.value).join(" · ");
  const nameB = b.value;
  const statsA = engine.statsFor(a);
  const statsB = engine.statsFor([b]);

  // Colour by each side's own sign; a shared sign splits into two
  // weights so the lines never merge.
  const sameSign = statsA.profit >= 0 === statsB.profit >= 0;
  const colorA =
    statsA.profit >= 0 ? "var(--pf-purple)" : "var(--pf-red)";
  const colorB = !sameSign
    ? statsB.profit >= 0
      ? "var(--pf-purple)"
      : "var(--pf-red)"
    : statsB.profit >= 0
      ? "var(--pf-purple-lite)"
      : "var(--pf-red-lite)";

  const days = PERIODS.find((p) => p.key === period)!.days;
  const cutoff = days === null ? null : engine.now + 1 - days * DAY;

  const lines = useMemo(() => {
    function toSeries(filters: Chip[]) {
      const run = engine.runningFor(filters);
      const pts = run.map((r) => {
        const picks = r.wins + r.losses;
        const v =
          metric === "$ Profit"
            ? r.profit
            : metric === "ROI"
              ? r.staked > 0
                ? (r.profit / r.staked) * 100
                : 0
              : picks > 0
                ? (r.wins / picks) * 100
                : 0;
        return { t: r.t, v };
      });
      return cutoff === null ? pts : pts.filter((p) => p.t >= cutoff);
    }
    return { A: toSeries(a), B: toSeries([b]) };
  }, [engine, a, b, metric, cutoff]);

  const all = [...lines.A, ...lines.B];
  const w = 360;
  const height = 190;
  const padL = 40;
  const padB = 22;
  const padT = 8;
  const minT = all.length ? Math.min(...all.map((p) => p.t)) : 0;
  const maxT = all.length ? Math.max(...all.map((p) => p.t)) : 1;
  const rawMin = all.length ? Math.min(...all.map((p) => p.v)) : 0;
  const rawMax = all.length ? Math.max(...all.map((p) => p.v)) : 1;
  const minV = metric === "$ Profit" ? Math.min(0, rawMin) : rawMin;
  const maxV = metric === "$ Profit" ? Math.max(0, rawMax) : rawMax;
  const rangeT = maxT - minT || 1;
  const rangeV = maxV - minV || 1;
  const x = (t: number) => padL + ((t - minT) / rangeT) * (w - padL - 6);
  const y = (v: number) =>
    padT + (1 - (v - minV) / rangeV) * (height - padT - padB);
  const path = (pts: { t: number; v: number }[]) =>
    pts.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  // Round, evenly spaced ticks like the sheet ($2k / $1k / $0 /
  // -$1k), never the series' raw extremes.
  const ticks = niceTicks(minV, maxV);
  const dates: Date[] = [];
  for (let i = 0; i < 5; i++) dates.push(new Date(minT + (rangeT * i) / 4));

  return (
    <main className={pageCls(dir)}>
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className="pf-max">
        <PfTopBar onBack={onBack} title="Compare" />

        <div className="pfc-cards">
          <button
            type="button"
            className="pfc-card"
            onClick={() => onOpen(a)}
          >
            <span className="pfc-cardic">{iconFor(a[0].value)}</span>
            <p className="pfc-cardname">
              <i className="pfc-dot" style={{ background: colorA }} />
              {nameA}
            </p>
            <p className="pfc-cardsub">
              {statsA.wins}-{statsA.losses} · {hitOf(statsA)}
            </p>
            <p
              className={`pfc-cardmoney font-money ${
                statsA.profit >= 0 ? "pos" : "neg"
              }`}
            >
              {money(statsA.profit)}
            </p>
          </button>
          <span className="pfc-vs">vs</span>
          <button
            type="button"
            className="pfc-card"
            onClick={() => onOpen([b])}
          >
            <span className="pfc-cardic">{iconFor(nameB)}</span>
            <p className="pfc-cardname">
              <i className="pfc-dot" style={{ background: colorB }} />
              {nameB}
            </p>
            <p className="pfc-cardsub">
              {statsB.wins}-{statsB.losses} · {hitOf(statsB)}
            </p>
            <p
              className={`pfc-cardmoney font-money ${
                statsB.profit >= 0 ? "pos" : "neg"
              }`}
            >
              {money(statsB.profit)}
            </p>
          </button>
        </div>

        <div className="pfc-metrics">
          {METRICS.map((m) => (
            <button
              key={m}
              type="button"
              className={`pfc-metric ${metric === m ? "on" : ""}`}
              onClick={() => setMetric(m)}
            >
              {m}
            </button>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${w} ${height}`}
          style={{ width: "100%", height: "auto", display: "block" }}
          aria-hidden="true"
        >
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={y(v)}
                x2={w - 4}
                y2={y(v)}
                stroke="var(--pf-ring)"
                strokeWidth="1"
              />
              <text
                x={padL - 6}
                y={y(v) + 3}
                textAnchor="end"
                className="pf-axis"
              >
                {axisLabel(v, metric)}
              </text>
            </g>
          ))}
          {dates.map((d, i) => (
            <text
              key={i}
              x={padL + ((w - padL - 6) * i) / 4}
              y={height - 5}
              textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
              className="pf-axis"
            >
              {`${MONTHS[d.getMonth()]} ${d.getDate()}`}
            </text>
          ))}
          {lines.A.length > 1 && (
            <polyline
              points={path(lines.A)}
              fill="none"
              stroke={colorA}
              strokeWidth="2.3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {lines.B.length > 1 && (
            <polyline
              points={path(lines.B)}
              fill="none"
              stroke={colorB}
              strokeWidth="2.3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="pfc-segsrow">
          <PfSegments
            items={PERIOD_KEYS}
            value={period}
            onChange={setPeriod}
            fill
          />
        </div>

        {/* A "View all" link sat here promising a page that does not
            exist in any of the ten sheets. A link that goes nowhere
            is worse than no link. */}
        <div className="pfc-keyhead">
          <h2 className="pfc-h2">Key stats</h2>
        </div>
        <section className="pfc-key">
          {[
            { name: nameA, s: statsA, color: colorA },
            { name: nameB, s: statsB, color: colorB },
          ].map((row) => (
            <div key={row.name} className="pfc-keyrow">
              <p className="pfc-keyname">
                <i className="pfc-dot" style={{ background: row.color }} />
                {row.name}
              </p>
              <div className="pfc-keystats">
                <b
                  className={`font-money ${
                    row.s.profit >= 0 ? "pos" : "neg"
                  }`}
                >
                  {money(row.s.profit)}
                </b>
                <span>{hitOf(row.s)} hit rate</span>
                <span>
                  {row.s.wins}-{row.s.losses}
                </span>
                <span>{roiOf(row.s)} ROI</span>
              </div>
            </div>
          ))}
        </section>

        <button
          type="button"
          className="pfc-explore"
          onClick={() => onOpen([b])}
        >
          Explore {nameB}
        </button>
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}

const CSS = `
  .pf { --pf-purple-lite: #9B7BF2; --pf-red-lite: #F9A8A8; }
  [data-theme="dark"] .pf { --pf-purple-lite: #C4B0FB;
    --pf-red-lite: #FBBEBE; }
  .pfc-cards { display: flex; align-items: center; gap: 8px;
    margin-bottom: var(--pf-gap-section); }
  .pfc-card { flex: 1; min-width: 0; background: var(--pf-card);
    border: 1px solid var(--pf-ring); border-radius: var(--pf-r-card);
    padding: 16px 12px; text-align: center; color: inherit;
    font-family: inherit; cursor: pointer; display: block; }
  .pfc-cardic { font-size: 30px; line-height: 1; display: block;
    margin-bottom: 10px; }
  .pfc-cardname { font-size: 14.5px; font-weight: 700; margin: 0 0 4px;
    display: flex; align-items: center; justify-content: center;
    gap: 6px; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; }
  .pfc-dot { width: 7px; height: 7px; border-radius: 999px;
    flex: none; display: inline-block; }
  .pfc-cardsub { font-size: 12.5px; font-weight: 500;
    color: var(--pf-sub); margin: 0 0 8px;
    font-variant-numeric: tabular-nums; }
  .pfc-cardmoney { font-size: 21px; font-weight: 600; margin: 0;
    font-variant-numeric: tabular-nums; }
  .pfc-vs { width: 38px; height: 38px; border-radius: 999px;
    background: var(--pf-inner); color: var(--pf-sub); flex: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 12.5px; font-weight: 600; }
  .pfc-metrics { display: flex; background: var(--pf-track);
    border: 1px solid var(--pf-ring); border-radius: 999px;
    padding: 3px; margin-bottom: var(--pf-gap-block); }
  .pfc-metric { flex: 1; border: none; background: none;
    color: var(--pf-sub); font-family: inherit; font-size: 13.5px;
    font-weight: 600; padding: 10px 0; border-radius: 999px;
    cursor: pointer; }
  .pfc-metric.on { background: var(--pf-purple); color: #fff;
    font-weight: 700; }
  .pfc-segsrow { margin: 12px 0 var(--pf-gap-section); }
  .pfc-keyhead { display: flex; justify-content: space-between;
    align-items: baseline; margin-bottom: 10px; }
  .pfc-h2 { font-size: 17px; font-weight: 700; margin: 0; }
  .pfc-key { background: var(--pf-card); border: 1px solid
    var(--pf-ring); border-radius: var(--pf-r-card); padding: 0 16px; }
  .pfc-keyrow { padding: 15px 0; border-bottom: 1px solid
    var(--pf-ring); }
  .pfc-keyrow:last-child { border-bottom: none; }
  .pfc-keyname { font-size: 13px; font-weight: 600;
    color: var(--pf-sub); margin: 0 0 7px; display: flex;
    align-items: center; gap: 7px; }
  .pfc-keystats { display: flex; align-items: baseline; gap: 14px;
    flex-wrap: wrap; }
  .pfc-keystats b { font-size: 17px; font-weight: 700;
    font-variant-numeric: tabular-nums; }
  .pfc-keystats span { font-size: 12.5px; font-weight: 500;
    color: var(--pf-sub); font-variant-numeric: tabular-nums; }
  .pfc-explore { display: block; width: 100%; border: none;
    background: var(--pf-purple); color: #fff; font-family: inherit;
    font-size: 15px; font-weight: 700; padding: 16px;
    border-radius: var(--pf-r-inner);
    margin-top: var(--pf-gap-block); cursor: pointer; }
`;
