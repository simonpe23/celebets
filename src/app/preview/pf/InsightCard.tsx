"use client";

// VIEW 8: THE INSIGHT / QUESTION CARD, built to
// 08_insight_question_card.png. Local preview, gitignored.
//
// A modal over the dimmed page: ringed bolt, the finding's kind in
// purple, one sentence naming the intersection in bold, four stat
// rows, then Explore (filled) and Ask Actuals why (outline).
//
// The finding is computed, never canned: the strongest two-fact
// intersection in the record, worded by its sign.

import { useMemo } from "react";
import {
  dedupeFacts,
  hitOf,
  money,
  roiOf,
  type Chip,
  type Engine,
} from "./engine";
import { PF_CSS } from "./theme";
import { useDismiss } from "./motion";

export default function InsightCard({
  engine,
  onExplore,
  onClose,
}: {
  engine: Engine;
  onExplore: (path: Chip[]) => void;
  onClose: () => void;
}) {
  // The scrim fades and the card drops back down together, so
  // closing reads as one movement rather than two things vanishing.
  const { leaving, close } = useDismiss(onClose);
  const finding = useMemo(() => {
    const top = dedupeFacts(engine.rankedFacts([], 5)).slice(0, 7);
    let best: { path: Chip[]; profit: number; score: number } | null = null;
    for (const a of top) {
      for (const b of engine.rankedFacts([a.chip], 3).slice(0, 6)) {
        const s = engine.statsFor([a.chip, b.chip]);
        const picks = s.wins + s.losses;
        if (picks < 4) continue;
        const score = Math.abs(s.profit) * Math.sqrt(picks / (picks + 8));
        if (best === null || score > best.score) {
          best = { path: [a.chip, b.chip], profit: s.profit, score };
        }
      }
    }
    return best;
  }, [engine]);

  if (finding === null) return null;
  const stats = engine.statsFor(finding.path);
  const good = stats.profit >= 0;
  const [first, second] = finding.path;

  return (
    <div
      className={`pf pfi-scrim pf-fade${leaving ? " leaving" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className={`pfi-sheet pf-rise${leaving ? " leaving" : ""}`}>
        <button
          type="button"
          className="pfi-close"
          onClick={close}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <span className={`pfi-ring ${good ? "" : "down"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13.5 2L4 13.5h5.5L10.5 22 20 10.5h-5.5L13.5 2z" />
          </svg>
        </span>

        <p className={`pfi-kind ${good ? "" : "down"}`}>
          {good ? "Biggest opportunity" : "Biggest leak"}
        </p>

        <p className="pfi-line">
          Your <b>{first.value}</b> in <b>{second.value}</b> is{" "}
          {good ? "performing exceptionally well." : "costing you money."}
        </p>

        <div className="pfi-stats">
          <div>
            <span>Profit</span>
            <b className={`font-money ${good ? "pos" : "neg"}`}>
              {money(stats.profit)}
            </b>
          </div>
          <div>
            <span>Hit rate</span>
            <b className="font-money">{hitOf(stats)}</b>
          </div>
          <div>
            <span>ROI</span>
            <b className="font-money">{roiOf(stats)}</b>
          </div>
          <div>
            <span>Bets</span>
            <b className="font-money">{stats.bets}</b>
          </div>
        </div>

        <button
          type="button"
          className="pfi-explore"
          onClick={() => onExplore(finding.path)}
        >
          {/* Worded in the same order as the sentence above it.
              "Explore Medium odds Moneyline" read like a typo. */}
          Explore {first.value} in {second.value}
        </button>
        <button type="button" className="pfi-ask">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 01-9 8.4L3 21l1.1-4.4A8.4 8.4 0 1121 11.5z" />
          </svg>
          Ask Actuals why
        </button>
      </div>
    </div>
  );
}

const CSS = `
  .pfi-scrim { position: fixed; inset: 0; z-index: 50;
    background: rgba(23,23,23,0.45); display: flex;
    align-items: flex-end; justify-content: center;
    padding: 0; min-height: 100svh; }
  [data-theme="dark"] .pfi-scrim { background: rgba(0,0,0,0.6); }
  .pfi-sheet { position: relative; width: 100%; max-width: 430px;
    background: var(--pf-card); border-radius: 28px 28px 0 0;
    padding: 30px 22px 26px; text-align: center;
    max-height: 92svh; overflow-y: auto; }
  .pfi-close { position: absolute; top: 20px; right: 20px;
    border: none; background: none; color: var(--pf-sub);
    padding: 0; cursor: pointer; }
  .pfi-close svg { width: 24px; height: 24px; }
  .pfi-ring { width: 74px; height: 74px; border-radius: 999px;
    border: 1.5px solid var(--pf-purple); color: var(--pf-purple);
    display: flex; align-items: center; justify-content: center;
    margin: 8px auto 20px; }
  .pfi-ring.down { border-color: var(--pf-red); color: var(--pf-red); }
  .pfi-ring svg { width: 32px; height: 32px; }
  .pfi-kind { font-size: 19px; font-weight: 700;
    color: var(--pf-purple); margin: 0 0 18px; }
  .pfi-kind.down { color: var(--pf-red); }
  .pfi-line { font-size: 18px; font-weight: 500; line-height: 1.45;
    margin: 0 0 24px; }
  .pfi-line b { font-weight: 700; }
  .pfi-stats { margin-bottom: 22px; }
  .pfi-stats div { display: flex; justify-content: space-between;
    align-items: baseline; padding: 14px 4px;
    border-bottom: 1px solid var(--pf-ring); }
  .pfi-stats div:last-child { border-bottom: none; }
  .pfi-stats span { font-size: 15px; font-weight: 500;
    color: var(--pf-sub); }
  .pfi-stats b { font-size: 17px; font-weight: 700;
    font-variant-numeric: tabular-nums; }
  .pfi-explore { display: block; width: 100%; border: none;
    background: var(--pf-purple); color: #fff; font-family: inherit;
    font-size: 15.5px; font-weight: 700; padding: 17px;
    border-radius: 999px; cursor: pointer; margin-bottom: 10px; }
  .pfi-ask { display: flex; align-items: center; justify-content: center;
    gap: 9px; width: 100%; border: 1px solid var(--pf-ring);
    background: var(--pf-card); color: var(--pf-purple);
    font-family: inherit; font-size: 15px; font-weight: 700;
    padding: 16px; border-radius: 999px; cursor: pointer; }
  .pfi-ask svg { width: 19px; height: 19px; }
`;
