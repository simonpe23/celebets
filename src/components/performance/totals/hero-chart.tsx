"use client";

// The small hero line on Totals. The sheet puts it beside the number
// rather than under it, so this is a compact version of the same
// treatment the other pages use: indigo line, soft fade beneath, a
// dashed zero line, an end dot, and the money ladder on the right.

import { useEffect, useRef, useState } from "react";
import {
  CHART_H_TOTALS,
  GREY_TEXT,
  INDIGO,
  W_SEMI,
  ZERO_LINE,
} from "@/components/performance/ui";

export type Point = { t: number; v: number };

function tick(v: number): string {
  const a = Math.abs(v);
  const t = a >= 1000 ? `${+(a / 1000).toFixed(1)}K` : `${Math.round(a)}`;
  return `${v < 0 ? "-" : ""}$${t}`;
}

// The rungs a money axis is allowed to use. Lab's own list, so Totals
// and Lab cannot draw the same record on two different ladders.
function niceStep(reach: number): number {
  const steps = [10, 25, 50, 100, 250, 500, 1000, 1500, 2000, 3000, 5000];
  for (const s of steps) if (reach <= s) return s;
  return Math.ceil(reach / 5000) * 5000;
}

export function HeroLine({
  points,
  width = 205,
  height = CHART_H_TOTALS,
}: {
  points: Point[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [len, setLen] = useState(0);
  const key = points.length > 0 ? `${points.length}:${points[points.length - 1].v}` : "empty";

  useEffect(() => {
    setDrawn(false);
    setLen(ref.current?.getTotalLength() ?? 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [key]);

  if (points.length < 2) return null;


  const t0 = points[0].t;
  const span = Math.max(1, points[points.length - 1].t - t0);
  const vs = points.map((p) => p.v);
  // THE LADDER FOLLOWS THE RECORD. It was a fixed $1,500 step, so every
  // chart was drawn inside a $3,000 window whatever it held: a $200
  // record was a flat scratch along the middle beside an axis reading
  // $1.5K / $0 / -$1.5K, claiming a range the user will not reach for
  // months. Fixed 2 September 2026.
  //
  // The steps are the ones Lab already uses, so the two charts cannot
  // pick different ladders for the same record. Above $1,500 nothing
  // changes, which is where his own record sits.
  // HALF THE REACH, so the axis keeps about the same number of rungs it
  // always had. Taking the whole reach as the step gave a three rung
  // ladder and quietly coarsened his own chart from
  // $3K/$1.5K/$0/-$1.5K to $3K/$0/-$3K, which is a change he did not
  // ask for. At his scale this returns 1500, the old constant, so his
  // chart is untouched.
  const reach = Math.max(Math.abs(Math.max(...vs, 0)), Math.abs(Math.min(...vs, 0)));
  const step = niceStep(reach / 2);
  const hi = Math.max(Math.ceil(Math.max(...vs) / step) * step, step);
  const lo = Math.min(Math.floor(Math.min(...vs, 0) / step) * step, -step);
  const x = (t: number) => ((t - t0) / span) * width;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  const ticks: number[] = [];
  for (let v = hi; v >= lo - 1; v -= step) ticks.push(v);

  // FLUID SINCE 31 AUGUST 2026, phase 3. The wrapper was a fixed
  // `width + 34`, so on a 320px phone the chart plus its axis column
  // reached 20px past the screen and dragged the page sideways. The
  // viewBox keeps the drawing identical; the box it is painted into
  // now follows whatever room the row has.
  return (
    <div
      className="relative w-full"
      style={{ maxWidth: width + 34, minWidth: 0 }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="tot-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={INDIGO} stopOpacity="0.22" />
            <stop offset="1" stopColor={INDIGO} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={`M0 ${y(0).toFixed(1)} H${width}`} stroke={ZERO_LINE} strokeWidth="1" strokeDasharray="2 4" />
        <path
          d={`${line} L${width} ${height} L0 ${height} Z`}
          fill="url(#tot-fill)"
          opacity={drawn ? 1 : 0}
          style={{ transition: "opacity 600ms ease 250ms" }}
        />
        <path
          ref={ref}
          d={line}
          stroke={INDIGO}
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={len || undefined}
          strokeDashoffset={drawn ? 0 : len}
          opacity={len === 0 && !drawn ? 0 : 1}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
        <circle
          cx={x(last.t)}
          cy={y(last.v)}
          r="4"
          fill={INDIGO}
          opacity={drawn ? 1 : 0}
          style={{ transition: "opacity 300ms ease 600ms" }}
        />
      </svg>
      <div
        className={`pointer-events-none absolute right-0 top-0 h-full w-[30px] text-xs ${W_SEMI}`}
        style={{ color: GREY_TEXT }}
      >
        {ticks.map((v) => (
          <span
            key={v}
            className="absolute left-0"
            style={{ top: `${((hi - v) / (hi - lo)) * height - 4}px` }}
          >
            {tick(v)}
          </span>
        ))}
      </div>
    </div>
  );
}
