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

import Image from "next/image";
import Link from "next/link";
import { Figtree } from "next/font/google";
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

const fig = Figtree({
  subsets: ["latin"],
  variable: "--font-fig",
});

// Pixel sampled from "0. Chat Aug 28.png".
const INDIGO = "#3614F0";
const INDIGO_FILL = "#3708E4";
const INK = "#101114";
const GREEN = "#1EAD2E";
const SUBGREEN = "#25B132";
const RED = "#FC1B1D";
const GREY_TEXT = "#757B87";
const NET_LABEL = "#353B49";
const ORANGE = "#EF8D08";
const HAIR = "#EDEDEF";
const PILL_LAV = "#F0EEFB";

const ROWS = [
  {
    rank: 1,
    icon: <DollarIcon size={20} />,
    tile: "#F0EEFB",
    name: "Moneyline",
    sel: "what~category~Moneyline",
    meta: "30–16",
    hit: "60% hit rate",
    spark: "s1" as const,
    money: "+$2,658",
    roi: "ROI +31%",
    moneyColor: GREEN,
  },
  {
    rank: 2,
    icon: <BallIcon size={20} />,
    tile: "#F0EEFB",
    name: "Premier League",
    sel: "where~plain~Premier League",
    meta: "14–8",
    hit: "64% hit rate",
    spark: "s2" as const,
    money: "+$743",
    roi: "ROI +22%",
    moneyColor: GREEN,
  },
  {
    rank: 3,
    icon: <TrendTileIcon size={20} />,
    tile: "#F0EEFB",
    name: "Low odds",
    sel: "risk~plain~Low odds",
    meta: "18–11",
    hit: "62% hit rate",
    spark: "s3" as const,
    money: "+$612",
    roi: "ROI +15%",
    moneyColor: GREEN,
  },
  {
    rank: 4,
    icon: <LayersIcon size={20} />,
    tile: "#F0EEFB",
    name: "Singles",
    sel: "how~plain~Singles",
    meta: "24–18",
    hit: "57% hit rate",
    spark: "s4" as const,
    money: "+$440",
    roi: "ROI +11%",
    moneyColor: GREEN,
  },
  {
    rank: 5,
    icon: <RedTarget size={20} />,
    tile: "#FEF0F0",
    name: "Player Props",
    sel: "what~category~Player Props",
    meta: "7–11",
    hit: "39% hit rate",
    spark: "s5" as const,
    money: "-$440",
    roi: "ROI -18%",
    moneyColor: RED,
  },
];

const FACTS = [
  { icon: <FactNote size={19} />, value: "87", label: "Bets" },
  { icon: <FactTarget size={19} />, value: "56%", label: "Hit rate" },
  { icon: <FactTrend size={19} />, value: "$10.9K", label: "Wagered" },
  { icon: <FactWave size={19} />, value: "$13.6K", label: "Returned" },
];

export default function PerformanceHomePreview() {
  return (
    <div
      className={`${fig.variable} flex min-h-svh flex-col`}
      style={{
        background: "#FBFBFC",
        color: INK,
        fontFamily: "var(--font-fig)",
      }}
    >
      <div className="relative mx-auto flex w-full max-w-[390px] flex-1 flex-col">
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

        {/* The Home / Lab / Totals menu, full width, high on the page. */}
        <div
          className="relative mx-[14px] mt-[7px] flex h-[36px] items-center rounded-full px-[4px]"
          style={{ background: "#F2F3F7" }}
        >
          <span
            className="flex h-[28px] w-[110px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
            style={{ background: INDIGO_FILL }}
          >
            Home
          </span>
          {/* A real link since 29 August 2026, the owner's order once
              Lab's preview existed: "make it so i can click lab and
              home in the top menu." The padding is an invisible tap
              target; nothing about the menu's look changes. */}
          <Link
            href="/preview/performance-lab"
            className="absolute left-[181px] top-1/2 -translate-x-1/2 -translate-y-1/2 px-[18px] py-[10px] text-[10.5px] font-semibold"
            style={{ color: "#6B6E7A" }}
          >
            Lab
          </Link>
          {/* A real link since 29 August 2026, when Totals got its
              page. Same menu-tap unlock he gave for Lab; nothing
              about the menu's look changes. */}
          <Link
            href="/preview/performance-totals"
            className="absolute left-[296px] top-1/2 -translate-x-1/2 -translate-y-1/2 px-[18px] py-[10px] text-[10.5px] font-semibold"
            style={{ color: "#6B6E7A" }}
          >
            Totals
          </Link>
        </div>

        {/* Net profit and the This month selector. */}
        <div className="relative mt-[10px] flex items-center justify-between pl-[22px] pr-[10px]">
          <p
            className="flex items-center gap-[1px] text-[10.5px] font-semibold"
            style={{ color: NET_LABEL }}
          >
            Net profit
            <InfoDot size={13} />
          </p>
          <span
            className="relative top-[2px] flex h-[24px] items-center gap-[3px] rounded-full bg-white px-[12px] text-[9.5px] font-semibold"
            style={{ color: "#252F3E", boxShadow: "0 1px 3px rgba(30,25,60,0.07)" }}
          >
            This month
            <ChevDown size={11} />
          </span>
        </div>

        {/* The number. */}
        <p
          className="relative mt-[4px] pl-[18px] text-[45px] font-bold leading-none"
          style={{ color: INDIGO }}
        >
          +$2,637
        </p>

        {/* The ROI and record line. */}
        <p className="relative mt-[7px] flex items-center gap-[4px] pl-[22px] text-[10.5px] font-semibold">
          <MiniTrend size={12} />
          <span style={{ color: SUBGREEN }}>+24.1% ROI</span>
          <span
            className="mx-[1px] inline-block h-[3px] w-[3px] rounded-full"
            style={{ background: "#9B9DA5" }}
          />
          <span style={{ color: NET_LABEL }}>49–38 Record</span>
        </p>

        {/* The chart: full width, no card, blending into the wash. Its
            right end rides up beside the number, like the sheet. */}
        <div className="relative mt-[-30px]">
          <div className="pl-[22px] pr-[54px]">
            <HeroChart width={313.6} height={98} />
          </div>
          <div
            className="absolute right-0 top-0 w-[38px] text-[8px] font-semibold"
            style={{ color: GREY_TEXT }}
          >
            <span className="absolute left-0 top-[-9px]">$3K</span>
            <span className="absolute left-0 top-[24px]">$1.5K</span>
            <span className="absolute left-0 top-[58px]">$0</span>
            <span className="absolute left-0 top-[91px]">-$1.5K</span>
          </div>
          <div
            className="mt-[12px] flex justify-between pl-[24px] pr-[52px] text-[7px] font-semibold"
            style={{ color: GREY_TEXT }}
          >
            <span>Mar 1</span>
            <span>Mar 8</span>
            <span>Mar 15</span>
            <span>Mar 22</span>
            <span>Mar 29</span>
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
              style={{ left, background: "#E6E7EC" }}
            />
          ))}
          {FACTS.map((f, i) => (
            <div
              key={f.label}
              className="flex items-center gap-[6px]"
              style={{ width: ["74px", "78px", "86px", "auto"][i] }}
            >
              <span className="relative top-[-3px]">{f.icon}</span>
              <div>
                <p className="text-[12.5px] font-bold leading-none tracking-[-0.01em]">
                  {f.value}
                </p>
                <p className="mt-[3px] text-[7.6px]" style={{ color: GREY_TEXT }}>
                  {f.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="min-h-[12px] grow-[2]" />

        {/* Actuals noticed: its own section on the plain page. */}
        <div
          className="relative mx-[15px] flex h-[45px] items-center rounded-[13px] pl-[7px] pr-[12px]"
          style={{
            background: "#FFF6E9",
            boxShadow: "inset 0 0 0 1px #F6E9CC",
          }}
        >
          <span
            className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full"
            style={{ background: "#FEEFD4" }}
          >
            <GoldSparkle size={16} />
          </span>
          <div className="ml-[11px] min-w-0 flex-1 leading-[1.4]">
            <p className="text-[7.8px] font-semibold" style={{ color: ORANGE }}>
              Actuals noticed
            </p>
            <p className="mt-[2px] whitespace-nowrap text-[8.7px]" style={{ color: "#2E3138" }}>
              Player Props drove most of your losses this month.
            </p>
          </div>
          <Chev size={11} color={ORANGE} />
        </div>

        <div className="min-h-[12px] grow-[2]" />

        {/* What drives your result. */}
        <div className="relative flex items-start justify-between pl-[20px] pr-[19px]">
          <div>
            <h2 className="whitespace-nowrap text-[11.2px] font-bold">
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
              href="/preview/performance-heatmap"
              className="flex h-[23px] items-center gap-[4px] rounded-full px-[9px] text-[9.5px] font-semibold"
              style={{ background: PILL_LAV, color: INDIGO }}
            >
              <HeatDots size={11} />
              Heat Map
            </Link>
            <span
              className="flex h-[23px] items-center gap-[4px] rounded-full px-[9px] text-[9.5px] font-semibold"
              style={{ background: PILL_LAV, color: INDIGO }}
            >
              <ChangedMark size={12} />
              What changed?
            </span>
          </div>
        </div>

        {/* The top list. */}
        <div className="relative mt-[8px]">
          {ROWS.map((row, i) => (
            <Link
              key={row.name}
              href={`/preview/performance-lab?sel=${encodeURIComponent(row.sel)}`}
              className={
                row.rank === 1
                  ? "mx-[12px] mb-[4px] flex h-[49px] items-center rounded-[12px] bg-white pl-[8px] pr-[12px]"
                  : "mx-[12px] flex h-[47px] items-center pl-[8px] pr-[12px]"
              }
              style={
                row.rank === 1
                  ? { boxShadow: "0 6px 16px rgba(28,24,58,0.08)" }
                  : { borderTop: i > 1 ? `1px solid ${HAIR}` : undefined }
              }
            >
              <span
                className="flex h-[19.5px] w-[19.5px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold"
                style={
                  row.rank === 1
                    ? { background: INDIGO_FILL, color: "#FFFFFF" }
                    : { background: "#EFEFF1", color: "#4A4C52" }
                }
              >
                {row.rank}
              </span>
              <span
                className="ml-[13px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: row.tile }}
              >
                {row.icon}
              </span>
              <div className="ml-[16px] w-[100px] shrink-0">
                <p className="whitespace-nowrap text-[11px] font-bold leading-[1.2]">
                  {row.name}
                </p>
                <p
                  className="mt-[2px] flex items-center gap-[7px] whitespace-nowrap text-[8.2px] font-semibold"
                  style={{ color: GREY_TEXT }}
                >
                  {row.meta}
                  <span
                    className="inline-block h-[2.5px] w-[2.5px] rounded-full"
                    style={{ background: GREY_TEXT }}
                  />
                  {row.hit}
                </p>
              </div>
              <div className="ml-[8px] w-[74px] shrink-0">
                <Spark shape={row.spark} />
              </div>
              <div className="ml-auto w-[58px] shrink-0 text-right">
                <p className="text-[11.5px] font-bold leading-[1.2]" style={{ color: row.moneyColor }}>
                  {row.money}
                </p>
                <p className="mt-[1px] text-[7.6px] font-semibold" style={{ color: row.moneyColor }}>
                  {row.roi}
                </p>
              </div>
              <span className="ml-[6px] shrink-0">
                <Chev size={10} color="#C3C4C9" />
              </span>
            </Link>
          ))}
        </div>

        {/* The door to Lab. It lands on an EMPTY Lab, the ruling:
            "i want a view inside the lab that is clean from
            selections." */}
        <Link
          href="/preview/performance-lab"
          className="relative mx-[14px] mt-[8px] flex h-[69px] items-center rounded-[14px] pl-[15px] pr-[15px]"
          style={{ background: "#F8F6FC" }}
        >
          <span
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full"
            style={{
              background:
                "radial-gradient(115% 115% at 32% 22%, #D8C6F3 0%, #C4A9EE 55%, #B090E8 100%)",
            }}
          >
            <OrbLayers size={25} />
          </span>
          <div className="ml-[13px] min-w-0 flex-1 pt-[2px] leading-[1.55]">
            <p className="whitespace-nowrap text-[10.2px] font-bold">
              Build your performance view
            </p>
            <p className="mt-[4px] text-[7.8px]" style={{ color: GREY_TEXT }}>
              Create custom views in{" "}
              <span className="font-semibold" style={{ color: INDIGO }}>
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
            className="relative top-[-2px] ml-[8px] flex h-[21px] w-[105px] shrink-0 items-center justify-center gap-[5px] rounded-full text-[10px] font-semibold text-white"
            style={{ background: INDIGO_FILL }}
          >
            Explore Lab
            <Chev size={7} color="#FFFFFF" />
          </span>
        </Link>

        <div className="min-h-[8px] grow-[3]" />
      </div>

      {/* The tab bar: a floating card, sticky at the foot of the page
          like every other page in the app (see TabBar.tsx for why
          sticky, mt-auto and last child are the mechanics). Taller,
          icons more prominent: the owner's round 2 instruction 6. */}
      <nav className="sticky bottom-0 z-40 mt-auto px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-3">
        <div
          className="mx-auto flex w-full max-w-[382px] items-stretch rounded-2xl p-1"
          style={{
            background: "rgba(252,251,253,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: "0 6px 20px -10px rgba(16,16,26,0.35), inset 0 0 0 1px #EFEFF2",
          }}
        >
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <TrackTabIcon size={24} />
            <span className="text-[10.5px] font-semibold" style={{ color: "#3E4553" }}>
              Track
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <PerformanceTabIcon size={24} />
            <span className="text-[10.5px] font-semibold" style={{ color: INDIGO }}>
              Performance
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <ResearchTabIcon size={24} />
            <span className="text-[10.5px] font-semibold" style={{ color: "#3E4553" }}>
              Research
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <ProfileTabIcon size={24} />
            <span className="text-[10.5px] font-semibold" style={{ color: "#3E4553" }}>
              Profile
            </span>
          </span>
        </div>
      </nav>
    </div>
  );
}
