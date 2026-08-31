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
  MENU_H,
  MENU_IDLE,
  MENU_INSET,
  MENU_PILL_H,
  MENU_PILL_TOP,
  MENU_PILL_W,
  MENU_TRACK,
  T_LABEL,
  W_BOLD,
  W_SEMI,
} from "./performance-ui";
import { withPeriod, type PeriodKey } from "./performance-lab/period";

const TABS = [
  { key: "home", label: "Home", href: "/preview/performance-home", left: 59, pill: 4 },
  { key: "lab", label: "Lab", href: "/preview/performance-lab", left: 181, pill: 126 },
  { key: "totals", label: "Totals", href: "/preview/performance-totals", left: 296, pill: 248 },
] as const;

export type PerfTab = (typeof TABS)[number]["key"];

export default function PerfMenu({
  active,
  period = "all",
}: {
  active: PerfTab;
  period?: PeriodKey;
}) {
  return (
    <div
      className={`relative ${MENU_INSET} ${MENU_H} rounded-full`}
      style={{ background: MENU_TRACK }}
    >
      {TABS.map((t) =>
        t.key === active ? (
          <span
            key={t.key}
            className={`absolute ${MENU_PILL_TOP} flex ${MENU_PILL_H} ${MENU_PILL_W} items-center justify-center rounded-full ${T_LABEL} ${W_BOLD} text-white`}
            style={{ background: INDIGO_FILL, left: t.pill }}
          >
            {t.label}
          </span>
        ) : (
          <Link
            key={t.key}
            href={t.key === "home" ? t.href : withPeriod(t.href, period)}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 px-[18px] py-[10px] ${T_LABEL} ${W_SEMI}`}
            style={{ color: MENU_IDLE, left: t.left }}
          >
            {t.label}
          </Link>
        )
      )}
    </div>
  );
}
