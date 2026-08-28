// The hero chart and the row sparklines for the new Home, measured
// from the sheets of 28 August 2026. The hero line is the app's
// purple (owner's ruling: "keep apps purple") over the soft wash, with
// a dotted zero line and the scale $3K to -$1.5K on the right. Row
// sparklines carry no end dots in these sheets. Series are
// deterministic: the same line every render. Hand drawn SVG, no chart
// library.

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

// The hero sheet's line: opens near -$1.1K, stumbles once, then climbs
// all month and ends top right on about +$2.9K with a solid dot.
const HERO = series(
  23,
  [-1050, -1250, -900, -500, -150, 150, -50, 450, 800, 700, 1150, 1500, 1350, 1750, 2100, 1950, 2450, 2800, 2900],
  150,
  120
);

export const HERO_MIN = -1500;
export const HERO_MAX = 3000;

export function HeroChart({
  width = 295,
  height = 126,
}: {
  width?: number;
  height?: number;
}) {
  const pts = toPoints(HERO, width, height, HERO_MIN, HERO_MAX);
  const zeroY = height - ((0 - HERO_MIN) / (HERO_MAX - HERO_MIN)) * height;
  const last = HERO[HERO.length - 1];
  const lastY = height - ((last - HERO_MIN) / (HERO_MAX - HERO_MIN)) * height;
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="ph-hero-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--brand-mark)" }} stopOpacity="0.20" />
          <stop offset="1" style={{ stopColor: "var(--brand-mark)" }} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1={zeroY}
        x2={width + 12}
        y2={zeroY}
        stroke="#B9B3C6"
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill="url(#ph-hero-fill)"
      />
      <polyline
        points={pts}
        fill="none"
        style={{ stroke: "var(--brand-mark)" }}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={lastY} r="4" style={{ fill: "var(--brand-mark)" }} />
    </svg>
  );
}

// Sparklines: purple and rising on the earners, red and falling on the
// leak. A soft fade under each, no end dot, as the top list sheet
// draws them.
const SPARKS: Record<string, number[]> = {
  up1: series(11, [14, 30, 18, 8, 26, 34, 30, 44, 40, 56, 52, 66], 70, 6),
  up2: series(22, [10, 18, 26, 22, 36, 32, 46, 42, 54, 66], 64, 5),
  up3: series(33, [12, 22, 17, 30, 40, 35, 48, 44, 58, 66], 64, 5),
  up4: series(44, [12, 16, 28, 24, 34, 44, 40, 54, 50, 64], 64, 5),
  down: series(55, [64, 56, 60, 44, 38, 42, 28, 32, 20, 12], 64, 4),
};

export function Spark({
  shape,
  color,
  width = 71,
  height = 22,
}: {
  shape: keyof typeof SPARKS;
  color: string;
  width?: number;
  height?: number;
}) {
  const data = SPARKS[shape];
  const pts = toPoints(data, width, height - 3, 0, 75);
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
          <stop offset="0" style={{ stopColor: color }} stopOpacity="0.20" />
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
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
