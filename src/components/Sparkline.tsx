// A tiny line drawn behind a number, the shape a figure makes over
// time. It carries no axis and no scale on purpose: it is there to say
// rising or falling at a glance, not to be read.
export default function Sparkline({
  points,
  positive,
  tone = "auto",
  className = "h-7",
  dots = false,
}: {
  points: number[];
  positive?: boolean;
  // auto colors by direction with the big chart's green and red.
  // purple is for lines that are not money, like a win rate, and for
  // the balance line, which the owner's mockups draw in brand purple.
  tone?: "auto" | "purple";
  className?: string;
  // Dots on every vertex, the mockup's balance chart look. Only for
  // charts whose container keeps roughly the viewBox's shape, because
  // the svg stretches and circles stretch with it.
  dots?: boolean;
}) {
  if (points.length < 2) return null;

  const W = 100;
  const H = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const path = points
    .map((value, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((value - min) / span) * H;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // The same two colors the big chart uses, plus the wordmark purple.
  const stroke =
    tone === "purple" ? "#A78BFA" : positive ? "#34D399" : "#FB7185";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      aria-hidden="true"
    >
      <path
        d={`${path} L${W},${H} L0,${H} Z`}
        fill={stroke}
        opacity={0.12}
        stroke="none"
      />
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
        points.map((value, i) => (
          <circle
            key={i}
            cx={(i / (points.length - 1)) * W}
            cy={H - ((value - min) / span) * H}
            r={1.8}
            fill={stroke}
          />
        ))}
    </svg>
  );
}
