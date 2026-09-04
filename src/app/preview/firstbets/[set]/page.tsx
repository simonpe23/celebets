// One Performance area, drawn against one of the first-days records.
// ?view= picks which of the six views opens. See ../page.tsx.
//
// ?since=YYYY-MM-DD draws a RESTARTED record, added 4 September 2026
// with the restart period. It is the only way to see and to test the
// "Since restart" entry in the period pill without a real account that
// has restarted, and `restarttest.mjs` pins the counting rule itself.
// These are demo bets, so nothing real is exposed.

import { Suspense } from "react";
import { notFound } from "next/navigation";
import PerfArea, { type PerfView } from "@/components/performance/area";
import { SETS, isFirstBetsKey } from "../data";

const VIEWS = ["home", "lab", "totals", "heatmap", "compare", "bets"];

export default async function FirstBetsPerformance({
  params,
  searchParams,
}: {
  params: Promise<{ set: string }>;
  searchParams: Promise<{ view?: string; since?: string }>;
}) {
  const { set } = await params;
  const { view, since } = await searchParams;
  if (!isFirstBetsKey(set)) notFound();
  const initial = view && VIEWS.includes(view) ? (view as PerfView) : "home";
  // A date that does not parse is treated as no restart at all, which
  // is what `sinceLine` would do with it anyway.
  const trackingSince =
    since && !Number.isNaN(new Date(since).getTime()) ? since : null;
  return (
    <Suspense fallback={null}>
      <PerfArea bets={SETS[set]} initial={initial} trackingSince={trackingSince} />
    </Suspense>
  );
}
