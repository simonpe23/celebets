import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BrandMark from "@/components/BrandMark";
import Disclaimer from "@/components/Disclaimer";
import Greeting from "@/components/Greeting";
import HomeDashboard from "@/components/HomeDashboard";
import KalshiAutoSync from "@/components/KalshiAutoSync";
import TabBar from "@/components/TabBar";
import { netProfitOf, pendingStakeOf, sinceLine } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import {
  COLUMN,
  PAGE,
} from "@/lib/ui";

// Settled bets stay on a pending card with Undo for this long.
const UNDO_WINDOW_MS = 15 * 60 * 1000;

export default async function HomePage() {
  const supabase = await createClient();
  // getUser sits INSIDE the Promise.all, not before it.
  //
  // It is a network call to Supabase's auth server, and it used to be
  // awaited on its own line, so every tab tap paid for that round trip
  // and then started fetching the bets. Two waits, one after the other,
  // for two things that do not depend on each other. Now they run
  // together and the page arrives a round trip sooner.
  const [
    {
      data: { user },
    },
    { data: transactions },
    { data: bets },
    { data: connections },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("transactions").select("type, amount"),
    supabase
      .from("bets")
      .select(
        "id, stake, total_odds, status, placed_at, settled_at, payout, cashed_out, legs (id, sport, description, odds, result, subcategory, market, period, competition, provider_market), bet_buys (id, amount, payout, created_at)"
      )
      .order("placed_at", { ascending: false }),
    supabase.from("connected_accounts").select("platform"),
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

  // THE FRESH START LINE. With no line, net profit is the all time
  // figure: balance plus removals minus additions, which equals
  // everything paid out minus everything staked. With a line, it is
  // the same sum over the bets that were not already settled before
  // it. The two formulas agree when there is no line, so nothing
  // moves for a user who never starts fresh.
  const trackingSince =
    (user?.user_metadata?.tracking_since as string | undefined) ?? null;
  const counted = sinceLine(allBets, trackingSince);
  // SETTLED BETS ONLY, his ruling of 2 September 2026. `netProfitOf`
  // carries the rule and the reasoning; both branches go through it
  // now, so the fresh start line and the all time figure cannot drift
  // apart. It used to read `balance + withdrawals - deposits`, which
  // counts a running bet's stake as if it had already lost.
  const netProfit = netProfitOf(trackingSince ? counted : allBets);
  // The money between startedWith and balance. Without it on screen the
  // card's own three figures do not add up.
  const riding = pendingStakeOf(trackingSince ? counted : allBets);

  // What the user put in. startedWith + netProfit = balance always,
  // whether or not a line exists, which is what keeps the card
  // readable: the parts still add up to the total.
  // startedWith - riding + netProfit = balance, always.
  const startedWith = balance + riding - netProfit;

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
    <main className={`relative ${PAGE}`}>
      {/* A whisper of the landing's purple at the very top of the
          page, and nothing more (v9.3). Two divs because the wash is
          a different purple per theme, like the landing's. */}
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
      <div className={COLUMN}>
        {/* The v9.3 header: the A mark, the greeting, the avatar, one
            row. No wordmark, no bell, no emoji: the owner kept this
            shape through every round of the redesign. */}
        <header className="flex items-center gap-2.5">
          <BrandMark size={26} />
          <div className="min-w-0 flex-1">
            <Greeting name={name} />
          </div>
          {/* The Settings door: a gear in a quiet chip. It was an
              initial-letter avatar, and the owner called that
              semi-vague: a lone letter says who you are, not where
              the tap goes. The gear says Settings in one glance. It
              is muted, not purple: the app's one purple control per
              screen is Set balance, just below. */}
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
          bets={allBets}
          liveBets={liveBets}
          balance={balance}
          netProfit={netProfit}
          startedWith={startedWith}
          riding={riding}
          trackingSince={trackingSince}
          hasBalance={allTransactions.length > 0}
          lastStake={lastStake}
          userId={user!.id}
          connectedPlatforms={(connections ?? []).map((c) => c.platform)}
        />

        {/* Phase 4 of the sync project: opening Track syncs Kalshi by
            itself, throttled server-side. */}
        <KalshiAutoSync
          connected={(connections ?? []).some((c) => c.platform === "kalshi")}
        />

        <Disclaimer />
      </div>
      <TabBar />
    </main>
  );
}
