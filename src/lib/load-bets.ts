// The signed in user's own bets, for the live Performance pages.
//
// It exists so the query is written ONCE. Six live pages need the same
// rows, and six copies of a select string is six chances for one page
// to fetch a column the others do not and quietly disagree with them.
//
// Row level security does the scoping: the query asks for "the bets"
// and the database returns only the bets of whoever is signed in. No
// page filters by user, so no page can forget to.

import { createClient } from "@/lib/supabase/server";
import type { BetWithLegs } from "@/lib/types";

export async function loadUserBets(): Promise<BetWithLegs[]> {
  const supabase = await createClient();
  // The column list is written out rather than built from a constant:
  // Supabase infers the row type from the literal, and a concatenated
  // string turns that inference off.
  const { data } = await supabase
    .from("bets")
    .select(
      "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory, market, period, competition, provider_market), bet_buys (id, amount, payout, created_at)"
    )
    .order("placed_at", { ascending: false });
  return (data ?? []) as BetWithLegs[];
}
