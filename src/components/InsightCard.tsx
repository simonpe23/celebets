"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildInsightPool } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { ACCENT, ACCENT_TINT, CARD, CARD_LINK } from "@/lib/ui";

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
// On Track it links to Performance, because insights are a layer
// inside Performance, the way Apple Health keeps insights inside the
// health data. On Performance itself it is the first section of the
// page, so it drops the link rather than pointing at itself.
export default function InsightCard({
  bets,
  linked = true,
}: {
  bets: BetWithLegs[];
  linked?: boolean;
}) {
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

  const body = (
    <>
      <span className="min-w-0 grow">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 ${ACCENT}`}
            aria-hidden="true"
          >
            <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2Z" />
          </svg>
          <span className="whitespace-nowrap text-sm font-bold">
            {linked ? "Insight of the day" : "Today's Insight"}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${ACCENT_TINT}`}>
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
        <span className="absolute -inset-4 rounded-full bg-[#FBBF24]/20 blur-xl" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#FBBF24,#F59E0B_55%,#B45309)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
            <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 3.5 4 4M17 6h3a1 1 0 0 1 1 1c0 2-1.5 3.5-4 4" />
          </svg>
        </span>
      </span>
    </>
  );

  if (!linked) {
    return <section className={`${CARD} flex items-center gap-3 p-4`}>{body}</section>;
  }

  return (
    <Link href="/stats" className={`${CARD} flex items-center gap-3 p-4`}>
      {body}
      <span className={`w-[68px] leading-tight ${CARD_LINK} text-xs`}>
        View Performance ›
      </span>
    </Link>
  );
}
