// The PUBLIC preview of Performance Totals: the shared tab area opened
// on the Totals tab.

import { Suspense } from "react";
import PerfArea from "../performance-area";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceTotalsPreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="totals" />
    </Suspense>
  );
}
