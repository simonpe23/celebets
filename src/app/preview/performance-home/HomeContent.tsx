// The new Performance Home, round 3, rebuilt to the combined master
// mockup "0. Chat Aug 28.png" (853px wide for a 390pt frame, scale
// 2.187). Every size here comes from probe.py ink measurements of that
// sheet, not from eyeballing: the same probes measure the rendered page
// and the two sets of boxes are diffed until they agree.
//
// 29 August 2026 the copy phase ended: "we're now passed copying it.
// We're now improving what we have." The mockup-0 measurements stay
// the baseline; his nine improvement edits sit on top: insight card
// standalone, taller menu, lighter number, shorter chart, tighter KPI
// row, a more prominent list, the big-chart wash restored, and the
// page distributes leftover height instead of pinning a gap above the
// tab bar.
//
// The owner's orders of 28 August 2026, all applied:
// - "pick the purple color from the mockup": indigo #3614F0 text and
//   line, #3708E4 fills, sampled from the sheet. Replaces the app
//   purple used in round 2.
// - "SAME FONT SIZE IS IMPORTANT": sizes are the sheet's own, derived
//   from measured ink boxes. The face is Figtree, the closest free
//   match by measured proportions, which he allowed: "pick a similar
//   one".
// - The Heat Map pill sits beside What changed? and the colour wash
//   stays behind the chart: his designer forgot both.
// - The top menu sits high on the page.
// - All five rows and the Lab card fit one phone screen with the chart
//   at the sheet's own height.
// - The bottom tab bar floats and sticks like every other page in the
//   app (TabBar.tsx has the sticky mechanics), taller and with more
//   prominent icons than the sheet: his round 2 instruction 6 stands.
//
// 30 August 2026 Home joined the shared colour dial,
// `../performance-ui`. Every colour on this page now comes from
// there, the same file Lab, Totals, Compare, the Heat Map and All Bets
// read. No value changed: the page looks exactly as he accepted it.
// Never write a hex in this folder again. Add a token to the dial and
// import it.

import Image from "next/image";
import Link from "next/link";
import { HeroChart, Spark } from "./charts";
import type { ReactNode } from "react";
import { buildHomeView, type HomeRow } from "./home-model";
import { makeEngine, type GroupKey } from "../pf/engine";
import PeriodPill from "../performance-lab/PeriodPill";
import {
  betsIn,
  type CustomRange,
  type PeriodKey,
} from "../performance-lab/period";
import { useState } from "react";
import type { BetWithLegs } from "@/lib/types";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import {
  BallIcon,
  ChangedMark,
  Chev,
  ChevDown,
  DollarIcon,
  FactNote,
  FactTarget,
  FactTrend,
  FactWave,
  GoldSparkle,
  HeatDots,
  InfoDot,
  LayersIcon,
  MiniTrend,
  OrbLayers,
  RedTarget,
  TrendTileIcon,
  WashTexture,
} from "../performance-icons";
import {
  AMBER_BG,
  AMBER_EDGE,
  AMBER_INK,
  AMBER_TILE,
  CHART_H_HOME,
  CHEV,
  DIVIDER,
  DOT_MUTED,
  GREEN,
  GREY_TEXT,
  HAIR,
  HAIRLINE,
  INDIGO,
  INDIGO_FILL,
  LAB_CARD,
  NET_LABEL,
  ON_BRAND,
  ORANGE,
  ORB_DEEP,
  ORB_HI,
  ORB_TINT,
  PILL_LAV,
  RANK_INK,
  RED,
  ROW_TILE_BAD,
  R_CHIP,
  R_INNER,
  R_SMALL,
  R_TILE,
  SELECTOR_INK,
  SUBGREEN,
  T_BODY,
  T_LABEL,
  T_LEAD,
  T_NANO,
  T_SMALL,
  T_STRONG,
  T_TINY,
  W_BOLD,
  W_SEMI,
} from "../performance-ui";

// A ranked row's tile icon comes from the family the fact belongs to,
// because the rows are computed now and no longer a fixed five. A
// losing fact wears the red target on a red tile, the pattern the
// accepted design already used for Player Props.
const GROUP_ICON: Record<GroupKey, (size: number) => ReactNode> = {
  what: (size) => <DollarIcon size={size} />,
  sport: (size) => <BallIcon size={size} />,
  where: (size) => <BallIcon size={size} />,
  risk: (size) => <TrendTileIcon size={size} />,
  how: (size) => <LayersIcon size={size} />,
  when: (size) => <TrendTileIcon size={size} />,
};

function rowIcon(row: HomeRow): ReactNode {
  if (!row.positive) return <RedTarget size={20} />;
  return GROUP_ICON[row.chip.group](20);
}

// The four fact icons, in the order the KPI row draws them. The
// figures beside them are computed, not typed.
const FACT_ICONS = [
  <FactNote key="bets" size={19} />,
  <FactTarget key="hit" size={19} />,
  <FactTrend key="wagered" size={19} />,
  <FactWave key="returned" size={19} />,
];

export default function HomeContent({
  bets,
  routes = PREVIEW_ROUTES,
  onJump,
  period,
  range,
  onPeriod,
  onRange,
}: {
  /** The preview passes demo bets; the live page passes the signed in
      user's own. The page itself never knows which. */
  bets: BetWithLegs[];
  routes?: PerfRoutes;
  /** Switch to Lab in place instead of navigating. The tab area passes
      this so a ranked row swaps the view rather than loading a page. */
  onJump?: (sel: string) => void;
  /** The window, owned by the tab area and shared with Lab and
      Totals. The pill in the corner used to be a picture of a control
      that read "This month" over an all time number. */
  period: PeriodKey;
  range: CustomRange;
  onPeriod: (key: PeriodKey) => void;
  onRange: (r: CustomRange) => void;
}) {
  const [periodOpen, setPeriodOpen] = useState(false);
  // The period is applied by filtering the bets, so every figure on
  // the page follows: the number, the chart, the KPI row and the
  // ranked list, with no call site knowing about dates.
  const view = buildHomeView(makeEngine(betsIn(bets, period, range)));
  return (
    <>
        {/* The colour wash behind the chart and KPI row, re-extracted
            from "2. big chart Aug 28.png": his 29 August order to go
            back to that sheet's fade. It ends before the insight card,
            which stands on the plain page. */}
        <div className="pointer-events-none absolute inset-x-0 top-[48px] h-[245px]">
          <Image
            src="/preview-assets/home-wash.png"
            alt=""
            fill
            priority
            sizes="390px"
            style={{ objectFit: "fill" }}
          />
          <WashTexture />
        </div>

        {/* Net profit and the period selector. */}
        <div className="relative mt-[10px] flex items-center justify-between pl-[22px] pr-[10px]">
          <p
            className={`flex items-center gap-[1px] ${T_LABEL} ${W_SEMI}`}
            style={{ color: NET_LABEL }}
          >
            Net profit
            <InfoDot size={13} />
          </p>
          <span className="relative top-[2px] z-30">
            <PeriodPill
              period={period}
              onPick={onPeriod}
              open={periodOpen}
              setOpen={setPeriodOpen}
              range={range}
              onRange={onRange}
            />
          </span>
        </div>

        {/* The number. */}
        <p
          className={`relative mt-[4px] pl-[18px] text-[45px] ${W_BOLD} leading-none`}
          style={{ color: view.positive ? INDIGO : RED }}
        >
          {view.netProfit}
        </p>

        {/* The ROI and record line. */}
        <p className={`relative mt-[7px] flex items-center gap-[4px] pl-[22px] ${T_LABEL} ${W_SEMI}`}>
          <MiniTrend size={12} />
          <span style={{ color: view.positive ? SUBGREEN : RED }}>
            {view.roiLine}
          </span>
          <span
            className="mx-[1px] inline-block h-[3px] w-[3px] rounded-full"
            style={{ background: DOT_MUTED }}
          />
          <span style={{ color: NET_LABEL }}>{view.recordLine}</span>
        </p>

        {/* The chart: full width, no card, blending into the wash. Its
            right end rides up beside the number, like the sheet. */}
        <div className="relative mt-[-30px]">
          <div className="pl-[22px] pr-[54px]">
            <HeroChart
              values={view.series}
              top={view.chartTop}
              bottom={view.chartBottom}
              width={313.6}
              height={CHART_H_HOME}
            />
          </div>
          <div
            className={`absolute right-0 top-0 w-[38px] ${T_TINY} ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            {view.yLabels.map((label, i) => (
              <span
                key={label + i}
                className="absolute left-0"
                style={{ top: [-9, 24, 58, 91][i] }}
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className={`mt-[12px] flex justify-between pl-[24px] pr-[52px] text-[7px] ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            {view.xLabels.map((label, i) => (
              <span key={label + i}>{label}</span>
            ))}
          </div>
        </div>

        <div className="min-h-[16px] grow" />

        {/* One cohesive KPI row on the wash, groups packed closer by
            his 29 August edit 7. */}
        <div className="relative flex items-center pl-[33px]">
          {["90px", "172px", "260px"].map((left) => (
            <span
              key={left}
              className="absolute top-1/2 h-[28px] w-px -translate-y-1/2"
              style={{ left, background: DIVIDER }}
            />
          ))}
          {view.kpis.map((f, i) => (
            <div
              key={f.label}
              className="flex items-center gap-[6px]"
              style={{ width: ["74px", "78px", "86px", "auto"][i] }}
            >
              <span className="relative top-[-3px]">{FACT_ICONS[i]}</span>
              <div>
                <p className={`text-[12.5px] ${W_BOLD} leading-none tracking-[-0.01em]`}>
                  {f.value}
                </p>
                <p className={`mt-[3px] ${T_NANO}`} style={{ color: GREY_TEXT }}>
                  {f.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-[12px] grow-[2]" />

        {/* Actuals noticed: its own section on the plain page. */}
        <div
          className={`relative mx-[15px] flex h-[45px] items-center ${R_CHIP} pl-[7px] pr-[12px]`}
          style={{
            background: AMBER_BG,
            boxShadow: `inset 0 0 0 1px ${AMBER_EDGE}`,
          }}
        >
          <span
            className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full"
            style={{ background: AMBER_TILE }}
          >
            <GoldSparkle size={16} />
          </span>
          <div className="ml-[11px] min-w-0 flex-1 leading-[1.4]">
            <p className={`text-[7.8px] ${W_SEMI}`} style={{ color: ORANGE }}>
              Actuals noticed
            </p>
            <p className="mt-[2px] whitespace-nowrap text-[8.7px]" style={{ color: AMBER_INK }}>
              {view.insight}
            </p>
          </div>
          <Chev size={11} color={ORANGE} />
        </div>

        <div className="min-h-[12px] grow-[2]" />

        {/* What drives your result. */}
        <div className="relative flex items-start justify-between pl-[20px] pr-[19px]">
          <div>
            <h2 className={`whitespace-nowrap text-[11.2px] ${W_BOLD}`}>
              What drives your result
            </h2>
            <p className="mt-[1px] whitespace-nowrap text-[8.9px]" style={{ color: GREY_TEXT }}>
              Ranked by contribution to net profit
            </p>
          </div>
          <div className="relative top-[3px] flex shrink-0 items-center gap-[6px]">
            {/* The pill opens the Heat Map page, 29 August 2026. Tap
                wiring only: nothing about the pill's look changes. */}
            <Link
              href={routes.heatmap}
              className={`flex h-[23px] items-center gap-[4px] rounded-full px-[9px] ${T_SMALL} ${W_SEMI}`}
              style={{ background: PILL_LAV, color: INDIGO }}
            >
              <HeatDots size={11} />
              Heat Map
            </Link>
            <span
              className={`flex h-[23px] items-center gap-[4px] rounded-full px-[9px] ${T_SMALL} ${W_SEMI}`}
              style={{ background: PILL_LAV, color: INDIGO }}
            >
              <ChangedMark size={12} />
              What changed?
            </span>
          </div>
        </div>

        {/* The top list. */}
        <div className="relative mt-[8px]">
          {view.rows.map((row, i) => (
            <Link
              key={row.chip.group + row.name}
              href={`${routes.lab}?sel=${encodeURIComponent(row.sel)}`}
              onClick={(e) => {
                if (!onJump) return;
                e.preventDefault();
                onJump(row.sel);
              }}
              className={
                i === 0
                  ? `mx-[12px] mb-[4px] flex h-[49px] items-center ${R_INNER} bg-white pl-[8px] pr-[12px]`
                  : "mx-[12px] flex h-[47px] items-center pl-[8px] pr-[12px]"
              }
              style={
                i === 0
                  ? { boxShadow: "0 6px 16px rgba(28,24,58,0.08)" }
                  : { borderTop: i > 1 ? `1px solid ${HAIR}` : undefined }
              }
            >
              <span
                className={`flex h-[19.5px] w-[19.5px] shrink-0 items-center justify-center rounded-full ${T_LABEL} ${W_BOLD}`}
                style={
                  i === 0
                    ? { background: INDIGO_FILL, color: ON_BRAND }
                    : { background: HAIRLINE, color: RANK_INK }
                }
              >
                {i + 1}
              </span>
              <span
                className={`ml-[13px] flex h-[30px] w-[30px] shrink-0 items-center justify-center ${R_SMALL}`}
                style={{ background: row.positive ? PILL_LAV : ROW_TILE_BAD }}
              >
                {rowIcon(row)}
              </span>
              <div className="ml-[16px] w-[100px] shrink-0">
                <p className={`whitespace-nowrap ${T_STRONG} ${W_BOLD} leading-[1.2]`}>
                  {row.name}
                </p>
                <p
                  className={`mt-[2px] flex items-center gap-[7px] whitespace-nowrap text-[8.2px] ${W_SEMI}`}
                  style={{ color: GREY_TEXT }}
                >
                  {row.record}
                  <span
                    className="inline-block h-[2.5px] w-[2.5px] rounded-full"
                    style={{ background: GREY_TEXT }}
                  />
                  {row.hit}
                </p>
              </div>
              <div className="ml-[8px] w-[74px] shrink-0">
                <Spark values={row.spark} positive={row.positive} />
              </div>
              <div className="ml-auto w-[58px] shrink-0 text-right">
                <p className={`${T_LEAD} ${W_BOLD} leading-[1.2]`} style={{ color: row.positive ? GREEN : RED }}>
                  {row.moneyLabel}
                </p>
                <p className={`mt-[1px] ${T_NANO} ${W_SEMI}`} style={{ color: row.positive ? GREEN : RED }}>
                  {row.roi}
                </p>
              </div>
              <span className="ml-[6px] shrink-0">
                <Chev size={10} color={CHEV} />
              </span>
            </Link>
          ))}
        </div>

        {/* The door to Lab. It lands on an EMPTY Lab, the ruling:
            "i want a view inside the lab that is clean from
            selections." */}
        <Link
          href={routes.lab}
          onClick={(e) => {
            if (!onJump) return;
            e.preventDefault();
            onJump("");
          }}
          className={`relative mx-[14px] mt-[8px] flex h-[69px] items-center ${R_TILE} pl-[15px] pr-[15px]`}
          style={{ background: LAB_CARD }}
        >
          <span
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                `radial-gradient(115% 115% at 32% 22%, ${ORB_HI} 0%, ${ORB_TINT} 55%, ${ORB_DEEP} 100%)`,
            }}
          >
            <OrbLayers size={25} />
          </span>
          <div className="ml-[13px] min-w-0 flex-1 pt-[2px] leading-[1.55]">
            <p className={`whitespace-nowrap text-[10.2px] ${W_BOLD}`}>
              Build your performance view
            </p>
            <p className="mt-[4px] text-[7.8px]" style={{ color: GREY_TEXT }}>
              Create custom views in{" "}
              <span className={`${W_SEMI}`} style={{ color: INDIGO }}>
                Lab
              </span>
              .
              <br />
              Combine Sport, What you bet, Where,
              <br />
              How, Risk and more.
            </p>
          </div>
          <span
            className={`relative top-[-2px] ml-[8px] flex h-[21px] w-[105px] shrink-0 items-center justify-center gap-[5px] rounded-full ${T_BODY} ${W_SEMI} text-white`}
            style={{ background: INDIGO_FILL }}
          >
            Explore Lab
            <Chev size={7} color={ON_BRAND} />
          </span>
        </Link>
    </>
  );
}
