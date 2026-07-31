"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney, formatSignedMoney, round2 } from "@/lib/format";
import BetHistory from "@/components/BetHistory";
import StatsRow from "@/components/StatsRow";
import {
  bucketRows,
  categoryRows,
  sportRows,
  sportTypeRows,
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
  // With a sport selected, singles vs parlays counts only that
  // sport's picks and that sport's share of the money.
  const bySportType = sport === null ? null : sportTypeRows(filtered, sport);
  const sportTotals = sport === null ? null : bySport[0];
  const byBucket = bucketRows(filtered, sport);
  const byCategory = sport === null ? [] : categoryRows(filtered, sport);
  const historyBets = [...filtered].sort(
    (a, b) =>
      new Date(b.settled_at ?? 0).getTime() -
      new Date(a.settled_at ?? 0).getTime()
  );

  const chipClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
      active
        ? "border-[#72AFCC] bg-[#72AFCC] text-[#F5EDCE]"
        : "border-neutral-300 dark:border-neutral-700"
    }`;

  const inputClass =
    "mt-1 block h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base text-neutral-900 outline-none focus:border-[#72AFCC] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
          <Link
            href="/app"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
          >
            Home
          </Link>
        </header>

        <StatsRow bets={allSettled} />

        <section>
          <p className="text-sm font-medium">Sport</p>
          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
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
          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
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
          <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 dark:bg-neutral-950/60 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No settled bets in this selection.
          </p>
        ) : (
          <>
            {sportTotals === null ? (
              <section className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3 text-center dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">Staked</p>
                  <p className="mt-0.5 text-sm font-bold">
                    {formatMoney(round2(t.staked))}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3 text-center dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">Returned</p>
                  <p className="mt-0.5 text-sm font-bold">
                    {formatMoney(round2(t.returned))}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3 text-center dark:border-neutral-800">
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
            ) : (
              <section className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3 text-center dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">Picks</p>
                  <p className="mt-0.5 text-sm font-bold">
                    {sportTotals.wins + sportTotals.losses}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3 text-center dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">Record</p>
                  <p className="mt-0.5 text-sm font-bold">
                    {sportTotals.wins}-{sportTotals.losses}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3 text-center dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">Profit</p>
                  <p
                    className={`mt-0.5 text-sm font-bold ${profitColor(
                      sportTotals.profit
                    )}`}
                  >
                    {formatSignedMoney(round2(sportTotals.profit))}
                  </p>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-4 dark:border-neutral-800">
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

            <section className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-4 dark:border-neutral-800">
              <h2 className="text-base font-bold">Singles vs parlays</h2>
              {bySportType !== null && (
                <p className="mt-1 text-xs text-neutral-500">
                  Only {sport} picks, and only {sport}&apos;s share of the
                  money.
                </p>
              )}
              <div className="mt-3 space-y-2">
                {bySportType !== null
                  ? bySportType.map((row, i) => {
                      const label = i === 0 ? "Singles" : "Parlays";
                      const picks = row.wins + row.losses;
                      return (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-2"
                        >
                          <p className="text-sm font-medium">{label}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-neutral-500">
                              {picks === 0
                                ? "no picks"
                                : `${pctLabel(row.wins, picks)} right (${row.wins} of ${picks})`}
                            </p>
                            <p
                              className={`w-20 text-right text-sm font-bold ${profitColor(
                                row.profit
                              )}`}
                            >
                              {picks === 0
                                ? "-"
                                : formatSignedMoney(round2(row.profit))}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  : byType.map((row) => (
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

            <section className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-4 dark:border-neutral-800">
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

            {sport !== null && byCategory.length > 0 && (
              <section className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-4 dark:border-neutral-800">
                <h2 className="text-base font-bold">Per category</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Your {sport} picks grouped by what you bet on. Same money
                  rules as everywhere else.
                </p>
                <div className="mt-3 space-y-2">
                  {byCategory.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-2"
                    >
                      <p className="min-w-0 truncate text-sm font-medium">
                        {row.label}
                      </p>
                      <div className="flex shrink-0 items-center gap-3">
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
            )}

            <Link
              href={
                sport !== null
                  ? `/recommendations?sport=${encodeURIComponent(sport)}`
                  : "/recommendations"
              }
              className="block h-12 w-full rounded-xl bg-[#58287F] text-center text-base font-semibold leading-[3rem] text-white active:bg-[#431E63]"
            >
              {sport !== null
                ? `All ${sport} recommendations`
                : "All recommendations"}
            </Link>

            <BetHistory bets={historyBets} />
          </>
        )}
      </div>
    </main>
  );
}
