"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMoney, formatSignedMoney, round2 } from "@/lib/format";
import BetHistory from "@/components/BetHistory";
import HeadlineProfit from "@/components/HeadlineProfit";
import StatTile from "@/components/StatTile";
import ProfitPanel, { type Period } from "@/components/ProfitPanel";
import Recommendations from "@/components/Recommendations";
import {
  bucketRows,
  categoryRows,
  sportRows,
  sportTypeRows,
  totals,
  typeRows,
} from "@/lib/stats";
import { SPORTS, SPORT_EMOJI, type BetWithLegs, type Sport } from "@/lib/types";

const PERIOD_LABELS: { key: Period; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
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
  return "text-neutral-500 dark:text-neutral-400";
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
  const [scrub, setScrub] = useState<{ value: number; date: Date } | null>(
    null
  );

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

  // The hero speaks in bets with no sport chosen, and in that sport's
  // picks and money share once one is.
  const periodLabel =
    PERIOD_LABELS.find((p) => p.key === period)?.label ?? "All time";
  const heroProfit =
    sportTotals === null ? t.returned - t.staked : sportTotals.profit;
  const heroRoi = sportTotals === null ? t.roi : null;
  const heroWins =
    sportTotals === null
      ? filtered.filter((b) => b.status === "won").length
      : sportTotals.wins;
  const heroLosses =
    sportTotals === null
      ? filtered.filter((b) => b.status === "lost").length
      : sportTotals.losses;

  // Sports that actually have settled picks in this selection.
  const breakdown = bySport
    .filter((row) => row.wins + row.losses > 0)
    .sort((a, b) => b.profit - a.profit);

  const pillClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
      active
        ? "border-[#4F7A57] bg-[#4F7A57] text-white"
        : "border-neutral-300 bg-white text-neutral-600 dark:border-white/15 dark:bg-[#1A2032] dark:text-neutral-300"
    }`;

  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <div className="flex shrink-0 items-center gap-2">
            <Recommendations bets={allSettled} />
            <Link
              href="/app"
              className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm font-bold text-neutral-600 dark:border-white/15 dark:text-neutral-300"
            >
              Home
            </Link>
          </div>
        </header>

        {/* The headline and the chart sit straight on the page. No card,
            so the top of the screen reads as one open area. */}
        <section>
          <HeadlineProfit
            label={`${periodLabel}${sport === null ? "" : ` / ${sport}`}`}
            profit={heroProfit}
            roi={heroRoi}
            scrub={scrub}
          />

          {/* The record, bare on the page. No cards, so it reads as one
              line of facts under the headline. */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-neutral-300/70 dark:divide-neutral-800">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {sport === null ? "Bets" : "Picks"}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">
                {heroWins + heroLosses}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Record
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">
                {heroWins}-{heroLosses}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Hit rate
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">
                {pctLabel(heroWins, heroWins + heroLosses)}
              </p>
            </div>
          </div>


          <div className="mt-5">
            <ProfitPanel
              bets={filtered}
              sport={sport}
              from={from}
              to={to}
              period={period}
              onPeriodChange={setPeriod}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFrom={setCustomFrom}
              onCustomTo={setCustomTo}
              onScrub={setScrub}
            />
          </div>

          {/* One filter row on the light page, as pressable pills. */}
          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            <button
              type="button"
              onClick={() => setSport(null)}
              className={pillClass(sport === null)}
            >
              All sports
            </button>
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={pillClass(sport === s)}
              >
                {SPORT_EMOJI[s]} {s}
              </button>
            ))}
          </div>
        </section>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-white/15">
            No settled bets in this selection.
          </p>
        ) : (
          <>
            {/* The tiles. With no sport chosen they speak in money and
                bets. With a sport chosen they speak in that sport's
                picks, because a parlay's stake covers several sports
                and cannot be split. */}
            <section className="grid grid-cols-3 gap-2">
              <StatTile label="Staked" value={formatMoney(round2(t.staked))} />
              <StatTile label="Returned" value={formatMoney(round2(t.returned))} />
              <StatTile
                label="ROI"
                value={heroRoi === null ? "-" : `${heroRoi.toFixed(1)}%`}
                tone={profitColor(heroRoi ?? 0)}
              />
            </section>

            <section className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] p-4 dark:border-white/10 dark:bg-[#151A28]">
              <h2 className="text-lg font-bold">Sports breakdown</h2>
              <div className="mt-3 divide-y divide-neutral-300/60 dark:divide-neutral-800">
                {breakdown.map((row) => (
                  <div
                    key={row.sport}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <p className="truncate text-sm font-semibold">
                      {SPORT_EMOJI[row.sport]} {row.sport}
                    </p>
                    <div className="flex shrink-0 items-center gap-4">
                      <p className="text-xs tabular-nums text-neutral-400">
                        {row.wins}-{row.losses}
                      </p>
                      <p
                        className={`w-24 text-right text-sm font-bold tabular-nums ${profitColor(
                          row.profit
                        )}`}
                      >
                        {formatSignedMoney(round2(row.profit))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
                Record counts every settled pick. Winnings split by odds,
                losses charged to the pick that lost the ticket.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-[#151A28] p-4 dark:border-white/10">
              <h2 className="text-lg font-bold">Singles vs parlays</h2>
              {bySportType !== null && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
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
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
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

            <section className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-[#151A28] p-4 dark:border-white/10">
              <h2 className="text-lg font-bold">Odds groups</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
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
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {row.total === 0
                        ? "no picks"
                        : `${pctLabel(row.wins, row.total)} right (${row.wins} of ${row.total})`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {sport !== null && byCategory.length > 0 && (
              <section className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-[#151A28] p-4 dark:border-white/10">
                <h2 className="text-lg font-bold">Per category</h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
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
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
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

            <BetHistory bets={historyBets} />
          </>
        )}
      </div>
    </main>
  );
}
