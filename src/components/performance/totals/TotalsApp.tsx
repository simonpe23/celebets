"use client";

// TOTALS, built to his sheet "2. Totals.png", 29 August 2026. Same
// two rules as Compare: the anatomy and the measured sizes are the
// sheet's, every colour and the Figtree face come from the accepted
// Home and Lab through the one dial in performance-ui.ts.
//
// Totals is the honest scan: no opinion, no building, no cleverness.
// Every number is computed from Lab's fixture through the same
// engine, so the four pages never disagree.
//
// ODDS ARE DECIMAL HERE, not the sheet's American ones. The sheet
// draws -110 in Recent Bets while its own KPI strip says 1.68, and
// the product rule in CLAUDE.md is decimal to two places. The rule
// wins over the drawing.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { makeEngine, money, type Chip } from "@/lib/performance-engine";
import type { BetWithLegs } from "@/lib/types";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import { chipIcon } from "@/components/performance/lab/LabApp";
import { Chev, InfoDot } from "@/components/performance/icons";
import {
  CARD,
  CHEV,
  DIVIDER,
  GREEN,
  GREY_TEXT,
  HAIRLINE,
  INDIGO,
  INK,
  NET_LABEL,
  PILL_LAV,
  RED,
  R_CARD,
  R_SMALL,
  SUBGREEN,
  TINT_BAD,
  TINT_GOOD,
  TINT_MID,
  T_BODY,
  T_LEAD,
  T_META,
  T_MICRO,
  T_NANO,
  T_SMALL,
  T_STRONG,
  T_TINY,
  W_BOLD,
  W_SEMI,
} from "@/components/performance/ui";
import Explain from "@/components/performance/lab/Explain";
import PeriodPill from "@/components/performance/lab/PeriodPill";
import { type CustomRange, type PeriodKey, betsIn, isPeriod, withPeriod } from "@/components/performance/lab/period";
import { Donut } from "./donut";
import { HeroLine } from "./hero-chart";
import {
  BANDS,
  bandRows,
  categoryRows,
  hitOf,
  overall,
  recentBets,
  sportRows,
  typeRows,
  type Row,
} from "./totals-model";

const pctRound = (v: number | null) => (v === null ? "-" : `${Math.round(v * 100)}%`);
const record = (r: { wins: number; losses: number }) => `${r.wins}–${r.losses}`;
const cash = (v: number) =>
  `${v < 0 ? "-" : "+"}$${Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// The sheet's own shorthand, so the longest name is not truncated.
// K IS FOR THOUSANDS, so a figure below a thousand must not wear one.
// Fixed 2 September 2026: a user who had staked $40 read "Wagered
// $0.0K", and one who had staked $120 read "$0.1K". Every record under
// a thousand dollars was rounded away to nothing, which is every new
// user. Above a thousand nothing changes, so his own strip is
// untouched.
function thousands(v: number): string {
  if (Math.abs(v) < 1000) return `$${Math.round(v).toLocaleString("en-US")}`;
  return `$${(v / 1000).toFixed(1)}K`;
}

// What an empty card is waiting for. His rule: "If the app cannot say
// something interesting yet, it should say what it is waiting for."
// One sentence, defined once, or two cards answer one question two
// ways.
const WAITING = "Nothing has settled yet. Your first result fills this in.";

const SHORT: Record<string, string> = {
  "Totals (Over/Under)": "Totals (O/U)",
};
const shortLabel = (name: string) => SHORT[name] ?? name;

const sportChip = (name: string): Chip => ({
  group: "sport",
  kind: "plain",
  value: name,
});
const catChip = (name: string): Chip => ({
  group: "what",
  kind: "category",
  value: name,
});

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative ${R_CARD} ${className}`}
      style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
    >
      {children}
    </div>
  );
}

// Job 3: "View all" opens Lab at that group. Lab IS the full list, so
// there is no new page to build; the address just names the group and
// Lab scrolls to it.
function SectionHead({
  title,
  link,
  href,
  onClick,
}: {
  title: string;
  link?: string;
  href?: string;
  /** Intercepts the link so the tab area can switch in place. The
      href stays, so the address is still shareable. */
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex items-center justify-between px-[13px] pt-[13px]">
      <h2 className={`text-sm ${W_BOLD}`}>{title}</h2>
      {link && href ? (
        <Link
          href={href}
          onClick={onClick}
          className={`flex items-center gap-[3px] ${T_SMALL} ${W_SEMI}`}
          style={{ color: INDIGO }}
        >
          {link}
          <Chev size={8} color={INDIGO} />
        </Link>
      ) : null}
    </div>
  );
}

export default function TotalsApp({
  bets,
  routes = PREVIEW_ROUTES,
  period,
  range,
  trackingSince = null,
  restarted = false,
  onRestarted,
  onPeriod,
  onRange,
  onJumpGroup,
  onBets,
}: {
  /** Demo bets on the public preview, the signed in user's own
      bets on the live page. The component never knows which. */
  bets: BetWithLegs[];
  routes?: PerfRoutes;
  /** Owned by the tab area so all three tabs show one window. It used
      to be a router.replace here, which is a server navigation: inside
      the shared area that would reload the page to change a filter. */
  period: PeriodKey;
  range: CustomRange;
  /** The restart line, or null. Only the live page passes one. */
  trackingSince?: string | null;
  /** True while the page counts from that restart rather than all of it. */
  restarted?: boolean;
  onRestarted?: (v: boolean) => void;
  onPeriod: (key: PeriodKey) => void;
  onRange: (r: CustomRange) => void;
  /** Open Lab on a group without leaving the page. */
  onJumpGroup?: (group: string) => void;
  /** Open All Bets in place. The tab area passes this so
      "See all bets" swaps the view instead of loading a page. */
  onBets?: () => void;
}) {
  // Job 4. The period is applied by building the engine from a
  // filtered record, so every number on the page follows without a
  // single call site knowing about dates.
  const [periodOpen, setPeriodOpen] = useState(false);
  const engine = useMemo(
    () => makeEngine(betsIn(bets, period, range, trackingSince, restarted)),
    [bets, period, range]
  );
  const all = useMemo(() => overall(engine), [engine]);
  const series = useMemo(
    () => engine.runningFor([]).map((r) => ({ t: r.t, v: r.profit })),
    [engine]
  );
  const sports = useMemo(() => sportRows(engine.settled), [engine]);
  const cats = useMemo(() => categoryRows(engine.settled), [engine]);
  const bands = useMemo(() => bandRows(engine.settled), [engine]);
  const types = useMemo(() => typeRows(engine.settled), [engine]);
  const recent = useMemo(() => recentBets(engine.settled, 3), [engine]);

  const kpis = [
    { value: `${all.picks}`, label: "Total bets" },
    { value: record(all), label: "Record" },
    { value: pctRound(hitOf(all)), label: "Hit rate" },
    { value: all.staked > 0 ? `${((all.profit / all.staked) * 100).toFixed(1)}%` : "-", label: "ROI" },
    { value: all.avgOdds === null ? "-" : all.avgOdds.toFixed(2), label: "Avg odds" },
    { value: thousands(all.staked), label: "Wagered" },
    { value: thousands(all.returned), label: "Returned" },
  ];

  // PER CATEGORY IS TWO LISTS: THE BEST 3 AND THE WORST 3.
  //
  // His idea and his words, 31 August 2026: "instead of a list of top
  // 6 categories in 2 columns. a top 3 list in 1 wider column is my
  // preferred look." Then, told a plain top 3 would hide every losing
  // category: "top 3 and bottom 3, go".
  //
  // CLAUDE BUILT THAT WRONG THE FIRST TIME, as ONE ranked list showing
  // its two ends. He caught it in a sentence: "what is number 4 on
  // this list? i was expecting two top 3 lists... there should never
  // be a 4 on a list with only top 3." He was right. One list of six
  // is the thing he asked to get away from, just in one column.
  //
  // Two lists, each numbered 1 to 3, and everything in the middle is
  // hidden. That is the point of the change.
  //
  // BEST AND WORST, NOT WINNERS AND LOSERS. His ruling, 31 August
  // 2026, overturning CLAUDE's: "a bottom 3 does not have to be a
  // loss. Top 3 are the best performing categories regardless of
  // outcome. Bottom 3 are the worst performing, regardless of
  // outcome."
  //
  // So on a losing record the Top 3 can be three red figures, and that
  // is correct: they are still the three that hurt least. The colour
  // still tells the truth about the sign, because that is a money rule
  // and money rules do not bend to a heading.
  //
  // THE TWO LISTS CAN NEVER SHARE A ROW. The bottom takes only what
  // the top did not, so with four categories it is three and one, and
  // with three it is three and none rather than the same rows twice.
  const CAT_TOP = 3;
  // A HEADING SAYING "TOP 3" MUST HAVE THREE ROWS UNDER IT. Fixed 2
  // September 2026. With four categories the split gave three and one,
  // so "Bottom 3" sat over a single row; with two it gave "Top 3" over
  // two. That is the thing he rejected on 31 August: "there should
  // never be a 4 on a list with only top 3."
  //
  // Below six categories there is no top and bottom to speak of, so
  // they are simply listed, best first, with no heading claiming
  // anything. At six and above the split is exactly as he approved it,
  // and his own record has six, so his page does not move.
  const split = cats.length >= CAT_TOP * 2;
  // `cats` is sorted by profit, best first, so the top is already in
  // order and the bottom is reversed to lead with the worst.
  const catBest = split ? cats.slice(0, CAT_TOP) : cats;
  const catWorst = split ? cats.slice(cats.length - CAT_TOP).reverse() : [];

  return (
    <>
      {/* The period selector, then the result beside its line. */}
      <div className="relative z-30 mt-[10px] flex items-center pl-[4px]">
        <PeriodPill
          hasRestart={!!trackingSince}
          restarted={restarted}
          onRestarted={onRestarted}
          period={period}
          onPick={onPeriod}
          open={periodOpen}
          setOpen={setPeriodOpen}
          range={range}
          onRange={onRange}
          align="left"
          size="plain"
        />
      </div>

      <div className="relative mt-[6px] flex items-start justify-between pl-[4px]">
        <div className="pt-[4px]">
          <p
            className={`text-hero ${W_BOLD} leading-none tracking-[-0.015em]`}
            style={{ color: all.profit < 0 ? RED : INDIGO }}
          >
            {money(all.profit)}
          </p>
          <p
            className={`mt-[9px] flex items-center gap-[2px] ${T_BODY} ${W_SEMI}`}
            style={{ color: NET_LABEL }}
          >
            Net profit
            <Explain term="Net profit" />
          </p>
          <p className={`mt-[7px] flex items-center gap-[5px] ${T_SMALL} ${W_SEMI}`}>
            <span style={{ color: all.profit < 0 ? RED : SUBGREEN }}>
              {/* A period with nothing settled in it has no ROI, and
                  "+-" is not a number. Reachable since job 4 gave the
                  page a period control. */}
              {all.staked > 0
                ? `${all.profit < 0 ? "" : "+"}${((all.profit / all.staked) * 100).toFixed(1)}%`
                : "-"}{" "}
              ROI
            </span>
            <span
              className="inline-block h-[2.5px] w-[2.5px] rounded-full"
              style={{ background: GREY_TEXT }}
            />
            <span style={{ color: NET_LABEL }}>{record(all)} Record</span>
          </p>
        </div>
        <div className="relative top-[10px] min-w-0 flex-1">
          <HeroLine points={series} width={168} height={86} />
        </div>
      </div>

      {/* The seven figure strip. */}
      <Card className="mt-[14px] px-[4px] py-[11px]">
        <div className="flex items-stretch">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className="flex min-w-0 flex-1 flex-col items-center justify-center px-[1px]"
              style={{ borderLeft: i === 0 ? undefined : `1px solid ${DIVIDER}` }}
            >
              <p className={`truncate ${T_LEAD} ${W_BOLD} leading-none tracking-[-0.01em]`}>
                {k.value}
              </p>
              <p
                className={`mt-[4px] truncate text-xs ${W_SEMI}`}
                style={{ color: GREY_TEXT }}
              >
                {k.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* NOTHING SETTLED, so say what would fill this rather than draw
          a heading, a grey ring and a column of nothing. Added 2
          September 2026, phase 3 of the silence job. */}
      {sports.length === 0 ? (
        <Card className="mt-[11px] pb-[13px]">
          <SectionHead title="Profit by Sport" />
          <p
            className={`px-[13px] pt-[6px] ${T_BODY} ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            {WAITING}
          </p>
        </Card>
      ) : (
      <Card className="mt-[11px] pb-[12px]">
        <SectionHead
          title="Profit by Sport"
          link="View all"
          href={withPeriod(`${routes.lab}?group=sport`, period)}
          onClick={(e) => {
            if (!onJumpGroup) return;
            e.preventDefault();
            onJumpGroup("sport");
          }}
        />
        <div className="mt-[8px] flex items-center gap-[8px] pl-[9px] pr-[9px]">
          <Donut
            size={104}
            slices={sports.map((s) => ({ key: s.key, value: s.profit, profit: s.profit }))}
            center={money(all.profit).replace("+", "")}
            caption="Net Profit"
          />
          <div className="min-w-0 flex-1">
            <div
              className={`flex items-center pb-[4px] ${T_TINY} ${W_SEMI}`}
              style={{ color: GREY_TEXT }}
            >
              <span className="flex-1" />
              <span className="w-[42px] text-right">Record</span>
              <span className="w-[62px] text-right">P/L</span>
            </div>
            {sports.map((s, i) => (
              <div
                key={s.key}
                className="flex items-center py-[6px]"
                style={{ borderTop: `1px solid ${HAIRLINE}` }}
              >
                <span className={`w-[11px] ${T_MICRO} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
                  {i + 1}
                </span>
                <span className="mr-[5px] flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                  {chipIcon(sportChip(s.key), false, undefined, 14)}
                </span>
                <span className={`min-w-0 flex-1 truncate ${T_META} ${W_SEMI}`}>
                  {s.label}
                </span>
                <span className={`w-[42px] text-right ${T_MICRO} ${W_SEMI}`} style={{ color: NET_LABEL }}>
                  {record(s)}
                </span>
                <span
                  className={`w-[62px] text-right ${T_META} ${W_BOLD}`}
                  style={{ color: s.profit < 0 ? RED : s.profit > 0 ? GREEN : NET_LABEL }}
                >
                  {s.profit === 0 ? "$0.00" : cash(s.profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      )}

      {/* Per Category: TWO lists, the best 3 and the worst 3. See the
          note beside catBest for why it is two lists and not one. */}
      <Card className="mt-[11px] pb-[10px]">
        <SectionHead
          title="Per Category"
          link="View all"
          href={withPeriod(`${routes.lab}?group=what`, period)}
          onClick={(e) => {
            if (!onJumpGroup) return;
            e.preventDefault();
            onJumpGroup("what");
          }}
        />
        <div className="mt-[8px] px-[13px]">
          <div
            className={`flex items-center pb-[3px] ${T_TINY} ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            <span className="flex-1" />
            <span className="w-[42px] text-right">Record</span>
            <span className="w-[62px] text-right">P/L</span>
          </div>
          {[
            { heading: split ? "Top 3" : "", rows: catBest },
            // His wording, 31 August 2026: "Bottom 3 is better wording
            // than top 3 losses".
            { heading: "Bottom 3", rows: catWorst },
          ]
            .filter((list) => list.rows.length > 0)
            .map((list, li) => (
              <div key={list.heading || "all"} className={li ? "mt-[11px]" : undefined}>
                {list.heading ? (
                <p
                  className={`pb-[3px] uppercase tracking-[0.04em] ${T_TINY} ${W_SEMI}`}
                  style={{ color: GREY_TEXT }}
                >
                  {list.heading}
                </p>
                ) : null}
                {list.rows.map((r, i) => (
                  <div
                    key={r.key}
                    className="flex items-center py-[6px]"
                    style={{ borderTop: `1px solid ${HAIRLINE}` }}
                  >
                    <span
                      className={`w-[13px] ${T_MICRO} ${W_SEMI}`}
                      style={{ color: GREY_TEXT }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="mr-[5px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[6px]"
                      style={{ background: PILL_LAV }}
                    >
                      {chipIcon(catChip(r.key), false, undefined, 11)}
                    </span>
                    <span className={`min-w-0 flex-1 truncate ${T_META} ${W_SEMI}`}>
                      {shortLabel(r.label)}
                    </span>
                    <span
                      className={`w-[42px] text-right ${T_MICRO} ${W_SEMI}`}
                      style={{ color: NET_LABEL }}
                    >
                      {record(r)}
                    </span>
                    <span
                      className={`w-[62px] text-right ${T_META} ${W_BOLD}`}
                      style={{
                        color:
                          r.profit < 0 ? RED : r.profit > 0 ? GREEN : NET_LABEL,
                      }}
                    >
                      {r.profit === 0 ? "$0.00" : cash(r.profit)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </Card>

      {/* Odds Groups beside Singles vs Parlays. */}
      <div className="relative mt-[11px] flex gap-[9px]">
        <div
          className={`min-w-0 flex-1 ${R_CARD} pb-[11px]`}
          style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
        >
          <h2 className={`px-[11px] pt-[12px] ${T_STRONG} ${W_BOLD}`}>Odds Groups</h2>
          <div className="mt-[7px] space-y-[6px] px-[9px]">
            {bands.map((b, i) => {
              const tint = [TINT_GOOD, TINT_MID, TINT_BAD][i];
              const meta = BANDS[i];
              return (
                <div key={b.key} className={`${R_SMALL} px-[9px] py-[7px]`} style={{ background: tint }}>
                  <div className="flex items-baseline justify-between">
                    <span className={`${T_META} ${W_BOLD}`}>
                      {i + 1}. {meta.label}
                    </span>
                    <span className={`${T_MICRO} ${W_SEMI}`} style={{ color: NET_LABEL }}>
                      {pctRound(hitOf(b))}
                    </span>
                  </div>
                  <div className="mt-[3px] flex items-baseline justify-between">
                    <span className={`${T_NANO} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
                      {meta.range}
                    </span>
                    <span className={`${T_NANO} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
                      {b.wins} of {b.wins + b.losses}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`min-w-0 flex-1 ${R_CARD} pb-[11px]`}
          style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
        >
          <h2 className={`px-[11px] pt-[12px] ${T_STRONG} ${W_BOLD}`}>Singles vs Parlays</h2>
          <div className="mt-[7px] space-y-[8px] px-[9px]">
            {types.map((t, i) => (
              <div
                key={t.key}
                className={`${R_SMALL} px-[9px] py-[13px]`}
                style={{ boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
              >
                <div className="flex items-baseline justify-between">
                  <span className={`${T_META} ${W_BOLD}`}>
                    {i + 1}. {t.label}
                  </span>
                  <span
                    className={`${T_META} ${W_BOLD}`}
                    style={{ color: t.profit < 0 ? RED : t.profit > 0 ? GREEN : NET_LABEL }}
                  >
                    {t.profit === 0 ? "$0.00" : cash(t.profit)}
                  </span>
                </div>
                <div className="mt-[3px] flex items-baseline justify-between">
                  <span className={`${T_NANO} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
                    {pctRound(hitOf(t))}
                  </span>
                  <span className={`${T_NANO} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
                    {t.wins} of {t.wins + t.losses}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The ledger. Same rule as above when nothing has settled. */}
      {recent.length === 0 ? (
        <Card className="mb-[6px] mt-[11px] pb-[13px]">
          <SectionHead title="Recent Bets" />
          <p
            className={`px-[13px] pt-[6px] ${T_BODY} ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            {WAITING}
          </p>
        </Card>
      ) : (
      <Card className="mb-[6px] mt-[11px] pb-[8px]">
        <div className="flex items-center justify-between px-[13px] pt-[13px]">
          <h2 className={`text-sm ${W_BOLD}`}>Recent Bets</h2>
          {/* Job 5. */}
          <Link
            href={withPeriod(`${routes.bets}?from=totals`, period)}
            onClick={(e) => {
              if (!onBets) return;
              e.preventDefault();
              onBets();
            }}
            className={`flex items-center gap-[3px] ${T_SMALL} ${W_SEMI}`}
            style={{ color: INDIGO }}
          >
            See all bets
            <Chev size={8} color={INDIGO} />
          </Link>
        </div>
        <div className="mt-[6px]">
          {recent.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center px-[13px] py-[8px]"
              style={{ borderTop: i === 0 ? undefined : `1px solid ${HAIRLINE}` }}
            >
              <span className="mr-[8px] flex h-[20px] w-[20px] shrink-0 items-center justify-center">
                {chipIcon(sportChip(b.sport), false, undefined, 17)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate ${T_SMALL} ${W_BOLD}`}>{b.pick}</p>
                <p className={`mt-[2px] truncate ${T_NANO} ${W_SEMI}`} style={{ color: GREY_TEXT }}>
                  {new Date(b.when).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {"  ·  "}
                  {b.sport}
                  {b.league ? `  ·  ${b.league}` : ""}
                </p>
              </div>
              <span className={`ml-[6px] ${T_MICRO} ${W_SEMI}`} style={{ color: NET_LABEL }}>
                {b.odds === null ? "-" : b.odds.toFixed(2)}
              </span>
              <span
                className={`ml-[9px] whitespace-nowrap ${T_SMALL} ${W_BOLD}`}
                style={{ color: b.profit < 0 ? RED : b.profit > 0 ? GREEN : NET_LABEL }}
              >
                {b.profit === 0 ? "$0.00" : cash(b.profit)}
              </span>
              <Chev size={8} color={CHEV} />
            </div>
          ))}
        </div>
      </Card>
      )}

      <div className="min-h-[8px]" />
    </>
  );
}
