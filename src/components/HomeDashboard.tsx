"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroMoney from "@/components/HeroMoney";
import MicroLabel from "@/components/MicroLabel";
import ProfitPanel, { type Period } from "@/components/ProfitPanel";
import InPlayHero from "@/components/InPlayHero";
import FormStrip from "@/components/FormStrip";
import SportBars from "@/components/SportBars";
import InsightLine from "@/components/InsightLine";
import NewBetForm from "@/components/NewBetForm";
import LiveBets from "@/components/LiveBets";
import BetHistory from "@/components/BetHistory";
import { formatMoney } from "@/lib/format";
import { buildInsightPool, pickInsights, sportRows, totals } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { CARD } from "@/lib/ui";

interface Props {
  bets: BetWithLegs[];
  liveBets: BetWithLegs[];
  balance: number;
  startedWith: number;
  hasBalance: boolean;
  lastStake: string;
}

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

// The home page answers three questions, in the order a bettor actually
// asks them: what is still running, what do I want to log, and how have
// I been going. The long view lives on Performance.
export default function HomeDashboard({
  bets,
  liveBets,
  balance,
  startedWith,
  hasBalance,
  lastStake,
}: Props) {
  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [scrub, setScrub] = useState<{ value: number; date: Date } | null>(
    null
  );

  const settled = bets.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );

  let from: Date | null = null;
  let to: Date | null = null;
  if (period === "custom") {
    from = customFrom ? new Date(customFrom + "T00:00:00") : null;
    to = customTo ? new Date(customTo + "T23:59:59.999") : null;
  } else {
    from = periodStart(period);
  }

  const inPeriod = settled.filter((b) => {
    const at = new Date(b.settled_at as string);
    if (from && at < from) return false;
    if (to && at > to) return false;
    return true;
  });

  const t = totals(inPeriod);
  const periodProfit = t.returned - t.staked;
  const decided = inPeriod.filter(
    (b) => b.status === "won" || b.status === "lost"
  ).length;

  const weekStart = periodStart("week");
  const weekBets = settled.filter(
    (b) => weekStart === null || new Date(b.settled_at as string) >= weekStart
  );
  const weekTotals = totals(weekBets);
  const weekProfit = weekTotals.returned - weekTotals.staked;

  const bars = sportRows(inPeriod).sort((a, b) => b.profit - a.profit);

  // Insights are drawn at random, so picking one during render makes
  // the server and the client disagree and React throws away the tree.
  // Picking after mount keeps the roll and fixes the mismatch.
  const [insight, setInsight] = useState<string | null>(null);
  useEffect(() => {
    const done = bets.filter(
      (b) => b.status !== "pending" && b.settled_at !== null
    );
    setInsight(pickInsights(buildInsightPool(done), 1)[0] ?? null);
  }, [bets]);

  const shown = scrub ? scrub.value : periodProfit;

  return (
    <div className="space-y-4">
      {/* 1. What is still running. The only thing here about the future. */}
      <InPlayHero liveBets={liveBets} weekProfit={weekProfit} />

      {/* 2. The daily action. Logging a bet is why the app gets opened
             at all, so it never moves below the fold. */}
      <NewBetForm lastStake={lastStake} compact />

      {/* 3. How it has been going lately, read as a shape not a figure. */}
      <FormStrip settled={settled} pending={liveBets.length} />

      <div id="live-now">
        <LiveBets bets={liveBets} />
      </div>

      {/* 4. The long record. Same panel as Performance, so the two pages
             are visibly the same product. */}
      <ProfitPanel
        bets={inPeriod}
        sport={null}
        from={from}
        to={to}
        period={period}
        onPeriodChange={setPeriod}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFrom={setCustomFrom}
        onCustomTo={setCustomTo}
        onScrub={setScrub}
        header={
          <div className="mt-3">
            <p className="text-white">
              <HeroMoney value={shown} className="text-[42px]" />
            </p>
            <p className="mt-1 text-xs text-white/50">
              {scrub
                ? scrub.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : t.roi === null
                  ? `${decided} settled`
                  : `${t.roi >= 0 ? "+" : ""}${t.roi.toFixed(1)}% ROI on ${formatMoney(t.staked)} staked`}
            </p>
          </div>
        }
      />

      <SportBars rows={bars} />

      <InsightLine text={insight} />

      {/* The balance reports, it does not shout. You set it once. */}
      <Link
        href="/transactions"
        className={`${CARD} flex items-center justify-between gap-3 p-4`}
      >
        <span>
          <MicroLabel>
            {hasBalance ? "Tracking Balance" : "No tracking balance"}
          </MicroLabel>
          <span className="mt-0.5 block font-money text-xl font-semibold tabular-nums">
            {hasBalance ? formatMoney(balance) : "Set one"}
          </span>
        </span>
        {hasBalance && (
          <span className="text-right">
            <MicroLabel>Started with</MicroLabel>
            <span className="mt-0.5 block font-money text-sm font-semibold tabular-nums text-neutral-500 dark:text-neutral-400">
              {formatMoney(startedWith)}
            </span>
          </span>
        )}
      </Link>

      <BetHistory bets={settled} limit={3} />
    </div>
  );
}
