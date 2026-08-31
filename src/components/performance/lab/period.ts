// THE PERIOD, shared by Lab, Totals and the Heat Map. Job 4.
//
// One vocabulary for the whole app. These are the live app's own
// periods, the list in `StatsView.tsx`, and the date maths is
// `periodStart` from `src/lib/stats.ts`, the same function Track's
// balance band uses. So "This month" means one thing everywhere,
// which is the point: the accepted Home already draws a pill saying
// "This month" and Totals one saying "All time", both from this list.
//
// Custom is IN, since 31 August 2026. It was left out while these
// were demo pages with a generated record; they are the live pages
// now. His words: "i should be able to see result from all time,
// year, month, week, day and then add custom as well, just as the old
// performance page." The old page's own behaviour is copied: the from
// date starts at midnight, the to date ends at 23:59:59.999, and a
// half filled range is treated as open at that end.
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
  { key: "custom", label: "Custom" },
] as const;

/** A custom range. Either end may be empty, meaning open at that end. */
export interface CustomRange {
  from: string;
  to: string;
}

export const EMPTY_RANGE: CustomRange = { from: "", to: "" };

export type PeriodKey = (typeof PERIODS)[number]["key"];

const SHORT = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
};

// A chosen range says what it is rather than the word Custom, so the
// pill never hides which window you are looking at.
export const labelOf = (key: PeriodKey, range?: CustomRange) => {
  if (key === "custom" && range && (range.from || range.to)) {
    if (range.from && range.to) return `${SHORT(range.from)} to ${SHORT(range.to)}`;
    return range.from ? `From ${SHORT(range.from)}` : `Until ${SHORT(range.to)}`;
  }
  return PERIODS.find((p) => p.key === key)?.label ?? "All time";
};

export const isPeriod = (v: string | null): v is PeriodKey =>
  v !== null && PERIODS.some((p) => p.key === v);

export function betsIn(
  bets: BetWithLegs[],
  key: PeriodKey,
  range?: CustomRange
): BetWithLegs[] {
  if (key === "all") return bets;

  if (key === "custom") {
    const r = range ?? EMPTY_RANGE;
    if (!r.from && !r.to) return bets;
    const from = r.from ? new Date(r.from + "T00:00:00").getTime() : -Infinity;
    const to = r.to ? new Date(r.to + "T23:59:59.999").getTime() : Infinity;
    return bets.filter((b) => {
      if (!b.settled_at) return false;
      const t = new Date(b.settled_at).getTime();
      return t >= from && t <= to;
    });
  }

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
