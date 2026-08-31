// The Compare preview shell. The page column, the face and the
// floating tab bar all come from `../performance-shell`, which every
// Performance page shares; this file is only what Compare adds.
//
// Compare is its own screen by his ruling of 29 August 2026, reached
// from Lab at exactly two selections. The Suspense boundary exists
// because CompareApp reads the two selections from the address.

import { Suspense } from "react";
import PerfPage from "../performance-shell";
import CompareApp from "./CompareApp";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceComparePreview() {
  return (
    <PerfPage>
      <Suspense fallback={null}>
        <CompareApp bets={labBets} />
      </Suspense>
    </PerfPage>
  );
}
