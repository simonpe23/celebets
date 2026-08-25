import { createClient } from "@/lib/supabase/server";
import AllInsights from "@/components/AllInsights";
import { isSubject, type BetWithLegs, type Sport } from "@/lib/types";

interface Props {
  searchParams: Promise<{ sport?: string }>;
}

export default async function InsightsPage({ searchParams }: Props) {
  const { sport: sportParam } = await searchParams;
  // Any valid subject, not just sports: ?sport=Crypto has to keep
  // working now that Crypto is filed under Economics.
  const sport: Sport | null = isSubject(sportParam) ? sportParam : null;

  const supabase = await createClient();
  const { data: bets } = await supabase
    .from("bets")
    .select(
      "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory, market, period, competition, provider_market), bet_buys (id, amount, payout, created_at)"
    )
    .order("placed_at", { ascending: false });

  return <AllInsights bets={(bets ?? []) as BetWithLegs[]} sport={sport} />;
}
