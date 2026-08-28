// The new Performance Home, built identically from the owner's mockup
// 14. Chat Aug 27.png (28 August 2026). Static preview: every number,
// word and colour is copied from the sheet. The one edit the owner
// allowed: the mockup's purple is replaced with the app's pre-defined
// purple (brand-top and brand-bottom for fills, brand-mark for lines,
// links and icons).
//
// Faces: words are Plus Jakarta Sans, the closest free match to the
// mockup's rounded geometric face (its paid reference is Circular Std,
// same as the wordmark). Best effort substitute, per the owner's
// instruction of 28 August 2026. The numerals are narrow in the sheet
// and measure out as Inter Tight, the app's own numeral face, so data
// lines carry font-money exactly as the rest of the app does.
//
// Light only: the mockup sheet is light, dark is a later round, so
// this page pins its own colours and ignores the theme toggle.

import { Plus_Jakarta_Sans } from "next/font/google";
import { BigChart, Spark } from "./charts";
import {
  CalendarIcon,
  ChangedIcon,
  Chevron,
  FlaskIcon,
  FootballIcon,
  GaugeIcon,
  HeatIcon,
  PerformanceTabIcon,
  ProfileTabIcon,
  PropsIcon,
  ResearchTabIcon,
  SinglesIcon,
  SlidersIcon,
  SparkleIcon,
  TargetIcon,
  TrackTabIcon,
} from "./icons";

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
});

// The mockup's palette, pixel sampled 28 August 2026.
const INK = "#0B0B0D";
const LABEL = "#71757F";
const META = "#767A87";
const SUB = "#858893";
const GREEN = "#12A012";
const RED = "#F81A1E";
const ORANGE = "#F97735";
const HAIR = "#E8E3E0";
const CARD = "#FCFAF9";

const ROWS = [
  {
    icon: <TargetIcon size={32} />,
    name: "Moneyline",
    meta: "30–16",
    hit: "65% Hit Rate",
    note: "Biggest strength",
    spark: "up1" as const,
    sparkColor: "var(--brand-mark)",
    money: "+$2,658",
    moneyColor: GREEN,
  },
  {
    icon: <FootballIcon size={32} />,
    name: "Premier League",
    meta: "12–7",
    hit: "63% Hit Rate",
    spark: "up2" as const,
    sparkColor: GREEN,
    money: "+$743",
    moneyColor: GREEN,
  },
  {
    icon: <GaugeIcon size={32} />,
    name: "Low odds",
    meta: "21–11",
    hit: "66% Hit Rate",
    spark: "up3" as const,
    sparkColor: GREEN,
    money: "+$612",
    moneyColor: GREEN,
  },
  {
    icon: <SinglesIcon size={32} />,
    name: "Singles",
    meta: "32–24",
    hit: "57% Hit Rate",
    spark: "up4" as const,
    sparkColor: GREEN,
    money: "+$440",
    moneyColor: GREEN,
  },
  {
    icon: <PropsIcon size={32} />,
    name: "Player Props",
    meta: "8–13",
    hit: "38% Hit Rate",
    spark: "down" as const,
    sparkColor: RED,
    money: "−$440",
    moneyColor: RED,
  },
];

const FACTS = [
  { value: "49–38", label: "Record" },
  { value: "56%", label: "Hit Rate" },
  { value: "18.4%", label: "ROI" },
  { value: "87", label: "Bets" },
];

export default function PerformanceHomePreview() {
  return (
    <div
      className={`${pjs.variable} min-h-svh`}
      style={{
        background: "#F8F4F3",
        color: INK,
        fontFamily: "var(--font-pjs)",
      }}
    >
      <div className="mx-auto max-w-[390px] px-3 pb-20 pt-4">
        {/* Page title. The mockup titles the page; copied as drawn. */}
        <h1 className="ml-1.5 text-[26px] font-bold tracking-[-0.02em]">
          Performance
        </h1>

        {/* The Home / Lab / Totals switcher. */}
        <div
          className="mt-4 flex h-[25px] items-center rounded-full p-[2px]"
          style={{
            background: "#FBF8F7",
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

        {/* The result: net profit on the left, four facts on the right. */}
        <div className="mt-5 flex items-start">
          <div className="min-w-0 flex-1 pl-[14px]">
            <p
              className="text-[8.5px] font-bold uppercase tracking-[0.12em]"
              style={{ color: LABEL }}
            >
              Net profit
            </p>
            <p
              className="font-money mt-1 text-[40px] font-semibold leading-none tracking-[-0.01em]"
              style={{ color: GREEN }}
            >
              +$2,637
            </p>
          </div>
          <div className="mr-6 mt-[2px] grid w-[124px] shrink-0 grid-cols-2">
            {FACTS.map((f, i) => (
              <div
                key={f.label}
                className="px-1 py-1 text-center"
                style={{
                  borderLeft: i % 2 === 1 ? `1px solid ${HAIR}` : undefined,
                  borderTop: i > 1 ? `1px solid ${HAIR}` : undefined,
                }}
              >
                <p className="font-money text-[13px] font-bold leading-tight">
                  {f.value}
                </p>
                <p className="text-[9.5px]" style={{ color: META }}>
                  {f.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* The chart: y labels left, green line, wash, end dot. */}
        <div className="mt-2.5 flex items-stretch gap-2">
          <div
            className="font-money relative w-[36px] shrink-0 text-right text-[9.5px] font-semibold"
            style={{ color: SUB }}
          >
            {/* The labels sit on their own lines: $0 rides the zero line. */}
            <span className="absolute right-0 top-[-2px]">$3K</span>
            <span className="absolute right-0 top-[53px]">$0</span>
            <span className="absolute bottom-[10px] right-0">{"−$1.5K"}</span>
          </div>
          <div className="min-w-0 flex-1">
            <BigChart height={88} />
            <div
              className="font-money mt-1 flex justify-between border-t px-3 text-[9.5px] font-semibold"
              style={{ color: SUB, borderColor: HAIR }}
            >
              {["Jun 12", "Jul 1", "Jul 19", "Aug 7", "Aug 25"].map((d) => (
                <span key={d} className="flex flex-col items-center">
                  <span
                    className="h-[3px] w-px"
                    style={{ background: "#C9C4C1" }}
                  />
                  <span className="pt-[2px]">{d}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* The time selector, centred under the chart. */}
        <div
          className="mx-auto mt-2.5 flex h-[26px] w-[287px] items-center rounded-full p-[2px]"
          style={{ background: "#F1EDEB" }}
        >
          <span
            className="flex h-[22px] w-[52px] items-center justify-center rounded-full text-[11.5px] font-bold"
            style={{
              background: "#FCFAF9",
              boxShadow: "0 1px 3px rgba(20,18,16,0.10)",
            }}
          >
            ALL
          </span>
          {["1D", "1W", "1M", "1Y"].map((t) => (
            <span
              key={t}
              className="flex h-[22px] flex-1 items-center justify-center text-[11px] font-semibold"
              style={{ color: "#3E4249" }}
            >
              {t}
            </span>
          ))}
          <span className="flex h-[22px] w-[34px] items-center justify-center">
            <CalendarIcon size={14} />
          </span>
        </div>

        <div className="mt-2.5 border-t" style={{ borderColor: HAIR }} />

        {/* The insight strip: the sparkle door and the heat map door. */}
        <div className="mt-2 flex gap-2">
          <div
            className="flex w-[214px] shrink-0 items-center gap-1.5 rounded-[9px] py-[6px] pl-2 pr-1.5"
            style={{ background: CARD, boxShadow: `inset 0 0 0 1px ${HAIR}` }}
          >
            <SparkleIcon size={19} />
            <div className="min-w-0 flex-1 leading-[1.35]">
              <p className="text-[9px] font-semibold" style={{ color: ORANGE }}>
                Insight:
              </p>
              <p className="whitespace-nowrap text-[9.5px] font-semibold tracking-[-0.015em]">
                Moneyline is your strongest Edge.
              </p>
            </div>
            <Chevron size={11} />
          </div>
          <div
            className="flex flex-1 items-center gap-1.5 overflow-hidden rounded-[9px] py-[5px] pl-2 pr-1.5"
            style={{ background: CARD, boxShadow: `inset 0 0 0 1px ${HAIR}` }}
          >
            <HeatIcon size={18} />
            <p className="min-w-0 flex-1 whitespace-nowrap text-[10.5px] font-semibold leading-tight">
              View heat map
            </p>
            <Chevron size={11} />
          </div>
        </div>

        {/* The findings. */}
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-[16.5px] font-bold tracking-[-0.01em]">
            What defines your performance
          </h2>
          <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand-mark">
            <ChangedIcon size={14} />
            What changed
          </span>
        </div>
        <p className="mt-0.5 text-[11.5px]" style={{ color: SUB }}>
          The five patterns driving your result.
        </p>

        <div className="mt-1">
          {ROWS.map((row, i) => (
            <div
              key={row.name}
              className="flex items-center gap-2 py-[7px]"
              style={{ borderTop: i > 0 ? `1px solid ${HAIR}` : undefined }}
            >
              <div className="w-[34px] shrink-0">{row.icon}</div>
              <div className="w-[110px] shrink-0">
                <p className="whitespace-nowrap text-[13.5px] font-bold leading-tight">
                  {row.name}
                </p>
                <p
                  className="font-money mt-[3px] flex items-center gap-1 whitespace-nowrap text-[10.5px] font-semibold"
                  style={{ color: META }}
                >
                  {row.meta}
                  <span
                    className="inline-block h-[3px] w-[3px] rounded-full"
                    style={{ background: META }}
                  />
                  {row.hit}
                </p>
                {row.note ? (
                  <p className="mt-[3px] text-[10.5px] font-semibold text-brand-mark">
                    {row.note}
                  </p>
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Spark
                  shape={row.spark}
                  color={row.sparkColor}
                  width={112}
                  height={36}
                />
              </div>
              <p
                className="font-money w-[58px] shrink-0 text-right text-[15px] font-semibold"
                style={{ color: row.moneyColor }}
              >
                {row.money}
              </p>
            </div>
          ))}
        </div>

        {/* The door to Lab. */}
        <div
          className="mt-1.5 flex items-center gap-2.5 rounded-[11px] px-3 py-[9px]"
          style={{ background: CARD, boxShadow: `inset 0 0 0 1px ${HAIR}` }}
        >
          <SlidersIcon size={30} />
          <div className="min-w-0 flex-1 leading-snug">
            <p className="text-[12px] font-bold">Build your performance view</p>
            <p className="text-[10.5px] leading-[1.35]" style={{ color: SUB }}>
              Combine the facts you care about and see the answer instantly.
            </p>
          </div>
          <span className="flex h-[32px] w-[104px] shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-b from-brand-top to-brand-bottom text-[12.5px] font-semibold text-white">
            Open Lab
          </span>
        </div>
      </div>

      {/* The four tab bar, Performance active. */}
      <div
        className="fixed inset-x-0 bottom-0 border-t"
        style={{ background: "#F8F4F3", borderColor: HAIR }}
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
