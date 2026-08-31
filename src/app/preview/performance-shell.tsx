// THE PERFORMANCE PAGE SHELL. One component, drawn by all six pages.
//
// Added 30 August 2026. Every one of the six page.tsx files used to
// repeat the same three things: the Figtree face, the 390pt phone
// column, and the whole four icon floating tab bar. The tab bar was
// byte for byte identical in all six, which means six places to miss
// when anything about it changes.
//
// What a page keeps for itself is its content. What every page shares
// is here, and the measurements come from `./performance-ui`.
//
// The tab bar is drawn, not wired: these are previews, and the four
// tabs do not navigate. That was true before this component existed
// and nothing about it changed.

import type { ReactNode } from "react";
import {
  COL_W,
  FONT_CLASS,
  FONT_FAMILY,
  INDIGO,
  INK,
  PAGE_BG,
  PerfTail,
  R_BAR,
  TAB_BAR_W,
  TAB_EDGE,
  TAB_GLASS,
  TAB_ICON,
  TAB_IDLE,
  TAIL_SHORT,
  T_LABEL,
  W_SEMI,
} from "./performance-ui";
import {
  PerformanceTabIcon,
  ProfileTabIcon,
  ResearchTabIcon,
  TrackTabIcon,
} from "./performance-icons";

export default function PerfPage({
  children,
  tail = TAIL_SHORT,
}: {
  children: ReactNode;
  // The spacer at the foot of the column, which decides how leftover
  // height is shared out. Home and Lab pass TAIL_TALL because they
  // have their own growing gaps higher up and this one has to lose.
  tail?: PerfTail;
}) {
  return (
    <div
      className={`${FONT_CLASS} flex min-h-svh flex-col`}
      style={{
        background: PAGE_BG,
        color: INK,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div className={`relative mx-auto flex w-full ${COL_W} flex-1 flex-col`}>
        {children}
        <div className={tail} />
      </div>

      {/* The tab bar: a floating card, sticky at the foot of the page
          like every other page in the app (see TabBar.tsx for why
          sticky, mt-auto and last child are the mechanics). Taller,
          icons more prominent: the owner's round 2 instruction 6. */}
      <nav className="sticky bottom-0 z-40 mt-auto px-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] pt-3">
        <div
          className={`mx-auto flex w-full ${TAB_BAR_W} items-stretch ${R_BAR} p-1`}
          style={{
            background: TAB_GLASS,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: `0 6px 20px -10px rgba(16,16,26,0.35), inset 0 0 0 1px ${TAB_EDGE}`,
          }}
        >
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <TrackTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: TAB_IDLE }}>
              Track
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <PerformanceTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: INDIGO }}>
              Performance
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <ResearchTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: TAB_IDLE }}>
              Research
            </span>
          </span>
          <span className="flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5">
            <ProfileTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: TAB_IDLE }}>
              Profile
            </span>
          </span>
        </div>
      </nav>
    </div>
  );
}
