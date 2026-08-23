"use client";

// VIEW 2, THE GOLDEN VIEW: the Fact Page as the CHART BUILDER, a
// replica of v3_02_fact_page.png. Local preview, gitignored.
//
// Why it changed: the page used to end in an "Inside <fact>" list,
// which was a second list after Home's list, and worse, tapping a
// row there did exactly what adding a fact does. Two controls, one
// outcome. The owner caught it: "i realize i miss Lab V1, where i
// can build my chart... we need more cards here."
//
// So the bottom half is now the workbench: a token bar for the
// question, then EXPLORE THIS PERFORMANCE as a two-column card grid
// whose + adds a fact IN PLACE. Every card's money is already the
// intersection, so the grid previews the result before you tap.
// Nothing navigates: the chart, the strip and the header re-scope
// where they stand. Removing the last token walks back out to Home.

import { useMemo, useState } from "react";
import TabBar from "@/components/TabBar";
import {
  hitOf,
  iconFor,
  money,
  roiOf,
  type Chip,
  type Engine,
  type Stats,
} from "./engine";
import { PF_CSS, PfChart, PfSegments, PfTopBar } from "./theme";
import { pageCls, useCountUp, type Dir } from "./motion";
import AddFact from "./AddFact";

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

function strengthOf(s: Stats): { label: string; tone: string } | null {
  const picks = s.wins + s.losses;
  if (picks < 5) return null;
  const roi = s.staked > 0 ? (s.profit / s.staked) * 100 : 0;
  if (s.profit > 0 && roi >= 20) return { label: "Core strength", tone: "up" };
  if (s.profit < 0) return { label: "Needs work", tone: "down" };
  return { label: "Steady", tone: "flat" };
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 4v16M7 20h10M4 8h16M4 8l-2 6h4l-2-6zM20 8l-2 6h4l-2-6z" />
    </svg>
  );
}

export default function Fact({
  dir,
  engine,
  path,
  onOpen,
  onRemove,
  onCompare,
  onBack,
}: {
  dir: Dir;
  engine: Engine;
  path: Chip[];
  onOpen: (chip: Chip) => void;
  onRemove: (chip: Chip) => void;
  onCompare: (chip: Chip) => void;
  onBack: () => void;
}) {
  const [period, setPeriod] = useState<PeriodKey>("ALL");
  const [expanded, setExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickCompare, setPickCompare] = useState(false);

  const name = path.map((c) => c.value).join(" · ");
  const stats = engine.statsFor(path);
  const strength = strengthOf(stats);
  // Adding a fact re-scopes this page in place, so the headline
  // money travels to its new figure rather than being replaced. It
  // is the same number, narrowed.
  const shownMoney = useCountUp(stats.profit);
  const fullSeries = useMemo(() => engine.seriesFor(path), [engine, path]);

  const days = PERIODS.find((p) => p.key === period)!.days;
  const cutoff = days === null ? null : engine.now + 1 - days * DAY;
  const series = useMemo(() => {
    if (cutoff === null) return fullSeries;
    const before = fullSeries.filter((p) => p.t < cutoff);
    const base = before.length > 0 ? before[before.length - 1].v : 0;
    const cut = fullSeries
      .filter((p) => p.t >= cutoff)
      .map((p) => ({ t: p.t, v: p.v - base }));
    return cut.length > 0 ? [{ t: cutoff, v: 0 }, ...cut] : fullSeries;
  }, [fullSeries, cutoff]);

  // The grid: facts you can still add, ranked, each priced AT the
  // intersection it would create.
  const options = useMemo(() => engine.rankedFacts(path, 2), [engine, path]);
  const shown = expanded ? options : options.slice(0, 10);

  return (
    <main className={pageCls(dir)}>
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className="pf-max">
        <PfTopBar
          onBack={onBack}
          right={
            <>
              <span className="pf-topbtn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={1.9} strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M12 15V3" />
                  <path d="M8 7l4-4 4 4" />
                  <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6" />
                </svg>
              </span>
              <span className="pf-topbtn" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.7" />
                  <circle cx="12" cy="12" r="1.7" />
                  <circle cx="19" cy="12" r="1.7" />
                </svg>
              </span>
            </>
          }
        />

        <div className="pff-head">
          {/* The PRIMARY fact's icon: the page is anchored on what
              you opened, never on the last fact added. */}
          <span className="pff-ic">{iconFor(path[0].value)}</span>
          <div className="pff-headtext">
            <h1 className="pff-name">{name}</h1>
            <div className="pff-moneyrow">
              <span
                className={`pff-money font-money ${
                  stats.profit >= 0 ? "pos" : "neg"
                }`}
              >
                {money(shownMoney)}
              </span>
              {strength !== null && (
                <span className={`pff-pill ${strength.tone}`}>
                  {strength.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* THE QUESTION: removable tokens plus the door to the full
            sheet. Removing the last one walks back out. */}
        <div className="pff-tokens">
          {path.map((c) => (
            <button
              key={`${c.group}|${c.value}`}
              type="button"
              className="pff-token"
              onClick={() => onRemove(c)}
            >
              {c.value} <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            className="pff-addtoken"
            onClick={() => setSheetOpen(true)}
          >
            <span aria-hidden="true">+</span> Add a fact
          </button>
        </div>

        <div className="pff-strip">
          <span>
            <b className="font-money">
              {stats.wins}-{stats.losses}
            </b>
            <i>Record</i>
          </span>
          <span>
            <b className="font-money">{hitOf(stats)}</b>
            <i>Hit rate</i>
          </span>
          <span>
            <b className="font-money">{roiOf(stats)}</b>
            <i>ROI</i>
          </span>
          <span>
            <b className="font-money">{stats.bets}</b>
            <i>Bets</i>
          </span>
        </div>

        {/* The "All time ▾" chip that used to sit up here said
            exactly what the ALL segment below the chart says. One
            statement of the period per card. */}
        <section className="pff-chartcard">
          <div className="pff-charttop">
            <span className="pff-chartlabel">Profit over time</span>
          </div>
          <PfChart series={series} id={`fact-${name}`} height={170} endDot />
          <div className="pff-chartsegs">
            <PfSegments
              items={PERIOD_KEYS}
              value={period}
              onChange={setPeriod}
              fill
            />
          </div>
        </section>

        <div className="pff-hint">
          <span className="pff-hinttext">
            <span className="pff-sparkle" aria-hidden="true">
              ✦
            </span>
            Tap any fact to refine. Results update instantly.
          </span>
          <span className="pf-link pff-betslink">
            See the {stats.bets} bets ›
          </span>
        </div>

        {options.length > 0 && (
          <>
            <p className="pff-gridlabel">Explore this performance</p>
            <div className="pff-grid">
              {shown.map((f) => (
                <button
                  key={`${f.chip.group}|${f.chip.value}`}
                  type="button"
                  className="pff-gcard"
                  onClick={() => onOpen(f.chip)}
                >
                  <span className="pff-gic">{iconFor(f.chip.value)}</span>
                  <span className="pff-gtext">
                    <b>{f.chip.value}</b>
                    <i className={f.s.profit >= 0 ? "pos" : "neg"}>
                      {money(f.s.profit)}
                    </i>
                  </span>
                  <span className="pff-gplus" aria-hidden="true">
                    +
                  </span>
                </button>
              ))}
            </div>
            {/* "View all facts" used to live here AND name the
                sheet, two controls with one name. This one only
                unfolds the grid, so it says so. */}
            {options.length > 10 && (
              <button
                type="button"
                className="pff-more"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show fewer facts ⌃" : "Show more facts ⌄"}
              </button>
            )}
          </>
        )}

        <div className="pff-actions">
          <button
            type="button"
            className="pff-btn outline"
            onClick={() => setPickCompare(true)}
          >
            <span className="pff-btnic">
              <ScaleIcon />
            </span>
            Compare
          </button>
          <button
            type="button"
            className="pff-btn filled"
            onClick={() => setSheetOpen(true)}
          >
            + Add a fact
          </button>
        </div>
      </div>
      <TabBar activeHref="/stats" />
      {sheetOpen && (
        <AddFact
          engine={engine}
          path={path}
          onAdd={(chip) => {
            onOpen(chip);
            setSheetOpen(false);
          }}
          onClose={() => setSheetOpen(false)}
        />
      )}
      {pickCompare && (
        <AddFact
          engine={engine}
          path={path}
          compare
          onAdd={(chip) => {
            setPickCompare(false);
            onCompare(chip);
          }}
          onClose={() => setPickCompare(false)}
        />
      )}
    </main>
  );
}

const CSS = `
  .pff-head { display: flex; gap: 16px; align-items: center;
    margin-bottom: 16px; }
  .pff-ic { width: 72px; height: 72px; border-radius: 999px;
    background: var(--pf-card); box-shadow: 0 0 0 1px var(--pf-ring);
    display: flex; align-items: center; justify-content: center;
    font-size: 34px; flex: none; }
  .pff-headtext { min-width: 0; }
  .pff-name { font-size: 22px; font-weight: 700; margin: 0 0 6px;
    letter-spacing: -0.015em; }
  .pff-moneyrow { display: flex; align-items: center; gap: 12px;
    flex-wrap: wrap; }
  .pff-money { font-size: 30px; font-weight: 600;
    letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
  /* The strength pill was carrying a THIRD green (#009B07 on
     #ECF9EF), close enough to the app's green to look like a
     mistake rather than a choice. It uses the tokens now. */
  .pff-pill { font-size: 12.5px; font-weight: 700; padding: 6px 13px;
    border-radius: 999px; white-space: nowrap; }
  .pff-pill.up { background: var(--pf-greenbg); color: var(--pf-green); }
  .pff-pill.down { background: var(--pf-redbg); color: var(--pf-red); }
  .pff-pill.flat { background: var(--pf-inner); color: var(--pf-sub); }
  .pff-tokens { display: flex; flex-wrap: wrap; gap: 10px;
    margin-bottom: 18px; }
  .pff-token { border: 1.5px solid var(--pf-purple);
    background: var(--pf-card); color: var(--pf-purple);
    font-family: inherit; font-size: 14px; font-weight: 700;
    padding: 10px 16px; border-radius: 999px; cursor: pointer; }
  .pff-token span { opacity: 0.75; margin-left: 4px; }
  .pff-addtoken { border: 1.5px solid var(--pf-ring);
    background: var(--pf-card); color: inherit; font-family: inherit;
    font-size: 14px; font-weight: 600; padding: 10px 18px;
    border-radius: 999px; cursor: pointer; }
  .pff-addtoken span { margin-right: 4px; }
  .pff-strip { display: flex; align-items: stretch;
    background: var(--pf-card); border: 1px solid var(--pf-ring);
    border-radius: var(--pf-r-inner); padding: 14px 4px;
    margin-bottom: var(--pf-gap-block); }
  .pff-strip span { flex: 1; text-align: center; padding: 0 4px; }
  .pff-strip span + span { border-left: 1px solid var(--pf-ring); }
  .pff-strip b { display: block; font-size: 19px; font-weight: 700;
    font-variant-numeric: tabular-nums; margin-bottom: 4px; }
  .pff-strip i { font-style: normal; font-size: 10.5px;
    font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--pf-muted); }
  .pff-chartcard { background: var(--pf-card);
    border: 1px solid var(--pf-ring); border-radius: var(--pf-r-card);
    padding: 16px; }
  .pff-charttop { display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 6px; min-height: 20px; }
  .pff-chartlabel { font-size: 11.5px; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--pf-sub); }
  .pff-chartsegs { margin-top: 12px; }
  .pff-hint { display: flex; justify-content: space-between;
    align-items: center; gap: 10px;
    margin: var(--pf-gap-block) 0 var(--pf-gap-section); }
  .pff-hinttext { display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 500; color: var(--pf-sub); }
  .pff-sparkle { color: var(--pf-purple); font-size: 14px; }
  .pff-betslink { flex: none; white-space: nowrap; }
  .pff-gridlabel { font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--pf-muted); margin: 0 0 10px; }
  .pff-grid { display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; }
  /* MEASURED off v3_02_fact_page.png, not eyeballed: card ~58px
     tall, radius 16; the ICON IS THE GRAPHIC, ~29px, no grey circle
     behind it; name 14.5 bold over money 15 bold on a 4px gap; the
     + is a small lavender dot; icon, text and + all vertically
     centered. */
  .pff-gcard { display: flex; align-items: center; gap: 12px;
    background: var(--pf-card); border: 1px solid var(--pf-ring);
    border-radius: var(--pf-r-inner); padding: 10px 16px 10px 12px;
    min-height: 58px; color: inherit; font-family: inherit;
    text-align: left; cursor: pointer; }
  .pff-gic { width: 34px; display: flex; align-items: center;
    justify-content: center; font-size: 28px; line-height: 1;
    flex: none; }
  .pff-gtext { min-width: 0; flex: 1; }
  .pff-gtext b { display: block; font-size: 14.5px; font-weight: 700;
    line-height: 1.15; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; margin-bottom: 4px; }
  .pff-gtext i { font-style: normal; font-size: 15px;
    font-weight: 700; line-height: 1;
    font-variant-numeric: tabular-nums; }
  .pff-gplus { color: #2404DD; flex: none; font-size: 17px;
    font-weight: 600; line-height: 1; align-self: center;
    padding: 2px; }
  [data-theme="dark"] .pff-gplus { color: #A78BFA; }
  .pff-more { display: block; width: 100%; border: 1px solid
    var(--pf-ring); background: var(--pf-inner); color: var(--pf-sub);
    font-family: inherit; font-size: 13.5px; font-weight: 600;
    padding: 14px; border-radius: var(--pf-r-inner);
    margin-top: 10px; cursor: pointer; }
  .pff-actions { display: flex; gap: 12px;
    margin-top: var(--pf-gap-block); }
  .pff-btn { flex: 1; border-radius: var(--pf-r-inner); padding: 16px;
    font-family: inherit; font-size: 15px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 8px; }
  .pff-btnic { display: flex; }
  .pff-btnic svg { width: 19px; height: 19px; }
  .pff-btn.outline { border: 1.5px solid var(--pf-purple);
    background: var(--pf-card); color: var(--pf-purple); }
  .pff-btn.filled { border: none; background: var(--pf-purple);
    color: #fff; }
`;
