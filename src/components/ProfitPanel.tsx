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
  // Optional block drawn on the panel above the chart. The home screen
  // puts its headline number here so the number and the line it draws
  // share one surface instead of sitting in two separate cards.
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
    "mt-1 block h-10 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus:border-white/40 [color-scheme:dark]";

  return (
    <section className="overflow-hidden rounded-3xl bg-[#080D20] p-4 dark:bg-[#0E1228] shadow-[0_18px_40px_-20px_rgba(16,19,34,0.9)] ring-1 ring-white/5">
      <div className="flex items-center justify-between gap-3">
        <MicroLabel onDark>Profit</MicroLabel>

        <div className="flex items-center gap-0.5 rounded-full bg-white/8 p-0.5">
          {RANGES.map(({ key, short }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors ${
                period === key
                  ? "bg-white text-[#080D20]"
                  : "text-white/50 active:text-white/80"
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
                ? "bg-white text-[#080D20]"
                : "text-white/50 active:text-white/80"
            }`}
          >
            <CalendarIcon />
          </button>
        </div>
      </div>

      {custom && (
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-3">
          <div>
            <label
              htmlFor="from"
              className="block"
            >
              <MicroLabel onDark>From</MicroLabel>
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
              <MicroLabel onDark>To</MicroLabel>
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
        <p className="flex h-52 items-center justify-center text-sm text-white/40">
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
