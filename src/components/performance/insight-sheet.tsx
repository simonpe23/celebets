"use client";

// THE INSIGHTS SHEET, 31 August 2026. His ruling: "the insight button
// does not work. make a pop up window, similar to what we have on
// Track that shows some top insights. then you can click new mix and
// new insights come up, or click all and you'll get to the insight
// page."
//
// THE CONTENT IS TRACK'S OWN, not a second version of it. It rolls
// through `rollInsights` from src/components/InsightsPopup.tsx, which
// is what the Track page's Insight of the day already calls. Two
// screens saying different things about the same record is the failure
// this avoids, and it is the same reason every money rule lives in one
// file.
//
// Only the dress is new: Track's sheet is the old palette with its own
// dark rules, and dropping it into Performance would look like a
// different app. This one is built from performance-ui.ts.

import Link from "next/link";
import { rollInsights } from "@/components/InsightsPopup";
import type { BetWithLegs } from "@/lib/types";
import { GoldSparkle } from "./icons";
import {
  AMBER_TILE,
  CARD,
  GREY_TEXT,
  INDIGO,
  INDIGO_FILL,
  INK,
  INSIGHT_ROW,
  NET_LABEL,
  ON_BRAND,
  R_CARD,
  R_CHIP,
  T_BODY,
  T_LABEL,
  T_SMALL,
  W_BOLD,
  W_SEMI,
} from "./ui";

export { rollInsights };

export default function InsightSheet({
  items,
  onReroll,
  onClose,
  live,
}: {
  /** null means closed. The page owns this so the strip can fill it
      on the first tap. */
  items: string[] | null;
  onReroll: () => void;
  onClose: () => void;
  /** The insights page is behind login, so the public preview must not
      offer a door to it. Nothing else about the sheet changes. */
  live: boolean;
}) {
  if (items === null) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close insights"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(16,17,20,0.42)" }}
      />
      <div
        className={`relative w-full max-w-[382px] ${R_CARD} px-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] pt-[16px] sm:pb-[18px]`}
        style={{ background: CARD, boxShadow: "0 -8px 40px rgba(16,16,26,0.22)" }}
      >
        <div className="flex items-center justify-between">
          <p className={`flex items-center gap-[7px] text-[14px] ${W_BOLD}`} style={{ color: INK }}>
            <span
              className="flex h-[26px] w-[26px] items-center justify-center rounded-full"
              style={{ background: AMBER_TILE }}
            >
              <GoldSparkle size={14} />
            </span>
            Your insights
          </p>
          <button
            onClick={onClose}
            className={`${T_LABEL} ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className={`mt-[14px] ${T_BODY} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
            Nothing to say yet. Settle a few bets and tap again.
          </p>
        ) : (
          <ul className="mt-[12px] space-y-[9px]">
            {items.map((text) => (
              <li
                key={text}
                className={`${R_CHIP} px-[12px] py-[10px] ${T_BODY} ${W_SEMI} leading-[1.5]`}
                style={{ background: INSIGHT_ROW, color: NET_LABEL }}
              >
                {text}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-[15px] flex items-center justify-between">
          <button
            onClick={onReroll}
            className={`flex h-[34px] items-center ${R_CHIP} px-[16px] ${T_LABEL} ${W_BOLD}`}
            style={{ background: INDIGO_FILL, color: ON_BRAND }}
          >
            New mix
          </button>
          {live ? (
            <Link
              href="/insights"
              className={`${T_SMALL} ${W_SEMI}`}
              style={{ color: INDIGO }}
            >
              Show all ›
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
