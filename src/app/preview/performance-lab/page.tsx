// The PUBLIC preview of Performance Lab: the shared tab area opened on
// the Lab tab. Switching tabs from here loads nothing.

import { Suspense } from "react";
import PerfArea from "@/components/performance/area";
import { labBets } from "@/components/performance/lab/lab-data";

export default function PerformanceLabPreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="lab" />
    </Suspense>
  );
}
