"use client";

import { useState } from "react";
import Link from "next/link";
import MicroLabel from "@/components/MicroLabel";
import { buildInsightPool, keyInsights, pickInsights } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { CARD, INNER } from "@/lib/ui";

// Key Insights: the second section of Performance, and the reason the
// page is a performance review rather than a statistics page.
//
// Three fixed statements, in this order, answering three questions:
//   Biggest strength   what am I good at
//   Biggest weakness   what is costing me
//   Trending           which way am I going
//
// They speak in MONEY, never in a percentage. Ruled by the owner: a
// parlay's stake covers several sports, so there is no honest per-sport
// or per-category ROI. Profit has no such problem.
//
// The rotating pool used to live behind a "Your insights" button in the
// page header, which was a second door to the same idea. It is now the
// "More insights" link at the foot of this card.

function toneClass(tone: "up" | "down" | "flat"): string {
  if (tone === "up") return "text-emerald-600 dark:text-emerald-400";
  if (tone === "down") return "text-red-600 dark:text-red-400";
  return "text-neutral-500 dark:text-neutral-400";
}

const LABELS = {
  strength: "Biggest strength",
  weakness: "Biggest weakness",
  trend: "Trending",
} as const;

function Icon({ kind }: { kind: "strength" | "weakness" | "trend" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[18px] w-[18px]",
    "aria-hidden": true,
  };
  if (kind === "strength") {
    // An upward arrow out of a corner.
    return (
      <svg {...common}>
        <path d="M3 17l6-6 4 4 7-7" />
        <path d="M14 8h6v6" />
      </svg>
    );
  }
  if (kind === "weakness") {
    return (
      <svg {...common}>
        <path d="M3 7l6 6 4-4 7 7" />
        <path d="M14 16h6v-6" />
      </svg>
    );
  }
  // Trending: a simple pulse.
  return (
    <svg {...common}>
      <path d="M3 12h4l3 7 4-14 3 7h4" />
    </svg>
  );
}

export default function KeyInsights({ bets }: { bets: BetWithLegs[] }) {
  // null means the rotating pool popup is closed.
  const [more, setMore] = useState<string[] | null>(null);

  const rows = keyInsights(bets);

  function roll() {
    setMore(pickInsights(buildInsightPool(bets)));
  }

  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold">Key Insights</h2>
        <button
          type="button"
          onClick={roll}
          className="shrink-0 text-sm font-bold text-[#7C3AED] dark:text-[#9A57FC]"
        >
          More insights →
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Not enough settled bets yet. Celebet needs five settled picks in
          a sport or a category before it will call anything a strength or
          a weakness.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <div
              key={row.kind}
              className={`${INNER} flex items-center gap-3 px-3 py-3`}
            >
              <span className={`shrink-0 ${toneClass(row.tone)}`}>
                <Icon kind={row.kind} />
              </span>
              <span className="min-w-0 grow">
                <MicroLabel>{LABELS[row.kind]}</MicroLabel>
                <span className="mt-0.5 block truncate text-sm font-semibold">
                  {row.headline}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {row.detail}
                </span>
              </span>
              <span
                className={`shrink-0 font-money text-[15px] font-bold tabular-nums ${toneClass(
                  row.tone
                )}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {more !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#161D38]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">More insights</h3>
              <button
                type="button"
                onClick={() => setMore(null)}
                className="rounded-lg px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400"
              >
                Close
              </button>
            </div>

            {more.length === 0 ? (
              <p className="mt-4 text-sm">
                Nothing to say yet. Settle a few bets and tap again.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {more.map((text, i) => (
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
                className="rounded-md border border-[#7C3AED] px-4 py-2 text-sm font-bold text-[#7C3AED] dark:border-[#9A57FC]/60 dark:text-[#9A57FC]"
              >
                New mix
              </button>
              <Link
                href="/recommendations"
                className="text-sm font-bold text-[#7C3AED] underline underline-offset-2 dark:text-[#9A57FC]"
              >
                Show all
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
