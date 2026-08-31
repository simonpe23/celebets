// The PUBLIC preview of Performance. Home, Lab and Totals are one
// page with three tabs, the same component the live pages render, over
// demo bets because a preview is public by his ruling.

import { Suspense } from "react";
import PerfArea from "@/components/performance/area";
import { labBets } from "@/components/performance/lab/lab-data";

export default function PerformanceHomePreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="home" />
    </Suspense>
  );
}
