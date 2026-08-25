"use client";

import MicroLabel from "@/components/MicroLabel";
import { useState } from "react";
import { formatMoney, formatSignedMoney, round2 } from "@/lib/format";
import BetHistory from "@/components/BetHistory";
import HeadlineProfit from "@/components/HeadlineProfit";
import InsightCard from "@/components/InsightCard";
import KeyInsights from "@/components/KeyInsights";
import SnapshotCard from "@/components/SnapshotCard";
import TabBar from "@/components/TabBar";
import ProfitPanel, { type Period } from "@/components/ProfitPanel";
import {
  bucketRows,
  categoryRows,
  marketRows,
  periodStart,
  sportRows,
  sinceLine,
  sportTypeRows,
  totals,
  typeRows,
} from "@/lib/stats";
import {
  KALSHI_CATEGORIES,
  NOT_SPORTS,
  SPORTS,
  SPORT_EMOJI,
  type BetWithLegs,
  type Sport,
} from "@/lib/types";
import { CARD, NO_SCROLLBAR } from "@/lib/ui";

const PERIOD_LABELS: { key: Period; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "custom", label: "Custom" },
];

// The date maths lives in stats.ts, shared with the balance band's
// period strip, so "Today" here and "Today" on Track always mean the
// same range. This wrapper only adds the periods with no start.
function startFor(period: Period): Date | null {
  if (
    period === "today" ||
    period === "week" ||
    period === "month" ||
    period === "year"
  ) {
    return periodStart(period);
  }
  return null;
}

function profitColor(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-neutral-500 dark:text-neutral-400";
}

// Fixed month names, not the locale's, so the server and the phone
// never disagree and trigger a hydration mismatch.
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

// One of the six facts under the chart. `border` draws the divider on
// its left, which is how a 3 by 2 grid gets columns without drawing a
// line down the outside edge of the panel.
function Fact({
  label,
  value,
  tone,
  border = false,
}: {
  label: string;
  value: string;
  tone?: string;
  border?: boolean;
}) {
  return (
    <div
      className={`text-center ${
        border ? "border-l border-neutral-900/10 dark:border-white/10" : ""
      }`}
    >
      <MicroLabel>{label}</MicroLabel>
      <p
        className={`mt-0.5 font-money text-[17px] font-bold tabular-nums ${
          tone ?? "text-neutral-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function pctLabel(wins: number, total: number): string {
  if (total === 0) return "-";
  return `${Math.round((wins / total) * 100)}%`;
}

// PERFORMANCE IS A PERFORMANCE REVIEW, NOT A STATISTICS PAGE. Ruled by
// the owner (August 2026). Opening it must not land on graphs, so the
// page runs in two halves:
//
//   The review, all time and unfiltered:
//     Today's Insight, Key Insights, Performance Snapshot
//   The data, filtered by period and by sport:
//     the headline and chart, the tiles, the breakdowns, the history
//
// The split is stated on the page. Without it the all time snapshot
// and the filtered headline sit under one screen showing two different
// profits, which reads as a bug.
export default function StatsView({
  bets,
  netProfit,
  trackingSince,
  activeHref,
}: {
  bets: BetWithLegs[];
  // The app's ONE definition of net profit, computed by the page from
  // balance and transactions. Never recomputed here from settled bets:
  // that version ignores money still riding and disagrees with the
  // Track page by hundreds of dollars.
  netProfit: number;
  // The fresh start line, or null. Performance is the one page that
  // still shows everything: the review at the foot counts from the
  // line, and the charts have an explicit All time switch, because
  // this is exactly where a user goes to look at the old record.
  trackingSince: string | null;
  // For the local preview only, whose URL is /preview/performance and
  // would otherwise light no tab at all. The real page leaves it unset
  // and the tab bar reads the address itself.
  activeHref?: string;
}) {
  const [sport, setSport] = useState<Sport | null>(null);
  // The Sports / Not Sports split (phase 3, the owner's ruling): a
  // sports app first, so the whole-sports view is one tap, but the
  // DEFAULT stays everything, or this page's headline would disagree
  // with the Tracking Balance for anyone who bets crypto or politics.
  // A group only narrows the bet set; picking a single sport clears
  // it, so the two can never fight over one headline.
  const [group, setGroup] = useState<"all" | "sports">("all");
  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [scrub, setScrub] = useState<{ value: number; date: Date } | null>(
    null
  );
  // With a fresh start line, the charts show the current record by
  // default and this opens the whole history back up.
  const [showAllTime, setShowAllTime] = useState(false);
  // Which Per-category row is expanded into its markets.
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const inPeriodLine =
    trackingSince && !showAllTime ? sinceLine(bets, trackingSince) : bets;

  const allSettled = inPeriodLine.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );

  // Period filter, based on the date the bet settled.
  let from: Date | null = null;
  let to: Date | null = null;
  if (period === "custom") {
    from = customFrom ? new Date(customFrom + "T00:00:00") : null;
    to = customTo ? new Date(customTo + "T23:59:59.999") : null;
  } else {
    from = startFor(period);
  }

  const inPeriod = allSettled.filter((b) => {
    const settled = new Date(b.settled_at as string);
    if (from && settled < from) return false;
    if (to && settled > to) return false;
    return true;
  });

  // The group narrows first: a bet counts as Sports (or Not Sports)
  // when at least one of its picks is, the same "some pick" rule the
  // single-sport filter has always used, so a crypto + tennis parlay
  // shows up under both, whole. Then the sport filter, unchanged.
  const inGroup =
    group === "all"
      ? inPeriod
      : inPeriod.filter((b) => b.legs.some((leg) => !NOT_SPORTS.has(leg.sport)));

  // Sport filter: keep bets that contain at least one pick of the sport.
  const filtered =
    sport === null
      ? inGroup
      : inGroup.filter((b) => b.legs.some((leg) => leg.sport === sport));

  const t = totals(filtered, sport);
  const bySport = sportRows(filtered).filter(
    (row) => sport === null || row.sport === sport
  );
  const byType = typeRows(filtered);
  // With a sport selected, singles vs parlays counts only that
  // sport's picks and that sport's share of the money.
  const bySportType = sport === null ? null : sportTypeRows(filtered, sport);
  const sportTotals = sport === null ? null : bySport[0];
  const byBucket = bucketRows(filtered, sport);
  const byCategory = categoryRows(filtered, sport);
  const historyBets = [...filtered].sort(
    (a, b) =>
      new Date(b.settled_at ?? 0).getTime() -
      new Date(a.settled_at ?? 0).getTime()
  );

  // The chip rows: real sports on one, categories on the other, both
  // complete. The owner ruled against hiding chips behind whether the
  // record holds such bets: what exists is visible.
  const sportChips = SPORTS.filter((s) => !NOT_SPORTS.has(s));
  // Crypto is no longer named here: it lives inside KALSHI_CATEGORIES
  // now, and listing it twice would draw two identical chips.
  const notSportsChips = [...KALSHI_CATEGORIES, "Other"] as Sport[];

  // The hero speaks in bets with no sport chosen, and in that sport's
  // picks and money share once one is.
  // With a fresh start line, "All" means all of the CURRENT record,
  // not all of history. Saying "All time" over a filtered number was
  // the headline contradicting the caption two lines above it.
  const rawPeriodLabel =
    PERIOD_LABELS.find((p) => p.key === period)?.label ?? "All time";
  const periodLabel =
    period === "all" && trackingSince && !showAllTime
      ? "Since restart"
      : rawPeriodLabel;
  const heroProfit =
    sportTotals === null ? t.returned - t.staked : sportTotals.profit;
  // ROI now has an answer for every sport, because totals() splits a
  // parlay's stake on the same weights it splits the profit. It used
  // to be null the moment a sport was chosen, which is why the tile
  // showed a dash.
  const heroRoi = t.roi;
  const heroWins =
    sportTotals === null
      ? filtered.filter((b) => b.status === "won").length
      : sportTotals.wins;
  const heroLosses =
    sportTotals === null
      ? filtered.filter((b) => b.status === "lost").length
      : sportTotals.losses;

  // Sports that actually have settled picks in this selection.
  const breakdown = bySport
    .filter((row) => row.wins + row.losses > 0)
    .sort((a, b) => b.profit - a.profit);

  // The review is the user's current record, so it ignores the All
  // time switch above it. Mixing them would put two different profits
  // under one screen with nothing saying why.
  const reviewBets = sinceLine(bets, trackingSince);

  const pillClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
      active
        ? "border-brand-mark bg-brand-top text-white"
        : "border-neutral-300 bg-white text-neutral-600 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-300"
    }`;

  return (
    <main className="flex min-h-svh flex-col px-4 pt-6 pb-2 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* THE TOP OF THE PAGE, rebuilt August 2026. The owner: "there's
            too much dead space on the performance page at the top... i
            don't think we get the best possible information."

            He was right, and there were four causes:
            1. The title was left aligned and the hero was centred, so
               the space between them read as a hole rather than as
               breathing room.
            2. "ALL TIME" sat above the number and "ALL" sat selected in
               the chart panel a moment below it. The same fact, twice.
            3. The number, the ROI pill, the three stats and the chart
               were four separate floating things on a plain page. The
               eye had nothing to hold.
            4. The title did no work. The tab bar already says you are
               on Performance.

            So the number now lives ON the chart panel, with the record
            row, above the line that draws it. One object instead of
            five. ProfitPanel was built with a `header` slot for exactly
            this and nothing had used it. */}
        <header className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-bold tracking-tight">Performance</h1>
          {trackingSince && (
            <button
              type="button"
              onClick={() => setShowAllTime((v) => !v)}
              className="shrink-0 text-sm font-semibold text-neutral-600 dark:text-neutral-300"
            >
              {showAllTime ? "Since restart ›" : "All time ›"}
            </button>
          )}
        </header>

        {/* "Find what pays and what leaks." is gone, cut by the owner.
            The line under the title only survives to say which record
            you are looking at, which is a fact the page cannot do
            without. A tagline read as wallpaper by the third visit and
            it was pushing the chart, the actual hero, down the page. */}
        {trackingSince && !showAllTime && (
          <p className="-mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Your record since {shortDate(trackingSince)}.
          </p>
        )}

        <section>
          <ProfitPanel
            bets={filtered}
            sport={sport}
            from={from}
            to={to}
            period={period}
            onPeriodChange={setPeriod}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFrom={setCustomFrom}
            onCustomTo={setCustomTo}
            onScrub={setScrub}
            header={
              <div className="mt-2">
                {/* No ROI pill here. Ruled by the owner, August 2026:
                    it says the same thing as the ROI tile a little
                    further down, and two of them cost the chart the
                    height it needed. The tile is the one that stays. */}
                <HeadlineProfit
                  label={`${periodLabel}${
                    sport !== null
                      ? ` / ${sport}`
                      : group === "sports"
                        ? " / Sports"
                        : ""
                  }`}
                  profit={heroProfit}
                  roi={null}
                  scrub={scrub}
                />
              </div>
            }
            footer={
              /* THE SIX NUMBERS SIT UNDER THE CHART, ON THE PANEL.
                 The owner: a tall chart is "so much white, ugly, not
                 exciting, dead space", and he was right. A running
                 profit line goes bottom left to top right, so the
                 taller the box, the bigger the empty triangle above
                 it. Stretching one element is not how you fill a
                 screen. Facts are.
                 The three money tiles used to be a separate card below
                 the panel; they are the same six facts either way, and
                 up here they cost no extra height because they replace
                 the emptiness. */
              <>
              <div className="mt-1 grid grid-cols-3 gap-y-3 border-t border-neutral-900/10 pt-3 dark:border-white/10">
                <Fact label={sport === null ? "Bets" : "Picks"} value={`${heroWins + heroLosses}`} />
                <Fact label="Record" value={`${heroWins}-${heroLosses}`} border />
                <Fact label="Hit rate" value={pctLabel(heroWins, heroWins + heroLosses)} border />
                <Fact label="Staked" value={formatMoney(round2(t.staked))} />
                <Fact label="Returned" value={formatMoney(round2(t.returned))} border />
                <Fact
                  label="ROI"
                  value={heroRoi === null ? "-" : `${heroRoi.toFixed(1)}%`}
                  tone={profitColor(heroRoi ?? 0)}
                  border
                />
              </div>

              {/* THE SPORT FILTER LIVES ON THE PANEL, under the numbers
                  it filters. It used to sit on the page below the
                  panel, where it landed half behind the tab bar at
                  rest and no chart height could fix that: the bar is
                  fixed to the screen, so on a taller phone the row just
                  comes back up to meet it. Inside the panel there is
                  nothing tappable after it, and the next thing down is
                  a card, which reads as "more below" rather than as
                  broken.
                  The scrollbar is hidden because iOS draws a grey bar
                  straight through the chips while you swipe. */}
              {/* ONE ROW, the owner's third and final shape for this
                  (20 August, "i regret it. remove the 3 rows"): a
                  CATEGORIES label, an All chip, then every category,
                  sports first. The Sports only view is not a chip
                  among chips anymore: it is a quiet toggle beside the
                  label, on or off, and off means everything. */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <MicroLabel>Categories</MicroLabel>
                  <button
                    type="button"
                    onClick={() => {
                      const next = group === "sports" ? "all" : "sports";
                      setGroup(next);
                      // Sports only cannot hold a not-sports pick.
                      if (next === "sports" && sport && NOT_SPORTS.has(sport))
                        setSport(null);
                    }}
                    className={`text-xs ${
                      group === "sports"
                        ? "font-semibold text-brand-mark"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {group === "sports" ? "✓ Sports only" : "Sports only"}
                  </button>
                </div>
                <div className={`-mx-4 mt-1.5 flex gap-2 overflow-x-auto px-4 pb-1 ${NO_SCROLLBAR}`}>
                  <button
                    type="button"
                    onClick={() => setSport(null)}
                    className={pillClass(sport === null)}
                  >
                    All
                  </button>
                  {[...sportChips, ...notSportsChips].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (NOT_SPORTS.has(s)) setGroup("all");
                        setSport(sport === s ? null : s);
                      }}
                      className={pillClass(sport === s)}
                    >
                      {SPORT_EMOJI[s]} {s}
                    </button>
                  ))}
                </div>
              </div>
              </>
            }
          />

        </section>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-white/15">
            No settled bets in this selection.
          </p>
        ) : (
          <>
            {/* Staked, Returned and ROI used to be three cards here.
                They moved up onto the panel, under the chart, where
                they fill the space the chart was being stretched to
                cover. Same six facts, one object instead of two. */}
            <section className={`${CARD} p-4`}>
              <h2 className="text-lg font-bold">Sports breakdown</h2>
              <div className="mt-3 divide-y divide-neutral-300/60 dark:divide-neutral-800">
                {breakdown.map((row) => (
                  <div
                    key={row.sport}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <p className="truncate text-sm font-semibold">
                      {SPORT_EMOJI[row.sport]} {row.sport}
                    </p>
                    <div className="flex shrink-0 items-center gap-4">
                      <p className="text-xs tabular-nums text-neutral-400">
                        {row.wins}-{row.losses}
                      </p>
                      <p
                        className={`w-24 font-money text-right text-sm font-bold tabular-nums ${profitColor(
                          row.profit
                        )}`}
                      >
                        {formatSignedMoney(round2(row.profit))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Record counts every settled pick. Winnings split by odds,
                losses charged to the pick that lost the ticket.
              </p>
            </section>

            <section className={`${CARD} p-4`}>
              <h2 className="text-lg font-bold">Odds groups</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Your settled picks grouped by how risky they were. Picks
                without odds are not shown here.
              </p>
              <div className="mt-3 space-y-2">
                {byBucket.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {row.total === 0
                        ? "no picks"
                        : `${pctLabel(row.wins, row.total)} right (${row.wins} of ${row.total})`}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${CARD} p-4`}>
              <h2 className="text-lg font-bold">Singles vs parlays</h2>
              {bySportType !== null && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Only {sport} picks, and only {sport}&apos;s share of the
                  money.
                </p>
              )}
              <div className="mt-3 space-y-2">
                {bySportType !== null
                  ? bySportType.map((row, i) => {
                      const label = i === 0 ? "Singles" : "Parlays";
                      const picks = row.wins + row.losses;
                      return (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-2"
                        >
                          <p className="text-sm font-semibold">{label}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {picks === 0
                                ? "no picks"
                                : `${pctLabel(row.wins, picks)} right (${row.wins} of ${picks})`}
                            </p>
                            <p
                              className={`w-20 font-money text-right text-sm font-bold tabular-nums ${profitColor(
                                row.profit
                              )}`}
                            >
                              {picks === 0
                                ? "-"
                                : formatSignedMoney(round2(row.profit))}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  : byType.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-2"
                      >
                        <p className="text-sm font-semibold">{row.label}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {row.betsTotal === 0
                              ? "no bets"
                              : `${pctLabel(row.betsWon, row.betsTotal)} (${row.betsWon} of ${row.betsTotal})`}
                          </p>
                          <p
                            className={`w-20 font-money text-right text-sm font-bold tabular-nums ${profitColor(
                              row.profit
                            )}`}
                          >
                            {row.betsTotal === 0
                              ? "-"
                              : formatSignedMoney(round2(row.profit))}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </section>

            {byCategory.length > 0 && (
              <section className={`${CARD} p-4`}>
                {/* HOW DO I PERFORM BY BETTING TYPE. The headline
                    question of the taxonomy work (August 2026), so it
                    shows for every view, not only with a sport
                    chosen. Rows are canonical categories; tapping one
                    opens its markets, the controlled detail level. */}
                <h2 className="text-lg font-bold">Per category</h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {sport === null ? "Your" : `Your ${sport}`} picks grouped
                  by bet type. Tap a row for the detail. Same money rules
                  as everywhere else.
                </p>
                <div className="mt-3 space-y-2">
                  {byCategory.map((row) => {
                    const open = openCategory === row.label;
                    const markets = open
                      ? marketRows(filtered, row.label, sport)
                      : [];
                    return (
                      <div key={row.label}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenCategory(open ? null : row.label)
                          }
                          className="flex w-full items-center justify-between gap-2"
                        >
                          <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold">
                            {row.label}
                            <span
                              aria-hidden="true"
                              className={`text-xs text-neutral-400 transition-transform ${
                                open ? "rotate-90" : ""
                              }`}
                            >
                              ›
                            </span>
                          </p>
                          <span className="flex shrink-0 items-center gap-3">
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {row.wins}-{row.losses}
                            </span>
                            <span
                              className={`w-20 font-money text-right text-sm font-bold tabular-nums ${profitColor(
                                row.profit
                              )}`}
                            >
                              {formatSignedMoney(round2(row.profit))}
                            </span>
                          </span>
                        </button>
                        {open && markets.length > 0 && (
                          <div className="mt-1.5 space-y-1.5 rounded-xl bg-neutral-100 px-3 py-2.5 dark:bg-[#161D38]">
                            {markets.map((m) => (
                              <div
                                key={m.label}
                                className="flex items-center justify-between gap-2"
                              >
                                <p className="min-w-0 truncate text-xs text-neutral-500 dark:text-neutral-400">
                                  {m.label}
                                </p>
                                <div className="flex shrink-0 items-center gap-3">
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {m.wins}-{m.losses}
                                  </p>
                                  <p
                                    className={`w-20 font-money text-right text-xs font-bold tabular-nums ${profitColor(
                                      m.profit
                                    )}`}
                                  >
                                    {formatSignedMoney(round2(m.profit))}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </>
        )}

        {/* THE REVIEW. All time and unfiltered, so it sits under a rule
            and its own heading: without them it reads as a third set of
            numbers disagreeing with the two above. */}
        <div className="border-t border-neutral-200 pt-5 dark:border-white/10">
          <h2 className="text-[17px] font-bold">Your review</h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            All time, and it ignores the filters above.
          </p>
        </div>

        <InsightCard bets={reviewBets} linked={false} />
        <KeyInsights bets={allSettled} />
        <SnapshotCard bets={reviewBets} netProfit={netProfit} linked={false} />

        {filtered.length > 0 && <BetHistory bets={historyBets} />}
      </div>
      <TabBar activeHref={activeHref} />
    </main>
  );
}
