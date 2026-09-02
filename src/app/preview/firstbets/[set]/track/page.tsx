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
import { balanceOf, netProfitOf } from "@/lib/stats";
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

  // Settled bets only, his ruling of 2 September 2026. An open bet
  // moves neither figure until it settles, so the two add up with
  // nothing extra on screen.
  const netProfit = netProfitOf(bets);
  const balance = balanceOf(bets, deposits, 0);

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
          startedWith={balance - netProfit}
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
