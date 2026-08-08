import Link from "next/link";
import Sparkline from "@/components/Sparkline";
import { round2 } from "@/lib/format";
import { sportRows, totals } from "@/lib/stats";
import { SPORT_EMOJI, type BetWithLegs } from "@/lib/types";
import { CARD, CARD_LINK } from "@/lib/ui";

// The Performance Snapshot: four all time figures with the shape each
// one made getting here. A taste of the Performance page, not a copy
// of it, which is why every corner of the card leads there.
//
// Best Sport shows profit, not ROI. Per sport ROI does not exist yet:
// a parlay's stake covers several sports and there is no agreed rule
// for splitting it (see CLAUDE.md). The mockup showed ROI there, and
// showing a number we cannot compute honestly is worse than showing
// the one we can.

// Each point is the figure as it stood after that bet settled.
function series(
  bets: BetWithLegs[],
  kind: "profit" | "roi" | "hitRate"
): number[] {
  const ordered = [...bets].sort(
    (a, b) =>
      new Date(a.settled_at ?? 0).getTime() -
      new Date(b.settled_at ?? 0).getTime()
  );

  const out: number[] = [];
  let wins = 0;
  let decided = 0;
  let staked = 0;
  let returned = 0;

  for (const bet of ordered) {
    if (bet.status === "won") wins += 1;
    if (bet.status === "won" || bet.status === "lost") decided += 1;
    staked += Number(bet.stake);
    returned += Number(bet.payout ?? 0);

    if (kind === "profit") out.push(returned - staked);
    else if (kind === "roi")
      out.push(staked === 0 ? 0 : ((returned - staked) / staked) * 100);
    else out.push(decided === 0 ? 0 : (wins / decided) * 100);
  }
  return out;
}

// Whole dollars, the mockup's density: "+$418", not "+$418.26". The
// exact figure lives one tap away on Performance.
function short(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "$0";
  const sign = rounded < 0 ? "-" : "+";
  return `${sign}$${Math.abs(rounded).toLocaleString("en-US")}`;
}

const LABEL = "text-xs text-neutral-500 dark:text-neutral-400";

const moneyTone = (value: number) =>
  value > 0
    ? "text-emerald-600 dark:text-emerald-400"
    : value < 0
      ? "text-red-600 dark:text-red-400"
      : "";

// netProfit comes from the page, not from the settled bets, because
// the app has ONE definition of net profit (balance + removals minus
// additions) and it counts money still riding on pending bets. The
// settled-only figure can sit hundreds of dollars away from the number
// on the balance card, and two values under one label is a bug.
export default function SnapshotCard({
  bets,
  netProfit,
  // On Track the whole card leads to Performance. On Performance it is
  // already there, so the link would point at itself.
  linked = true,
}: {
  bets: BetWithLegs[];
  netProfit: number;
  linked?: boolean;
}) {
  const settled = bets.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );
  if (settled.length === 0) return null;

  const t = totals(settled);
  const profit = round2(netProfit);
  const wins = settled.filter((b) => b.status === "won").length;
  const losses = settled.filter((b) => b.status === "lost").length;
  const decided = wins + losses;
  const hitRate = decided === 0 ? null : Math.round((wins / decided) * 100);
  const best = sportRows(settled)
    .filter((row) => row.wins + row.losses > 0)
    .sort((a, b) => b.profit - a.profit)[0];

  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-bold">Performance Snapshot</h2>
        {linked ? (
          <Link
            href="/stats"
            className={CARD_LINK}
          >
            View all ›
          </Link>
        ) : (
          <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
            All time
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 divide-x divide-neutral-200 dark:divide-white/10">
        <div className="pr-2">
          <p className={LABEL}>Net Profit</p>
          <p
            className={`mt-1 font-money text-lg font-bold tabular-nums ${moneyTone(profit)}`}
          >
            {short(profit)}
          </p>
          <div className="mt-2">
            <Sparkline
              points={series(settled, "profit")}
              positive={profit >= 0}
              className="h-5"
              fill="none"
            />
          </div>
        </div>

        <div className="px-2">
          <p className={LABEL}>ROI</p>
          <p
            className={`mt-1 font-money text-lg font-bold tabular-nums ${moneyTone(t.roi ?? 0)}`}
          >
            {t.roi === null
              ? "-"
              : `${t.roi >= 0 ? "+" : ""}${t.roi.toFixed(1)}%`}
          </p>
          <div className="mt-2">
            <Sparkline
              points={series(settled, "roi")}
              positive={(t.roi ?? 0) >= 0}
              className="h-5"
              fill="none"
            />
          </div>
        </div>

        <div className="px-2">
          <p className={LABEL}>Win Rate</p>
          <p className="mt-1 font-money text-lg font-bold tabular-nums">
            {hitRate === null ? "-" : `${hitRate}%`}
          </p>
          <div className="mt-2">
            <Sparkline
              points={series(settled, "hitRate")}
              tone="neutral"
              className="h-5"
              fill="none"
            />
          </div>
        </div>

        <div className="pl-2">
          <p className={LABEL}>Best Sport</p>
          {best ? (
            <>
              {/* Wraps rather than truncates. A quarter of the card is
                  not wide enough for "American Football", and cutting a
                  sport's name to "Americ..." is worse than two lines. */}
              <p className="mt-1 text-sm font-bold leading-tight">
                {SPORT_EMOJI[best.sport]} {best.sport}
              </p>
              <p
                className={`mt-1 font-money text-xs tabular-nums ${moneyTone(best.profit)}`}
              >
                {short(best.profit)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm font-bold">-</p>
          )}
        </div>
      </div>
    </section>
  );
}
