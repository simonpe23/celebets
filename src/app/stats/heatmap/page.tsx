// Performance Heat Map, live. A deep link into the shared tab area,
// opened on the Heat Map, on the signed in user's own bets.
//
// It used to be a page of its own. Tapping the Heat Map pill on Home
// left the area and asked the database for his bets a second time,
// which is what "heat map is loading slowly" was. The address still
// works; arriving here just starts the area on this view.

import { Suspense } from "react";
import PerfArea from "../../preview/performance-area";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsHeatmapPage() {
  const bets = await loadUserBets();
  return (
    <Suspense fallback={null}>
      <PerfArea bets={bets} initial="heatmap" routes={LIVE_ROUTES} live />
    </Suspense>
  );
}
