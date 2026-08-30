// The Performance Totals shell, built to his sheet "2. Totals.png",
// 29 August 2026. Same menu geometry, colours and tab bar as Home and
// Lab, with Totals active and the other two as real links. The living
// page is TotalsApp.tsx.

import { Suspense } from "react";
import { Figtree } from "next/font/google";
import {
  PerformanceTabIcon,
  ProfileTabIcon,
  ResearchTabIcon,
  TrackTabIcon,
} from "../performance-home/icons";
import PerfMenu from "../performance-lab/PerfMenu";
import TotalsApp from "./TotalsApp";
import {
  INDIGO,
  INK,
  PAGE_BG,
  TAB_EDGE,
  TAB_GLASS,
  TAB_IDLE,
} from "../performance-ui";

const fig = Figtree({
  subsets: ["latin"],
  variable: "--font-fig",
});

export default function PerformanceTotalsPreview() {
  return (
    <div
      className={`${fig.variable} flex min-h-svh flex-col`}
      style={{
        background: PAGE_BG,
        color: INK,
        fontFamily: "var(--font-fig)",
      }}
    >
      <div className="relative mx-auto flex w-full max-w-[390px] flex-1 flex-col">
        <Suspense fallback={<div className="mx-[14px] mt-[7px] h-[36px]" />}>
          <PerfMenu active="totals" />
        </Suspense>

        <Suspense fallback={null}>
          <TotalsApp />
        </Suspense>
        <div className="min-h-[6px] grow" />
      </div>

      {/* The tab bar: the same floating sticky card as the accepted
          Home, Performance active. */}
      <nav className="sticky bottom-0 z-40 mt-auto px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-3">
        <div
          className="mx-auto flex w-full max-w-[382px] items-stretch rounded-2xl p-1"
          style={{
            background: TAB_GLASS,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: `0 6px 20px -10px rgba(16,16,26,0.35), inset 0 0 0 1px ${TAB_EDGE}`,
          }}
        >
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <TrackTabIcon size={24} />
            <span className="text-[10.5px] font-semibold" style={{ color: TAB_IDLE }}>
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
            <span className="text-[10.5px] font-semibold" style={{ color: TAB_IDLE }}>
              Research
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <ProfileTabIcon size={24} />
            <span className="text-[10.5px] font-semibold" style={{ color: TAB_IDLE }}>
              Profile
            </span>
          </span>
        </div>
      </nav>
    </div>
  );
}
