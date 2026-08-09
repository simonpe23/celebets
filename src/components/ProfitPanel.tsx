"use client";

import MicroLabel from "@/components/MicroLabel";
import ProfitChart from "@/components/ProfitChart";
import type { BetWithLegs, Sport } from "@/lib/types";

export type Period = "today" | "week" | "month" | "year" | "all" | "custom";

// Short labels, the way every finance chart writes them. The control
// lives on the panel because it changes the panel and nothing else.
export const RANGES: { key: Period; short: string }[] = [
  { key: "all", short: "ALL" },
  { key: "today", short: "1D" },
  { key: "week", short: "1W" },
  { key: "month", short: "1M" },
  { key: "year", short: "1Y" },
];

// THE PANEL'S SURFACE.
//
// The chart used to sit on a dark panel even in light mode, because I
// had decided a glow needs darkness. The owner: "i don't love that in
// light mode, chart background is black. it does not go."
//
// He chose this from three shown side by side (white card, soft tint,
// no panel). The other two are gone rather than left in as options: an
// unused variant with no job is how the purple sprawl started.
//
// LIGHT: no container at all. The chart draws straight on the page,
// the line uses the app's ordinary money colors, and the glow is
// switched off, because a glow on white turns the line muddy.
// DARK: unchanged. The navy panel and the glow belong there.
//
// The variables exist because the chart's colors are SVG attributes,
// and an attribute cannot carry a Tailwind dark: variant. They are
// written out in full, never built with string maths: Tailwind v4
// scans source text, so a class that only exists after a replaceAll at
// runtime is a class it never generates.
const SURFACE =
  "[--chart-up:#059669] [--chart-down:#DC2626] [--chart-rule:#0F12281F] [--chart-muted:#94A3B8] [--chart-glow:0] " +
  "dark:[--chart-up:#34D399] dark:[--chart-down:#FB7185] dark:[--chart-rule:#FFFFFF38] dark:[--chart-muted:#FFFFFF59] dark:[--chart-glow:1] " +
  "rounded-3xl py-1 dark:bg-[#0E1228] dark:p-4 dark:shadow-[0_18px_40px_-20px_rgba(16,19,34,0.9)] dark:ring-1 dark:ring-white/5";

interface Props {
  bets: BetWithLegs[];
  sport: Sport | null;
  from: Date | null;
  to: Date | null;
  period: Period;
  onPeriodChange: (period: Period) => void;
  customFrom: string;
  customTo: string;
  onCustomFrom: (value: string) => void;
  onCustomTo: (value: string) => void;
  onScrub: (point: { value: number; date: Date } | null) => void;
  // Drawn on the panel between the period chips and the chart.
  // Performance puts its headline number and record row here, so the
  // number and the line that draws it share one surface instead of
  // floating as separate things with a gap between them.
  header?: React.ReactNode;
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export default function ProfitPanel({
  bets,
  sport,
  from,
  to,
  period,
  onPeriodChange,
  customFrom,
  customTo,
  onCustomFrom,
  onCustomTo,
  onScrub,
  header,
}: Props) {
  const custom = period === "custom";

  const dateClass =
    "mt-1 block h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-500 dark:border-white/15 dark:bg-white/5 dark:text-white dark:focus:border-white/40 dark:[color-scheme:dark]";

  return (
    // data-chart-panel is a test hook, not a style. scrubtest.mjs used
    // to find this panel by the word "PROFIT" on it, so deleting that
    // label silently pointed the test at a different card and it
    // reported the gesture dead when it was fine. A test that finds its
    // target by copy breaks every time the copy changes.
    <section
      data-chart-panel
      className={`overflow-hidden ${SURFACE}`}
    >
      {/* No "PROFIT" label any more. The signed money figure sits right
          below it now, which says the same thing louder, and three ways
          of naming one number was the clutter the owner pointed at. */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-0.5 rounded-full bg-neutral-900/[0.06] p-0.5 dark:bg-white/8">
          {RANGES.map(({ key, short }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors ${
                period === key
                  ? "bg-white text-[#0E0E14] shadow-sm dark:text-[#080D20]"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {short}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPeriodChange(custom ? "all" : "custom")}
            aria-label="Custom date range"
            className={`flex items-center rounded-full px-2 py-1.5 transition-colors ${
              custom
                ? "bg-white text-[#0E0E14] shadow-sm dark:text-[#080D20]"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            <CalendarIcon />
          </button>
        </div>
      </div>

      {custom && (
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-neutral-900/[0.04] p-3 dark:bg-white/5">
          <div>
            <label
              htmlFor="from"
              className="block"
            >
              <MicroLabel>From</MicroLabel>
            </label>
            <input
              id="from"
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFrom(e.target.value)}
              className={dateClass}
            />
          </div>
          <div>
            <label
              htmlFor="to"
              className="block"
            >
              <MicroLabel>To</MicroLabel>
            </label>
            <input
              id="to"
              type="date"
              value={customTo}
              onChange={(e) => onCustomTo(e.target.value)}
              className={dateClass}
            />
          </div>
        </div>
      )}

      {header}

      {bets.length === 0 ? (
        <p
          className="flex h-52 items-center justify-center text-sm"
          style={{ color: "var(--chart-muted)" }}
        >
          {custom && !customFrom && !customTo
            ? "Pick a start and an end date."
            : "No settled bets in this range."}
        </p>
      ) : (
        <ProfitChart
          bets={bets}
          sport={sport}
          from={from}
          to={to}
          onScrub={onScrub}
        />
      )}
    </section>
  );
}
