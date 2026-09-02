// The hero chart and the row sparklines for the new Home, round 3.
// Every line here is TRACED point by point from the owner's mockup
// "0. Chat Aug 28.png": these are his designer's actual curves, not
// generated ones. Colours are sampled from the same sheet. Hand drawn
// SVG, no chart library.
//
// Colours come from the shared dial, `../performance-ui`, since 30
// August 2026. The values did not change in the move. The losing
// spark's red is SPARK_RED, a shade off the money RED: that is what
// this sheet's thin line samples at, and the two must not be merged.

import { INDIGO, SPARK_RED, ZERO_LINE } from "@/components/performance/ui";

// The hero line, 224 traced points, in a 313.6x139.0 box.
export const HERO_H = 128.9;

function path(pts: number[][]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
}

// A list of values becomes points inside the box: evenly spaced across
// the width, scaled so the lowest value sits on the floor and the
// highest on the ceiling. Zero is forced into the range so a line that
// never turns a profit still reads as being under the break even line.
function toPoints(
  values: number[],
  width: number,
  height: number,
  floor?: number,
  ceiling?: number
): number[][] {
  // NO VALUES MEANS NO LINE. Until 2 September 2026 this returned a
  // line along the FLOOR of the box, and the break even line sits in
  // the middle, so an account that had never settled a bet drew as
  // flat and deep in the red. HeroChart draws nothing at all now.
  if (values.length === 0) return [];
  const lo = floor ?? Math.min(0, ...values);
  const hi = ceiling ?? Math.max(0, ...values);
  const span = hi - lo || 1;
  // ONE VALUE IS A POINT, NOT A LINE, and it belongs at its own height.
  // It used to be drawn flat across the MIDDLE of the box whatever it
  // was, so a first bet of +$100 sat on the $25 gridline, contradicting
  // the "+$100" printed directly above it.
  const y = (v: number) =>
    Number((height - ((v - lo) / span) * height).toFixed(2));
  if (values.length === 1) return [[width, y(values[0])]];
  const step = width / (values.length - 1);
  return values.map((v, i) => [Number((i * step).toFixed(2)), y(v)]);
}

export function HeroChart({
  values,
  top,
  bottom,
  width = 313.6,
  height = HERO_H,
}: {
  values: number[];
  /** The axis ceiling, so the line and its labels share one scale. */
  top: number;
  /** The axis floor. */
  bottom: number;
  width?: number;
  height?: number;
}) {
  const h = height;
  const pts = toPoints(values, width, h, bottom, top);
  const last = pts[pts.length - 1];
  // A line needs two points. With one settled bet there is a dot and
  // nothing else, which is the truth: one result is not a trend.
  const hasLine = pts.length > 1;
  // Zero is always inside the range, so the dotted line is the break
  // even line rather than decoration: above it you are up, below it
  // you are down.
  const zeroY = h - ((0 - bottom) / (top - bottom || 1)) * h;
  if (pts.length === 0) return null;
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${h}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="ph-hero-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={INDIGO} stopOpacity="0.24" />
          <stop offset="1" stopColor={INDIGO} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1={zeroY}
        x2={width}
        y2={zeroY}
        stroke={ZERO_LINE}
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      {hasLine && (
        <>
          <path
            d={`${path(pts)} L${width} ${h} L0 ${h} Z`}
            fill="url(#ph-hero-fill)"
            stroke="none"
          />
          <path
            d={path(pts)}
            fill="none"
            stroke={INDIGO}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </>
      )}
      {last && <circle cx={last[0]} cy={last[1]} r="4.3" fill={INDIGO} />}
    </svg>
  );
}

// The five sparklines, one per ranked row, drawn from that fact's own
// running profit. Red when the fact is losing money, indigo when it is
// making it.
export function Spark({
  values,
  positive = true,
  width = 73.6,
  height = 22.4,
}: {
  values: number[];
  positive?: boolean;
  width?: number;
  height?: number;
}) {
  const pts = toPoints(values, width, height);
  const color = positive ? INDIGO : SPARK_RED;
  const id = `ph-spark-${positive ? "up" : "down"}`;
  return (
    // FLUID SINCE 31 AUGUST 2026, phase 3. It was width={width}, a
    // fixed 73.6px, which is fine at 390 and is 74px the row does not
    // have at 320. The viewBox keeps the drawing identical; only the
    // box it is painted into follows the row now.
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.16" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path(pts)} L${width} ${height} L0 ${height} Z`}
        fill={`url(#${id})`}
        stroke="none"
      />
      <path
        d={path(pts)}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
