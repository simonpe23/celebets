"use client";

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
import { makeEngine, type GroupKey } from "@/lib/performance-engine";
import PeriodPill from "@/components/performance/lab/PeriodPill";
import {
  betsIn,
  type CustomRange,
  type PeriodKey,
} from "@/components/performance/lab/period";
import { useState } from "react";
import type { BetWithLegs } from "@/lib/types";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import InsightSheet, { rollInsights } from "@/components/performance/insight-sheet";
import {
  BallIcon,
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
  OrbLayers,
  RedTarget,
  TrendTileIcon,
  WashTexture,
} from "@/components/performance/icons";
import {
  AMBER_BG,
  AMBER_EDGE,
  AMBER_INK,
  AMBER_TILE,
  CHART_H_HOME,
  CHEV,
  DIVIDER,
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
  T_BODY,
  T_LABEL,
  T_LEAD,
  T_NANO,
  T_SMALL,
  T_STRONG,
  T_TINY,
  W_BOLD,
  W_SEMI,
} from "@/components/performance/ui";

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
// The four KPI icons, in Lab's order and wearing Lab's icons, since
// 31 August 2026: "i want to change the kpi row on home and mirror
// labs." Bets, Record, Hit rate, ROI. The values are built in
// `home-model.ts`; this list only has to stay in step with them.
const FACT_ICONS = [
  <FactNote key="bets" size={19} />,
  <FactWave key="record" size={19} />,
  <FactTarget key="hit" size={19} />,
  <FactTrend key="roi" size={19} />,
];

export default function HomeContent({
  bets,
  routes = PREVIEW_ROUTES,
  onJump,
  onHeatmap,
  period,
  range,
  trackingSince = null,
  restarted = false,
  onRestarted,
  onPeriod,
  onRange,
  live = false,
}: {
  /** The preview passes demo bets; the live page passes the signed in
      user's own. The page itself never knows which. */
  bets: BetWithLegs[];
  routes?: PerfRoutes;
  /** The insights page is behind login, so the sheet only offers a
      door to it on the live page. */
  live?: boolean;
  /** Switch to Lab in place instead of navigating. The tab area passes
      this so a ranked row swaps the view rather than loading a page. */
  onJump?: (sel: string) => void;
  /** Open the Heat Map in place. Same reason as onJump: the Heat Map
      is a view inside the tab area now, so the pill swaps the view
      instead of loading a page and re-reading the database. */
  onHeatmap?: () => void;
  /** The window, owned by the tab area and shared with Lab and
      Totals. The pill in the corner used to be a picture of a control
      that read "This month" over an all time number. */
  period: PeriodKey;
  range: CustomRange;
  /** The restart line, or null. Only the live page passes one. */
  trackingSince?: string | null;
  /** True while the page counts from that restart rather than all of it. */
  restarted?: boolean;
  onRestarted?: (v: boolean) => void;
  onPeriod: (key: PeriodKey) => void;
  onRange: (r: CustomRange) => void;
}) {
  const [periodOpen, setPeriodOpen] = useState(false);
  // The insights sheet, 31 August 2026. null means closed.
  const [insights, setInsights] = useState<string[] | null>(null);
  // The period is applied by filtering the bets, so every figure on
  // the page follows: the number, the chart, the KPI row and the
  // ranked list, with no call site knowing about dates.
  const view = buildHomeView(makeEngine(betsIn(bets, period, range, trackingSince, restarted)));
  return (
    <>
        {/* The colour wash behind the chart and KPI row, re-extracted
            from "2. big chart Aug 28.png": his 29 August order to go
            back to that sheet's fade. It ends before the insight card,
            which stands on the plain page. */}
        {/* overflow-hidden since 31 August 2026, phase 3. The texture
            inside is a fixed viewBox drawn with overflow visible, so on
            a 320px phone its curves painted 16px past the screen edge
            and dragged the page sideways. A decoration must never be
            the reason a page scrolls. */}
        <div className="pointer-events-none absolute inset-x-0 top-[48px] h-[245px] overflow-hidden">
          <Image
            src="/preview-assets/home-wash.png"
            alt=""
            fill
            priority
            sizes="448px"
            // COVER, NOT FILL, since 31 August 2026, phase 3. `fill`
            // stretches the artwork to whatever box it is given, which
            // was exactly right while that box was always 390x245 and
            // wrong the moment the column could be any width. The
            // checker caught it at both 320 and 448 the first time it
            // was allowed to look at more than one width.
            style={{ objectFit: "cover" }}
          />
          <WashTexture />
        </div>

        {/* Net profit and the period selector. */}
        <div className="relative mt-[10px] flex items-center justify-between pl-[8px]">
          <p
            className={`flex items-center gap-[1px] ${T_LABEL} ${W_SEMI}`}
            style={{ color: NET_LABEL }}
          >
            Net profit
            <InfoDot size={13} />
          </p>
          <span className="relative top-[2px] z-30">
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
            />
          </span>
        </div>

        {/* The number. */}
        <p
          className={`relative mt-[4px] pl-[4px] text-hero ${W_BOLD} leading-none`}
          style={{ color: view.positive ? INDIGO : RED }}
        >
          {view.netProfit}
        </p>

        {/* THE ROI AND RECORD LINE IS GONE, 31 August 2026. His words:
            "Remove Roi and record inside the charts on home, lab. see
            attached image, chart is blocking those numbers." The chart
            rides up beside the number and ran straight through the
            text, so the text lost.

            The chart has NOT moved. The line took 22.75px of height
            (7px margin plus 15.75px of text) and the chart's own
            margin gives exactly that much back, so nothing below
            shifts by a pixel. */}

        {/* The chart: full width, no card, blending into the wash. Its
            right end rides up beside the number, like the sheet. */}
        <div className="relative mt-[-7.25px]">
          <div className="pl-[8px] pr-[40px]">
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
            className={`mt-[12px] flex justify-between pl-[24px] pr-[52px] text-xs ${W_SEMI}`}
            style={{ color: GREY_TEXT }}
          >
            {view.xLabels.map((label, i) => (
              <span key={label + i}>{label}</span>
            ))}
          </div>
        </div>

        <div className="min-h-[16px] max-h-[24px] grow" />

        {/* One cohesive KPI row on the wash, groups packed closer by
            his 29 August edit 7.

            FOUR EQUAL COLUMNS since 31 August 2026, phase 3 of the size
            and layout job. The four widths were 78, 92, 96 and auto,
            and the three dividers were nailed at 96, 188 and 284: all
            of them measured off a 390px mockup and all of them wrong
            at any other width. His words: "i want performance to
            expand as well as the other pages do." A quarter each is a
            quarter each at every width, and Lab's row is the same
            markup, so the two still line up. */}
        <div className="relative grid grid-cols-4 pl-[8px]">
          {view.kpis.map((f, i) => (
            <div
              key={f.label}
              className="relative flex items-center gap-[6px]"
            >
              {i > 0 ? (
                <span
                  className="absolute -left-[7px] top-1/2 h-[28px] w-px -translate-y-1/2"
                  style={{ background: DIVIDER }}
                />
              ) : null}
              <span className="relative top-[-3px]">{FACT_ICONS[i]}</span>
              <div>
                <p className={`text-base ${W_BOLD} leading-none tracking-[-0.01em]`}>
                  {f.value}
                </p>
                <p className={`mt-[3px] ${T_NANO}`} style={{ color: GREY_TEXT }}>
                  {f.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-[12px] max-h-[44px] grow-[2]" />

        {/* Actuals noticed: its own section on the plain page. Tapping
            it opens the insights sheet, his ruling of 31 August 2026.
            The sentence is computed, so a record with nothing losing
            has no sentence. The card goes with it: an amber card with
            a blank line under its heading is not a design, it is a
            hole. What a brand new account should see here instead is
            still open, in docs/open-questions.md. */}
        {view.insight ? (
        <button
          onClick={() => setInsights(rollInsights(bets))}
          aria-label="Open your insights"
          className={`relative flex h-[45px] items-center ${R_CHIP} pl-[7px] pr-[12px] text-left`}
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
          <span className="ml-[11px] block min-w-0 flex-1 leading-[1.4]">
            <span className={`block text-xs ${W_SEMI}`} style={{ color: ORANGE }}>
              Actuals noticed
            </span>
            <span
              className="mt-[2px] block truncate text-xs"
              style={{ color: AMBER_INK }}
            >
              {view.insight}
            </span>
          </span>
          <Chev size={11} color={ORANGE} />
        </button>
        ) : null}
        <InsightSheet
          items={insights}
          live={live}
          onReroll={() => setInsights(rollInsights(bets))}
          onClose={() => setInsights(null)}
        />

        <div className="min-h-[12px] max-h-[44px] grow-[2]" />

        {/* What drives your result. */}
        <div className="relative flex items-start justify-between pl-[6px] pr-[5px]">
          {/* THE HEADING TELLS THE TRUTH ABOUT WHICH MODE THIS IS.
              "Ranked by contribution" is a lie on a record where every
              fact contributed the same 100%, which is every record too
              thin to rank. Changed 2 September 2026, phase 2 of the
              silence job. */}
          <div>
            <h2 className={`whitespace-nowrap text-base ${W_BOLD}`}>
              {view.thin ? "What your record is so far" : "What drives your result"}
            </h2>
            {/* ONE LINE UNDER THE HEADING, never two. When there is
                nothing at all to list, what the block is waiting for
                IS the subtitle: saying "ranking starts when there is
                more to compare" above "nothing has settled yet" is the
                same sentence twice. */}
            <p className="mt-[1px] text-xs" style={{ color: GREY_TEXT }}>
              {view.waiting ??
                (view.thin
                  ? "Ranking starts when there is more to compare"
                  : "Ranked by contribution to net profit")}
            </p>
          </div>
          <div className="relative top-[3px] flex shrink-0 items-center gap-[6px]">
            {/* The pill opens the Heat Map, 29 August 2026. It stays a
                real link so the address works and a long press can
                open it in a new tab; the tab area intercepts the tap
                and swaps the view instead, 31 August 2026.

                IT USED TO HAVE A NEIGHBOUR, "What changed?", drawn but
                inert. He deleted it on 31 August 2026: "remove what
                changed button. i don't think it's that needed." */}
            <Link
              href={routes.heatmap}
              onClick={(e) => {
                if (!onHeatmap) return;
                e.preventDefault();
                onHeatmap();
              }}
              className={`flex h-[23px] items-center gap-[4px] rounded-full px-[9px] ${T_SMALL} ${W_SEMI}`}
              style={{ background: PILL_LAV, color: INDIGO }}
            >
              <HeatDots size={11} />
              Heat Map
            </Link>
          </div>
        </div>

        {/* WHAT THE RECORD IS, when it is too thin to rank.
            His answer of 2 September 2026, asked what Home should do
            with its empty block: show the same five Lab shows, its own
            way. And on what to show: "a thin record should always show
            everything that was a part of the bet."

            No rank numbers, because nothing is ranked. No sparkline,
            because one bet has no line. The groups and their order are
            Lab's, so the two pages cannot describe one bet two ways. */}
        {view.thin && (
          <div className="relative mt-[8px]">
            {view.groups.map((group) => (
              <div key={group.label} className="mt-[10px] first:mt-0">
                <p
                  className={`pb-[3px] pl-[8px] uppercase tracking-[0.04em] text-xs ${W_SEMI}`}
                  style={{ color: GREY_TEXT }}
                >
                  {group.label}
                </p>
                {group.rows.map((row, i) => (
                  <Link
                    key={row.chip.group + row.name}
                    href={`${routes.lab}?sel=${encodeURIComponent(row.sel)}`}
                    onClick={(e) => {
                      if (!onJump) return;
                      e.preventDefault();
                      onJump(row.sel);
                    }}
                    className="flex h-[44px] items-center pl-[8px] pr-[8px]"
                    style={{ borderTop: i > 0 ? `1px solid ${HAIR}` : undefined }}
                  >
                    <span
                      className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center ${R_SMALL}`}
                      style={{ background: row.positive ? PILL_LAV : ROW_TILE_BAD }}
                    >
                      {rowIcon(row)}
                    </span>
                    <div className="ml-[13px] min-w-0 flex-1">
                      <p className={`truncate ${T_STRONG} ${W_BOLD} leading-[1.2]`}>
                        {row.name}
                      </p>
                      <p
                        className={`mt-[2px] flex items-center gap-[7px] truncate text-xs ${W_SEMI}`}
                        style={{ color: GREY_TEXT }}
                      >
                        {row.record}
                        <span
                          className="inline-block h-[2.5px] w-[2.5px] shrink-0 rounded-full"
                          style={{ background: GREY_TEXT }}
                        />
                        {row.hit}
                      </p>
                    </div>
                    <div className="ml-[8px] shrink-0 text-right">
                      <p
                        className={`${T_LEAD} ${W_BOLD} leading-[1.2]`}
                        style={{ color: row.positive ? GREEN : RED }}
                      >
                        {row.moneyLabel}
                      </p>
                      <p
                        className={`mt-[1px] ${T_NANO} ${W_SEMI}`}
                        style={{ color: row.positive ? GREEN : RED }}
                      >
                        {row.roi}
                      </p>
                    </div>
                    <span className="ml-[6px] shrink-0">
                      <Chev size={10} color={CHEV} />
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* The top list. */}
        <div className={`relative mt-[8px]${view.thin ? " hidden" : ""}`}>
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
                  ? `mb-[4px] flex h-[49px] items-center ${R_INNER} bg-white pl-[8px] pr-[8px]`
                  : "flex h-[47px] items-center pl-[8px] pr-[8px]"
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
              {/* THE NAME AND THE SPARKLINE SHARE WHATEVER IS LEFT,
                  3 to 2, since 31 August 2026, phase 3. They were
                  w-[100px] and w-[74px], both shrink-0, which is 174px
                  of fixed width in a row whose other parts already
                  need 180. On a 320px phone that overflowed the screen
                  by 35px, which is one of the two things that made
                  small phones scroll sideways. The money never
                  shrinks: it is the one thing on the row that must not
                  be cut. */}
              <div className="ml-[16px] min-w-0 flex-[3]">
                <p className={`truncate ${T_STRONG} ${W_BOLD} leading-[1.2]`}>
                  {row.name}
                </p>
                <p
                  className={`mt-[2px] flex items-center gap-[7px] truncate text-xs ${W_SEMI}`}
                  style={{ color: GREY_TEXT }}
                >
                  {row.record}
                  <span
                    className="inline-block h-[2.5px] w-[2.5px] shrink-0 rounded-full"
                    style={{ background: GREY_TEXT }}
                  />
                  {row.hit}
                </p>
              </div>
              <div className="ml-[8px] min-w-0 max-w-[74px] flex-[2]">
                <Spark values={row.spark} positive={row.positive} />
              </div>
              <div className="ml-[8px] shrink-0 text-right">
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
          className={`relative mt-[8px] flex h-[69px] items-center ${R_TILE} pl-[15px] pr-[8px]`}
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
            <p className={`whitespace-nowrap text-sm ${W_BOLD}`}>
              Build your performance view
            </p>
            <p className="mt-[4px] text-xs" style={{ color: GREY_TEXT }}>
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
