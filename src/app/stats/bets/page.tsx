// Performance Bets, live, on the signed in user's own bets.

import { Suspense } from "react";
import PerfPage from "../../preview/performance-shell";
import BetsApp from "../../preview/performance-bets/BetsApp";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsBetsPage() {
  const bets = await loadUserBets();
  return (
    <PerfPage live>
      <Suspense fallback={null}>
        <BetsApp bets={bets} routes={LIVE_ROUTES} />
      </Suspense>
    </PerfPage>
  );
}
