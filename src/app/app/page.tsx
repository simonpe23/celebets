import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Disclaimer from "@/components/Disclaimer";
import HomeDashboard from "@/components/HomeDashboard";
import TabBar from "@/components/TabBar";
import Wordmark from "@/components/Wordmark";
import type { BetWithLegs } from "@/lib/types";

// Settled bets stay on a pending card with Undo for this long.
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
  // What the user put in. startedWith + netProfit = balance, and
  // showing the parts is what makes the balance readable.
  const startedWith = deposits - withdrawals;

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

  // Google sign in provides a full name. Email accounts have none, and
  // a mangled email prefix is worse than no name, so those greet bare.
  const fullName = user?.user_metadata?.full_name as string | undefined;
  const name = fullName ? fullName.split(" ")[0] : null;

  return (
    <main className="min-h-dvh px-4 pt-6 pb-32 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <h1>
            <Wordmark className="text-2xl" />
          </h1>
          <span className="flex items-center gap-3">
            <span
              className="text-neutral-500 dark:text-neutral-400"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </span>
          {/* The avatar opens Settings. It used to be the log out
              button, so one stray tap ended the session. Log out now
              lives at the foot of Settings. */}
          <Link
            href="/settings"
            title="Settings"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-top text-sm font-bold text-white"
          >
            {(name ?? "C").charAt(0).toUpperCase()}
          </Link>
          </span>
        </header>

        <HomeDashboard
          bets={allBets}
          liveBets={liveBets}
          balance={balance}
          netProfit={netProfit}
          startedWith={startedWith}
          hasBalance={allTransactions.length > 0}
          lastStake={lastStake}
          userId={user!.id}
          name={name}
        />

        <Disclaimer />
      </div>
      <TabBar />
    </main>
  );
}
