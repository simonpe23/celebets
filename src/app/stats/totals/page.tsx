// Performance Totals, live. A deep link into the shared tab area, opened
// on the Totals tab, on the signed in user's own bets.

import { Suspense } from "react";
import PerfArea from "@/components/performance/area";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsTotalsPage() {
  const bets = await loadUserBets();
  return (
    <Suspense fallback={null}>
      <PerfArea bets={bets} initial="totals" routes={LIVE_ROUTES} live />
    </Suspense>
  );
}
