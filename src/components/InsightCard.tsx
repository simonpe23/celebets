"use client";

import { useEffect, useState } from "react";
import InsightsPopup, { rollInsights } from "@/components/InsightsPopup";
import { buildInsightPool } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { ACCENT, CARD, CARD_LINK } from "@/lib/ui";

// Insight of the day. One thing Actuals noticed in the user's own
// data, surfaced on its own: the user did not ask, and no AI went
// researching. It is the only line on the Track page that concludes
// instead of reporting.
//
// "Of the day" is literal: the pick is seeded by the date, so it holds
// steady all day and changes overnight, instead of rerolling on every
// visit. Picked after mount because the phone's date is the one that
// matters, not the server's.
//
// On Track it carries "View Insights", which opens the rotating pool
// in a sheet rather than navigating anywhere. Ruled by the owner
// (August 2026), reversing his earlier note that the link should say
// "View Performance" because "View Insights" sounds like a separate
// product. He decided in front of the built page: the insight is the
// thing you want more of, so the tap should give you more of it, not
// move you to another screen.
//
// On Performance itself the card is the first section of the page and
// Key Insights already carries "More insights", so it shows no
// control at all.
export default function InsightCard({
  bets,
  linked = true,
}: {
  bets: BetWithLegs[];
  linked?: boolean;
}) {
  const [text, setText] = useState<string | null>(null);
  // null means the sheet is closed.
  const [popup, setPopup] = useState<string[] | null>(null);

  const settled = bets.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );

  useEffect(() => {
    const pool = buildInsightPool(
      bets.filter((b) => b.status !== "pending" && b.settled_at !== null)
    );
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
          {/* No AI badge. Removed by the owner, August 2026. The
              sparkle already says Actuals noticed this on its own, and
              the badge was a second label for the same idea. */}
          <span className="whitespace-nowrap text-sm font-bold">
            {linked ? "Insight of the day" : "Today's Insight"}
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
    return (
      <section className={`${CARD} flex items-center gap-3 p-4`}>{body}</section>
    );
  }

  return (
    <section className={`${CARD} flex items-center gap-3 p-4`}>
      {body}
      <button
        type="button"
        onClick={() => setPopup(rollInsights(settled))}
        className={`w-[68px] shrink-0 text-left leading-tight ${CARD_LINK} text-xs`}
      >
        View Insights ›
      </button>

      <InsightsPopup
        items={popup}
        onReroll={() => setPopup(rollInsights(settled))}
        onClose={() => setPopup(null)}
      />
    </section>
  );
}
