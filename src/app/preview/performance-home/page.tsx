// The new Performance Home, built from zero to the owner's six sheets
// of 28 August 2026: Performance Menu (+_2), hero chart, kpi row +
// insights row_2, mini buttons, top list. Every colour was pixel
// sampled and every size measured from the sheets at their own scales
// (hero and kpi share one canvas at 3.29x, top list is the phone frame
// at 3.27x, mini buttons at 4.31x, the menu frame at 1.87x). Nothing
// is inherited from the discarded builds.
//
// The one ruled exception to "identical": the sheets' indigo wears the
// app's pre-defined purple. His words: "Swap to the app's purple" and,
// for the menu, "copy the design of them, but keep apps purple".
//
// Words are Plus Jakarta Sans, the standing best-effort match for the
// sheets' rounded geometric face. Light only: the sheets are light.

import { Plus_Jakarta_Sans } from "next/font/google";
import { HeroChart, Spark } from "./charts";
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
  PerformanceTabIcon,
  ProfileTabIcon,
  RedTarget,
  ResearchTabIcon,
  TrackTabIcon,
  TrendTileIcon,
  WashTexture,
} from "./icons";

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
});

// Pixel sampled from the sheets, 28 August 2026.
const INK = "#1C1C21";
const GREEN_HERO = "#3FA43C";
const GREEN = "#3EA35B";
const RED = "#E24C50";
const GREY_LABEL = "#6E7076";
const GREY_META = "#55575E";
const GREY_SUB = "#545B69";
const AMBER_TEXT = "#B08332";
const AMBER_GOLD = "#C08A28";

const ROWS = [
  {
    rank: 1,
    icon: <DollarIcon />,
    tile: "#EDEBFA",
    name: "Moneyline",
    meta: "30-16",
    hit: "60% hit rate",
    spark: "up1" as const,
    sparkColor: "var(--brand-mark)",
    money: "+$2,658",
    roi: "ROI +31%",
    moneyColor: GREEN,
  },
  {
    rank: 2,
    icon: <BallIcon />,
    tile: "#EDEBFA",
    name: "Premier League",
    meta: "14-8",
    hit: "64% hit rate",
    spark: "up2" as const,
    sparkColor: "var(--brand-mark)",
    money: "+$743",
    roi: "ROI +22%",
    moneyColor: GREEN,
  },
  {
    rank: 3,
    icon: <TrendTileIcon />,
    tile: "#EDEBFA",
    name: "Low odds",
    meta: "18-11",
    hit: "62% hit rate",
    spark: "up3" as const,
    sparkColor: "var(--brand-mark)",
    money: "+$612",
    roi: "ROI +15%",
    moneyColor: GREEN,
  },
  {
    rank: 4,
    icon: <LayersIcon />,
    tile: "#EDEBFA",
    name: "Singles",
    meta: "24-18",
    hit: "57% hit rate",
    spark: "up4" as const,
    sparkColor: "var(--brand-mark)",
    money: "+$440",
    roi: "ROI +11%",
    moneyColor: GREEN,
  },
  {
    rank: 5,
    icon: <RedTarget />,
    tile: "#FAEBEB",
    name: "Player Props",
    meta: "7-11",
    hit: "39% hit rate",
    spark: "down" as const,
    sparkColor: RED,
    money: "-$440",
    roi: "ROI -18%",
    moneyColor: RED,
  },
];

const FACTS = [
  { icon: <FactNote />, value: "87", label: "Bets" },
  { icon: <FactTarget />, value: "56%", label: "Hit rate" },
  { icon: <FactTrend />, value: "$10.9K", label: "Wagered" },
  { icon: <FactWave />, value: "$13.6K", label: "Returned" },
];

export default function PerformanceHomePreview() {
  return (
    <div
      className={`${pjs.variable} min-h-svh`}
      style={{
        background: "#FAFAFD",
        color: INK,
        fontFamily: "var(--font-pjs)",
      }}
    >
      <div className="relative mx-auto max-w-[390px] pb-16 pt-2">
        {/* The soft wash the hero sits on: lavender low left, peach low
            right, a blush top right, fading out before the list. It
            runs BEHIND the chart and the fact strip so they blend, the
            cohesion the owner pointed at. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[40px] h-[420px]"
          style={{
            background:
              "radial-gradient(70% 60% at 8% 62%, rgba(216,204,246,0.55), transparent 70%), radial-gradient(55% 52% at 96% 78%, rgba(250,229,220,0.60), transparent 72%), radial-gradient(45% 42% at 92% 6%, rgba(250,236,240,0.55), transparent 70%), linear-gradient(180deg, rgba(251,247,252,0.9), rgba(249,243,250,0.75) 55%, rgba(250,250,253,0))",
            maskImage:
              "linear-gradient(180deg, black 72%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, black 72%, transparent 100%)",
          }}
        >
          <WashTexture />
        </div>

        {/* The menu, from the Performance Menu sheets: full width under
            the status bar, no title, no icons. */}
        <div
          className="relative mx-2 mt-2 flex h-[27px] items-center rounded-full p-[2px]"
          style={{ background: "#F5F3FB" }}
        >
          <span className="flex h-[23px] w-[109px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-top to-brand-bottom text-[12.5px] font-semibold text-white">
            Home
          </span>
          <span
            className="flex h-[23px] flex-1 items-center justify-center text-[12.5px] font-semibold"
            style={{ color: "#6B6E76" }}
          >
            Lab
          </span>
          <span
            className="flex h-[23px] flex-1 items-center justify-center text-[12.5px] font-semibold"
            style={{ color: "#6B6E76" }}
          >
            Totals
          </span>
        </div>

        {/* Net profit and the This month selector. */}
        <div className="relative mt-[25px] flex items-center justify-between pl-[25px] pr-[14px]">
          <p
            className="flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: "#3A3C42" }}
          >
            Net profit
            <InfoDot size={12} />
          </p>
          <span
            className="flex h-[25px] items-center gap-1.5 rounded-full bg-white px-3 text-[8.5px] font-semibold"
            style={{ boxShadow: "0 1px 3px rgba(30,25,60,0.07)" }}
          >
            This month
            <ChevDown size={9} />
          </span>
        </div>

        {/* The number. */}
        <p className="relative mt-[6px] pl-[25px] text-[56px] font-extrabold leading-none tracking-[-0.01em] text-brand-mark">
          +$2,637
        </p>

        {/* The ROI and record line. */}
        <p className="relative mt-[10px] flex items-center gap-2 pl-[25px] text-[8.5px] font-semibold">
          <MiniTrend size={11} color={GREEN_HERO} />
          <span style={{ color: GREEN_HERO }}>+24.1% ROI</span>
          <span
            className="mx-1 inline-block h-[3px] w-[3px] rounded-full"
            style={{ background: "#9B9DA5" }}
          />
          <span style={{ color: "#3A3C42" }}>49–38 Record</span>
        </p>

        {/* The chart, scale labels on the right. */}
        <div className="relative mt-[8px]">
          <div className="pl-[24px] pr-[71px]">
            <HeroChart height={126} />
          </div>
          <div
            className="absolute right-[14px] top-0 h-[126px] w-[48px] text-left text-[8px] font-semibold"
            style={{ color: "#63656D" }}
          >
            <span className="absolute left-2 top-[-1px]">$3K</span>
            <span className="absolute left-2 top-[38px]">$1.5K</span>
            <span className="absolute left-2 top-[80px]">$0</span>
            <span className="absolute bottom-[-4px] left-2">-$1.5K</span>
          </div>
          <div
            className="mt-[13px] flex justify-between pl-[23px] pr-[52px] text-[8px] font-semibold"
            style={{ color: "#63656D" }}
          >
            <span>Mar 1</span>
            <span>Mar 8</span>
            <span>Mar 15</span>
            <span>Mar 22</span>
            <span>Mar 29</span>
          </div>
        </div>

        {/* The fact strip, a light card blending with the wash. */}
        <div
          className="relative mx-[10px] mt-[8px] flex h-[55px] items-center justify-between rounded-[12px] px-5"
          style={{
            background: "rgba(255,255,255,0.55)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.75)",
          }}
        >
          {FACTS.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              {f.icon}
              <div className="leading-[1.35]">
                <p className="text-[12.5px] font-bold">{f.value}</p>
                <p className="text-[9.5px]" style={{ color: GREY_LABEL }}>
                  {f.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actuals noticed. */}
        <div
          className="relative mx-[10px] mt-[9px] flex h-[43px] items-center gap-2.5 rounded-[12px] pl-2 pr-3"
          style={{
            background: "#FDF8EB",
            boxShadow: "inset 0 0 0 1px #F2E7C8",
          }}
        >
          <span
            className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full"
            style={{ background: "#F3E4BE", outline: "6px solid #F3E4BE" }}
          >
            <GoldSparkle size={12} />
          </span>
          <div className="ml-1.5 min-w-0 flex-1 leading-[1.5]">
            <p className="text-[7px] font-semibold" style={{ color: AMBER_TEXT }}>
              Actuals noticed
            </p>
            <p className="text-[8px] font-semibold" style={{ color: "#2E2F35" }}>
              <span style={{ color: AMBER_GOLD }}>Player Props</span> drove most
              of your losses this month.
            </p>
          </div>
          <Chev size={9} color={AMBER_GOLD} />
        </div>

        {/* What drives your result. */}
        <div className="relative mt-[20px] flex items-center justify-between pl-[22px] pr-[14px]">
          <div>
            <h2 className="text-[15px] font-bold tracking-[-0.01em]">
              What drives your result
            </h2>
            <p className="mt-[2px] text-[8.5px]" style={{ color: GREY_SUB }}>
              Ranked by contribution to net profit
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="flex h-[25px] items-center gap-1 rounded-full px-2.5 text-[8.5px] font-semibold text-brand-mark"
              style={{ background: "#F0EEFB" }}
            >
              <HeatDots size={9} />
              Heat Map
            </span>
            <span
              className="flex h-[25px] items-center gap-1 rounded-full px-2.5 text-[8.5px] font-semibold text-brand-mark"
              style={{ background: "#F0EEFB" }}
            >
              <ChangedMark size={10} />
              What changed?
            </span>
          </div>
        </div>

        {/* The top list. */}
        <div className="relative mt-[12px]">
          {ROWS.map((row, i) => (
            <div
              key={row.name}
              className={
                row.rank === 1
                  ? "mx-[10px] flex h-[49px] items-center rounded-[12px] bg-white pl-[9px] pr-[10px]"
                  : "mx-[10px] flex h-[44px] items-center pl-[9px] pr-[10px]"
              }
              style={
                row.rank === 1
                  ? { boxShadow: "0 7px 18px rgba(28,24,58,0.10)" }
                  : { borderTop: i > 1 ? "1px solid #ECECF0" : undefined }
              }
            >
              <span
                className={
                  row.rank === 1
                    ? "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-top to-brand-bottom text-[8.5px] font-bold text-white"
                    : "flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full text-[8.5px] font-bold"
                }
                style={
                  row.rank === 1 ? undefined : { background: "#EBEBED", color: "#4A4C52" }
                }
              >
                {row.rank}
              </span>
              <span
                className="ml-[11px] flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-[9px]"
                style={{ background: row.tile }}
              >
                {row.icon}
              </span>
              <div className="ml-[15px] w-[97px] shrink-0">
                <p className="whitespace-nowrap text-[12.5px] font-bold leading-[1.2]">
                  {row.name}
                </p>
                <p
                  className="mt-[2px] flex items-center gap-1 whitespace-nowrap text-[8px] font-semibold"
                  style={{ color: GREY_META }}
                >
                  {row.meta}
                  <span
                    className="inline-block h-[2.5px] w-[2.5px] rounded-full"
                    style={{ background: GREY_META }}
                  />
                  {row.hit}
                </p>
              </div>
              <div className="min-w-0 flex-1 pl-1 pr-3">
                <Spark shape={row.spark} color={row.sparkColor} width={71} height={22} />
              </div>
              <div className="w-[54px] shrink-0 text-right">
                <p className="text-[12.5px] font-bold leading-[1.2]" style={{ color: row.moneyColor }}>
                  {row.money}
                </p>
                <p className="mt-[1px] text-[8px] font-semibold" style={{ color: row.moneyColor }}>
                  {row.roi}
                </p>
              </div>
              <span className="ml-2 shrink-0">
                <Chev size={10} color="#C3C4C9" />
              </span>
            </div>
          ))}
        </div>

        {/* The door to Lab. */}
        <div
          className="relative mx-[10px] mt-[9px] flex h-[66px] items-center rounded-[14px] pl-[13px] pr-[13px]"
          style={{ background: "#F4F2F9" }}
        >
          <span
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 18%, #C7B9F2 0%, var(--brand-mark) 48%, var(--brand-top) 100%)",
            }}
          >
            <OrbLayers size={24} />
          </span>
          <div className="ml-[14px] min-w-0 flex-1 leading-[1.45]">
            <p className="text-[13px] font-bold tracking-[-0.01em]">
              Build your performance view
            </p>
            <p className="text-[8.5px]" style={{ color: "#5A5C64" }}>
              Create custom views in{" "}
              <span className="font-semibold text-brand-mark">Lab</span>.
              <br />
              Combine Sport, What you bet, Where,
              <br />
              How, Risk and more.
            </p>
          </div>
          <span className="ml-2 flex h-[25px] shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-top to-brand-bottom px-3 text-[10.5px] font-semibold text-white">
            Explore Lab
            <Chev size={8} color="#FFFFFF" />
          </span>
        </div>
      </div>

      {/* The tab bar, marks from the top list sheet, Performance on. */}
      <div className="fixed inset-x-0 bottom-0" style={{ background: "#FBFBFB" }}>
        <div className="mx-auto flex max-w-[390px] items-start justify-between px-10 pb-3 pt-2.5">
          <span className="flex w-12 flex-col items-center gap-[3px]">
            <TrackTabIcon size={14} />
            <span className="text-[8px] font-semibold" style={{ color: "#26262B" }}>
              Track
            </span>
          </span>
          <span className="flex w-14 flex-col items-center gap-[3px]">
            <PerformanceTabIcon size={14} />
            <span className="text-[8px] font-semibold text-brand-mark">
              Performance
            </span>
          </span>
          <span className="flex w-12 flex-col items-center gap-[3px]">
            <ResearchTabIcon size={14} />
            <span className="text-[8px] font-semibold" style={{ color: "#26262B" }}>
              Research
            </span>
          </span>
          <span className="flex w-12 flex-col items-center gap-[3px]">
            <ProfileTabIcon size={14} />
            <span className="text-[8px] font-semibold" style={{ color: "#26262B" }}>
              Profile
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
