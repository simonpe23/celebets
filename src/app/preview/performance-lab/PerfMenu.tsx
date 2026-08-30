"use client";

// THE HOME / LAB / TOTALS MENU, one component instead of the same
// geometry copied into three files. The accepted Home keeps its own
// copy because that folder is locked to this chat.
//
// It carries the period from job 4 across the tabs, so switching from
// Totals to Lab keeps what you were looking at. Arriving from Home
// starts at All time: Home cannot carry the period until its own chat
// wires it, his ruling of 29 August 2026.
//
// Label centres are the accepted Home's: 59, 181, 296.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { INDIGO_FILL, MENU_IDLE, MENU_TRACK } from "./ui";
import { isPeriod, withPeriod } from "./period";

const TABS = [
  { key: "home", label: "Home", href: "/preview/performance-home", left: 59, pill: 4 },
  { key: "lab", label: "Lab", href: "/preview/performance-lab", left: 181, pill: 126 },
  { key: "totals", label: "Totals", href: "/preview/performance-totals", left: 296, pill: 248 },
] as const;

export default function PerfMenu({ active }: { active: "home" | "lab" | "totals" }) {
  const raw = useSearchParams().get("period");
  const period = isPeriod(raw) ? raw : "all";
  return (
    <div
      className="relative mx-[14px] mt-[7px] h-[36px] rounded-full"
      style={{ background: MENU_TRACK }}
    >
      {TABS.map((t) =>
        t.key === active ? (
          <span
            key={t.key}
            className="absolute top-[4px] flex h-[28px] w-[110px] items-center justify-center rounded-full text-[10.5px] font-bold text-white"
            style={{ background: INDIGO_FILL, left: t.pill }}
          >
            {t.label}
          </span>
        ) : (
          <Link
            key={t.key}
            href={t.key === "home" ? t.href : withPeriod(t.href, period)}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 px-[18px] py-[10px] text-[10.5px] font-semibold"
            style={{ color: MENU_IDLE, left: t.left }}
          >
            {t.label}
          </Link>
        )
      )}
    </div>
  );
}
