import { createClient } from "@/lib/supabase/server";
import StatsView from "@/components/StatsView";
import type { BetWithLegs } from "@/lib/types";

export default async function StatsPage() {
  const supabase = await createClient();

  const { data: bets } = await supabase
    .from("bets")
    .select(
      "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory), bet_buys (id, amount, payout, created_at)"
    )
    .order("placed_at", { ascending: false });

  return <StatsView bets={(bets ?? []) as BetWithLegs[]} />;
}
