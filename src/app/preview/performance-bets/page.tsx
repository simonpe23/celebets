// The All Bets preview shell, job 5: the page column, the Figtree
// face and the floating sticky tab bar, all the accepted Home's. The
// living page is BetsApp.tsx.
//
// Reached from Lab's "See these N bets" and Totals' "See all bets",
// and the back arrow returns to whichever one sent you.

import { Suspense } from "react";
import { Figtree } from "next/font/google";
import {
  PerformanceTabIcon,
  ProfileTabIcon,
  ResearchTabIcon,
  TrackTabIcon,
} from "../performance-home/icons";
import BetsApp from "./BetsApp";
import { INDIGO, INK, PAGE_BG, TAB_EDGE, TAB_GLASS, TAB_IDLE } from "../performance-lab/ui";

const fig = Figtree({
  subsets: ["latin"],
  variable: "--font-fig",
});

export default function PerformanceHeatmapPreview() {
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
        <Suspense fallback={null}>
          <BetsApp />
        </Suspense>
        <div className="min-h-[6px] grow" />
      </div>

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
