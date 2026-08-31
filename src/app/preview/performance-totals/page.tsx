// The PUBLIC preview of Performance Totals: the shared tab area opened
// on the Totals tab.

import { Suspense } from "react";
import PerfArea from "@/components/performance/area";
import { labBets } from "@/components/performance/lab/lab-data";

export default function PerformanceTotalsPreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="totals" />
    </Suspense>
  );
}
