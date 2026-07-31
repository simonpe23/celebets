"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildInsightPool, buildSportInsightPool } from "@/lib/stats";
import { SPORT_EMOJI, type BetWithLegs, type Sport } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
  sport: Sport | null;
}

export default function AllRecommendations({ bets, sport }: Props) {
  // Computed after mount so week and month boundaries use the
  // phone's timezone.
  const [insights, setInsights] = useState<string[] | null>(null);

  useEffect(() => {
    const settled = bets.filter(
      (b) => b.status !== "pending" && b.settled_at !== null
    );
    const pool =
      sport === null
        ? buildInsightPool(settled)
        : buildSportInsightPool(settled, sport);
    setInsights(pool.map((insight) => insight.text));
  }, [bets, sport]);

  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {sport === null
              ? "All recommendations"
              : `${SPORT_EMOJI[sport]} ${sport}`}
          </h1>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/stats"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
            >
              Stats
            </Link>
            <Link
              href="/app"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
            >
              Home
            </Link>
          </div>
        </header>

        <p className="text-sm text-neutral-500">
          {sport === null
            ? "Every statement that is currently true about your settled bets."
            : `Every statement that is currently true about your ${sport} picks.`}
        </p>

        {insights === null ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Loading...
          </p>
        ) : insights.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Nothing to say yet. Settle a few bets and come back.
          </p>
        ) : (
          <div className="space-y-2">
            {insights.map((text, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-neutral-950 p-4 dark:border-neutral-800"
              >
                <p className="text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
