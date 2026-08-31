// The All Bets preview. A deep link into the shared tab area, opened
// on All Bets, over demo bets because a preview is public by his
// ruling.
//
// Reached from Lab's "See these N bets" and Totals' "See all bets",
// and the back arrow returns to whichever one sent you. It was its own
// PAGE until 31 August 2026; it is a view inside the area now, so
// neither door loads anything. The address still works.

import { Suspense } from "react";
import PerfArea from "../performance-area";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceBetsPreview() {
  return (
    <Suspense fallback={null}>
      <PerfArea bets={labBets} initial="bets" />
    </Suspense>
  );
}
