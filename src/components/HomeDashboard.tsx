import BalanceCard from "@/components/BalanceCard";
import InsightCard from "@/components/InsightCard";
import LiveBets from "@/components/LiveBets";
import BetHistory from "@/components/BetHistory";
import NewBetForm from "@/components/NewBetForm";
import SnapshotCard from "@/components/SnapshotCard";
import { round2 } from "@/lib/format";
import { betProfit, sinceLine } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
  liveBets: BetWithLegs[];
  balance: number;
  netProfit: number;
  startedWith: number;
  // The fresh start line, or null. Everything the user judges
  // themselves on counts from here: the balance line, the snapshot,
  // and the insights.
  trackingSince: string | null;
  hasBalance: boolean;
  lastStake: string;
  userId: string;
}

// The Track page, built to the owner's mockup (August 2026): greeting,
// balance, the four ways to capture a bet, insight of the day, the
// performance snapshot, then what is pending. History and charts live
// on Performance, one tab away.
export default function HomeDashboard({
  bets,
  liveBets,
  balance,
  netProfit,
  startedWith,
  trackingSince,
  hasBalance,
  lastStake,
  userId,
}: Props) {
  // Everything on this page speaks in the current period. The old
  // bets are not gone, they live in the history on Performance.
  const counted = sinceLine(bets, trackingSince);

  const settled = counted
    .filter((b) => b.status !== "pending" && b.settled_at !== null)
    .sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );

  // Newest first for the history card. `settled` above is oldest
  // first, because the balance line is drawn in the order it happened.
  const settledNewestFirst = [...settled].reverse();

  // The line in the balance card: the balance after each settled
  // bet, starting from what the user put in.
  let running = startedWith;
  const series = [startedWith, ...settled.map((b) => (running = round2(running + betProfit(b))))];

  return (
    <div className="space-y-4">
      {/* The greeting lives in the page header now, beside the brand
          mark (v9.3): one row instead of a floating line. */}
      <BalanceCard
        balance={balance}
        netProfit={netProfit}
        startedWith={startedWith}
        hasBalance={hasBalance}
        betCount={settled.length}
        userId={userId}
        trackingSince={trackingSince}
        series={hasBalance ? series : undefined}
        settledBets={settled}
      />

      <NewBetForm lastStake={lastStake} compact />

      <InsightCard bets={counted} />

      <SnapshotCard bets={counted} netProfit={netProfit} />

      <LiveBets bets={liveBets} />

      {/* What just finished, under what is still riding, so the page
          reads forward in time. The SAME component Performance uses,
          capped at ten: the owner wants settling, date edits and
          deletes to work in both places, and both pages re-read from
          the server after any of them. */}
      <BetHistory bets={settledNewestFirst} limit={10} />
    </div>
  );
}
