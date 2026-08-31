"use client";

// The menu with the period read out of the address, for Lab and
// Totals. Split out of `performance-menu.tsx` so that Home, which has
// no period to carry, can draw the same menu without a client hook
// and stay a static page.

import { useSearchParams } from "next/navigation";
import PerfMenu, { type PerfTab } from "./performance-menu";
import { isPeriod } from "./performance-lab/period";

export default function PerfMenuLive({ active }: { active: PerfTab }) {
  const raw = useSearchParams().get("period");
  return <PerfMenu active={active} period={isPeriod(raw) ? raw : "all"} />;
}
