// The new Performance Lab, built piece by piece on the accepted Home's
// design. The owner's ruling, 29 August 2026: "the lab page has to
// follow Home's design and style." The living reference is
// src/app/preview/performance-home/ (read it, never edit it); the menu
// geometry, colours and tab bar below are its, with Lab active.
//
// Piece 1: the frame. The page column, the Home / Lab / Totals menu
// with Lab active (Home is a real link, Totals has no page yet), and
// the floating sticky tab bar. The six chip groups, the answer panel
// and the rest arrive in later pieces, each shown to the owner before
// the next starts.

import Link from "next/link";
import { Figtree } from "next/font/google";
import {
  PerformanceTabIcon,
  ProfileTabIcon,
  ResearchTabIcon,
  TrackTabIcon,
} from "../performance-home/icons";
import { INDIGO, INDIGO_FILL, INK, MENU_IDLE, MENU_TRACK, PAGE_BG } from "./ui";

const fig = Figtree({
  subsets: ["latin"],
  variable: "--font-fig",
});

export default function PerformanceLabPreview() {
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
        {/* The Home / Lab / Totals menu, Home's exact geometry with the
            pill moved to Lab. Label centers on Home: 59, 181, 296. */}
        <div
          className="relative mx-[14px] mt-[7px] h-[36px] rounded-full"
          style={{ background: MENU_TRACK }}
        >
          <Link
            href="/preview/performance-home"
            className="absolute left-[59px] top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10.5px] font-semibold"
            style={{ color: MENU_IDLE }}
          >
            Home
          </Link>
          <span
            className="absolute left-[126px] top-[4px] flex h-[28px] w-[110px] items-center justify-center rounded-full text-[10.5px] font-bold text-white"
            style={{ background: INDIGO_FILL }}
          >
            Lab
          </span>
          <span
            className="absolute left-[296px] top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10.5px] font-semibold"
            style={{ color: MENU_IDLE }}
          >
            Totals
          </span>
        </div>

        {/* The Lab body builds here, piece by piece. */}
        <div className="min-h-[8px] grow-[3]" />
      </div>

      {/* The tab bar: the same floating sticky card as the accepted
          Home, Performance active. */}
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
