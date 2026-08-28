// The big profit chart and the row sparklines, matched to the owner's
// area mockups of 28 August 2026: a purple line with a purple wash, a
// dotted zero line, purple sparklines on the earners and a red one on
// the leak. Series are deterministic so every render draws the same
// line. No chart library, hand drawn SVG like the rest of the app.

// Deterministic PRNG so the jagged daily noise never changes between
// renders or builds.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A walk through anchor values with noise, the shape of a real
// profit history.
function series(seed: number, anchors: number[], points: number, noise: number) {
  const rnd = mulberry32(seed);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = (i / (points - 1)) * (anchors.length - 1);
    const lo = Math.min(Math.floor(t), anchors.length - 2);
    const f = t - lo;
    const base = anchors[lo] * (1 - f) + anchors[lo + 1] * f;
    out.push(base + (rnd() - 0.5) * 2 * noise);
  }
  out[out.length - 1] = anchors[anchors.length - 1];
  return out;
}

function toPoints(
  data: number[],
  w: number,
  h: number,
  min: number,
  max: number
) {
  const step = w / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / (max - min)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// The month sheet's line: starts under zero, finds its feet early and
// climbs all month with small stumbles, ending top right on about
// +$2.9K with a solid dot.
const BIG = series(
  19,
  [-450, -800, -350, 150, 600, 450, 1000, 1400, 1200, 1800, 1650, 2100, 2500, 2350, 2750, 2900],
  140,
  140
);

// $3K at the top, -$1.5K at the bottom, the sheet's own scale.
export const BIG_MIN = -1500;
export const BIG_MAX = 3000;
export const zeroFraction = (0 - BIG_MIN) / (BIG_MAX - BIG_MIN);

export function BigChart({
  width = 330,
  height = 112,
}: {
  width?: number;
  height?: number;
}) {
  const pts = toPoints(BIG, width, height, BIG_MIN, BIG_MAX);
  const zeroY = height - zeroFraction * height;
  const last = BIG[BIG.length - 1];
  const lastY = height - ((last - BIG_MIN) / (BIG_MAX - BIG_MIN)) * height;
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="ph-big-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--brand-mark)" }} stopOpacity="0.22" />
          <stop offset="1" style={{ stopColor: "var(--brand-mark)" }} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* the dotted zero line */}
      <line
        x1="0"
        y1={zeroY}
        x2={width}
        y2={zeroY}
        stroke="#B9B7C4"
        strokeWidth="1"
        strokeDasharray="2.5 4"
      />
      {/* the wash under the line, down to the chart floor */}
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill="url(#ph-big-fill)"
      />
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: "var(--brand-mark)" }}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={lastY} r="4.5" style={{ fill: "var(--brand-mark)" }} />
    </svg>
  );
}

// One sparkline per ranked row: purple on the earners, red and falling
// on the leak. Gradient fades under each, solid dot on the end.
const SPARKS: Record<string, number[]> = {
  up1: series(11, [5, 18, 14, 30, 26, 42, 40, 55, 70], 60, 7),
  up2: series(22, [8, 16, 24, 20, 34, 30, 44, 52, 66], 60, 6),
  up3: series(33, [6, 20, 15, 28, 38, 33, 46, 56, 68], 60, 6),
  up4: series(44, [10, 14, 26, 22, 32, 42, 38, 52, 64], 60, 6),
  down: series(55, [66, 58, 62, 46, 40, 44, 30, 24, 12], 60, 5),
};

export function Spark({
  shape,
  color,
  width = 96,
  height = 34,
}: {
  shape: keyof typeof SPARKS;
  color: string;
  width?: number;
  height?: number;
}) {
  const data = SPARKS[shape];
  const pts = toPoints(data, width, height - 6, 0, 75);
  const last = data[data.length - 1];
  const lastY = height - 6 - (last / 75) * (height - 6);
  // One gradient per shape; each shape appears once on the page, so
  // the id is stable across server and client renders.
  const id = `ph-spark-${shape}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: color }} stopOpacity="0.22" />
          <stop offset="1" style={{ stopColor: color }} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#${id})`}
      />
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: color }}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={lastY} r="3" style={{ fill: color }} />
    </svg>
  );
}
