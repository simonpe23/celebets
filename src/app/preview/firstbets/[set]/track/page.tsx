// The Track tab, drawn against one of the first-days records.
//
// It mirrors src/app/app/page.tsx's arithmetic exactly, including the
// part that reads badly on day one: a pending stake has already left
// the balance, so net profit shows a loss the user has not made. That
// is the app's one definition of net profit and the preview must obey
// it, or this page would hide the very thing it exists to show.

import { notFound } from "next/navigation";
import HomeDashboard from "@/components/HomeDashboard";
import TabBar from "@/components/TabBar";
import { COLUMN, PAGE } from "@/lib/ui";
import { netProfitOf, pendingStakeOf } from "@/lib/stats";
import { SETS, isFirstBetsKey } from "../../data";

// A new user who has set a tracking balance. Zero would hide the
// balance card's normal state behind its no-balance state, and both
// are worth looking at: `?balance=0` draws the other one.
const DEPOSITS = 500;

export default async function FirstBetsTrack({
  params,
  searchParams,
}: {
  params: Promise<{ set: string }>;
  searchParams: Promise<{ balance?: string }>;
}) {
  const { set } = await params;
  const { balance: balanceParam } = await searchParams;
  if (!isFirstBetsKey(set)) notFound();

  const bets = SETS[set];
  const deposits = balanceParam === "0" ? 0 : DEPOSITS;

  const staked = bets.reduce((sum, b) => sum + Number(b.stake), 0);
  const payouts = bets.reduce((sum, b) => sum + Number(b.payout ?? 0), 0);
  const balance = deposits - staked + payouts;
  // Settled bets only, his ruling of 2 September 2026, and the stake
  // riding on the rest shown beside it so the three figures add up.
  const netProfit = netProfitOf(bets);
  const riding = pendingStakeOf(bets);

  const liveBets = bets.filter(
    (b) => b.status === "pending" || b.legs.some((l) => l.result === "pending")
  );

  return (
    <main className={`relative ${PAGE}`}>
      <div className={COLUMN}>
        <HomeDashboard
          bets={bets}
          liveBets={liveBets}
          balance={balance}
          netProfit={netProfit}
          startedWith={balance + riding - netProfit}
          riding={riding}
          trackingSince={null}
          hasBalance={deposits > 0}
          lastStake={bets.length > 0 ? String(Number(bets[0].stake)) : ""}
          userId="preview"
          connectedPlatforms={[]}
        />
      </div>
      <TabBar activeHref="/app" />
    </main>
  );
}
