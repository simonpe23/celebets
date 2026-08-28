// The new Performance Home. First built identically from the owner's
// full page mockup 14. Chat Aug 27.png, then rebuilt area by area to
// the four sheets he shared in chat on 28 August 2026 ("i want my page
// to look like this. i love it. please try to make it look
// identical"): the purple result and chart with a This month selector,
// the four fact strip, the Actuals noticed card, the ranked list with
// numbered rows, the lavender Lab card, and the new tab bar marks.
//
// The standing edit: every mockup purple is replaced with the app's
// pre-defined purple (brand-top and brand-bottom for fills, brand-mark
// for lines, links and icons). Amber maps to the app's own insight
// accent. Other colours are read off the sheets by eye until the owner
// drops the four images into the repo for pixel sampling.
//
// Faces: words are Plus Jakarta Sans (closest free match to the
// sheets' rounded geometric face), numerals are Inter Tight through
// font-money, the app's own numeral convention.
//
// Light only: the sheets are light, dark is a later round, so this
// page pins its own colours and ignores the theme toggle.

import { Plus_Jakarta_Sans } from "next/font/google";
import { BigChart, Spark } from "./charts";
import {
  ArrowRight,
  BallIcon,
  ChangedIcon,
  Chev,
  ChevDown,
  DollarIcon,
  FactNote,
  FactTarget,
  FactTrend,
  FactWave,
  FlaskIcon,
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
} from "./icons";

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
});

// The sheets' palette, read by eye 28 August 2026, purple and amber
// mapped to the app's own accents. Pixel sampling pending the owner
// uploading the four sheets.
const INK = "#111114";
const LABEL = "#6E7076";
const SUB = "#85878E";
const GREEN = "#16A34A";
const RED = "#E5484D";
const HAIR = "#ECECF0";
const AMBER = "#B45309";

const ROWS = [
  {
    rank: 1,
    icon: <DollarIcon />,
    tile: "#EEECFA",
    name: "Moneyline",
    meta: "30–16",
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
    tile: "#EEECFA",
    name: "Premier League",
    meta: "14–8",
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
    tile: "#EEECFA",
    name: "Low odds",
    meta: "18–11",
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
    tile: "#EEECFA",
    name: "Singles",
    meta: "24–18",
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
    tile: "#FBEAEA",
    name: "Player Props",
    meta: "7–11",
    hit: "39% hit rate",
    spark: "down" as const,
    sparkColor: RED,
    money: "−$440",
    roi: "ROI −18%",
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
        background: "#F8F8FA",
        color: INK,
        fontFamily: "var(--font-pjs)",
      }}
    >
      <div className="mx-auto max-w-[390px] px-3 pb-24 pt-4">
        {/* Page title, kept from the first sheet. */}
        <h1 className="ml-1.5 text-[26px] font-bold tracking-[-0.02em]">
          Performance
        </h1>

        {/* The Home / Lab / Totals switcher, kept from the first sheet. */}
        <div
          className="mt-4 flex h-[25px] items-center rounded-full p-[2px]"
          style={{
            background: "#FDFDFE",
            boxShadow: `inset 0 0 0 1px ${HAIR}`,
          }}
        >
          <span className="flex h-[21px] flex-1 items-center justify-center rounded-full bg-gradient-to-b from-brand-top to-brand-bottom text-[12px] font-semibold text-white">
            Home
          </span>
          <span className="flex h-[21px] flex-1 items-center justify-center gap-1 text-[12px] font-semibold">
            <FlaskIcon size={14} />
            Lab
          </span>
          <span className="flex h-[21px] flex-1 items-center justify-center text-[12px] font-semibold">
            Totals
          </span>
        </div>

        {/* The result, on the soft gradient wash the sheet paints. */}
        <div
          className="relative mt-4 rounded-2xl px-1 pt-2"
          style={{
            background:
              "radial-gradient(58% 48% at 12% 14%, rgba(154,87,252,0.09), transparent 70%), radial-gradient(50% 42% at 88% 72%, rgba(244,164,188,0.10), transparent 70%), radial-gradient(46% 40% at 78% 8%, rgba(255,196,150,0.07), transparent 70%)",
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="flex items-center gap-1.5 text-[14px] font-semibold"
              style={{ color: "#3A3C42" }}
            >
              Net profit
              <InfoDot size={13} />
            </p>
            <span
              className="flex h-[30px] items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-semibold"
              style={{ boxShadow: `0 1px 4px rgba(20,20,40,0.08), inset 0 0 0 1px ${HAIR}` }}
            >
              This month
              <ChevDown size={11} />
            </span>
          </div>

          <p className="font-money mt-2 text-[40px] font-bold leading-none tracking-[-0.01em] text-brand-mark">
            +$2,637
          </p>

          <p className="mt-2 flex items-center gap-2 text-[12.5px] font-semibold">
            <MiniTrend size={13} />
            <span className="font-money" style={{ color: GREEN }}>
              +24.1% ROI
            </span>
            <span
              className="inline-block h-[3px] w-[3px] rounded-full"
              style={{ background: SUB }}
            />
            <span className="font-money" style={{ color: "#3A3C42" }}>
              49–38 Record
            </span>
          </p>

          {/* The chart: purple line, dotted zero, labels on the right. */}
          <div className="mt-3 flex items-stretch gap-2">
            <div className="min-w-0 flex-1">
              <BigChart height={112} />
              <div
                className="font-money mt-2 flex justify-between px-2 text-[10px] font-semibold"
                style={{ color: SUB }}
              >
                <span>Mar 1</span>
                <span>Mar 8</span>
                <span>Mar 15</span>
                <span>Mar 22</span>
                <span>Mar 29</span>
              </div>
            </div>
            <div
              className="font-money relative w-[34px] shrink-0 text-left text-[10px] font-semibold"
              style={{ color: SUB }}
            >
              <span className="absolute left-0 top-[-4px]">$3K</span>
              <span className="absolute left-0 top-[31px]">$1.5K</span>
              <span className="absolute left-0 top-[68px]">$0</span>
              <span className="absolute left-0 top-[104px]">{"−$1.5K"}</span>
            </div>
          </div>
        </div>

        {/* The four facts, one strip. */}
        <div
          className="mt-4 flex items-center justify-between rounded-[14px] bg-white px-3.5 py-2.5"
          style={{ boxShadow: `inset 0 0 0 1px ${HAIR}, 0 1px 4px rgba(20,20,40,0.04)` }}
        >
          {FACTS.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              {f.icon}
              <div className="leading-tight">
                <p className="font-money text-[13.5px] font-bold">{f.value}</p>
                <p className="text-[10px]" style={{ color: LABEL }}>
                  {f.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actuals noticed. Amber is the app's own insight accent. */}
        <div
          className="mt-3 flex items-center gap-2.5 rounded-[14px] py-2.5 pl-2.5 pr-3"
          style={{
            background: "#FBF3DE",
            boxShadow: "inset 0 0 0 1px #F0E2BD",
          }}
        >
          <span
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full"
            style={{ background: "#F5E7C4" }}
          >
            <GoldSparkle size={18} />
          </span>
          <div className="min-w-0 flex-1 leading-snug">
            <p className="text-[10px] font-semibold" style={{ color: AMBER }}>
              Actuals noticed
            </p>
            <p className="text-[11px] font-semibold" style={{ color: "#26262B" }}>
              <span style={{ color: AMBER }}>Player Props</span> drove most of
              your losses this month.
            </p>
          </div>
          <Chev size={12} color={AMBER} />
        </div>

        {/* The findings. */}
        <div className="mt-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="whitespace-nowrap text-[15px] font-bold tracking-[-0.01em]">
              What drives your result
            </h2>
            <p className="mt-0.5 whitespace-nowrap text-[10px]" style={{ color: SUB }}>
              Ranked by contribution to net profit
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="flex h-[25px] items-center gap-1 rounded-full px-2 text-[10px] font-semibold text-brand-mark"
              style={{ background: "#EFEDFB" }}
            >
              <HeatDots size={11} />
              Heat Map
            </span>
            <span
              className="flex h-[25px] items-center gap-1 rounded-full px-2 text-[10px] font-semibold text-brand-mark"
              style={{ background: "#EFEDFB" }}
            >
              <ChangedIcon size={12} />
              What changed?
            </span>
          </div>
        </div>

        <div className="mt-2">
          {ROWS.map((row, i) => (
            <div
              key={row.name}
              className={
                row.rank === 1
                  ? "flex items-center gap-2 rounded-2xl bg-white px-2.5 py-3"
                  : "flex items-center gap-2 px-2.5 py-[9px]"
              }
              style={
                row.rank === 1
                  ? { boxShadow: `0 8px 22px rgba(24,20,60,0.09), inset 0 0 0 1px ${HAIR}` }
                  : { borderTop: i > 1 ? `1px solid ${HAIR}` : undefined }
              }
            >
              <span
                className={
                  row.rank === 1
                    ? "font-money flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-brand-top to-brand-bottom text-[11px] font-bold text-white"
                    : "font-money flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                }
                style={row.rank === 1 ? undefined : { background: "#EFEFF3", color: "#4A4C52" }}
              >
                {row.rank}
              </span>
              <span
                className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: row.tile }}
              >
                {row.icon}
              </span>
              <div className="w-[104px] shrink-0">
                <p className="whitespace-nowrap text-[13px] font-bold leading-tight">
                  {row.name}
                </p>
                <p
                  className="font-money mt-[3px] flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold"
                  style={{ color: LABEL }}
                >
                  {row.meta}
                  <span
                    className="inline-block h-[3px] w-[3px] rounded-full"
                    style={{ background: LABEL }}
                  />
                  {row.hit}
                </p>
              </div>
              <div className="min-w-0 flex-1 pr-1">
                <Spark shape={row.spark} color={row.sparkColor} width={84} height={34} />
              </div>
              <div className="w-[58px] shrink-0 text-right">
                <p className="font-money text-[14px] font-bold" style={{ color: row.moneyColor }}>
                  {row.money}
                </p>
                <p
                  className="font-money mt-[1px] text-[10px] font-semibold"
                  style={{ color: row.moneyColor }}
                >
                  {row.roi}
                </p>
              </div>
              <Chev size={12} color="#C6C7CC" />
            </div>
          ))}
        </div>

        {/* The door to Lab. */}
        <div
          className="mt-3 flex items-center gap-3 rounded-2xl px-3 py-3"
          style={{ background: "#F1EFFB" }}
        >
          <span
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(120% 120% at 30% 20%, #C4A6FF 0%, var(--brand-mark) 45%, var(--brand-top) 100%)",
            }}
          >
            <OrbLayers size={22} />
          </span>
          <div className="min-w-0 flex-1 leading-snug">
            <p className="whitespace-nowrap text-[11.5px] font-bold tracking-[-0.01em]">Build your performance view</p>
            <p className="text-[10.5px] leading-[1.4]" style={{ color: "#5A5C64" }}>
              Create custom views in{" "}
              <span className="font-semibold text-brand-mark">Lab</span>.
              Combine Sport, What you bet, Where, How, Risk and more.
            </p>
          </div>
          <span className="flex h-[34px] shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-top to-brand-bottom px-3 text-[12px] font-semibold text-white">
            Explore Lab
            <ArrowRight size={12} />
          </span>
        </div>
      </div>

      {/* The four tab bar, Performance active, marks from the list sheet. */}
      <div
        className="fixed inset-x-0 bottom-0 border-t"
        style={{ background: "#F8F8FA", borderColor: HAIR }}
      >
        <div className="mx-auto flex max-w-[390px] items-start justify-between px-8 pb-2.5 pt-1.5">
          <span className="flex w-14 flex-col items-center gap-[3px]">
            <TrackTabIcon size={20} />
            <span className="text-[9px] font-semibold" style={{ color: INK }}>
              Track
            </span>
          </span>
          <span className="flex w-16 flex-col items-center gap-[3px]">
            <PerformanceTabIcon size={20} />
            <span className="text-[9px] font-semibold text-brand-mark">
              Performance
            </span>
          </span>
          <span className="flex w-14 flex-col items-center gap-[3px]">
            <ResearchTabIcon size={20} />
            <span className="text-[9px] font-semibold" style={{ color: INK }}>
              Research
            </span>
          </span>
          <span className="flex w-14 flex-col items-center gap-[3px]">
            <ProfileTabIcon size={20} />
            <span className="text-[9px] font-semibold" style={{ color: INK }}>
              Profile
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
