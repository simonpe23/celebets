// The PUBLIC preview of Performance Home. It draws the same component
// the live page draws, over demo bets, because a preview is public by
// his ruling of 28 August 2026 and must never carry real user data.

import HomeApp from "./HomeApp";
import { labBets } from "../performance-lab/lab-data";

export default function PerformanceHomePreview() {
  return <HomeApp bets={labBets} />;
}
