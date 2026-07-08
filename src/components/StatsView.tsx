"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney, formatSignedMoney, round2 } from "@/lib/format";
import {
  bucketRows,
  buildRecommendations,
  sportRows,
  totals,
  typeRows,
} from "@/lib/stats";
import { SPORTS, SPORT_EMOJI, type BetWithLegs, type Sport } from "@/lib/types";

type Period = "today" | "week" | "month" | "year" | "all" | "custom";

const PERIOD_LABELS: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

function periodStart(period: Period): Date | null {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "today") return startToday;
  if (period === "week") {
    const daysSinceMonday = (startToday.getDay() + 6) % 7;
    const monday = new Date(startToday);
    monday.setDate(startToday.getDate() - daysSinceMonday);
    return monday;
  }
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  return null;
}

function profitColor(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-neutral-500";
}

function pctLabel(wins: number, total: number): string {
  if (total === 0) return "-";
  return `${Math.round((wins / total) * 100)}%`;
}

export default function StatsView({ bets }: { bets: BetWithLegs[] }) {
  const [sport, setSport] = useState<Sport | null>(null);
  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showRecs, setShowRecs] = useState(false);

  const allSettled = bets.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );

  // Period filter, based on the date the bet settled.
  let from: Date | null = null;
  let to: Date | null = null;
  if (period === "custom") {
    from = customFrom ? new Date(customFrom + "T00:00:00") : null;
    to = customTo ? new Date(customTo + "T23:59:59.999") : null;
  } else {
    from = periodStart(period);
  }

  const inPeriod = allSettled.filter((b) => {
    const settled = new Date(b.settled_at as string);
    if (from && settled < from) return false;
    if (to && settled > to) return false;
    return true;
  });

  // Sport filter: keep bets that contain at least one pick of the sport.
  const filtered =
    sport === null
      ? inPeriod
      : inPeriod.filter((b) => b.legs.some((leg) => leg.sport === sport));

  const t = totals(filtered);
  const bySport = sportRows(filtered).filter(
    (row) => sport === null || row.sport === sport
  );
  const byType = typeRows(filtered);
  const byBucket = bucketRows(filtered, sport);
  const recommendations = buildRecommendations(allSettled);

  const chipClass = (active: boolean) =>
    `rounded-xl border px-3 py-2 text-sm font-semibold ${
      active
        ? "border-emerald-600 bg-emerald-600 text-white"
        : "border-neutral-300 dark:border-neutral-700"
    }`;

  const inputClass =
    "mt-1 block h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base text-neutral-900 outline-none focus:border-emerald-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
          <Link
            href="/"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
          >
            Home
          </Link>
        </header>

        <section>
          <p className="text-sm font-medium">Sport</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSport(null)}
              className={chipClass(sport === null)}
            >
              All
            </button>
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={chipClass(sport === s)}
              >
                {SPORT_EMOJI[s]} {s}
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm font-medium">Period</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PERIOD_LABELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                className={chipClass(period === key)}
              >
                {label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="from" className="block text-xs text-neutral-500">
                  From
                </label>
                <input
                  id="from"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="to" className="block text-xs text-neutral-500">
                  To
                </label>
                <input
                  id="to"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </section>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No settled bets in this selection.
          </p>
        ) : (
          <>
            <section className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-neutral-200 p-3 text-center dark:border-neutral-800">
                <p className="text-xs text-neutral-500">Staked</p>
                <p className="mt-0.5 text-sm font-bold">
                  {formatMoney(round2(t.staked))}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-3 text-center dark:border-neutral-800">
                <p className="text-xs text-neutral-500">Returned</p>
                <p className="mt-0.5 text-sm font-bold">
                  {formatMoney(round2(t.returned))}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-3 text-center dark:border-neutral-800">
                <p className="text-xs text-neutral-500">ROI</p>
                <p
                  className={`mt-0.5 text-sm font-bold ${profitColor(
                    t.roi ?? 0
                  )}`}
                >
                  {t.roi === null ? "-" : `${t.roi.toFixed(1)}%`}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-base font-bold">Per sport</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Record counts every settled pick. Money follows the split
                rules: winnings split by odds, losses charged to the pick
                that lost the ticket.
              </p>
              <div className="mt-3 space-y-2">
                {bySport.map((row) => (
                  <div
                    key={row.sport}
                    className="flex items-center justify-between gap-2"
                  >
                    <p className="text-sm font-medium">
                      {SPORT_EMOJI[row.sport]} {row.sport}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-neutral-500">
                        {row.wins}-{row.losses}
                      </p>
                      <p
                        className={`w-20 text-right text-sm font-bold ${profitColor(
                          row.profit
                        )}`}
                      >
                        {formatSignedMoney(round2(row.profit))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-base font-bold">Singles vs parlays</h2>
              <div className="mt-3 space-y-2">
                {byType.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <p className="text-sm font-medium">{row.label}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-neutral-500">
                        {row.betsTotal === 0
                          ? "no bets"
                          : `${pctLabel(row.betsWon, row.betsTotal)} (${row.betsWon} of ${row.betsTotal})`}
                      </p>
                      <p
                        className={`w-20 text-right text-sm font-bold ${profitColor(
                          row.profit
                        )}`}
                      >
                        {row.betsTotal === 0
                          ? "-"
                          : formatSignedMoney(round2(row.profit))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-base font-bold">Odds groups</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Your settled picks grouped by how risky they were. Picks
                without odds are not shown here.
              </p>
              <div className="mt-3 space-y-2">
                {byBucket.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="text-sm text-neutral-500">
                      {row.total === 0
                        ? "no picks"
                        : `${pctLabel(row.wins, row.total)} right (${row.wins} of ${row.total})`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <section>
          <button
            type="button"
            onClick={() => setShowRecs((v) => !v)}
            className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white active:bg-emerald-700"
          >
            {showRecs ? "Hide recommendations" : "Show recommendations"}
          </button>

          {showRecs && (
            <div className="mt-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                Based on all your settled bets. Filters above do not apply
                here.
              </p>
              {recommendations.length === 0 ? (
                <p className="mt-2 text-sm">
                  More data needed. Once a group has at least 5 settled
                  bets or picks, recommendations appear here.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {recommendations.map((text, i) => (
                    <li key={i} className="text-sm leading-relaxed">
                      {text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
