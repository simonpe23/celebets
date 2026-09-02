"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TabBar from "@/components/TabBar";
import { buildInsightPool, buildSportInsightPool } from "@/lib/stats";
import { SPORT_EMOJI, type BetWithLegs, type Sport } from "@/lib/types";
import {
  CARD,
  COLUMN,
  INNER,
  PAGE,
  PAGE_TITLE,
} from "@/lib/ui";

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
    <main className={PAGE}>
      <div className={COLUMN}>
        {/* A WAY BACK. Added 2 September 2026: this page is reached
            from the Research tab and from Performance, and it had no
            back arrow at all while the bottom bar lit Performance, so
            anyone arriving from Research had no way to return to where
            they came from. The arrow follows Settings' own pattern. */}
        <header className="flex items-center gap-3">
          <Link
            href="/stats"
            aria-label="Back to Performance"
            className="shrink-0 text-neutral-600 dark:text-neutral-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="min-w-0">
          <h1 className={PAGE_TITLE}>
            {sport === null
              ? "Your insights"
              : `${SPORT_EMOJI[sport]} ${sport}`}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {sport === null
              ? "Every statement that is currently true about your settled bets."
              : `Every statement that is currently true about your ${sport} picks.`}
          </p>
          </div>
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
