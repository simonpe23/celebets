"use client";

import Link from "next/link";
import { buildInsightPool, pickInsights } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { BTN, CARD_LINK } from "@/lib/ui";

// The rotating insight pool, in a sheet. One file, because two places
// open it: "View Insights" on the Track page's Insight of the day, and
// "More insights" on Performance's Key Insights. Copying the markup is
// how the two would drift apart.
//
// Four statements at a time, at most one per category, so a single tap
// never shows four facts of the same kind. New mix rerolls.
export default function InsightsPopup({
  items,
  onReroll,
  onClose,
}: {
  // null means closed. The parent owns this so the trigger button can
  // fill it on the first tap.
  items: string[] | null;
  onReroll: () => void;
  onClose: () => void;
}) {
  if (items === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#161D38]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Your insights</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400"
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-4 text-sm">
            Nothing to say yet. Settle a few bets and tap again.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((text, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {text}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onReroll}
            className={`${BTN} h-9 px-4`}
          >
            New mix
          </button>
          <Link
            href="/recommendations"
            className={`${CARD_LINK} underline underline-offset-2`}
          >
            Show all ›
          </Link>
        </div>
      </div>
    </div>
  );
}

// The pool a trigger should hand to the sheet. Exported so both callers
// roll the same way.
export function rollInsights(bets: BetWithLegs[]): string[] {
  return pickInsights(buildInsightPool(bets));
}
