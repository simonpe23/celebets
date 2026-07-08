import { createClient } from "@/lib/supabase/server";
import WalletCard from "@/components/WalletCard";
import NewBetForm from "@/components/NewBetForm";
import PendingBets from "@/components/PendingBets";
import type { BetWithLegs } from "@/lib/types";

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
        "id, stake, total_odds, status, placed_at, settled_at, payout, legs (id, sport, description, odds, result)"
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

  const pendingBets = allBets.filter((b) => b.status === "pending");

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

        <NewBetForm />

        <PendingBets bets={pendingBets} />
      </div>
    </main>
  );
}
