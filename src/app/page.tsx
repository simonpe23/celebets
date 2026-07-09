import { createClient } from "@/lib/supabase/server";
import WalletCard from "@/components/WalletCard";
import NewBetForm from "@/components/NewBetForm";
import Recommendations from "@/components/Recommendations";
import LiveBets from "@/components/LiveBets";
import StatsRow from "@/components/StatsRow";
import BetHistory from "@/components/BetHistory";
import type { BetWithLegs, Sport } from "@/lib/types";

// Settled bets stay on a Live now card with Undo for this long.
const UNDO_WINDOW_MS = 15 * 60 * 1000;

interface Props {
  searchParams: Promise<{ repeat?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { repeat } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: transactions }, { data: bets }] = await Promise.all([
    supabase.from("transactions").select("type, amount"),
    supabase
      .from("bets")
      .select(
        "id, stake, total_odds, status, placed_at, settled_at, payout, legs (id, sport, description, odds, result, subcategory)"
      )
      .order("placed_at", { ascending: false }),
  ]);

  const allTransactions = transactions ?? [];
  const allBets = (bets ?? []) as BetWithLegs[];

  const deposits = allTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = allTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalStaked = allBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const totalPayouts = allBets
    .filter((b) => b.status === "won")
    .reduce((sum, b) => sum + Number(b.payout ?? 0), 0);

  const balance = deposits - withdrawals - totalStaked + totalPayouts;
  const netProfit = balance + withdrawals - deposits;

  // Defaults that pre-fill the form: last stake, most used sport.
  const defaultStake =
    allBets.length > 0 ? String(Number(allBets[0].stake)) : "";
  const sportCounts = new Map<Sport, number>();
  for (const bet of allBets) {
    for (const leg of bet.legs) {
      sportCounts.set(leg.sport, (sportCounts.get(leg.sport) ?? 0) + 1);
    }
  }
  let defaultSport: Sport | null = null;
  for (const [sport, count] of sportCounts) {
    if (defaultSport === null || count > (sportCounts.get(defaultSport) ?? 0)) {
      defaultSport = sport;
    }
  }

  // Repeat bet: pre-fill the form from an existing bet's id.
  const repeatBet = repeat
    ? (allBets.find((b) => b.id === repeat) ?? null)
    : null;

  const now = Date.now();
  const liveBets = allBets.filter(
    (b) =>
      b.status === "pending" ||
      b.legs.some((leg) => leg.result === "pending") ||
      (b.settled_at &&
        now - new Date(b.settled_at).getTime() < UNDO_WINDOW_MS)
  );
  const settledBets = allBets
    .filter((b) => b.status !== "pending")
    .sort(
      (a, b) =>
        new Date(b.settled_at ?? 0).getTime() -
        new Date(a.settled_at ?? 0).getTime()
    );

  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Celebets</h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
            >
              Log out
            </button>
          </form>
        </header>

        <WalletCard
          balance={balance}
          netProfit={netProfit}
          userId={user!.id}
        />

        <NewBetForm
          key={repeatBet?.id ?? "fresh"}
          defaultStake={defaultStake}
          defaultSport={defaultSport}
          repeatBet={
            repeatBet
              ? {
                  stake: String(Number(repeatBet.stake)),
                  legs: repeatBet.legs.map((leg) => ({
                    sport: leg.sport,
                    subcategory: leg.subcategory,
                  })),
                }
              : null
          }
        />

        <Recommendations bets={settledBets} />

        <LiveBets bets={liveBets} />

        <StatsRow bets={settledBets} />

        <BetHistory bets={settledBets} />
      </div>
    </main>
  );
}
