"use client";

import { useEffect, useState } from "react";
import { formatOdds, formatMoney, formatSignedMoney } from "@/lib/format";
import { SPORT_EMOJI, type BetWithLegs } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
}

function profitOf(bet: BetWithLegs): number {
  return bet.status === "won"
    ? Number(bet.payout ?? 0) - Number(bet.stake)
    : -Number(bet.stake);
}

export default function BetHistory({ bets }: Props) {
  // Dates are rendered after mount so they use the phone's timezone.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section>
      <h2 className="text-lg font-bold">Betting history</h2>

      {bets.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
          Settled bets will show up here.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {bets.map((bet) => {
            const profit = profitOf(bet);
            return (
              <div
                key={bet.id}
                className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {bet.legs.map((leg) => (
                      <p key={leg.id} className="truncate text-sm font-medium">
                        {SPORT_EMOJI[leg.sport]} {leg.description}
                      </p>
                    ))}
                    <p className="mt-1 text-xs text-neutral-500">
                      {mounted && bet.settled_at
                        ? new Date(bet.settled_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : ""}
                      {" · "}
                      {formatMoney(Number(bet.stake))} at{" "}
                      {formatOdds(Number(bet.total_odds))}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-bold ${
                      profit > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatSignedMoney(profit)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
