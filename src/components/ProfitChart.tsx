"use client";

import { formatSignedMoney, round2 } from "@/lib/format";
import { betProfitFor } from "@/lib/stats";
import type { BetWithLegs, Sport } from "@/lib/types";

interface Props {
  // Already filtered by period and sport by the stats page.
  bets: BetWithLegs[];
  sport: Sport | null;
  // Start and end of the chosen period. Null means open ended.
  from: Date | null;
  to: Date | null;
}

// The drawing grid. The chart stretches to the panel's width, so these
// are just internal coordinates, not pixels on screen.
const W = 300;
const H = 150;

// Brighter than the page colors on purpose. These have to glow
// against the dark panel.
const GREEN = "#34D399";
const RED = "#FB7185";

function shortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ProfitChart({ bets, sport, from, to }: Props) {
  const settled = bets
    .filter((b) => b.settled_at !== null)
    .sort(
      (a, b) =>
        new Date(a.settled_at as string).getTime() -
        new Date(b.settled_at as string).getTime()
    );

  if (settled.length === 0) return null;

  // The line always starts at zero, so every period stands on its own.
  const firstSettled = new Date(settled[0].settled_at as string);
  const startX = from ?? new Date(firstSettled.getTime() - 60 * 60 * 1000);
  const now = new Date();
  const lastSettled = new Date(
    settled[settled.length - 1].settled_at as string
  );
  let endX = to !== null && to < now ? to : now;
  if (endX < lastSettled) endX = lastSettled;

  const spanMs = Math.max(endX.getTime() - startX.getTime(), 60 * 60 * 1000);

  // Running profit, one step per settled bet.
  let running = 0;
  const points: { t: number; value: number }[] = [{ t: 0, value: 0 }];
  for (const bet of settled) {
    running += betProfitFor(bet, sport);
    const t =
      (new Date(bet.settled_at as string).getTime() - startX.getTime()) /
      spanMs;
    points.push({ t: Math.min(Math.max(t, 0), 1), value: running });
  }
  // Hold the last value flat up to the end of the period.
  if (points[points.length - 1].t < 1) {
    points.push({ t: 1, value: running });
  }

  const values = points.map((p) => p.value);
  const rawMax = Math.max(...values, 0);
  const rawMin = Math.min(...values, 0);
  const pad = Math.max((rawMax - rawMin) * 0.18, 1);
  const max = rawMax + pad;
  const min = rawMin - pad;

  const x = (t: number) => t * W;
  const y = (value: number) => H - ((value - min) / (max - min)) * H;

  const zeroY = y(0);
  const zeroFraction = zeroY / H;

  const line = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${x(p.t).toFixed(2)},${y(p.value).toFixed(2)}`
    )
    .join(" ");

  // The shaded band sits between the line and the zero line, so gains
  // shade upward and losses shade downward.
  const area =
    `M${x(points[0].t).toFixed(2)},${zeroY.toFixed(2)} ` +
    points
      .map((p) => `L${x(p.t).toFixed(2)},${y(p.value).toFixed(2)}`)
      .join(" ") +
    ` L${x(points[points.length - 1].t).toFixed(2)},${zeroY.toFixed(2)} Z`;

  const last = points[points.length - 1];
  const endColor = running >= 0 ? GREEN : RED;

  return (
    <section className="overflow-hidden rounded-3xl bg-[#101322] p-4 shadow-[0_18px_40px_-20px_rgba(16,19,34,0.9)] ring-1 ring-white/5">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Profit over time
        </p>
        <p
          className="text-sm font-bold tabular-nums"
          style={{ color: endColor }}
        >
          {formatSignedMoney(round2(running))}
        </p>
      </div>

      <div className="relative mt-3 h-44">
        <div className="absolute inset-y-0 left-0 w-14 text-[10px] font-medium tabular-nums text-white/35">
          {rawMax > 0 && (
            <span className="absolute left-0 top-0">
              {formatSignedMoney(round2(rawMax))}
            </span>
          )}
          <span
            className="absolute left-0 -translate-y-1/2"
            style={{ top: `${zeroFraction * 100}%` }}
          >
            $0
          </span>
          {rawMin < 0 && (
            <span className="absolute bottom-0 left-0">
              {formatSignedMoney(round2(rawMin))}
            </span>
          )}
        </div>

        <div className="absolute inset-y-0 left-14 right-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Your running profit over the chosen period"
          >
            <defs>
              <linearGradient
                id="celebet-line"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={H}
              >
                <stop offset="0" stopColor={GREEN} />
                <stop offset={zeroFraction} stopColor={GREEN} />
                <stop offset={zeroFraction} stopColor={RED} />
                <stop offset="1" stopColor={RED} />
              </linearGradient>

              <linearGradient
                id="celebet-area"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={H}
              >
                <stop offset="0" stopColor={GREEN} stopOpacity="0.5" />
                <stop
                  offset={zeroFraction}
                  stopColor={GREEN}
                  stopOpacity="0.02"
                />
                <stop offset={zeroFraction} stopColor={RED} stopOpacity="0.02" />
                <stop offset="1" stopColor={RED} stopOpacity="0.45" />
              </linearGradient>

              {/* Two blurs: a wide bloom and a tight one, which is what
                  makes the line read as lit rather than drawn. */}
              <filter
                id="celebet-bloom"
                x="-25%"
                y="-50%"
                width="150%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter
                id="celebet-glow"
                x="-25%"
                y="-50%"
                width="150%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            {/* Faint rules so the panel reads as a chart, not a poster. */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1="0"
                y1={H * f}
                x2={W}
                y2={H * f}
                stroke="#ffffff"
                strokeOpacity="0.05"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={area} fill="url(#celebet-area)" />

            <line
              x1="0"
              y1={zeroY}
              x2={W}
              y2={zeroY}
              stroke="#ffffff"
              strokeOpacity="0.22"
              strokeWidth="1"
              strokeDasharray="2 5"
              vectorEffect="non-scaling-stroke"
            />

            <path
              d={line}
              fill="none"
              stroke="url(#celebet-line)"
              strokeWidth="8"
              strokeOpacity="0.45"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              filter="url(#celebet-bloom)"
            />
            <path
              d={line}
              fill="none"
              stroke="url(#celebet-line)"
              strokeWidth="4"
              strokeOpacity="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              filter="url(#celebet-glow)"
            />
            <path
              d={line}
              fill="none"
              stroke="url(#celebet-line)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* The dot that marks where you stand today. */}
          <span
            className="pointer-events-none absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4"
            style={{
              left: `${last.t * 100}%`,
              top: `${(y(last.value) / H) * 100}%`,
              backgroundColor: endColor,
              boxShadow: `0 0 14px 2px ${endColor}`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--tw-ring-color" as any]: `${endColor}40`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-between pl-14 text-[10px] font-medium text-white/35">
        <span>{shortDate(startX)}</span>
        <span>{shortDate(endX)}</span>
      </div>
    </section>
  );
}
