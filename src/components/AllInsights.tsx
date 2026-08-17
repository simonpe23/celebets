"use client";

import { useEffect, useState } from "react";
import TabBar from "@/components/TabBar";
import { buildInsightPool, buildSportInsightPool } from "@/lib/stats";
import { SPORT_EMOJI, type BetWithLegs, type Sport } from "@/lib/types";
import { CARD, INNER } from "@/lib/ui";

// Every statement Actuals can currently make about the user's settled
// bets. This is the "Show all" behind the insights sheet.
//
// It used to be the Research tab, which was wrong: insights happen
// AFTER a bet and Actuals surfaces them on its own, while Research
// happens BEFORE a bet and the user goes looking. The owner drew that
// line himself. The tab bar lights Performance here, because that is
// the area this belongs to.

interface Props {
  bets: BetWithLegs[];
  sport: Sport | null;
}

export default function AllInsights({ bets, sport }: Props) {
  // Computed after mount so week and month boundaries use the phone's
  // timezone rather than the server's.
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

  const empty = (message: string) => (
    <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400">
      {message}
    </p>
  );

  return (
    <main className="flex min-h-svh flex-col px-4 pt-6 pb-2 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight">
            {sport === null
              ? "Your insights"
              : `${SPORT_EMOJI[sport]} ${sport}`}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {sport === null
              ? "Every statement that is currently true about your settled bets."
              : `Every statement that is currently true about your ${sport} picks.`}
          </p>
        </header>

        {insights === null ? (
          empty("Loading...")
        ) : insights.length === 0 ? (
          empty("Nothing to say yet. Settle a few bets and come back.")
        ) : (
          <section className={`${CARD} p-4`}>
            <div className="space-y-2">
              {insights.map((text, i) => (
                <p key={i} className={`${INNER} px-3 py-3 text-sm leading-relaxed`}>
                  {text}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}
