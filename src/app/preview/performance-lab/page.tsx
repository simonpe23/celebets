// The new Performance Lab, built piece by piece on the accepted Home's
// design. The owner's ruling, 29 August 2026: "the lab page has to
// follow Home's design and style."
//
// This file is only what Lab adds. The page column, the face and the
// floating tab bar come from `../performance-shell`, and the top menu
// from `../performance-menu-live`, both shared by every Performance
// page. The living page, the tray, the answer panel and the six chip
// groups, is LabApp.tsx.
//
// Two Suspense boundaries: the menu reads the period from the address
// and LabApp reads the selection from it, which is how Home's taps
// hand a fact over.

import { Suspense } from "react";
import PerfPage from "../performance-shell";
import PerfMenuLive from "../performance-menu-live";
import LabApp from "./LabApp";
import { MENU_H, MENU_INSET, TAIL_TALL } from "../performance-ui";
import { labBets } from "./lab-data";

export default function PerformanceLabPreview() {
  return (
    <PerfPage tail={TAIL_TALL}>
      <Suspense fallback={<div className={`${MENU_INSET} ${MENU_H}`} />}>
        <PerfMenuLive active="lab" />
      </Suspense>

      <Suspense fallback={null}>
        <LabApp bets={labBets} />
      </Suspense>
    </PerfPage>
  );
}
