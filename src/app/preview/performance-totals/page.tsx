// The Performance Totals shell, built to his sheet "2. Totals.png",
// 29 August 2026. The living page is TotalsApp.tsx.
//
// This file is only what Totals adds. The page column, the face and
// the floating tab bar come from `../performance-shell`, and the top
// menu from `../performance-menu-live`, both shared by every
// Performance page.

import { Suspense } from "react";
import PerfPage from "../performance-shell";
import PerfMenuLive from "../performance-menu-live";
import TotalsApp from "./TotalsApp";
import { MENU_H, MENU_INSET } from "../performance-ui";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceTotalsPreview() {
  return (
    <PerfPage>
      <Suspense fallback={<div className={`${MENU_INSET} ${MENU_H}`} />}>
        <PerfMenuLive active="totals" />
      </Suspense>

      <Suspense fallback={null}>
        <TotalsApp bets={labBets} />
      </Suspense>
    </PerfPage>
  );
}
