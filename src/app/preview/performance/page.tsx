import StatsView from "@/components/StatsView";
import { previewBets, DEPOSITS } from "../data";

// The Performance page. Mirrors src/app/stats/page.tsx: change one and
// change the other, or the preview lies.
// ?since=2026-08-01 draws a fresh start line, so the switch and the
// captions can be seen without a database.
export default async function PerformancePreview({
  searchParams,
}: {
  searchParams: Promise<{ since?: string }>;
}) {
  const { since } = await searchParams;
  // Computed the same way the real page computes it, from a made up
  // starting balance, so the Snapshot's Net Profit is the app's one
  // definition rather than a settled-only recount.
  const staked = previewBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const payouts = previewBets.reduce(
    (sum, b) => sum + Number(b.payout ?? 0),
    0
  );
  const balance = DEPOSITS - staked + payouts;
  const netProfit = Math.round((balance - DEPOSITS) * 100) / 100;

  return <StatsView
      bets={previewBets}
      netProfit={netProfit}
      trackingSince={since ?? null}
      activeHref="/stats"
    />;
}
