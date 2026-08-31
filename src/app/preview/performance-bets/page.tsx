// The All Bets preview shell, job 5. The page column, the face and the
// floating tab bar all come from `../performance-shell`, which every
// Performance page shares; this file is only what All Bets adds.
//
// Reached from Lab's "See these N bets" and Totals' "See all bets",
// and the back arrow returns to whichever one sent you.

import { Suspense } from "react";
import PerfPage from "../performance-shell";
import BetsApp from "./BetsApp";

export default function PerformanceBetsPreview() {
  return (
    <PerfPage>
      <Suspense fallback={null}>
        <BetsApp />
      </Suspense>
    </PerfPage>
  );
}
