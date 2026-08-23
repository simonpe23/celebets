import type { BetWithLegs } from "@/lib/types";
import { performanceBets, pendingBets } from "./performance/data";

// Local design preview data only. This folder is gitignored so it
// never reaches production.
//
// Track and Performance now share ONE account. The settled bets live
// in ./performance/data.ts because Key Insights needs five settled
// picks in a group before it will call anything a strength or a
// weakness, and the old thin Track fixture sat under that line.
// Two fixtures meant two different records in the same product
// photo, which is exactly the mistake a marketing shot must not make.
export const previewBets: BetWithLegs[] = [
  ...pendingBets,
  ...performanceBets,
];

export { DEPOSITS } from "./performance/data";
