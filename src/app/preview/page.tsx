import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import Greeting from "@/components/Greeting";
import HomeDashboard from "@/components/HomeDashboard";
import KalshiAutoSync from "@/components/KalshiAutoSync";
import TabBar from "@/components/TabBar";
import { previewBets, DEPOSITS } from "./data";

// The Track page. Mirrors src/app/app/page.tsx: change one and change
// the other, or the preview lies.
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ since?: string; connected?: string }>;
}) {
  const { since, connected } = await searchParams;
  const live = previewBets.filter((b) => b.status === "pending");

  // Derived, never typed in. Net profit has one definition in this app
  // and the preview must obey it too, or the shots show a balance that
  // does not follow from the bets under it.
  const staked = previewBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const payouts = previewBets.reduce((sum, b) => sum + Number(b.payout ?? 0), 0);
  const netProfit = Math.round((payouts - staked) * 100) / 100;
  const balance = Math.round((DEPOSITS + netProfit) * 100) / 100;

  return (
    <main className="relative flex min-h-svh flex-col px-4 pt-6 pb-2 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 dark:hidden"
        style={{
          background:
            "radial-gradient(360px 200px at 80% -60px, rgba(124,58,237,0.10), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-64 dark:block"
        style={{
          background:
            "radial-gradient(360px 200px at 80% -60px, rgba(154,87,252,0.14), transparent 70%)",
        }}
      />
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="flex items-center gap-2.5">
          <BrandMark size={26} />
          <div className="min-w-0 flex-1">
            <Greeting name="Simon" />
          </div>
          <Link
            href="/settings"
            title="Settings"
            aria-label="Settings"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-neutral-500 ring-1 ring-neutral-900/[0.06] dark:bg-[#0E1228] dark:text-neutral-400 dark:ring-white/[0.07]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </Link>
        </header>

        <HomeDashboard
          bets={previewBets}
          liveBets={live}
          balance={balance}
          netProfit={netProfit}
          startedWith={DEPOSITS}
          trackingSince={since ?? null}
          hasBalance={true}
          lastStake="500"
          userId="preview"
          connectedPlatforms={connected ? ["kalshi"] : []}
        />

        {/* Mirrors the real page; never syncs here, there is no
            session to sync with. ?connected=1 also shows the synced
            line, frozen, for screenshots. */}
        <KalshiAutoSync
          connected={false}
          demoNote={
            connected ? "Synced with Kalshi: 2 bets updated" : null
          }
        />
      </div>
      <TabBar activeHref="/app" />
    </main>
  );
}
