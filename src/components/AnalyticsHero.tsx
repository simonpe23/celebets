"use client";

import ProfitChart from "@/components/ProfitChart";
import { formatSignedMoney, round2 } from "@/lib/format";
import type { BetWithLegs, Sport } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
  sport: Sport | null;
  from: Date | null;
  to: Date | null;
  // What the period button says, shown as the card's small label.
  periodLabel: string;
  profit: number;
  roi: number | null;
  wins: number;
  losses: number;
  // "bets" with no sport chosen, "picks" once a sport is chosen.
  unit: string;
  tone?: "money" | "brand";
}

function moneyColor(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-neutral-500";
}

export default function AnalyticsHero({
  bets,
  sport,
  from,
  to,
  periodLabel,
  profit,
  roi,
  wins,
  losses,
  unit,
  tone = "money",
}: Props) {
  const settledCount = wins + losses;
  const winRate =
    settledCount > 0 ? Math.round((wins / settledCount) * 100) : null;

  return (
    <section className="rounded-3xl border border-neutral-300/70 bg-gradient-to-b from-white to-[#EDF0F4] p-5 shadow-[0_10px_30px_-16px_rgba(23,23,23,0.45)] dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
        {periodLabel}
        {sport === null ? "" : ` / ${sport}`}
      </p>

      <p
        className={`mt-2 text-center text-5xl font-bold tracking-tight ${moneyColor(
          profit
        )}`}
      >
        {formatSignedMoney(round2(profit))}
      </p>

      {roi !== null && (
        <p
          className={`mt-1 text-center text-sm font-semibold ${moneyColor(roi)}`}
        >
          {roi > 0 ? "+" : ""}
          {roi.toFixed(1)}% ROI
        </p>
      )}

      <div className="mt-5 grid grid-cols-3 divide-x divide-neutral-300/70 dark:divide-neutral-800">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Won
          </p>
          <p className="mt-1 text-xl font-bold">{wins}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Lost
          </p>
          <p className="mt-1 text-xl font-bold">{losses}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Hit rate
          </p>
          <p className="mt-1 text-xl font-bold">
            {winRate === null ? "-" : `${winRate}%`}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
        Profit over time
      </p>
      <p className="sr-only">
        Running profit across {settledCount} settled {unit}.
      </p>

      <div className="mt-2">
        <ProfitChart
          bets={bets}
          sport={sport}
          from={from}
          to={to}
          tone={tone}
        />
      </div>
    </section>
  );
}
