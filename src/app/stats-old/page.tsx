// TODAY'S PERFORMANCE PAGE, KEPT ALIVE AT ITS OWN ADDRESS.
//
// His ruling, 31 August 2026, after he had to say it three times: "I
// have said this many times: want today's /stats to be reachable with
// my numbers in the future. that's all i want." So when the rebuilt
// Performance took over `/stats`, this page moved here rather than
// dying. Same code, same real numbers, design untouched. It stays
// until he retires it himself.
//
// The tab bar still marks Performance as the active tab, because that
// is which part of the app this is.

import { createClient } from "@/lib/supabase/server";
import StatsView from "@/components/StatsView";
import { netProfitOf, sinceLine } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";

export default async function StatsPage() {
  const supabase = await createClient();

  // getUser sits INSIDE the Promise.all, not before it.
  //
  // It is a network call to Supabase's auth server, and it used to be
  // awaited on its own line, so every tab tap paid for that round trip
  // and then started fetching the bets. Two waits, one after the other,
  // for two things that do not depend on each other. Now they run
  // together and the page arrives a round trip sooner.
  const [
    {
      data: { user },
    },
    { data: transactions },
    { data: bets },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("transactions").select("type, amount"),
    supabase
      .from("bets")
      .select(
        "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory, market, period, competition, provider_market), bet_buys (id, amount, payout, created_at)"
      )
      .order("placed_at", { ascending: false }),
  ]);

  const allTransactions = transactions ?? [];
  const allBets = (bets ?? []) as BetWithLegs[];

  // The app's ONE definition of net profit, computed here exactly as
  // the Track page computes it. The Performance Snapshot shows the same
  // number on both pages or it is a bug.
  const deposits = allTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = allTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalStaked = allBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const totalPayouts = allBets.reduce(
    (sum, b) => sum + Number(b.payout ?? 0),
    0
  );

  const balance = deposits - withdrawals - totalStaked + totalPayouts;

  // The fresh start line. See src/lib/stats.ts. The Snapshot must show
  // the same number as the Track page, so both derive it the same way.
  const trackingSince =
    (user?.user_metadata?.tracking_since as string | undefined) ?? null;
  // SETTLED BETS ONLY, his ruling of 2 September 2026, the same rule
  // Track uses. Both branches go through `netProfitOf` so this page and
  // Track cannot print two different net profits, which is the whole
  // reason the comment above says they derive it the same way. It used
  // to be `balance + withdrawals - deposits`, which counts a running
  // bet's stake as if it had already lost.
  const netProfit = netProfitOf(
    trackingSince ? sinceLine(allBets, trackingSince) : allBets
  );

  return (
    <StatsView
      activeHref="/stats"
      bets={allBets}
      netProfit={netProfit}
      trackingSince={trackingSince}
    />
  );
}
