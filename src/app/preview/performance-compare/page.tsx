// The Compare preview. A deep link into the shared tab area, opened on
// Compare, over demo bets because a preview is public by his ruling.
//
// Compare is its own screen by his ruling of 29 August 2026, reached
// from Lab at exactly two selections. It was its own PAGE until 31
// August 2026; it is a view inside the area now, so opening it from
// Lab loads nothing. The address still works.

import { Suspense } from "react";
import PerfArea from "../performance-area";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceComparePreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="compare" />
    </Suspense>
  );
}
