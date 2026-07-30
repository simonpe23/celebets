import { createClient } from "@/lib/supabase/server";
import WalletCard from "@/components/WalletCard";
import NewBetForm from "@/components/NewBetForm";
import LiveBets from "@/components/LiveBets";
import StatsRow from "@/components/StatsRow";
import BetHistory from "@/components/BetHistory";
import type { BetWithLegs } from "@/lib/types";

// Settled bets stay on a Live now card with Undo for this long.
const UNDO_WINDOW_MS = 15 * 60 * 1000;

export default async function HomePage() {
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

  const deposits = allTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = allTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalStaked = allBets.reduce((sum, b) => sum + Number(b.stake), 0);
  // Payouts exist on won bets and on cashed out bets (even lost ones).
  const totalPayouts = allBets.reduce(
    (sum, b) => sum + Number(b.payout ?? 0),
    0
  );

  const balance = deposits - withdrawals - totalStaked + totalPayouts;
  const netProfit = balance + withdrawals - deposits;

  // The most recent stake, shown only as a quick chip under the
  // stake field. The form itself always opens blank.
  const lastStake =
    allBets.length > 0 ? String(Number(allBets[0].stake)) : "";

  const now = Date.now();
  // Cashed out bets are done: they only linger for the short undo
  // window, never because of unsettled picks.
  const liveBets = allBets.filter(
    (b) =>
      b.status === "pending" ||
      (!b.cashed_out && b.legs.some((leg) => leg.result === "pending")) ||
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
          <h1 className="text-2xl font-bold tracking-tight">Celebet</h1>
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
          settledBets={settledBets}
        />

        <StatsRow bets={settledBets} />

        <NewBetForm lastStake={lastStake} />

        <LiveBets bets={liveBets} />

        <BetHistory bets={settledBets} />
      </div>
    </main>
  );
}
