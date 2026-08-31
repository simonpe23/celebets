// Performance Compare, live. A deep link into the shared tab area,
// opened on Compare, on the signed in user's own bets.

import { Suspense } from "react";
import PerfArea from "../../preview/performance-area";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsComparePage() {
  const bets = await loadUserBets();
  return (
    <Suspense fallback={null}>
      <PerfArea bets={bets} initial="compare" routes={LIVE_ROUTES} live />
    </Suspense>
  );
}
