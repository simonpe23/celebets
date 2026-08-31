// PERFORMANCE, LIVE. The rebuilt area took over `/stats`; the old page
// moved to `/stats-old` and is still reachable with his real numbers.
//
// Home, Lab and Totals are one page here. The bets are loaded once and
// switching tabs asks the server for nothing.

import { Suspense } from "react";
import PerfArea from "../preview/performance-area";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsPage() {
  const bets = await loadUserBets();
  return (
    <Suspense fallback={null}>
      <PerfArea bets={bets} initial="home" routes={LIVE_ROUTES} live />
    </Suspense>
  );
}
