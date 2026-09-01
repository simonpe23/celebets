// THE HOME / LAB / TOTALS MENU. One component, drawn by three pages.
//
// It used to exist twice: this file served Lab and Totals, and the
// accepted Home held its own copy because that folder was locked to
// one chat. The lock is gone (30 August 2026) and so is the copy, so
// the menu's height, its pill and its labels are now one edit.
//
// It moved out of `performance-lab/` on the same day. It never
// belonged to Lab; sitting in Lab's folder just made it look that way.
//
// Every measurement comes from `../performance-ui`. Label centres and
// pill positions are the accepted Home's, measured off his sheet.
//
// TWO EXPORTS, and the difference matters:
//   PerfMenu      plain, takes the period as a prop. Home uses this,
//                 which keeps Home a static page.
//   PerfMenuLive  reads the period out of the address. Lab and Totals
//                 use this, so switching tabs keeps what you were
//                 looking at.
// Arriving from Home starts at All time: Home has no period of its
// own to carry, his ruling of 29 August 2026.

import Link from "next/link";
import {
  INDIGO_FILL,
  ON_BRAND,
  MENU_H,
  MENU_IDLE,
  MENU_INSET,
  MENU_PILL_H,
  MENU_PILL_TOP,
  MENU_PAD,
  MENU_TRACK,
  T_LABEL,
  W_BOLD,
  W_SEMI,
} from "./ui";
import { withPeriod, type PeriodKey } from "@/components/performance/lab/period";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";

// The address of each tab comes from the route set, because the same
// menu is drawn on the public previews and on the live pages.
//
// THE PIXEL POSITIONS ARE GONE, 31 August 2026, phase 3 of the size
// and layout job. Home sat at left: 59, Lab at 181, Totals at 296,
// and the pill at 4, 126 and 248, with a fixed 110px width. Those
// numbers were measured off a 390px mockup and were correct at
// exactly one width. They caused two of the things he complained
// about:
//
//   His words: "i want performance to expand as well as the other
//   pages do." It could not. Widening the column would have left the
//   menu's three tabs sitting where 390px put them.
//
//   Small phones scrolled sideways. Totals overflowed a 320px screen
//   by 52px, because a tab pinned at 296 plus its own width does not
//   fit in 320.
//
// Three equal thirds now, so the menu is right at any width and there
// is no number to go stale.
const TABS = [
  { key: "home", label: "Home" },
  { key: "lab", label: "Lab" },
  { key: "totals", label: "Totals" },
] as const;

export type PerfTab = (typeof TABS)[number]["key"];

export default function PerfMenu({
  active,
  period = "all",
  routes = PREVIEW_ROUTES,
  onSelect,
}: {
  active: PerfTab;
  period?: PeriodKey;
  routes?: PerfRoutes;
  /** Switch in place. Given by the tab area, which keeps this menu
      mounted so the pill can slide instead of being rebuilt. */
  onSelect?: (tab: PerfTab) => void;
}) {
  const index = Math.max(
    0,
    TABS.findIndex((t) => t.key === active)
  );
  // THE PILL SLIDES, his instruction of 31 August 2026: "i want to see
  // the tab bar slide over." It is one element that moves, not three
  // that swap, so the browser animates the journey. It used to carry
  // the active label inside it; the labels sit in the row above it
  // now and only their colour changes, which is how every segmented
  // control works and which is what lets the whole thing be
  // proportional.
  return (
    <div
      className={`relative ${MENU_INSET} ${MENU_H} rounded-full`}
      style={{ background: MENU_TRACK }}
    >
      <span
        aria-hidden
        className={`absolute ${MENU_PILL_TOP} ${MENU_PILL_H} rounded-full`}
        style={{
          background: INDIGO_FILL,
          left: MENU_PAD,
          width: `calc((100% - ${MENU_PAD * 2}px) / ${TABS.length})`,
          transform: `translateX(calc(${index} * 100%))`,
          transition: "transform 260ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <div className="relative flex h-full">
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <Link
              key={t.key}
              href={
                t.key === "home" ? routes.home : withPeriod(routes[t.key], period)
              }
              onClick={(e) => {
                if (!onSelect) return;
                e.preventDefault();
                onSelect(t.key);
              }}
              className={`flex flex-1 items-center justify-center ${T_LABEL} ${
                on ? W_BOLD : W_SEMI
              }`}
              style={{ color: on ? ON_BRAND : MENU_IDLE }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
