"use client";

// The two line chart on Compare, built to "1. Compare.png": two
// series over one axis, y ticks on the LEFT, a dashed zero line, and
// x labels underneath. Colour follows his standing chart rule, which
// the sheet also draws: a side in profit is the indigo line, a side
// losing is red. When both sides share a sign the second takes a
// lighter weight of the same colour, because two identical lines
// cannot be told apart; the legend dots say which is which.
//
// One pass of the engine's runningFor feeds all three metrics, so
// Profit, ROI and Hit rate are the same series read three ways.

import { useEffect, useRef, useState } from "react";
import {
  GREY_TEXT,
  GRID_LINE,
  INDIGO,
  LIGHT_INDIGO,
  LIGHT_RED,
  RED,
  ZERO_LINE,
} from "../performance-lab/ui";

export type Series = { t: number; v: number }[];

// Four intervals, on a round number. A coarser target once produced
// a $4k to -$2k ladder for a record that never left $2k, which wastes
// most of the card on empty air.
function niceStep(span: number): number {
  const raw = span / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-6))));
  for (const m of [1, 2, 2.5, 5, 10]) if (raw <= m * mag) return m * mag;
  return 10 * mag;
}

function dateTick(t: number): string {
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CompareChart({
  a,
  b,
  format,
  aDown,
  bDown,
}: {
  a: Series;
  b: Series;
  format: (v: number) => string;
  aDown: boolean;
  bDown: boolean;
}) {
  const W = 300;
  const H = 132;
  const [drawn, setDrawn] = useState(false);
  const aRef = useRef<SVGPathElement>(null);
  const bRef = useRef<SVGPathElement>(null);
  const [lens, setLens] = useState<[number, number]>([0, 0]);
  const key = `${a.length}:${a.at(-1)?.v ?? 0}:${b.length}:${b.at(-1)?.v ?? 0}`;

  useEffect(() => {
    setDrawn(false);
    setLens([
      aRef.current?.getTotalLength() ?? 0,
      bRef.current?.getTotalLength() ?? 0,
    ]);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [key]);

  const all = [...a, ...b];
  if (all.length < 2) return null;

  const t0 = Math.min(...all.map((p) => p.t));
  const t1 = Math.max(...all.map((p) => p.t));
  const span = Math.max(1, t1 - t0);
  const vs = all.map((p) => p.v);
  const rawHi = Math.max(...vs, 0);
  const rawLo = Math.min(...vs, 0);
  const step = niceStep(Math.max(rawHi - rawLo, 1));
  const hi = Math.ceil(rawHi / step) * step;
  const lo = Math.floor(rawLo / step) * step;
  const range = Math.max(hi - lo, step);

  const x = (t: number) => ((t - t0) / span) * W;
  const y = (v: number) => H - ((v - lo) / range) * H;

  const path = (s: Series) =>
    s
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`)
      .join(" ");

  // The soft fill under each line, the way the sheet draws it and the
  // way Home's hero chart does. It closes on the zero line, not the
  // floor, so a losing line fills downward.
  const area = (s: Series) =>
    `${path(s)} L${x(s[s.length - 1].t).toFixed(1)} ${y(0).toFixed(1)} L${x(s[0].t).toFixed(1)} ${y(0).toFixed(1)} Z`;

  // Both sides losing, or both winning, would draw two lines of one
  // colour. The second then takes the lighter weight.
  const aColor = aDown ? RED : INDIGO;
  const bColor = bDown
    ? aDown
      ? LIGHT_RED
      : RED
    : aDown
      ? INDIGO
      : LIGHT_INDIGO;

  const ticks: number[] = [];
  for (let v = lo; v <= hi + 1e-6; v += step) ticks.push(v);

  const labelT = [0, 0.25, 0.5, 0.75, 1].map((f) => t0 + f * span);

  return (
    <div>
      <div className="relative pl-[38px] pr-[6px]">
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          style={{ overflow: "visible" }}
          aria-hidden
        >
          {ticks.map((v) => (
            <path
              key={v}
              d={`M0 ${y(v).toFixed(1)} H${W}`}
              stroke={Math.abs(v) < 1e-6 ? ZERO_LINE : GRID_LINE}
              strokeWidth="1"
              strokeDasharray={Math.abs(v) < 1e-6 ? "3 4" : undefined}
            />
          ))}
          <defs>
            {[
              { id: "cmp-a", c: aColor },
              { id: "cmp-b", c: bColor },
            ].map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={g.c} stopOpacity="0.20" />
                <stop offset="1" stopColor={g.c} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>
          {[
            { s: b, id: "cmp-b" },
            { s: a, id: "cmp-a" },
          ].map((f) =>
            f.s.length > 1 ? (
              <path
                key={f.id}
                d={area(f.s)}
                fill={`url(#${f.id})`}
                opacity={drawn ? 1 : 0}
                style={{ transition: "opacity 600ms ease 250ms" }}
              />
            ) : null
          )}
          {[
            { s: b, c: bColor, r: bRef, len: lens[1] },
            { s: a, c: aColor, r: aRef, len: lens[0] },
          ].map((line, i) => (
            <path
              key={i}
              ref={line.r}
              d={path(line.s)}
              stroke={line.c}
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={line.len || undefined}
              strokeDashoffset={drawn ? 0 : line.len}
              opacity={line.len === 0 && !drawn ? 0 : 1}
              style={{ transition: "stroke-dashoffset 700ms ease" }}
            />
          ))}
        </svg>
        <div
          className="absolute left-0 top-0 h-full w-[36px] text-right text-[8px] font-semibold"
          style={{ color: GREY_TEXT }}
        >
          {ticks.map((v) => (
            <span
              key={v}
              className="absolute right-[4px]"
              style={{ top: `${((hi - v) / range) * H - 4}px` }}
            >
              {format(v)}
            </span>
          ))}
        </div>
      </div>
      <div
        className="mt-[9px] flex justify-between pl-[40px] pr-[6px] text-[7.4px] font-semibold"
        style={{ color: GREY_TEXT }}
      >
        {labelT.map((t, i) => (
          <span key={i}>{dateTick(t)}</span>
        ))}
      </div>
    </div>
  );
}
