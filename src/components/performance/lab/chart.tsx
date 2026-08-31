"use client";

// Lab's answer chart: the cumulative profit line for the current
// selection, drawn in the accepted Home hero chart's exact language
// (see ../performance-home/charts.tsx): indigo #3614F0 line at 1.8,
// a vertical fade fill from 0.24 to 0.01, a dotted reference line at
// zero, a 4.3 radius end dot, overflow visible. Home traces a mockup;
// Lab computes, so the geometry is scaled from the live points.

import { useEffect, useRef, useState } from "react";

import {
  CHART_H_LAB,
  GREY_TEXT,
  INDIGO,
  T_TINY,
  W_SEMI,
  ZERO_LINE,
} from "@/components/performance/ui";

export type ChartPoint = { t: number; v: number };

function niceCeil(v: number): number {
  if (v <= 0) return 0;
  const steps = [100, 250, 500, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000];
  for (const s of steps) if (v <= s) return s;
  return Math.ceil(v / 5000) * 5000;
}

function moneyTick(v: number): string {
  const a = Math.abs(v);
  const txt = a >= 1000 ? `${+(a / 1000).toFixed(1)}K` : `${a}`;
  return `${v < 0 ? "-" : ""}$${txt}`;
}

function dateTick(t: number): string {
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LabChart({ points }: { points: ChartPoint[] }) {
  const W = 313.6;
  const H = CHART_H_LAB;
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [len, setLen] = useState(0);
  const key = points.length > 0 ? `${points.length}:${points[points.length - 1].v}` : "empty";

  // The line draws itself when the question changes: motion level B,
  // information that the answer is being recomputed. The real path
  // length is measured before the reveal, so the dash never cuts the
  // line short. Off under reduced motion.
  useEffect(() => {
    setDrawn(false);
    setLen(pathRef.current?.getTotalLength() ?? 0);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [key]);

  if (points.length < 2) return null;

  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  const span = Math.max(1, t1 - t0);
  const values = points.map((p) => p.v);
  const hi = niceCeil(Math.max(...values, 1) * 1.05);
  const lo = Math.min(0, ...values);
  const loTick = lo < 0 ? -niceCeil(-lo) : 0;
  const top = hi;
  const bottom = loTick === 0 ? -hi * 0.12 : loTick * 1.15;
  const y = (v: number) => H - ((v - bottom) / (top - bottom)) * H;
  const x = (t: number) => ((t - t0) / span) * W;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const last = points[points.length - 1];

  const ticks: number[] = [hi, hi / 2, 0];
  // A shallow dip keeps its dashed line but not a label: a tick
  // crowding $0 reads worse than no tick.
  if (loTick < 0 && -loTick >= hi / 4) ticks.push(loTick);

  const labelT = [0, 0.25, 0.5, 0.75, 1].map((f) => t0 + f * span);

  return (
    <div className="relative">
      <div className="pl-[22px] pr-[54px]">
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          style={{ overflow: "visible" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="lab-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={INDIGO} stopOpacity="0.24" />
              <stop offset="1" stopColor={INDIGO} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path
            d={`M0 ${y(0).toFixed(1)} H${W}`}
            stroke={ZERO_LINE}
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <path d={area} fill="url(#lab-fill)" opacity={drawn ? 1 : 0} style={{ transition: "opacity 700ms ease 250ms" }} />
          <path
            ref={pathRef}
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
            r="4.3"
            fill={INDIGO}
            opacity={drawn ? 1 : 0}
            style={{ transition: "opacity 300ms ease 600ms" }}
          />
        </svg>
      </div>
      <div
        className={`absolute right-0 top-0 h-full w-[38px] ${T_TINY} ${W_SEMI}`}
        style={{ color: GREY_TEXT }}
      >
        {ticks.map((v) => (
          <span
            key={v}
            className="absolute left-0"
            style={{ top: `${((top - v) / (top - bottom)) * H - 4}px` }}
          >
            {moneyTick(v)}
          </span>
        ))}
      </div>
      <div
        className={`mt-[12px] flex justify-between pl-[24px] pr-[52px] text-[7px] ${W_SEMI}`}
        style={{ color: GREY_TEXT }}
      >
        {labelT.map((t, i) => (
          <span key={i}>{dateTick(t)}</span>
        ))}
      </div>
    </div>
  );
}
