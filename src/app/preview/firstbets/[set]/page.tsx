// One Performance area, drawn against one of the first-days records.
// ?view= picks which of the six views opens. See ../page.tsx.

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
  searchParams: Promise<{ view?: string }>;
}) {
  const { set } = await params;
  const { view } = await searchParams;
  if (!isFirstBetsKey(set)) notFound();
  const initial = view && VIEWS.includes(view) ? (view as PerfView) : "home";
  return (
    <Suspense fallback={null}>
      <PerfArea bets={SETS[set]} initial={initial} />
    </Suspense>
  );
}
