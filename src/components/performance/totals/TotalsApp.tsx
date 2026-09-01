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
      className={`relative mx-[11px] ${R_CARD} ${className}`}
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
    () => makeEngine(betsIn(bets, period, range)),
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
    { value: `$${(all.staked / 1000).toFixed(1)}K`, label: "Wagered" },
    { value: `$${(all.returned / 1000).toFixed(1)}K`, label: "Returned" },
  ];

  const catLeft = cats.slice(0, 3);
  const catRight = cats.slice(3, 6);

  return (
    <>
      {/* The period selector, then the result beside its line. */}
      <div className="relative z-30 mt-[10px] flex items-center pl-[15px]">
        <PeriodPill
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

      <div className="relative mt-[6px] flex items-start justify-between pl-[15px] pr-[8px]">
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
        <div className="relative top-[10px] shrink-0">
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

      {/* Profit by Sport: the ring, then the ranked list. */}
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
        <div className="mt-[8px] flex items-center gap-[8px] pl-[9px] pr-[11px]">
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

      {/* Per Category, two columns. */}
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
        <div className="mt-[6px] flex px-[11px]">
          {[catLeft, catRight].map((col, ci) => (
            <div
              key={ci}
              className="min-w-0 flex-1"
              style={{
                borderLeft: ci === 1 ? `1px solid ${HAIRLINE}` : undefined,
                paddingLeft: ci === 1 ? "9px" : undefined,
                paddingRight: ci === 0 ? "9px" : undefined,
              }}
            >
              {col.map((r, i) => (
                <div
                  key={r.key}
                  className="flex items-center py-[7px]"
                  style={{ borderTop: i === 0 ? undefined : `1px solid ${HAIRLINE}` }}
                >
                  <span
                    className={`w-[10px] ${T_MICRO} ${W_SEMI}`}
                    style={{ color: ci * 3 + i === 3 ? INDIGO : GREY_TEXT }}
                  >
                    {ci * 3 + i + 1}
                  </span>
                  <span
                    className="ml-[3px] mr-[5px] flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[6px]"
                    style={{ background: PILL_LAV }}
                  >
                    {chipIcon(catChip(r.key), false, undefined, 11)}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-xs ${W_SEMI}`}>
                    {shortLabel(r.label)}
                  </span>
                  <span className={`ml-[3px] text-xs ${W_SEMI}`} style={{ color: NET_LABEL }}>
                    {record(r)}
                  </span>
                  <span
                    className={`ml-[4px] whitespace-nowrap text-xs ${W_BOLD}`}
                    style={{ color: r.profit < 0 ? RED : r.profit > 0 ? GREEN : NET_LABEL }}
                  >
                    {r.profit === 0 ? "$0.00" : cash(r.profit)}
                  </span>
                  <Chev size={8} color={CHEV} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Odds Groups beside Singles vs Parlays. */}
      <div className="relative mt-[11px] flex gap-[9px] px-[11px]">
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

      {/* The ledger. */}
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

      <div className="min-h-[8px]" />
    </>
  );
}
