"use client";

import HeroMoney from "@/components/HeroMoney";
import { round2 } from "@/lib/format";

interface Props {
  label: string;
  profit: number;
  roi: number | null;
  // Set while a finger is held on the chart. The headline then shows
  // that moment instead of the whole period.
  scrub?: { value: number; date: Date } | null;
}

export default function HeadlineProfit({
  label,
  profit,
  roi,
  scrub,
}: Props) {
  const shown = scrub ? scrub.value : profit;
  const shownLabel = scrub
    ? scrub.date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : label;
  const up = round2(shown) >= 0;

  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
        {shownLabel}
      </p>

      <p className="mt-2 text-neutral-900 dark:text-white">
        <HeroMoney value={shown} />
      </p>

      {/* The pill keeps its space while you scrub, so nothing on the
          page jumps as the number changes. */}
      {roi !== null && (
        <p className={`mt-3 ${scrub ? "invisible" : ""}`}>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
              up
                ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-600/10 text-red-700 dark:text-red-400"
            }`}
          >
            {roi > 0 ? "+" : ""}
            {roi.toFixed(1)}% ROI
          </span>
        </p>
      )}
    </div>
  );
}
