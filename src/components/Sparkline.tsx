// A tiny line drawn behind a number, the shape a figure makes over
// time. It carries no axis and no scale on purpose: it is there to say
// rising or falling at a glance, not to be read.
export default function Sparkline({
  points,
  positive,
  tone = "auto",
  className = "h-7",
  dots = false,
  fill = "gradient",
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
  // Dots on every vertex, the mockup's balance chart look.
  dots?: boolean;
  // gradient fades away under the line, none is a bare line. The
  // mockup uses gradient on the balance chart and bare lines in the
  // snapshot. There is no flat fill: flat blocks read as panels.
  fill?: "gradient" | "none";
}) {
  if (points.length < 2) return null;

  const W = 100;
  const H = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const xy = (value: number, i: number) => ({
    x: (i / (points.length - 1)) * W,
    y: H - ((value - min) / span) * H,
  });

  const path = points
    .map((value, i) => {
      const { x, y } = xy(value, i);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // The same two colors the big chart uses.
  const stroke =
    tone === "neutral" ? "#94A3B8" : positive ? "#34D399" : "#FB7185";

  // Stable enough: two sparklines only collide when they would define
  // the identical gradient anyway.
  const gid = `sg-${tone}-${points.length}-${Math.round(min * 7 + max * 13)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      aria-hidden="true"
    >
      {fill === "gradient" && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
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
      {dots &&
        points.map((value, i) => {
          const { x, y } = xy(value, i);
          return <circle key={i} cx={x} cy={y} r={1.8} fill={stroke} />;
        })}
    </svg>
  );
}
