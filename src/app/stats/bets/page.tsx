// Performance Bets, live. A deep link into the shared tab area, opened
// on All Bets, on the signed in user's own bets.

import { Suspense } from "react";
import PerfArea from "@/components/performance/area";
import { loadRestartLine, loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsBetsPage() {
  const [bets, trackingSince] = await Promise.all([
    loadUserBets(),
    loadRestartLine(),
  ]);
  return (
    <Suspense fallback={null}>
      <PerfArea bets={bets} trackingSince={trackingSince} initial="bets" routes={LIVE_ROUTES} live />
    </Suspense>
  );
}
