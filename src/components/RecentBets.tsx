"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatSignedMoney } from "@/lib/format";
import { betProfit } from "@/lib/stats";
import { SPORT_EMOJI, type BetWithLegs } from "@/lib/types";
import { CARD, CARD_LINK, INNER } from "@/lib/ui";

// The last ten settled bets on the Track page. Read only: settling,
// editing and deleting all live on the bet's own card or on Performance,
// and two places that can change the same row is how they drift apart.
//
// It sits below Pending Bets, so the page reads forward in time: what
// is still riding, then what just finished.

// How many results the owner asked for.
const LIMIT = 10;

export default function RecentBets({ bets }: { bets: BetWithLegs[] }) {
  // Dates render after mount so they use the phone's timezone, not the
  // server's. The same rule as the pending card.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const recent = bets
    .filter((b) => b.status !== "pending" && b.settled_at !== null)
    .sort(
      (a, b) =>
        new Date(b.settled_at as string).getTime() -
        new Date(a.settled_at as string).getTime()
    )
    .slice(0, LIMIT);

  if (recent.length === 0) return null;

  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold">Recent results</h2>
        <Link href="/stats" className={CARD_LINK}>
          View all ›
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {recent.map((bet) => {
          const isParlay = bet.legs.length > 1;
          const profit = betProfit(bet);
          const won = profit >= 0;

          return (
            <div
              key={bet.id}
              className={`${INNER} flex items-center justify-between gap-3 p-3`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                {isParlay ? (
                  <span className="shrink-0 rounded-md bg-neutral-200/70 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                    Parlay
                  </span>
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200/70 text-lg dark:bg-white/10">
                    {SPORT_EMOJI[bet.legs[0]?.sport ?? "Football"]}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-bold">
                    {isParlay
                      ? `${bet.legs.length} Leg Parlay`
                      : (bet.legs[0]?.description ??
                        bet.legs[0]?.subcategory ??
                        bet.legs[0]?.sport)}
                  </span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {mounted
                      ? new Date(bet.settled_at as string).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : ""}
                    {bet.cashed_out && " · cashed out"}
                  </span>
                </span>
              </span>

              {/* The money is the whole point of the row, so it is the
                  only thing on the right. Green up, red down, the same
                  meaning it carries everywhere else. */}
              <span
                className={`shrink-0 font-money text-[15px] font-bold tabular-nums ${
                  won
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatSignedMoney(profit)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
