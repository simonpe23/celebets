// Performance Lab, live, on the signed in user's own bets.

import { Suspense } from "react";
import PerfPage from "../../preview/performance-shell";
import PerfMenuLive from "../../preview/performance-menu-live";
import LabApp from "../../preview/performance-lab/LabApp";
import { MENU_H, MENU_INSET, TAIL_TALL } from "../../preview/performance-ui";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsLabPage() {
  const bets = await loadUserBets();
  return (
    <PerfPage live tail={TAIL_TALL}>
      <Suspense fallback={<div className={`${MENU_INSET} ${MENU_H}`} />}>
        <PerfMenuLive active="lab" routes={LIVE_ROUTES} />
      </Suspense>

      <Suspense fallback={null}>
        <LabApp bets={bets} routes={LIVE_ROUTES} live />
      </Suspense>
    </PerfPage>
  );
}
