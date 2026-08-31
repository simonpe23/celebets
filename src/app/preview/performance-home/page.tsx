// The PUBLIC preview of Performance. Home, Lab and Totals are one
// page with three tabs, the same component the live pages render, over
// demo bets because a preview is public by his ruling.

import PerfArea from "../performance-area";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceHomePreview() {
  return <PerfArea bets={labBets} initial="home" />;
}
