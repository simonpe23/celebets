"use client";

import { useEffect, useState } from "react";
import { formatSignedMoney } from "@/lib/format";

export interface SettledBetSummary {
  status: string;
  stake: number;
  payout: number | null;
  settled_at: string | null;
}

interface Period {
  label: string;
  value: number;
}

function profitOf(bet: SettledBetSummary): number {
  return bet.status === "won"
    ? Number(bet.payout ?? 0) - Number(bet.stake)
    : -Number(bet.stake);
}

export default function StatsRow({ bets }: { bets: SettledBetSummary[] }) {
  // Computed after mount so the day, week, month, and year boundaries
  // use the phone's local timezone, not the server's.
  const [periods, setPeriods] = useState<Period[] | null>(null);

  useEffect(() => {
    const now = new Date();
    const startToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const daysSinceMonday = (startToday.getDay() + 6) % 7;
    const startWeek = new Date(startToday);
    startWeek.setDate(startToday.getDate() - daysSinceMonday);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const sumFrom = (from: Date) =>
      bets
        .filter((b) => b.settled_at && new Date(b.settled_at) >= from)
        .reduce((sum, b) => sum + profitOf(b), 0);

    setPeriods([
      { label: "Today", value: sumFrom(startToday) },
      { label: "This week", value: sumFrom(startWeek) },
      { label: "This month", value: sumFrom(startMonth) },
      { label: "This year", value: sumFrom(startYear) },
    ]);
  }, [bets]);

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {(
        periods ??
        ["Today", "This week", "This month", "This year"].map((label) => ({
          label,
          value: null as number | null,
        }))
      ).map(({ label, value }) => {
        const color =
          value === null || value === 0
            ? "text-neutral-500"
            : value > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400";
        return (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 p-3 text-center dark:border-neutral-800"
          >
            <p className="text-xs text-neutral-500">{label}</p>
            <p className={`mt-0.5 text-sm font-bold ${color}`}>
              {value === null ? "-" : formatSignedMoney(value)}
            </p>
          </div>
        );
      })}
    </section>
  );
}
