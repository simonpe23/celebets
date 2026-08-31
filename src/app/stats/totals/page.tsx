// Performance Totals, live, on the signed in user's own bets.

import { Suspense } from "react";
import PerfPage from "../../preview/performance-shell";
import PerfMenuLive from "../../preview/performance-menu-live";
import TotalsApp from "../../preview/performance-totals/TotalsApp";
import { MENU_H, MENU_INSET } from "../../preview/performance-ui";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsTotalsPage() {
  const bets = await loadUserBets();
  return (
    <PerfPage live>
      <Suspense fallback={<div className={`${MENU_INSET} ${MENU_H}`} />}>
        <PerfMenuLive active="totals" routes={LIVE_ROUTES} />
      </Suspense>

      <Suspense fallback={null}>
        <TotalsApp bets={bets} routes={LIVE_ROUTES} />
      </Suspense>
    </PerfPage>
  );
}
