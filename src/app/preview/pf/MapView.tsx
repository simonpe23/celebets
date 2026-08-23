"use client";

// VIEW 6: MAP VIEW, a replica of 06_map_view.png. Local preview,
// gitignored. Colors sampled off the sheet: solid greens graded
// from #04873F (most profit) to #1FAE5B (least), losses on #EA382B,
// and the Others bucket in #79808C.
//
// The laws, straight from the sheet's own caption: SIZE SHOWS
// IMPACT (the money a fact moves), colour shows which way it went.
// Facts too small to letter fold into one grey Others tile rather
// than shredding the map into slivers.
//
// Tapping a tile opens that fact's page, so the map is a second
// door into the same builder, never a separate product.

import { useMemo } from "react";
import TabBar from "@/components/TabBar";
import { dedupeFacts, money, type Chip, type Engine } from "./engine";
import { PF_CSS, PfTopBar } from "./theme";
import { pageCls, type Dir } from "./motion";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Squarified treemap in a 0..100 x 0..100 space.
function squarify<T extends { value: number }>(
  items: T[],
  rect: Rect
): (T & Rect)[] {
  const out: (T & Rect)[] = [];
  let rest = [...items].sort((a, b) => b.value - a.value);
  let { x, y, w, h } = rect;
  let total = rest.reduce((s, i) => s + i.value, 0);
  while (rest.length > 0 && total > 0) {
    const vertical = w < h;
    const side = vertical ? w : h;
    let row: T[] = [];
    let rowSum = 0;
    let bestWorst = Infinity;
    for (const item of rest) {
      const tryRow = [...row, item];
      const trySum = rowSum + item.value;
      const thickness = (trySum / total) * (vertical ? h : w);
      let worst = 0;
      for (const r of tryRow) {
        const len = (r.value / trySum) * side;
        worst = Math.max(worst, Math.max(len / thickness, thickness / len));
      }
      if (worst <= bestWorst) {
        row = tryRow;
        rowSum = trySum;
        bestWorst = worst;
      } else break;
    }
    const thickness = (rowSum / total) * (vertical ? h : w);
    let offset = 0;
    for (const r of row) {
      const len = (r.value / rowSum) * side;
      out.push(
        vertical
          ? { ...r, x: x + offset, y, w: len, h: thickness }
          : { ...r, x, y: y + offset, w: thickness, h: len }
      );
      offset += len;
    }
    if (vertical) {
      y += thickness;
      h -= thickness;
    } else {
      x += thickness;
      w -= thickness;
    }
    rest = rest.slice(row.length);
    total -= rowSum;
  }
  return out;
}

// The sheet's green ladder: the more a fact earns, the deeper it
// goes. Losses take one red; Others takes the grey.
function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const p = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${p.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export default function MapView({
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
  const { tiles, others } = useMemo(() => {
    // Rank by the money moved, not by score, so the map is honest
    // about size. A fixed count keeps the biggest LEAK on the map:
    // a percentage threshold once folded it into Others, and a
    // heatmap with no red in it is not a heatmap.
    // Twins are hidden HERE and only here among the pickers,
    // because size is the map's whole message: two tiles for one set
    // of bets (Baseball and MLB) would paint the same money twice
    // and make it look like double the impact.
    const facts = dedupeFacts(engine.rankedFacts([], 5)).sort(
      (a, b) => Math.abs(b.s.profit) - Math.abs(a.s.profit)
    );
    return {
      tiles: facts.slice(0, 9),
      others: facts.slice(9).reduce((s, f) => s + f.s.profit, 0),
    };
  }, [engine]);

  const maxProfit = Math.max(...tiles.map((f) => f.s.profit), 1);
  const items = [
    ...tiles.map((f) => ({
      key: f.chip.value,
      chip: f.chip as Chip | null,
      label: f.chip.value,
      profit: f.s.profit,
      value: Math.abs(f.s.profit),
    })),
    ...(Math.abs(others) > 0
      ? [
          {
            key: "Others",
            chip: null,
            label: "Others",
            profit: others,
            value: Math.abs(others),
          },
        ]
      : []),
  ];
  const placed = squarify(items, { x: 0, y: 0, w: 100, h: 100 });

  function fill(t: (typeof placed)[number]): string {
    if (t.chip === null) return "#79808C";
    if (t.profit < 0) return "#EA382B";
    // Deepest green for the biggest earner, lightening down.
    const share = Math.min(1, t.profit / maxProfit);
    return mix("#22B265", "#04873F", share);
  }

  return (
    <main className={pageCls(dir)}>
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className="pf-max">
        <PfTopBar
          onBack={onBack}
          title="Map view"
          right={
            <>
              <button
                type="button"
                className="pfm-tgl"
                onClick={onBack}
                aria-label="List view"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={1.9} strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <button type="button" className="pfm-tgl on"
                aria-label="Map view" aria-pressed="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={1.9} strokeLinejoin="round">
                  <rect x="3" y="3" width="8" height="8" rx="1.4" />
                  <rect x="13" y="3" width="8" height="5" rx="1.4" />
                  <rect x="13" y="10" width="8" height="11" rx="1.4" />
                  <rect x="3" y="13" width="8" height="8" rx="1.4" />
                </svg>
              </button>
            </>
          }
        />

        <div className="pfm-map">
          {placed.map((t) => {
            // Type sized from the tile's real pixels, so a narrow
            // column never prints a number wider than itself.
            const pxW = (t.w / 100) * 398;
            const pxH = (t.h / 100) * 498;
            const moneySize = Math.max(
              12,
              Math.min(27, pxW / 6.2, pxH / 3.4)
            );
            const nameSize = Math.max(10, Math.min(17, moneySize * 0.62));
            return (
              <button
                key={t.key}
                type="button"
                className="pfm-tile"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: `${t.w}%`,
                  height: `${t.h}%`,
                  background: fill(t),
                }}
                onClick={() => t.chip && onOpen(t.chip)}
              >
                <span className="pfm-name" style={{ fontSize: nameSize }}>
                  {t.label}
                </span>
                <span
                  className="pfm-money font-money"
                  style={{ fontSize: moneySize }}
                >
                  {money(t.profit)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pfm-legend">
          <span>More profit</span>
          <span className="pfm-swatches">
            {["#04873F", "#0C9147", "#159C50", "#1FAE5B", "#8FD9B0"].map(
              (c) => (
                <i key={c} style={{ background: c }} />
              )
            )}
            <i className="pfm-gap" />
            {["#F7B3AC", "#F28A80", "#EE6156", "#EA382B"].map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          <span>More loss</span>
        </div>
        <p className="pfm-caption">Size shows impact on your results</p>
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}

const CSS = `
  /* The toggle sits in the shared top bar's right slot, so it takes
     that bar's 40px button size rather than a private 34x30. */
  .pfm-tgl { width: 40px; height: 40px;
    border-radius: var(--pf-r-small);
    border: 1px solid var(--pf-ring); background: var(--pf-card);
    color: var(--pf-sub); display: flex; align-items: center;
    justify-content: center; cursor: pointer; padding: 0; }
  .pfm-tgl svg { width: 18px; height: 18px; }
  .pfm-tgl.on { background: var(--pf-inner); color: inherit; }
  .pf-topright { gap: 8px; }
  .pfm-map { position: relative; width: 100%; aspect-ratio: 1 / 1.25;
    border-radius: var(--pf-r-inner); overflow: hidden; }
  .pfm-tile { position: absolute; border: 2px solid var(--pf-card);
    font-family: inherit; cursor: pointer; overflow: hidden;
    display: flex; flex-direction: column; align-items: flex-start;
    justify-content: flex-end; gap: 2px; padding: 10px;
    border-radius: 8px; color: #fff; text-align: left; }
  .pfm-name { font-weight: 600; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%; }
  .pfm-money { font-weight: 700; line-height: 1.1;
    font-variant-numeric: tabular-nums; white-space: nowrap;
    max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  .pfm-legend { display: flex; align-items: center; gap: 10px;
    margin-top: var(--pf-gap-block); font-size: 12px;
    font-weight: 500; color: var(--pf-sub); }
  .pfm-swatches { flex: 1; display: flex; align-items: center;
    justify-content: center; gap: 3px; }
  .pfm-swatches i { width: 16px; height: 11px; border-radius: 2px;
    display: block; }
  .pfm-gap { background: none !important; width: 8px !important; }
  .pfm-caption { text-align: center; font-size: 12px;
    font-weight: 500; color: var(--pf-sub); margin: 12px 0 0; }
`;
