// The Heat Map preview shell. The page column, the face and the
// floating tab bar all come from `../performance-shell`, which every
// Performance page shares; this file is only what the Heat Map adds.
//
// Its own screen, reached from the Heat Map pill on Home, with a back
// arrow that returns there. The heat map lives on Home and nowhere
// else for now, his ruling of 26 August 2026.

import { Suspense } from "react";
import PerfPage from "../performance-shell";
import HeatmapApp from "./HeatmapApp";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceHeatmapPreview() {
  return (
    <PerfPage>
      <Suspense fallback={null}>
        <HeatmapApp bets={labBets} />
      </Suspense>
    </PerfPage>
  );
}
