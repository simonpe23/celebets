// The Heat Map preview. A deep link into the shared tab area, opened
// on the Heat Map, over demo bets because a preview is public by his
// ruling.
//
// The Heat Map is a view inside that area since 31 August 2026, not a
// page of its own, so tapping Home's pill swaps the view instead of
// loading a page. The address still works.

import { Suspense } from "react";
import PerfArea from "../performance-area";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceHeatmapPreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="heatmap" />
    </Suspense>
  );
}
