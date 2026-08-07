"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildInsightPool } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { CARD } from "@/lib/ui";

// Insight of the day. One thing Celebet noticed in the user's own
// data, surfaced on its own: the user did not ask, and no AI went
// researching. It is the only line on the Track page that concludes
// instead of reporting.
//
// "Of the day" is literal: the pick is seeded by the date, so it holds
// steady all day and changes overnight, instead of rerolling on every
// visit. Picked after mount because the phone's date is the one that
// matters, not the server's.
//
// It links to Performance, not to a separate insights page. Insights
// are a layer inside Performance, the way Apple Health keeps insights
// inside the health data. Ruled by the owner, August 2026.
export default function InsightCard({ bets }: { bets: BetWithLegs[] }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const settled = bets.filter(
      (b) => b.status !== "pending" && b.settled_at !== null
    );
    const pool = buildInsightPool(settled);
    if (pool.length === 0) return;
    const now = new Date();
    const seed =
      now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    setText(pool[seed % pool.length].text);
  }, [bets]);

  if (!text) return null;

  return (
    <Link href="/stats" className={`${CARD} flex items-center gap-3 p-4`}>
      <span className="min-w-0 grow">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 shrink-0 text-[#7C3AED] dark:text-[#A78BFA]"
            aria-hidden="true"
          >
            <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2Z" />
          </svg>
          <span className="whitespace-nowrap text-sm font-bold">
            Insight of the day
          </span>
          <span className="rounded bg-[#7C3AED]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#7C3AED] dark:bg-[#A78BFA]/15 dark:text-[#A78BFA]">
            AI
          </span>
        </span>
        <span className="mt-2 line-clamp-3 text-[15px] font-semibold leading-snug">
          {text}
        </span>
      </span>

      {/* The trophy in its glow. Three layers, because one flat blur
          behind a flat circle is what made it look cheap: a wide soft
          halo, a tighter bright ring, and a lit gradient on the disc
          itself. */}
      <span className="relative shrink-0" aria-hidden="true">
        <span className="absolute -inset-5 rounded-full bg-[#7C3AED]/25 blur-2xl" />
        <span className="absolute -inset-2 rounded-full bg-[#A78BFA]/30 blur-lg" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#A78BFA,#7C3AED_55%,#5B21B6)] shadow-[0_0_28px_-4px_rgba(124,58,237,0.85),inset_0_1px_1px_rgba(255,255,255,0.45)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
            <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 3.5 4 4M17 6h3a1 1 0 0 1 1 1c0 2-1.5 3.5-4 4" />
          </svg>
        </span>
      </span>

      <span className="w-[72px] shrink-0 text-xs font-bold leading-tight text-[#7C3AED] dark:text-[#A78BFA]">
        View Performance →
      </span>
    </Link>
  );
}
