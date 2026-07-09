"use client";

import { useState } from "react";
import Link from "next/link";
import { buildInsightPool, pickInsights } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";

export default function Recommendations({ bets }: { bets: BetWithLegs[] }) {
  // null means the panel is closed.
  const [recs, setRecs] = useState<string[] | null>(null);

  return (
    <section>
      <button
        type="button"
        onClick={() => setRecs(pickInsights(buildInsightPool(bets)))}
        className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white active:bg-emerald-700"
      >
        {recs === null ? "Show recommendations" : "New recommendations"}
      </button>

      {recs !== null && (
        <div className="mt-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Based on all your settled bets.
            </p>
            <button
              type="button"
              onClick={() => setRecs(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500"
            >
              Hide
            </button>
          </div>
          {recs.length === 0 ? (
            <p className="mt-2 text-sm">
              Nothing to say yet. Settle a few bets and tap again.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {recs.map((text, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  {text}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/recommendations"
            className="mt-3 block text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400"
          >
            Show all recommendations
          </Link>
        </div>
      )}
    </section>
  );
}
