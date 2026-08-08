import { createClient } from "@/lib/supabase/server";
import StatsView from "@/components/StatsView";
import { netProfitOf, sinceLine } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";

export default async function StatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: transactions }, { data: bets }] = await Promise.all([
    supabase.from("transactions").select("type, amount"),
    supabase
      .from("bets")
      .select(
        "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory), bet_buys (id, amount, payout, created_at)"
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
  const allTimeProfit = balance + withdrawals - deposits;
  const netProfit = trackingSince
    ? netProfitOf(sinceLine(allBets, trackingSince))
    : allTimeProfit;

  return (
    <StatsView
      bets={allBets}
      netProfit={netProfit}
      trackingSince={trackingSince}
    />
  );
}
