// Performance Compare, live, on the signed in user's own bets.

import { Suspense } from "react";
import PerfPage from "../../preview/performance-shell";
import CompareApp from "../../preview/performance-compare/CompareApp";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsComparePage() {
  const bets = await loadUserBets();
  return (
    <PerfPage live>
      <Suspense fallback={null}>
        <CompareApp bets={bets} routes={LIVE_ROUTES} />
      </Suspense>
    </PerfPage>
  );
}
