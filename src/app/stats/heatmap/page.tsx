// Performance Heatmap, live, on the signed in user's own bets.

import { Suspense } from "react";
import PerfPage from "../../preview/performance-shell";
import HeatmapApp from "../../preview/performance-heatmap/HeatmapApp";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsHeatmapPage() {
  const bets = await loadUserBets();
  return (
    <PerfPage live>
      <Suspense fallback={null}>
        <HeatmapApp bets={bets} routes={LIVE_ROUTES} />
      </Suspense>
    </PerfPage>
  );
}
