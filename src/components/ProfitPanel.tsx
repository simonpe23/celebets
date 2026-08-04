"use client";

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
}

export default function ProfitPanel({
  bets,
  sport,
  from,
  to,
  period,
  onPeriodChange,
}: Props) {
  return (
    <section className="overflow-hidden rounded-3xl bg-[#101322] p-4 shadow-[0_18px_40px_-20px_rgba(16,19,34,0.9)] ring-1 ring-white/5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Profit
        </p>

        <div className="flex items-center gap-0.5 rounded-full bg-white/8 p-0.5">
          {RANGES.map(({ key, short }) => (
            <button
              key={key}
              type="button"
              onClick={() => onPeriodChange(key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors ${
                period === key
                  ? "bg-white text-[#101322]"
                  : "text-white/50 active:text-white/80"
              }`}
            >
              {short}
            </button>
          ))}
        </div>
      </div>

      {bets.length === 0 ? (
        <p className="flex h-52 items-center justify-center text-sm text-white/40">
          No settled bets in this range.
        </p>
      ) : (
        <ProfitChart bets={bets} sport={sport} from={from} to={to} />
      )}

      <button
        type="button"
        onClick={() => onPeriodChange(period === "custom" ? "all" : "custom")}
        className={`mt-1 text-[11px] font-semibold ${
          period === "custom" ? "text-white" : "text-white/40"
        }`}
      >
        {period === "custom" ? "Clear custom range" : "Custom range"}
      </button>
    </section>
  );
}
