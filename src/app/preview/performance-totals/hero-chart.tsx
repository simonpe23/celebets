"use client";

// The small hero line on Totals. The sheet puts it beside the number
// rather than under it, so this is a compact version of the same
// treatment the other pages use: indigo line, soft fade beneath, a
// dashed zero line, an end dot, and the money ladder on the right.

import { useEffect, useRef, useState } from "react";
import { GREY_TEXT, INDIGO, ZERO_LINE } from "../performance-lab/ui";

export type Point = { t: number; v: number };

function tick(v: number): string {
  const a = Math.abs(v);
  const t = a >= 1000 ? `${+(a / 1000).toFixed(1)}K` : `${Math.round(a)}`;
  return `${v < 0 ? "-" : ""}$${t}`;
}

export function HeroLine({ points, width = 205, height = 92 }: { points: Point[]; width?: number; height?: number }) {
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
  const step = 1500;
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

  return (
    <div className="relative" style={{ width: width + 34 }}>
      <svg
        width={width}
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
        className="pointer-events-none absolute right-0 top-0 h-full w-[32px] text-[7.5px] font-semibold"
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
