// A small line chart drawn behind or beside a number: the shape a
// figure made over time. No axis and no scale on purpose. It is there
// to say rising or falling at a glance, not to be read.
//
// TWO BUGS LIVED HERE UNTIL AUGUST 2026, and the owner found them on
// his own account where the balance card was a wall of pink blobs.
//
// 1. The svg stretches to its box with preserveAspectRatio="none". In
//    the balance card that is 1.4x across and 3.7x down. The line
//    survived it because of vectorEffect="non-scaling-stroke", but the
//    dots did not: a circle of radius 1.8 came out 5px wide and 13px
//    tall. Every "dot" was a vertical smear.
//    Fixed by never putting a circle inside the stretched svg. The one
//    end dot is an HTML element placed by percentage, so it is round at
//    any size.
//
// 2. One point per settled bet, joined by straight lines. Past about
//    thirty bets that is a hairball, not a shape. Fixed by sampling
//    down to a readable number of points and smoothing through them.

// Money charts must not overshoot: a curve that dips below a low point
// invents a loss the user never had. Quadratic segments through the
// midpoints stay inside the data, unlike a Catmull-Rom spline.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const at = (i: number) => `${pts[i].x.toFixed(2)},${pts[i].y.toFixed(2)}`;
  if (pts.length === 2) return `M${at(0)} L${at(1)}`;

  let d = `M${at(0)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q${at(i)} ${mx.toFixed(2)},${my.toFixed(2)}`;
  }
  d += ` L${at(pts.length - 1)}`;
  return d;
}

// Keeps the first and last value, the two that carry meaning, and
// spreads the rest evenly between them.
function sample(values: number[], max: number): number[] {
  if (values.length <= max) return values;
  const out: number[] = [];
  for (let i = 0; i < max; i++) {
    out.push(values[Math.round((i * (values.length - 1)) / (max - 1))]);
  }
  return out;
}

export default function Sparkline({
  points,
  positive,
  tone = "auto",
  className = "h-7",
  endDot = false,
  fill = "gradient",
  baseline = false,
}: {
  points: number[];
  positive?: boolean;
  // auto colors by direction with the big chart's green and red.
  // neutral is for a line that is not money, like a win rate: it has
  // no up-is-good meaning to carry, so it carries no color either.
  //
  // There is no purple tone any more. A purple data line said nothing,
  // and it was two of the twelve purples the owner called overwhelming.
  tone?: "auto" | "neutral";
  className?: string;
  // One dot on the latest value, the only point worth marking. Drawn
  // outside the svg so it cannot be stretched into an ellipse.
  endDot?: boolean;
  // gradient fades away under the line, none is a bare line. There is
  // no flat fill: flat blocks read as panels.
  fill?: "gradient" | "none";
  // A dashed line at the level the series started, so above-the-line
  // reads as gained and below as lost (v9.3's balance band). Drawn as
  // an HTML border, not an svg path: the svg is stretched, and a dash
  // pattern stretched sideways becomes long smears.
  baseline?: boolean;
}) {
  if (points.length < 2) return null;

  const W = 100;
  const H = 28;
  // Enough to keep the shape, few enough to stay legible. Above this
  // the line stops being a trend and becomes noise.
  const values = sample(points, 48);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  // Headroom, so the peak is not clipped by its own stroke.
  const pad = 2;

  const pts = values.map((value, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - pad - ((value - min) / span) * (H - pad * 2),
  }));

  const path = smoothPath(pts);

  const stroke =
    tone === "neutral" ? "#94A3B8" : positive ? "#34D399" : "#FB7185";

  // Stable enough: two sparklines only collide when they would define
  // the identical gradient anyway.
  const gid = `sg-${tone}-${values.length}-${Math.round(min * 7 + max * 13)}`;
  const last = pts[pts.length - 1];

  const first = pts[0];

  return (
    <span className={`relative block w-full ${className}`}>
      {baseline && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-neutral-900/[0.12] dark:border-white/[0.14]"
          style={{ top: `${(first.y / H) * 100}%` }}
        />
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        {fill === "gradient" && (
          <>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${path} L${W},${H} L0,${H} Z`}
              fill={`url(#${gid})`}
              stroke="none"
            />
          </>
        )}
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {endDot && (
        <span
          className="pointer-events-none absolute h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#0E1228]"
          style={{
            backgroundColor: stroke,
            left: `${(last.x / W) * 100}%`,
            top: `${(last.y / H) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </span>
  );
}
