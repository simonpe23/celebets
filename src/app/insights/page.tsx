import { createClient } from "@/lib/supabase/server";
import AllInsights from "@/components/AllInsights";
import { SPORTS, type BetWithLegs, type Sport } from "@/lib/types";

interface Props {
  searchParams: Promise<{ sport?: string }>;
}

export default async function InsightsPage({ searchParams }: Props) {
  const { sport: sportParam } = await searchParams;
  const sport = (SPORTS as readonly string[]).includes(sportParam ?? "")
    ? (sportParam as Sport)
    : null;

  const supabase = await createClient();
  const { data: bets } = await supabase
    .from("bets")
    .select(
      "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory), bet_buys (id, amount, payout, created_at)"
    )
    .order("placed_at", { ascending: false });

  return <AllInsights bets={(bets ?? []) as BetWithLegs[]} sport={sport} />;
}
