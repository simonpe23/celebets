"use client";

// COMPARE, built to his sheet "1. Compare.png". His two orders,
// 29 August 2026: "make an identical copy of it" and "colors and
// fonts needs to follow the design for home and lab". So the
// anatomy, the order of the sections and the measured sizes come
// from the sheet; every colour and the Figtree face come from the
// accepted Home and Lab.
//
// It is its own page, ruled the same day: tapping Compare in Lab
// opens this screen and the back arrow returns to Lab with both
// chips still selected. The trigger is unchanged, exactly two
// selections.
//
// Every number is computed by the pf engine from Lab's own fixture,
// so Compare, Lab and Home never disagree.

import { useMemo, useState } from "react";
import PerfHeader from "@/components/performance/header";
import { useSearchParams } from "next/navigation";
import {
  makeEngine,
  money,
  type Chip,
  type Stats,
} from "@/app/preview/pf/engine";
import type { BetWithLegs } from "@/lib/types";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import { chipIcon } from "@/components/performance/lab/LabApp";
import Explain from "@/components/performance/lab/Explain";
import {
  InfoDot,
} from "@/components/performance/icons";
import { leagueSports } from "@/components/performance/lab/lab-model";
import {
  CARD,
  CARD_WINNER,
  CHEV,
  GREEN,
  GREY_TEXT,
  HAIRLINE,
  INDIGO,
  INDIGO_FILL,
  INK,
  LIGHT_INDIGO,
  LIGHT_RED,
  MENU_IDLE,
  NET_LABEL,
  ON_BRAND,
  ORB_LIGHT,
  ORB_MID,
  PILL_GREY,
  PILL_LAV,
  RED,
  R_CARD,
  SEL_EDGE,
  TRACK,
  TRACK_SOFT,
  T_BODY,
  T_LEAD,
  T_META,
  T_SMALL,
  T_STRONG,
  T_TINY,
  W_BOLD,
  W_SEMI,
} from "@/components/performance/ui";
import { CompareChart, type Series } from "./compare-chart";

const METRICS = ["Profit", "ROI", "Hit rate"] as const;
type Metric = (typeof METRICS)[number];

const PERIODS = [
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 182 },
  { key: "1Y", days: 365 },
  { key: "All", days: null },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

const DAY = 86400000;

function parseSel(raw: string | null): Chip[] {
  if (!raw) return [];
  const out: Chip[] = [];
  for (const part of raw.split("|")) {
    const [group, kind, ...rest] = part.split("~");
    const value = rest.join("~");
    if (!group || !kind || !value) continue;
    if (!["sport", "what", "where", "when", "how", "risk"].includes(group)) continue;
    if (!["plain", "category", "market"].includes(kind)) continue;
    out.push({ group, kind, value } as Chip);
  }
  return out;
}

const chipKey = (c: Chip) => `${c.group}~${c.kind}~${c.value}`;

// The demo pairing when Compare is opened cold, chosen to tell the
// sheet's own story with honest numbers: a clear earner against the
// record's clear leak.
const DEMO: Chip[] = [
  { group: "sport", kind: "plain", value: "Football" },
  { group: "sport", kind: "plain", value: "Basketball" },
];

function hitRate(s: Stats): number | null {
  const picks = s.wins + s.losses;
  return picks > 0 ? s.wins / picks : null;
}
function roi(s: Stats): number | null {
  return s.staked > 0 ? s.profit / s.staked : null;
}
function avgStake(s: Stats): number | null {
  return s.bets > 0 ? s.staked / s.bets : null;
}
const pct = (v: number | null) => (v === null ? "-" : `${(v * 100).toFixed(1)}%`);
const pctRound = (v: number | null) => (v === null ? "-" : `${Math.round(v * 100)}%`);
const usd = (v: number | null) =>
  v === null ? "-" : `$${v.toFixed(2)}`;

// Money on an axis: $2k, $0, -$1k, the sheet's own shorthand.
function axisMoney(v: number): string {
  const a = Math.abs(v);
  const t = a >= 1000 ? `${+(a / 1000).toFixed(1)}k` : `${Math.round(a)}`;
  return `${v < 0 ? "-" : ""}$${t}`;
}

export default function CompareApp({
  bets,
  routes = PREVIEW_ROUTES,
  sel,
  onBack,
}: {
  /** Demo bets on the public preview, the signed in user's own
      bets on the live page. The component never knows which. */
  bets: BetWithLegs[];
  routes?: PerfRoutes;
  /** The pair to compare, as `a|b`. A prop since 31 August 2026,
      because Compare is a view inside the tab area now and pushState
      does not refresh useSearchParams. */
  sel?: string;
  /** Back to Lab in place, with both chips still chosen. */
  onBack?: (sel: string) => void;
}) {
  const engine = useMemo(() => makeEngine(bets), [bets]);
  const params = useSearchParams();
  const [metric, setMetric] = useState<Metric>("Profit");
  const [period, setPeriod] = useState<PeriodKey>("All");

  const leagueSportMap = useMemo(() => leagueSports(engine.settled), [engine]);

  // Exactly two selections, the ruled trigger. Anything else falls
  // back to the demo pair rather than showing a broken page.
  const parsed = parseSel(sel !== undefined ? sel : params.get("sel"));
  const pair = parsed.length === 2 ? parsed : DEMO;
  const backSel = pair.map(chipKey).join("|");

  const days = PERIODS.find((p) => p.key === period)?.days ?? null;
  const after = days === null ? undefined : engine.now - days * DAY;

  const statsA = engine.statsFor([pair[0]], undefined, after);
  const statsB = engine.statsFor([pair[1]], undefined, after);

  // Series for the chart: cumulative WITHIN the period, so both
  // lines start at zero the way the sheet draws them.
  function seriesOf(chip: Chip, m: Metric): Series {
    const rows = engine.runningFor([chip]);
    if (rows.length === 0) return [];
    const start = after ?? 0;
    let base = { profit: 0, staked: 0, wins: 0, losses: 0 };
    const inside: typeof rows = [];
    for (const r of rows) {
      if (r.t < start) base = r;
      else inside.push(r);
    }
    if (inside.length === 0) return [];
    const at = (r: (typeof rows)[number]) => {
      if (m === "Profit") return r.profit - base.profit;
      if (m === "ROI") {
        const st = r.staked - base.staked;
        return st > 0 ? ((r.profit - base.profit) / st) * 100 : 0;
      }
      const w = r.wins - base.wins;
      const l = r.losses - base.losses;
      return w + l > 0 ? (w / (w + l)) * 100 : 0;
    };
    const first = { t: inside[0].t - DAY, v: m === "Profit" ? 0 : at(inside[0]) };
    return [first, ...inside.map((r) => ({ t: r.t, v: at(r) }))];
  }

  const seriesA = seriesOf(pair[0], metric);
  const seriesB = seriesOf(pair[1], metric);

  // The three metrics with a defensible winner. Record, average
  // stake and bet count are context: a bigger stake or a longer run
  // is not a better one, and scoring them would be an unexplainable
  // number, which this product has removed once already.
  const scored = [
    { label: "Net profit", a: statsA.profit, b: statsB.profit },
    { label: "ROI", a: roi(statsA), b: roi(statsB) },
    { label: "Hit rate", a: hitRate(statsA), b: hitRate(statsB) },
  ];
  const aWins = scored.filter(
    (m) => m.a !== null && m.b !== null && m.a > m.b
  ).length;
  const bWins = scored.filter(
    (m) => m.a !== null && m.b !== null && m.b > m.a
  ).length;
  const leaderIsA = aWins > bWins || (aWins === bWins && statsA.profit >= statsB.profit);

  const win = leaderIsA ? pair[0] : pair[1];
  const lose = leaderIsA ? pair[1] : pair[0];
  const winStats = leaderIsA ? statsA : statsB;
  const loseStats = leaderIsA ? statsB : statsA;
  const winScore = leaderIsA ? aWins : bWins;

  const rows: {
    label: string;
    a: string;
    b: string;
    tone?: boolean;
    info?: boolean;
  }[] = [
    {
      label: "Net profit",
      a: money(statsA.profit),
      b: money(statsB.profit),
      tone: true,
      info: true,
    },
    { label: "ROI", a: pct(roi(statsA)), b: pct(roi(statsB)), tone: true, info: true },
    {
      label: "Hit rate",
      a: pctRound(hitRate(statsA)),
      b: pctRound(hitRate(statsB)),
      tone: true,
      info: true,
    },
    {
      label: "Record",
      a: `${statsA.wins}–${statsA.losses}`,
      b: `${statsB.wins}–${statsB.losses}`,
      info: true,
    },
    { label: "Avg stake", a: usd(avgStake(statsA)), b: usd(avgStake(statsB)), info: true },
    { label: "Bets", a: `${statsA.bets}`, b: `${statsB.bets}` },
  ];

  // Why the leader wins: only the comparisons it actually leads.
  const trendOf = (s: Series) => (s.length > 1 ? s[s.length - 1].v - s[0].v : 0);
  const winTrend = trendOf(leaderIsA ? seriesOf(pair[0], "Profit") : seriesOf(pair[1], "Profit"));
  const loseTrend = trendOf(leaderIsA ? seriesOf(pair[1], "Profit") : seriesOf(pair[0], "Profit"));
  const winHit = hitRate(winStats);
  const loseHit = hitRate(loseStats);
  const winRoi = roi(winStats);
  const loseRoi = roi(loseStats);
  // The card explains the result, so it never restates the result:
  // profit is the headline on the two cards above, and these are the
  // three reasons behind it, exactly the three the sheet lists. Each
  // appears only where the leader actually leads.
  const reasons: { title: string; detail: string }[] = [];
  if (winHit !== null && loseHit !== null && winHit > loseHit)
    reasons.push({
      title: "Higher hit rate",
      detail: `${pctRound(winHit)} vs ${pctRound(loseHit)}`,
    });
  if (winRoi !== null && loseRoi !== null && winRoi > loseRoi)
    reasons.push({
      title: "Stronger ROI",
      detail: `${pct(winRoi)} vs ${pct(loseRoi)}`,
    });
  if (winTrend > loseTrend)
    reasons.push({
      title: "Stronger trend",
      detail: `${money(winTrend)} ${period === "All" ? "all time" : `over ${period}`}`,
    });
  const topReasons = reasons.slice(0, 3);

  const fmt =
    metric === "Profit" ? axisMoney : (v: number) => `${Math.round(v)}%`;

  const spanLabel =
    period === "All"
      ? "Data shown for your whole record"
      : `Data shown for the past ${
          period === "1M" ? "month" : period === "1Y" ? "12 months" : period.replace("M", " months")
        }`;

  return (
    <>
      {/* Header: the back door to Lab, both chips still selected.
          `tall` is Compare's own 44px shape, four pixels more than the
          other two headers. See performance-header.tsx. */}
      <PerfHeader
        href={`${routes.lab}?sel=${encodeURIComponent(backSel)}`}
        onBack={onBack ? () => onBack(backSel) : undefined}
        label="Back to Lab"
        title="Compare"
        tall
      />

      {/* The two cards, with the winner bordered and crowned. */}
      <div className="relative mt-[8px] flex items-stretch px-[20px]">
        {[
          { chip: pair[0], s: statsA, winner: leaderIsA },
          { chip: pair[1], s: statsB, winner: !leaderIsA },
        ].map(({ chip, s, winner }, i) => (
          <div
            key={chipKey(chip)}
            className="relative min-w-0 rounded-[18px] px-[14px] pb-[17px] pt-[15px]"
            style={{
              flex: winner ? "1.04 1 0%" : "1 1 0%",
              marginRight: i === 0 ? "15px" : undefined,
              boxShadow: winner
                ? `inset 0 0 0 1.4px ${INDIGO}, 0 2px 10px rgba(40,20,190,0.08)`
                : "0 1px 5px rgba(24,20,50,0.07)",
              background: winner ? CARD_WINNER : CARD,
            }}
          >
            {winner ? (
              <span
                className="absolute right-[12px] top-[13px] flex h-[21px] w-[33px] items-center justify-center rounded-full"
                style={{ background: INDIGO_FILL }}
              >
                <CrownIcon />
              </span>
            ) : null}
            <div className="flex items-center gap-[9px]">
              <span
                className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full"
                style={{ background: PILL_LAV }}
              >
                {chipIcon(
                  chip,
                  false,
                  chip.group === "where" ? leagueSportMap.get(chip.value) : undefined,
                  20
                )}
              </span>
              <p
                className={`min-w-0 truncate text-[14px] ${W_BOLD}`}
                style={{ paddingRight: winner ? "26px" : undefined }}
              >
                {chip.value}
              </p>
            </div>
            <p
              className={`mt-[11px] flex items-center gap-[5px] whitespace-nowrap ${T_META} ${W_SEMI}`}
              style={{ color: GREY_TEXT }}
            >
              {s.wins}–{s.losses}
              <span
                className="inline-block h-[2.5px] w-[2.5px] rounded-full"
                style={{ background: GREY_TEXT }}
              />
              {pctRound(hitRate(s))} hit rate
            </p>
            <p className={`mt-[15px] ${T_BODY} ${W_SEMI}`} style={{ color: NET_LABEL }}>
              Net profit
            </p>
            <p
              className={`mt-[5px] text-[30px] ${W_BOLD} leading-none tracking-[-0.01em]`}
              style={{ color: s.profit < 0 ? RED : GREEN }}
            >
              {money(s.profit)}
            </p>
          </div>
        ))}
        {/* The VS badge, centred on the seam and overlapping both. */}
        <span
          className={`pointer-events-none absolute left-1/2 top-1/2 flex h-[38px] w-[38px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${T_BODY} ${W_BOLD}`}
          style={{ background: CARD, color: GREY_TEXT, boxShadow: "0 2px 8px rgba(24,20,50,0.10)" }}
        >
          VS
        </span>
      </div>

      {/* The metric toggle. */}
      <div
        className="relative mx-[20px] mt-[12px] flex h-[38px] items-center rounded-full p-[3px]"
        style={{ background: TRACK }}
      >
        {METRICS.map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`flex h-[32px] flex-1 items-center justify-center rounded-full ${T_STRONG} ${W_BOLD} transition-colors`}
            style={
              metric === m
                ? { background: INDIGO_FILL, color: ON_BRAND }
                : { color: MENU_IDLE }
            }
          >
            {m}
          </button>
        ))}
      </div>

      {/* The chart card. */}
      <div
        className={`relative mx-[20px] mt-[11px] ${R_CARD} px-[12px] pb-[11px] pt-[12px]`}
        style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-[5px]">
            {[
              { chip: pair[0], s: statsA, down: statsA.profit < 0, light: false },
              { chip: pair[1], s: statsB, down: statsB.profit < 0, light: true },
            ].map(({ chip, s, down, light }) => (
              <p key={chipKey(chip)} className={`flex items-center gap-[6px] ${T_SMALL} ${W_SEMI}`}>
                <span
                  className="inline-block h-[7px] w-[7px] rounded-full"
                  style={{
                    background: down
                      ? light && statsA.profit < 0
                        ? LIGHT_RED
                        : RED
                      : light && statsA.profit >= 0
                        ? LIGHT_INDIGO
                        : INDIGO,
                  }}
                />
                <span style={{ color: INK }}>{chip.value}</span>
                <span style={{ color: s.profit < 0 ? RED : GREEN }}>
                  {metric === "Profit"
                    ? money(s.profit)
                    : metric === "ROI"
                      ? pct(roi(s))
                      : pctRound(hitRate(s))}
                </span>
              </p>
            ))}
          </div>
          <span
            className={`shrink-0 rounded-full px-[10px] py-[5px] ${T_META} ${W_SEMI}`}
            style={{ background: TRACK_SOFT, color: NET_LABEL }}
          >
            Cumulative {metric.toLowerCase()}
          </span>
        </div>

        <div className="mt-[10px]">
          <CompareChart
            a={seriesA}
            b={seriesB}
            format={fmt}
            aDown={statsA.profit < 0}
            bDown={statsB.profit < 0}
          />
        </div>

        <div
          className="mt-[10px] flex h-[30px] items-center rounded-full p-[2px]"
          style={{ background: TRACK_SOFT }}
        >
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex h-[26px] flex-1 items-center justify-center rounded-full ${T_SMALL} ${W_SEMI} transition-colors`}
              style={
                period === p.key
                  ? { background: INDIGO_FILL, color: ON_BRAND }
                  : { color: MENU_IDLE }
              }
            >
              {p.key}
            </button>
          ))}
        </div>
        <p className={`mt-[8px] text-center ${T_TINY}`} style={{ color: GREY_TEXT }}>
          {spanLabel}
        </p>
      </div>

      {/* Head to head. */}
      <div
        className={`relative mx-[20px] mt-[11px] overflow-hidden ${R_CARD} pt-[12px]`}
        style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
      >
        <div className="flex items-center justify-between px-[13px]">
          <h2 className={`${T_LEAD} ${W_BOLD}`}>Head to head</h2>
          <span
            className={`rounded-full px-[10px] py-[4px] ${T_SMALL} ${W_SEMI}`}
            style={{ background: PILL_GREY, color: NET_LABEL }}
          >
            {win.value} wins {winScore} / {scored.length}
          </span>
        </div>

        <div className={`mt-[10px] flex px-[13px] pb-[5px] ${T_SMALL} ${W_BOLD}`}>
          <span
            className="flex-1 text-left"
            style={{ color: leaderIsA ? INDIGO : statsA.profit < 0 ? RED : NET_LABEL }}
          >
            {pair[0].value}
          </span>
          <span className="w-[104px] shrink-0 text-center" style={{ color: GREY_TEXT }}>
            Metric
          </span>
          <span
            className="flex-1 text-right"
            style={{ color: !leaderIsA ? INDIGO : statsB.profit < 0 ? RED : NET_LABEL }}
          >
            {pair[1].value}
          </span>
        </div>

        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center ${T_BODY} ${W_SEMI}`}
            style={{ borderTop: `1px solid ${HAIRLINE}` }}
          >
            <span
              className="flex-1 py-[10px] pl-[13px] text-left"
              style={{
                color: r.tone ? toneColor(r, true, statsA, statsB) : INK,
              }}
            >
              {r.a}
            </span>
            <span
              className={`flex w-[104px] shrink-0 items-center justify-center gap-[4px] py-[10px] text-center ${T_SMALL} ${W_SEMI}`}
              style={{ color: NET_LABEL }}
            >
              {r.label}
              {r.info ? <Explain term={r.label} size={11} /> : null}
            </span>
            <span
              className="flex-1 py-[10px] pr-[13px] text-right"
              style={{
                color: r.tone ? toneColor(r, false, statsA, statsB) : INK,
              }}
            >
              {r.b}
            </span>
            {i === rows.length - 1 ? null : null}
          </div>
        ))}
      </div>

      {/* Why the leader wins. */}
      {topReasons.length > 0 ? (
        <div
          className={`relative mx-[20px] mb-[6px] mt-[11px] ${R_CARD} px-[12px] py-[12px]`}
          style={{ background: PILL_LAV }}
        >
          <div className="flex items-center gap-[10px]">
            <span
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  `radial-gradient(115% 115% at 32% 22%, ${ORB_LIGHT} 0%, ${ORB_MID} 60%, ${INDIGO_FILL} 100%)`,
              }}
            >
              <RiseIcon />
            </span>
            <p className={`${T_STRONG} ${W_BOLD}`} style={{ color: INDIGO }}>
              Why {win.value} wins
            </p>
          </div>
          <div className="mt-[11px] flex items-stretch">
            {topReasons.map((r, i) => (
              <div
                key={r.title}
                className="flex min-w-0 flex-1 items-center gap-[7px] px-[6px]"
                style={{ borderLeft: i === 0 ? undefined : `1px solid ${SEL_EDGE}` }}
              >
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
                  style={{ boxShadow: `inset 0 0 0 1.3px ${GREEN}` }}
                >
                  <TickRise />
                </span>
                <span className="min-w-0 leading-[1.35]">
                  <span className={`block truncate text-[8.6px] ${W_BOLD}`}>{r.title}</span>
                  <span className={`block truncate ${T_TINY}`} style={{ color: GREY_TEXT }}>
                    {r.detail}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="min-h-[10px]" />
    </>
  );
}

// Green and red mean money moved, so they colour the money rows and
// the rate rows only, and only where the two sides differ.
function toneColor(
  r: { label: string },
  isA: boolean,
  a: Stats,
  b: Stats
): string {
  const value =
    r.label === "Net profit"
      ? (isA ? a.profit : b.profit)
      : r.label === "ROI"
        ? (isA ? roi(a) : roi(b)) ?? 0
        : ((isA ? hitRate(a) : hitRate(b)) ?? 0) - 0.5;
  return value < 0 ? RED : GREEN;
}

function CrownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.6 14.4h12.8M4 6.2l3.1 2.6L10 4.6l2.9 4.2L16 6.2l-1 6.1H5L4 6.2Z"
        stroke={ON_BRAND}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RiseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.6 14.2l4.2-4.3 2.8 2.8 5.8-6"
        stroke={ON_BRAND}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 6.5h3.9v3.9"
        stroke={ON_BRAND}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TickRise() {
  return (
    <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 14.4L14.2 5.2"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.6 5.2h5.8V11"
        stroke={GREEN}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
