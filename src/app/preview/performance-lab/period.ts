// THE PERIOD, shared by Lab, Totals and the Heat Map. Job 4.
//
// One vocabulary for the whole app. These are the live app's own
// periods, the list in `StatsView.tsx`, and the date maths is
// `periodStart` from `src/lib/stats.ts`, the same function Track's
// balance band uses. So "This month" means one thing everywhere,
// which is the point: the accepted Home already draws a pill saying
// "This month" and Totals one saying "All time", both from this list.
//
// Custom is left out. It needs a date picker, and these are demo
// pages with a generated record.
//
// HOW THE PERIOD IS APPLIED: by building the engine from a filtered
// list of bets, not by threading a date through every call. Every
// page's existing code then works unchanged and no surface can
// compute a different answer from another. That is the same reason
// every money rule lives in one file.

import { periodStart } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";

export const PERIODS = [
  { key: "all", label: "All time" },
  { key: "year", label: "This year" },
  { key: "month", label: "This month" },
  { key: "week", label: "This week" },
  { key: "today", label: "Today" },
] as const;

export type PeriodKey = (typeof PERIODS)[number]["key"];

export const labelOf = (key: PeriodKey) =>
  PERIODS.find((p) => p.key === key)?.label ?? "All time";

export const isPeriod = (v: string | null): v is PeriodKey =>
  v !== null && PERIODS.some((p) => p.key === v);

export function betsIn(bets: BetWithLegs[], key: PeriodKey): BetWithLegs[] {
  if (key === "all") return bets;
  const from = periodStart(key).getTime();
  return bets.filter((b) => {
    if (!b.settled_at) return false;
    return new Date(b.settled_at).getTime() >= from;
  });
}

// The period travels between the preview pages in the address, so
// switching tabs keeps it. The accepted Home cannot carry it: that
// folder is locked to this chat, so arriving from Home starts at All
// time. His ruling, 29 August 2026: "Home folder will not be
// unlocked. I will organize that in the home chat."
export function withPeriod(href: string, key: PeriodKey): string {
  if (key === "all") return href;
  return href + (href.includes("?") ? "&" : "?") + `period=${key}`;
}
