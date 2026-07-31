"use client";

import { useState } from "react";
import Link from "next/link";
import { buildInsightPool, pickInsights } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";

export default function Recommendations({ bets }: { bets: BetWithLegs[] }) {
  // null means the popup is closed.
  const [recs, setRecs] = useState<string[] | null>(null);

  function roll() {
    setRecs(pickInsights(buildInsightPool(bets)));
  }

  return (
    <>
      <button
        type="button"
        onClick={roll}
        className="rounded-xl bg-[#213555] px-3 py-2.5 text-center text-xs font-bold text-[#E5D283] active:bg-[#16233A]"
      >
        Recommendations
      </button>

      {recs !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Recommendations</h3>
              <button
                type="button"
                onClick={() => setRecs(null)}
                className="rounded-lg bg-[#213555] px-4 py-2 text-sm font-bold text-[#E5D283] active:bg-[#16233A]"
              >
                Hide
              </button>
            </div>

            {recs.length === 0 ? (
              <p className="mt-4 text-sm">
                Nothing to say yet. Settle a few bets and tap again.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recs.map((text, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    {text}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={roll}
                className="rounded-lg border border-[#213555] px-4 py-2 text-sm font-bold text-[#213555] dark:text-[#E5D283]"
              >
                New mix
              </button>
              <Link
                href="/recommendations"
                className="text-sm font-bold text-[#213555] underline underline-offset-2 dark:text-[#E5D283]"
              >
                Show all
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
