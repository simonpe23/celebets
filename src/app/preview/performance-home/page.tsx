// The new Performance Home, round 2, rebuilt to the owner's full page
// mockups of 28 August 2026: "1. mockup_Aug 28.png" is the overview
// and the spec from the KPI row down; "2. big chart Aug 28.png" is the
// spec for the top: the menu row with the Heat Map pill, the result,
// and the full width chart that blends into the page (no card). Both
// are 853px wide for a 390pt frame, scale 2.187.
//
// The wash behind the chart and the KPI row is the sheet's own
// background, lifted from "2. big chart Aug 28.png" by sampling only
// clean background pixels and interpolating (the owner approved using
// a background image for this effect). It lives at
// public/preview-assets/home-wash.png. The contour texture is redrawn
// on top at very low opacity, behind the chart, per his round 2 note.
//
// Round 2 direct orders also applied: the menu sits higher, the KPI
// row blends into the chart, one cohesive KPI row (not the sheet's 2x2
// grid), no logo block up top, the page runs to the bottom like the
// sheet, and the bottom tab bar is taller with more prominent icons
// regardless of the mockup, his instruction 6.
//
// The one ruled exception to "identical": the sheets' indigo wears the
// app's pre-defined purple. His words: "keep apps purple".

import Image from "next/image";
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

// Pixel sampled from the round 2 sheets.
const INK = "#1C1C21";
const GREEN_HERO = "#3FA43C";
const GREEN = "#3EA35B";
const RED = "#E24C50";
const GREY_LABEL = "#6E7076";
const GREY_META = "#55575E";
const AMBER_TEXT = "#B08332";
const AMBER_GOLD = "#C08A28";
const HAIR = "#EDEDEF";
const PILL_LAV = "#F0EDFB";

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
  { icon: <FactNote size={18} />, value: "87", label: "Bets" },
  { icon: <FactTarget size={18} />, value: "56%", label: "Hit rate" },
  { icon: <FactTrend size={18} />, value: "$10.9K", label: "Wagered" },
  { icon: <FactWave size={18} />, value: "$13.6K", label: "Returned" },
];

export default function PerformanceHomePreview() {
  return (
    <div
      className={`${pjs.variable} min-h-svh`}
      style={{
        background: "#FAF9FC",
        color: INK,
        fontFamily: "var(--font-pjs)",
      }}
    >
      <div className="relative mx-auto max-w-[390px] pb-[86px] pt-2">
        {/* The sheet's own background, behind the chart and KPI row. */}
        <div className="pointer-events-none absolute inset-x-0 top-[40px] h-[372px]">
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

        {/* The menu row: switcher left, Heat Map right, high up. */}
        <div className="relative flex items-center justify-between px-[14px]">
          <div
            className="flex h-[33px] w-[261px] items-center rounded-full p-[5px]"
            style={{ background: "#F2F0F8" }}
          >
            <span className="flex h-[23px] w-[73px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-top to-brand-bottom text-[13px] font-semibold text-white">
              Home
            </span>
            <span
              className="flex h-[23px] flex-1 items-center justify-center text-[13px] font-semibold"
              style={{ color: "#6B6E76" }}
            >
              Lab
            </span>
            <span
              className="flex h-[23px] flex-1 items-center justify-center text-[13px] font-semibold"
              style={{ color: "#6B6E76" }}
            >
              Totals
            </span>
          </div>
          <span
            className="flex h-[33px] items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-brand-mark"
            style={{ background: PILL_LAV }}
          >
            <HeatDots size={11} />
            Heat Map
          </span>
        </div>

        {/* Net profit and the This month selector. */}
        <div className="relative mt-[22px] flex items-center justify-between pl-[24px] pr-[9px]">
          <p
            className="flex items-center gap-1.5 text-[12.5px] font-semibold"
            style={{ color: "#3A3C42" }}
          >
            Net profit
            <InfoDot size={13} />
          </p>
          <span
            className="flex h-[27px] items-center gap-1.5 rounded-full bg-white px-3.5 text-[11px] font-semibold"
            style={{ boxShadow: "0 1px 3px rgba(30,25,60,0.07)" }}
          >
            This month
            <ChevDown size={10} />
          </span>
        </div>

        {/* The number. */}
        <p className="relative mt-[13px] pl-[24px] text-[53px] font-extrabold leading-none tracking-[-0.02em] text-brand-mark">
          +$2,637
        </p>

        {/* The ROI and record line. */}
        <p className="relative mt-[11px] flex items-center gap-2 pl-[24px] text-[9px] font-semibold">
          <MiniTrend size={12} color={GREEN_HERO} />
          <span style={{ color: GREEN_HERO }}>+24.1% ROI</span>
          <span
            className="mx-1 inline-block h-[3px] w-[3px] rounded-full"
            style={{ background: "#9B9DA5" }}
          />
          <span style={{ color: "#3A3C42" }}>49–38 Record</span>
        </p>

        {/* The chart: full width, no card, blending into the wash. Its
            top right rides higher than the sub line, like the sheet. */}
        <div className="relative mt-[-14px]">
          <div className="pl-[22px] pr-[54px]">
            <HeroChart width={314} height={130} />
          </div>
          <div
            className="absolute right-[9px] top-0 h-[130px] w-[40px] text-left text-[8px] font-semibold"
            style={{ color: "#63656D" }}
          >
            <span className="absolute left-1.5 top-[2px]">$3K</span>
            <span className="absolute left-1.5 top-[44px]">$1.5K</span>
            <span className="absolute left-1.5 top-[86px]">$0</span>
            <span className="absolute bottom-[-4px] left-1.5">-$1.5K</span>
          </div>
          <div
            className="mt-[16px] flex justify-between pl-[22px] pr-[50px] text-[8px] font-semibold"
            style={{ color: "#63656D" }}
          >
            <span>Mar 1</span>
            <span>Mar 8</span>
            <span>Mar 15</span>
            <span>Mar 22</span>
            <span>Mar 29</span>
          </div>
        </div>

        {/* One cohesive KPI row, straight on the wash, no card. */}
        <div className="relative mt-[26px] flex items-center justify-between px-[18px]">
          {FACTS.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              {f.icon}
              <div className="leading-[1.25]">
                <p className="text-[19px] font-bold tracking-[-0.01em]">
                  {f.value}
                </p>
                <p className="text-[10.5px]" style={{ color: GREY_LABEL }}>
                  {f.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actuals noticed. */}
        <div
          className="relative mx-[16px] mt-[25px] flex h-[44px] items-center gap-2.5 rounded-[13px] pl-2 pr-2.5"
          style={{
            background: "#FEF7EA",
            boxShadow: "inset 0 0 0 1px #F3E8C9",
          }}
        >
          <span
            className="ml-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full"
            style={{ background: "#F6E8C3" }}
          >
            <GoldSparkle size={16} />
          </span>
          <div className="min-w-0 flex-1 leading-[1.5]">
            <p className="text-[10.5px] font-semibold" style={{ color: AMBER_TEXT }}>
              Actuals noticed
            </p>
            <p className="whitespace-nowrap text-[11px] font-semibold" style={{ color: "#2E2F35" }}>
              <span style={{ color: AMBER_GOLD }}>Player Props</span> drove most
              of your losses this month.
            </p>
          </div>
          <Chev size={11} color={AMBER_GOLD} />
        </div>

        {/* What drives your result. */}
        <div className="relative mt-[19px] flex items-center justify-between pl-[19px] pr-[14px]">
          <div>
            <h2 className="text-[16px] font-bold tracking-[-0.01em]">
              What drives your result
            </h2>
            <p className="mt-[3px] text-[11px]" style={{ color: "#62646C" }}>
              Ranked by contribution to net profit
            </p>
          </div>
          <span
            className="flex h-[25px] shrink-0 items-center gap-1.5 rounded-full px-3 text-[11.5px] font-semibold text-brand-mark"
            style={{ background: PILL_LAV }}
          >
            <ChangedMark size={12} />
            What changed?
          </span>
        </div>

        {/* The top list. */}
        <div className="relative mt-[13px]">
          {ROWS.map((row, i) => (
            <div
              key={row.name}
              className={
                row.rank === 1
                  ? "mx-[10px] flex h-[48px] items-center rounded-[12px] bg-white pl-[9px] pr-[10px]"
                  : "mx-[10px] flex h-[43px] items-center pl-[9px] pr-[10px]"
              }
              style={
                row.rank === 1
                  ? { boxShadow: "0 6px 16px rgba(28,24,58,0.08)" }
                  : { borderTop: i > 1 ? `1px solid ${HAIR}` : undefined }
              }
            >
              <span
                className={
                  row.rank === 1
                    ? "flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-top to-brand-bottom text-[8.5px] font-bold text-white"
                    : "flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full text-[8.5px] font-bold"
                }
                style={
                  row.rank === 1 ? undefined : { background: "#EBEBED", color: "#4A4C52" }
                }
              >
                {row.rank}
              </span>
              <span
                className="ml-[11px] flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[9px]"
                style={{ background: row.tile }}
              >
                {row.icon}
              </span>
              <div className="ml-[16px] w-[100px] shrink-0">
                <p className="whitespace-nowrap text-[12px] font-bold leading-[1.2]">
                  {row.name}
                </p>
                <p
                  className="mt-[3px] flex items-center gap-1 whitespace-nowrap text-[8.5px] font-semibold"
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
              <div className="w-[52px] shrink-0 text-right">
                <p className="text-[12px] font-bold leading-[1.2]" style={{ color: row.moneyColor }}>
                  {row.money}
                </p>
                <p className="mt-[2px] text-[8.5px] font-semibold" style={{ color: row.moneyColor }}>
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
          className="relative mx-[15px] mt-[10px] flex h-[64px] items-center rounded-[14px] pl-[12px] pr-[13px]"
          style={{ background: "#F4F1FA" }}
        >
          <span
            className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 18%, #C7B9F2 0%, var(--brand-mark) 48%, var(--brand-top) 100%)",
            }}
          >
            <OrbLayers size={23} />
          </span>
          <div className="ml-[15px] min-w-0 flex-1 leading-[1.5]">
            <p className="text-[12.5px] font-bold tracking-[-0.01em]">
              Build your performance view
            </p>
            <p className="mt-[2px] text-[9px]" style={{ color: "#5A5C64" }}>
              Create custom views in{" "}
              <span className="font-semibold text-brand-mark">Lab</span>.
              <br />
              Combine Sport, What you bet, Where,
              <br />
              How, Risk and more.
            </p>
          </div>
          <span className="ml-2 flex h-[25px] shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-top to-brand-bottom px-3 text-[11px] font-semibold text-white">
            Explore Lab
            <Chev size={8} color="#FFFFFF" />
          </span>
        </div>
      </div>

      {/* The tab bar. Taller, icons more prominent: the owner's round 2
          instruction 6, a deliberate step past the mockup. */}
      <div
        className="fixed inset-x-0 bottom-0"
        style={{ background: "#FBFAFC", boxShadow: "0 -1px 0 #EFEFF2" }}
      >
        <div className="mx-auto flex max-w-[390px] items-start justify-between px-9 pb-[14px] pt-[10px]">
          <span className="flex w-14 flex-col items-center gap-[4px]">
            <TrackTabIcon size={22} />
            <span className="text-[10.5px] font-semibold" style={{ color: "#26262B" }}>
              Track
            </span>
          </span>
          <span className="flex w-[70px] flex-col items-center gap-[4px]">
            <PerformanceTabIcon size={22} />
            <span className="text-[10.5px] font-semibold text-brand-mark">
              Performance
            </span>
          </span>
          <span className="flex w-14 flex-col items-center gap-[4px]">
            <ResearchTabIcon size={22} />
            <span className="text-[10.5px] font-semibold" style={{ color: "#26262B" }}>
              Research
            </span>
          </span>
          <span className="flex w-14 flex-col items-center gap-[4px]">
            <ProfileTabIcon size={22} />
            <span className="text-[10.5px] font-semibold" style={{ color: "#26262B" }}>
              Profile
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
