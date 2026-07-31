import WalletCard from "@/components/WalletCard";
import StatsRow from "@/components/StatsRow";
import NewBetForm from "@/components/NewBetForm";
import LiveBets from "@/components/LiveBets";
import BetHistory from "@/components/BetHistory";
import Wordmark from "@/components/Wordmark";
import type { BetWithLegs } from "@/lib/types";

const bets: BetWithLegs[] = [
  {
    id: "1", stake: 100, total_odds: 1.66, status: "pending",
    placed_at: "2026-07-30T12:00:00Z", settled_at: null, payout: null,
    cashed_out: false, bet_buys: [],
    legs: [
      { id: "a", sport: "Football", description: "France advances", odds: 1.31, result: "pending", subcategory: "Win-bet / Moneyline" },
      { id: "b", sport: "Football", description: "Mbappe 1+ goals", odds: 1.26, result: "pending", subcategory: "Player Props: Goalscorer" },
    ],
  },
  {
    id: "2", stake: 50, total_odds: 3.52, status: "won",
    placed_at: "2026-07-29T12:00:00Z", settled_at: "2026-07-30T09:00:00Z",
    payout: 176, cashed_out: false, bet_buys: [],
    legs: [{ id: "c", sport: "Tennis", description: "Mochizuki", odds: 3.52, result: "won", subcategory: null }],
  },
  {
    id: "3", stake: 80, total_odds: 2.4, status: "lost",
    placed_at: "2026-07-28T12:00:00Z", settled_at: "2026-07-29T09:00:00Z",
    payout: null, cashed_out: false, bet_buys: [],
    legs: [{ id: "d", sport: "Basketball", description: "Lakers ML", odds: 2.4, result: "lost", subcategory: null }],
  },
];

export default function PreviewPage() {
  const settled = bets.filter((b) => b.status !== "pending");
  const live = bets.filter((b) => b.status === "pending");
  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between">
          <h1><Wordmark className="text-2xl" /></h1>
          <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium">Log out</button>
        </header>
        <WalletCard balance={2657.39} netProfit={1361.39} userId="preview" settledBets={settled} />
        <StatsRow bets={settled} />
        <NewBetForm lastStake="100" />
        <LiveBets bets={live} />
        <BetHistory bets={settled} />
      </div>
    </main>
  );
}
