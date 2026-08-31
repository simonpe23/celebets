// PERFORMANCE HOME, LIVE. The rebuilt Performance area took over the
// `/stats` address; today's old page moved to `/stats-old` and is
// still reachable with his real numbers, his ruling of 31 August 2026.
//
// The page itself is the same component the public preview draws. The
// only difference is what it is handed: the preview gets demo bets,
// this gets the signed in user's own, and the addresses its links
// point at come from LIVE_ROUTES instead of the preview set.

import HomeApp from "../preview/performance-home/HomeApp";
import { loadUserBets } from "@/lib/load-bets";
import { LIVE_ROUTES } from "@/lib/performance-routes";

export default async function StatsPage() {
  const bets = await loadUserBets();
  return <HomeApp bets={bets} routes={LIVE_ROUTES} live />;
}
