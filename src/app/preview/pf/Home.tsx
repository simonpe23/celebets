"use client";

// PORTFOLIO HOME, built to v2_01_portfolio_home.png. Local preview,
// gitignored.
//
// The sheet's anatomy, top to bottom:
//   Portfolio + gear in a lavender rounded square.
//   HERO CARD: the period's profit as the page's one big number,
//     bets · hit · ROI under it, the axis chart, then the 7D 30D 90D
//     All control and the lavender Explore Your Heatmap button.
//   Your performance / Ranked by what matters most + By impact chip.
//   Exactly five ranked rows with wide faded sparklines.
//   Build your Performance View, the door to the builder.
//   Things worth knowing: full lavender card, sparkle + purple
//     title, Updated today, the two insights side by side, See all
//     insights with a trailing chevron.
//
// Cut by the owner: the Overall score (72/100). Cut in the polish
// pass: the "All time ▾" chip, which said what the segmented control
// two lines below it already said.
//
// The segmented control re-runs the chart AND the profit above it,
// so the number and the line can never disagree.

import { useMemo, useState } from "react";
import TabBar from "@/components/TabBar";
import {
  dedupeFacts,
  hitOf,
  iconFor,
  money,
  roiOf,
  SORT_LABELS,
  type Chip,
  type Engine,
  type Fact,
  type SortMode,
} from "@/lib/performance-engine";
import { PF_CSS, PfChart, PfSegments, PfSpark } from "./theme";
import { pageCls, useCountUp, type Dir } from "./motion";
import AddFact from "./AddFact";

const MODES: SortMode[] = ["impact", "profit", "roi", "hit"];
const DAY = 86400000;
const PERIODS = [
  { key: "7D", days: 7, label: "Last 7 days" },
  { key: "30D", days: 30, label: "Last 30 days" },
  { key: "90D", days: 90, label: "Last 90 days" },
  { key: "All", days: null, label: "All time" },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];
const PERIOD_KEYS = PERIODS.map((p) => p.key);

export default function Home({
  dir,
  engine,
  onOpen,
  onMap,
  onChanged,
  onInsight,
}: {
  dir: Dir;
  engine: Engine;
  onOpen: (chip: Chip) => void;
  onMap: () => void;
  onChanged: () => void;
  onInsight: () => void;
}) {
  const [mode, setMode] = useState<SortMode>("impact");
  const [period, setPeriod] = useState<PeriodKey>("All");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { facts, topLine, leakLine, fullSeries } = useMemo(() => {
    const ranked = dedupeFacts(engine.rankedFacts([], 5));
    for (const f of ranked) f.spark = engine.sparkFor([f.chip]);
    return {
      facts: ranked.slice(0, 10),
      topLine: ranked.find((f) => f.s.profit > 0) ?? null,
      leakLine: ranked.find((f) => f.s.profit < 0) ?? null,
      fullSeries: engine.seriesFor([]),
    };
  }, [engine]);

  const days = PERIODS.find((p) => p.key === period)!.days;
  const cutoff = days === null ? null : engine.now + 1 - days * DAY;
  const stats =
    cutoff === null
      ? engine.statsFor([])
      : engine.statsFor([], undefined, cutoff);
  const series = useMemo(() => {
    if (cutoff === null) return fullSeries;
    const before = fullSeries.filter((p) => p.t < cutoff);
    const base = before.length > 0 ? before[before.length - 1].v : 0;
    const cut = fullSeries
      .filter((p) => p.t >= cutoff)
      .map((p) => ({ t: p.t, v: p.v - base }));
    return [{ t: cutoff, v: 0 }, ...cut];
  }, [fullSeries, cutoff]);

  const periodLabel = PERIODS.find((p) => p.key === period)!.label;
  const sorted = engine.sortFacts(facts, mode);
  const shown = sorted.slice(0, 5);
  // The hero travels to its new value when the period changes.
  // Snapping to a different figure reads as a different number
  // appearing; travelling reads as the same number changing, which
  // is what actually happened.
  const heroProfit = useCountUp(stats.profit);

  function Row({ f, rank }: { f: Fact; rank: number }) {
    return (
      <button
        type="button"
        className="pfh-row pf-stagger"
        // Rows arrive one after another, capped so the list never
        // crawls. The rank is the order, so the sequence is the
        // ranking being counted out.
        style={{ animationDelay: `${Math.min(rank - 1, 5) * 0.055}s` }}
        onClick={() => onOpen(f.chip)}
      >
        <span className="pfh-rank">{rank}</span>
        <span className="pfh-ic">{iconFor(f.chip.value)}</span>
        <span className="pfh-name">
          <b>{f.chip.value}</b>
          <i>
            {f.s.wins}-{f.s.losses}&nbsp;&nbsp;·&nbsp;&nbsp;{hitOf(f.s)}
          </i>
        </span>
        <PfSpark
          data={f.spark}
          id={f.chip.value}
          w={84}
          h={30}
          color={f.s.profit >= 0 ? "var(--pf-purple)" : "var(--pf-red)"}
        />
        <span className="pfh-right">
          <b className={f.s.profit >= 0 ? "pos" : "neg"}>
            {money(f.s.profit)}
          </b>
          <i>{roiOf(f.s)} ROI</i>
        </span>
        <span className="pf-chev">›</span>
      </button>
    );
  }

  return (
    <main className={pageCls(dir)}>
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className="pf-max">
        <div className="pf-h1row">
          <h1 className="pf-h1">Portfolio</h1>
          <span className="pfh-gearbtn" aria-hidden="true">
            ⚙
          </span>
        </div>

        {/* THE HERO CARD. The Overall score is gone (owner cut it);
            profit IS the hero now. */}
        <section className="pfh-hero">
          {/* ONE STATEMENT OF THE PERIOD, not two. This card used to
              carry an "All time ▾" chip AND an "All" segment selected
              directly below it, the same fact twice, which is the
              exact error the last Performance rebuild was undone by.
              The chip is gone; the label now names the window, so it
              does real work instead of saying "Profit". */}
          <div className="pfh-hero-top">
            <p className="pfh-label">
              {periodLabel} profit <span className="pfh-info">ⓘ</span>
            </p>
          </div>
          <p
            className={`pfh-profit font-money ${
              stats.profit >= 0 ? "pos" : "neg"
            }`}
          >
            {money(heroProfit)}
          </p>
          <p className="pfh-profitsub">
            {stats.bets} bets · {hitOf(stats)} hit rate ·{" "}
            {roiOf(stats)} ROI
          </p>
          <PfChart series={series} id="home" height={160} />
          <div className="pfh-hero-foot">
            <PfSegments
              items={PERIOD_KEYS}
              value={period}
              onChange={setPeriod}
            />
            <button
              type="button"
              className="pfh-mapbtn"
              onClick={onMap}
            >
              <span aria-hidden="true">▤</span> Explore Your Heatmap
            </button>
          </div>
        </section>

        <div className="pfh-listhead">
          <div>
            <h2 className="pfh-h2">Your performance</h2>
            <p className="pfh-ranksub">Ranked by what matters most.</p>
          </div>
          <button
            type="button"
            className="pfh-sort"
            onClick={() =>
              setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length])
            }
          >
            {SORT_LABELS[mode]} ▾
          </button>
        </div>

        <section className="pfh-list">
          {shown.map((f, i) => (
            <Row key={f.chip.value} f={f} rank={i + 1} />
          ))}
        </section>
        {/* THE BUILDER'S FRONT DOOR. It used to unfold five more
            rows, which was a weak job for its name. It now opens the
            Add a fact sheet with NO context, so a question can be
            built from scratch without entering a fact first. */}
        <button
          type="button"
          className="pf-door pfh-door"
          onClick={() => setSheetOpen(true)}
        >
          <span>Build your Performance View</span>
          <span className="pf-chev" aria-hidden="true">
            ›
          </span>
        </button>

        {/* THINGS WORTH KNOWING: the full lavender card. */}
        <section className="pfh-know">
          <button
            type="button"
            className="pfh-know-head"
            onClick={onInsight}
          >
            <span className="pfh-know-title">
              <span className="pfh-sparkle" aria-hidden="true">
                ✦
              </span>
              Things worth knowing
            </span>
            <span className="pf-chev">›</span>
          </button>
          {/* This opens What Changed, so it is drawn as a link. It
              used to be 12px muted grey, which reads as a caption:
              nobody taps a caption. */}
          <button
            type="button"
            className="pfh-know-sub"
            onClick={onChanged}
          >
            Updated today ›
          </button>
          <div className="pfh-know-grid">
            {topLine !== null && (
              <div className="pfh-insight">
                <span className="pfh-badge up" aria-hidden="true">
                  ↑
                </span>
                <span className="pfh-insight-body">
                  <b>{topLine.chip.value} is carrying you</b>
                  <i>
                    <em className="pos">{money(topLine.s.profit)}</em>{" "}
                    profit · {hitOf(topLine.s)} hit rate
                  </i>
                </span>
              </div>
            )}
            {leakLine !== null && (
              <div className="pfh-insight">
                <span className="pfh-badge down" aria-hidden="true">
                  ↓
                </span>
                <span className="pfh-insight-body">
                  <b>{leakLine.chip.value} is dragging you down</b>
                  <i>
                    <em className="neg">{money(leakLine.s.profit)}</em>{" "}
                    loss · {hitOf(leakLine.s)} hit rate
                  </i>
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="pfh-know-foot"
            onClick={onInsight}
          >
            <span className="pf-link">See all insights</span>
            <span className="pf-chev">›</span>
          </button>
        </section>
      </div>
      <TabBar activeHref="/stats" />
      {sheetOpen && (
        <AddFact
          engine={engine}
          path={[]}
          onAdd={(chip) => {
            setSheetOpen(false);
            onOpen(chip);
          }}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </main>
  );
}

const CSS = `
  .pfh-gearbtn { width: 40px; height: 40px;
    border-radius: var(--pf-r-small); background: var(--pf-lav);
    color: var(--pf-purple); display: flex; align-items: center;
    justify-content: center; font-size: 22px; }
  .pfh-hero { background: var(--pf-card); border: 1px solid
    var(--pf-ring); border-radius: var(--pf-r-card); padding: 16px;
    margin: 16px 0 var(--pf-gap-section); }
  .pfh-hero-top { display: flex; justify-content: space-between;
    align-items: flex-start; gap: 8px; margin-bottom: 2px; }
  .pfh-label { font-size: 13.5px; font-weight: 600; margin: 0;
    color: var(--pf-sub); white-space: nowrap; }
  .pfh-info { color: var(--pf-muted); font-size: 12px; }
  .pfh-profit { font-size: 42px; font-weight: 600; margin: 4px 0 6px;
    letter-spacing: -0.015em; font-variant-numeric: tabular-nums;
    line-height: 1.1; }
  .pfh-profitsub { font-size: 13px; font-weight: 500; margin: 0 0 6px;
    color: var(--pf-sub); font-variant-numeric: tabular-nums;
    white-space: nowrap; }
  .pfh-hero-foot { display: flex; flex-direction: column;
    align-items: flex-start; margin-top: 10px;
    gap: var(--pf-gap-block); }
  .pfh-mapbtn { display: flex; align-items: center;
    justify-content: center; gap: 8px; width: 100%; border: none;
    background: var(--pf-lav); color: var(--pf-purple);
    font-family: inherit; font-size: 14px; font-weight: 700;
    padding: 13px; border-radius: var(--pf-r-small); cursor: pointer; }
  .pfh-listhead { display: flex; justify-content: space-between;
    align-items: flex-start; gap: 12px; margin-bottom: 4px; }
  .pfh-h2 { font-size: 20px; font-weight: 700; margin: 0; }
  .pfh-ranksub { font-size: 13.5px; font-weight: 500;
    color: var(--pf-sub); margin: 4px 0 0; }
  .pfh-sort { border: 1px solid var(--pf-ring);
    background: var(--pf-card); color: inherit; font-family: inherit;
    font-size: 12.5px; font-weight: 600; padding: 8px 13px;
    border-radius: 999px; cursor: pointer; flex: none; }
  .pfh-list { display: flex; flex-direction: column; }
  .pfh-row { display: flex; align-items: center; gap: 12px;
    width: 100%; border: none; border-bottom: 1px solid var(--pf-ring);
    background: none; color: inherit; font-family: inherit;
    text-align: left; padding: 15px 0; cursor: pointer; }
  .pfh-row:last-child { border-bottom: none; }
  .pfh-rank { width: 25px; height: 25px; border-radius: 999px;
    background: var(--pf-green); color: #fff; font-size: 12px;
    font-weight: 800; display: flex; align-items: center;
    justify-content: center; flex: none;
    font-variant-numeric: tabular-nums; }
  .pfh-ic { width: 42px; height: 42px; border-radius: 999px;
    background: var(--pf-inner); display: flex; align-items: center;
    justify-content: center; font-size: 19px; flex: none; }
  .pfh-name { min-width: 0; flex: 1; }
  .pfh-name b { display: block; font-size: 15px; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px; }
  .pfh-name i { font-style: normal; font-size: 12.5px;
    font-weight: 500; color: var(--pf-sub);
    font-variant-numeric: tabular-nums; }
  .pfh-right { flex: none; text-align: right; }
  .pfh-right b { display: block; font-size: 15px; font-weight: 700;
    font-variant-numeric: tabular-nums; margin-bottom: 3px; }
  .pfh-right i { font-style: normal; font-size: 12px;
    font-weight: 500; color: var(--pf-sub);
    font-variant-numeric: tabular-nums; }
  .pfh-door { margin-top: var(--pf-gap-block); }
  .pfh-know { background: var(--pf-lav);
    border-radius: var(--pf-r-card); padding: 16px;
    margin-top: var(--pf-gap-section); }
  .pfh-know-head { display: flex; justify-content: space-between;
    align-items: baseline; width: 100%; border: none;
    background: none; padding: 0; cursor: pointer;
    font-family: inherit; color: inherit; }
  .pfh-know-title { font-size: 15.5px; font-weight: 700;
    color: var(--pf-purple); display: flex; align-items: center;
    gap: 8px; }
  .pfh-sparkle { font-size: 15px; }
  .pfh-know-sub { font-size: 13px; font-weight: 600;
    color: var(--pf-purple); margin: 0 0 8px;
    padding: 4px 6px 8px 23px; border: none; background: none;
    cursor: pointer; font-family: inherit; display: block;
    text-align: left; margin-left: -6px; }
  .pfh-know-grid { display: grid;
    grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 370px) {
    .pfh-know-grid { grid-template-columns: 1fr; }
  }
  .pfh-insight { display: flex; gap: 10px; align-items: flex-start; }
  .pfh-badge { width: 26px; height: 26px; border-radius: 999px;
    flex: none; display: flex; align-items: center;
    justify-content: center; font-size: 12px; font-weight: 800; }
  .pfh-badge.up { background: var(--pf-greenbg); color: var(--pf-green); }
  .pfh-badge.down { background: var(--pf-redbg); color: var(--pf-red); }
  .pfh-insight-body { min-width: 0; }
  .pfh-insight-body b { display: block; font-size: 13px;
    font-weight: 700; margin-bottom: 2px; }
  .pfh-insight-body i { font-style: normal; font-size: 11.5px;
    font-weight: 500; color: var(--pf-sub); white-space: nowrap;
    font-variant-numeric: tabular-nums; }
  .pfh-insight-body em { font-style: normal; font-weight: 700; }
  .pfh-know-foot { display: flex; justify-content: space-between;
    align-items: center; margin-top: 14px; width: 100%;
    border: none; background: none; padding: 0; cursor: pointer;
    font-family: inherit; color: inherit; }
  .pfh-know-foot .pf-link { font-size: 14px; }
`;
