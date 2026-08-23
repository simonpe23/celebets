"use client";

// VIEW 7: WHAT CHANGED, built to 07_what_changed.png. Local
// preview, gitignored.
//
// "Since yesterday" is the owner's ruling, with a designed quiet
// day: most days nothing moves, and a movement feed that invents
// motion to fill itself is a liar.
//
// A card carries the rank delta (or NEW), the fact, its money, the
// day's change beside it, and the sentence that explains the badge.
// Ranks are recomputed as of yesterday and compared with today, the
// same machinery the Portfolio v2 concept used for its badges.

import { useMemo } from "react";
import TabBar from "@/components/TabBar";
import { dedupeFacts, hitOf, money, type Chip, type Engine } from "./engine";
import { PF_CSS, PfTopBar } from "./theme";
import { pageCls, type Dir } from "./motion";

const DAY = 86400000;

export default function Changed({
  dir,
  engine,
  onOpen,
  onBack,
}: {
  dir: Dir;
  engine: Engine;
  onOpen: (chip: Chip) => void;
  onBack: () => void;
}) {
  const rows = useMemo(() => {
    // The window is generous in the preview (a demo record does not
    // settle bets every single day); the real build uses one day.
    const since = engine.now + 1 - 3 * DAY;
    const today = dedupeFacts(engine.rankedFacts([], 5));
    const before = dedupeFacts(engine.rankedFacts([], 5, since));
    const wasRank = new Map(
      before.map((f, i) => [`${f.chip.group}|${f.chip.value}`, i])
    );
    const wasProfit = new Map(
      before.map((f) => [
        `${f.chip.group}|${f.chip.value}`,
        f.s.profit,
      ])
    );
    return today
      .map((f, i) => {
        const key = `${f.chip.group}|${f.chip.value}`;
        const was = wasRank.get(key);
        const delta = f.s.profit - (wasProfit.get(key) ?? 0);
        return {
          fact: f,
          rank: i + 1,
          moved: was === undefined ? null : was - i,
          isNew: was === undefined,
          delta,
        };
      })
      .filter((r) => r.isNew || Math.abs(r.delta) >= 1 || (r.moved ?? 0) !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 6);
  }, [engine]);

  return (
    <main className={pageCls(dir)}>
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className="pf-max">
        <PfTopBar onBack={onBack} />

        <h1 className="pf-h1">What changed</h1>
        <p className="pf-sub">Since yesterday</p>

        {rows.length === 0 ? (
          <div className="pfw-quiet">
            <p className="pfw-quiet-title">Nothing moved yesterday</p>
            <p className="pfw-quiet-body">
              No bets settled, so your ranking is exactly where you left
              it. Come back after your next result.
            </p>
          </div>
        ) : (
          rows.map((r, i) => {
            // A fact that held its rank is not a fall: it gets the
            // neutral badge, never a red arrow pointing at zero.
            const moved = r.moved ?? 0;
            const tone = r.isNew || moved > 0 ? "up" : moved < 0 ? "down" : "flat";
            return (
              <button
                key={r.fact.chip.value}
                type="button"
                className="pfw-card pf-stagger"
                // A movement feed reads better when the movements
                // arrive one at a time, in the order they matter.
                style={{ animationDelay: `${Math.min(i, 5) * 0.055}s` }}
                onClick={() => onOpen(r.fact.chip)}
              >
                <span className={`pfw-badge ${tone}`}>
                  {r.isNew ? (
                    "NEW"
                  ) : moved === 0 ? (
                    `#${r.rank}`
                  ) : (
                    <>
                      <span aria-hidden="true">
                        {moved > 0 ? "↑" : "↓"}
                      </span>{" "}
                      {Math.abs(moved)}
                    </>
                  )}
                </span>
                <span className="pfw-body">
                  <b>{r.fact.chip.value}</b>
                  <span className="pfw-money">
                    <em
                      className={`font-money ${
                        r.fact.s.profit >= 0 ? "pos" : "neg"
                      }`}
                    >
                      {money(r.fact.s.profit)}
                    </em>
                    {!r.isNew && Math.abs(r.delta) >= 1 && (
                      <i
                        className={`font-money ${
                          r.delta >= 0 ? "pos" : "neg"
                        }`}
                      >
                        {money(r.delta)}
                      </i>
                    )}
                  </span>
                  <span className="pfw-say">
                    {r.isNew
                      ? "New to your top facts"
                      : moved > 0
                        ? `Moved up to #${r.rank}`
                        : moved < 0
                          ? `Moved down to #${r.rank}`
                          : `Holding at #${r.rank} · ${hitOf(r.fact.s)} hit`}
                  </span>
                </span>
              </button>
            );
          })
        )}

        {rows.length > 0 && (
          <button type="button" className="pf-door pfw-door">
            <span>View all changes</span>
            <span className="pf-chev" aria-hidden="true">
              ›
            </span>
          </button>
        )}

        <div className="pfw-ask">
          <span className="pfw-askic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a8 8 0 11-3.2-6.4" />
              <path d="M12 8.5v4M12 16h.01" />
            </svg>
          </span>
          <span className="pfw-asktext">
            <b>Ask Actuals</b>
            <i>Why did this change?</i>
          </span>
          <span className="pf-chev">›</span>
        </div>
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}

const CSS = `
  .pfw-card { display: flex; align-items: flex-start; gap: 14px;
    width: 100%; background: var(--pf-card);
    border: 1px solid var(--pf-ring); border-radius: var(--pf-r-inner);
    padding: 16px; margin-bottom: 10px; color: inherit;
    font-family: inherit; text-align: left; cursor: pointer; }
  .pfw-badge { min-width: 44px; height: 34px; border-radius: 999px;
    display: flex; align-items: center; justify-content: center;
    gap: 3px; flex: none; font-size: 12.5px; font-weight: 800;
    padding: 0 10px; }
  .pfw-badge.up { background: var(--pf-greenbg); color: var(--pf-green); }
  .pfw-badge.down { background: var(--pf-redbg); color: var(--pf-red); }
  .pfw-badge.flat { background: var(--pf-inner); color: var(--pf-sub); }
  .pfw-body { min-width: 0; flex: 1; }
  .pfw-body b { display: block; font-size: 15px; font-weight: 700;
    margin-bottom: 4px; }
  .pfw-money { display: flex; align-items: baseline; gap: 10px;
    margin-bottom: 6px; }
  .pfw-money em { font-style: normal; font-size: 15px;
    font-weight: 700; font-variant-numeric: tabular-nums; }
  .pfw-money i { font-style: normal; font-size: 13px;
    font-weight: 600; font-variant-numeric: tabular-nums; }
  .pfw-say { font-size: 13px; font-weight: 500; color: var(--pf-sub); }
  .pfw-door { margin-top: var(--pf-gap-block); }
  .pfw-quiet { background: var(--pf-inner);
    border-radius: var(--pf-r-inner); padding: 22px;
    margin-bottom: 10px; }
  .pfw-quiet-title { font-size: 16px; font-weight: 700; margin: 0 0 6px; }
  .pfw-quiet-body { font-size: 13.5px; font-weight: 500;
    color: var(--pf-sub); margin: 0; line-height: 1.45; }
  .pfw-ask { display: flex; align-items: center; gap: 14px;
    background: var(--pf-lav); border-radius: var(--pf-r-inner);
    padding: 16px; margin-top: 10px; }
  .pfw-askic { width: 38px; height: 38px;
    border-radius: var(--pf-r-small); background: var(--pf-purple);
    color: #fff; flex: none; display: flex; align-items: center;
    justify-content: center; }
  .pfw-askic svg { width: 20px; height: 20px; }
  .pfw-asktext { flex: 1; min-width: 0; }
  .pfw-asktext b { display: block; font-size: 14.5px; font-weight: 700;
    color: var(--pf-purple); margin-bottom: 2px; }
  .pfw-asktext i { font-style: normal; font-size: 13px;
    font-weight: 500; color: var(--pf-sub); }
`;
