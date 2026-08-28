// The big profit chart and the row sparklines, drawn to match the
// owner's Home mockup. Series are deterministic: a seeded generator
// shaped through anchor points, so every render draws the same line
// the mockup drew. No chart library, hand drawn SVG like the rest of
// the app.

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

// The mockup's line: starts just under zero, sinks to about -$1.2K in
// June, climbs across zero in mid July and ends at the top right on
// about +$2.85K with a solid dot.
const BIG = series(
  7,
  [-250, -700, -1200, -900, -400, 200, 650, 400, 1100, 1500, 1250, 1900, 2300, 1950, 2500, 2850],
  150,
  170
);

export function BigChart({
  width = 366,
  height = 87,
}: {
  width?: number;
  height?: number;
}) {
  // $3K at the top, -$1.5K at the bottom, the mockup's own scale.
  const MIN = -1500;
  const MAX = 3000;
  const pts = toPoints(BIG, width, height, MIN, MAX);
  const zeroY = height - ((0 - MIN) / (MAX - MIN)) * height;
  const last = BIG[BIG.length - 1];
  const lastY = height - ((last - MIN) / (MAX - MIN)) * height;
  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="ph-big-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12A012" stopOpacity="0.20" />
          <stop offset="1" stopColor="#12A012" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* the zero line */}
      <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="#B9B5B2" strokeWidth="1" />
      {/* the wash under the line, down to the chart floor */}
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill="url(#ph-big-fill)"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#12A012"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={lastY} r="4.5" fill="#12A012" />
    </svg>
  );
}

// One sparkline per ranked row: purple for the lead row, green for
// earners, red and falling for the leak. Gradient fades under each,
// solid dot on the end, as the mockup draws them.
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
  width = 122,
  height = 40,
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
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`url(#${id})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={lastY} r="3.4" fill={color} />
    </svg>
  );
}
