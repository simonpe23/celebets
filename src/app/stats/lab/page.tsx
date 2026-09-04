// Performance Lab, live. A deep link into the shared tab area, opened
// on the Lab tab, on the signed in user's own bets.

import { Suspense } from "react";
import PerfArea from "@/components/performance/area";
import { loadRestartLine, loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsLabPage() {
  const [bets, trackingSince] = await Promise.all([
    loadUserBets(),
    loadRestartLine(),
  ]);
  return (
    <Suspense fallback={null}>
      <PerfArea bets={bets} trackingSince={trackingSince} initial="lab" routes={LIVE_ROUTES} live />
    </Suspense>
  );
}
