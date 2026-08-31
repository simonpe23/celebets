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
import Link from "next/link";
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

// The four bottom tabs. On the public previews they are inert: a
// preview is a picture of a design, and a tap that left the preview
// area would be a surprise. On the live pages they are real links, or
// the bar would strand you on Performance.
const LIVE_TABS = {
  track: "/app",
  performance: "/stats",
  research: "/recommendations",
  // Profile IS today's Settings page, promoted to a tab by his ruling
  // of 26 August 2026 and due a rework.
  profile: "/settings",
};

// One tab: a link on the live pages, a plain span on the previews.
function TabSlot({
  live,
  href,
  children,
}: {
  live: boolean;
  href: string;
  children: ReactNode;
}) {
  const cls =
    "flex flex-1 flex-col items-center justify-center gap-[4px] py-1.5";
  return live ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

export default function PerfPage({
  children,
  tail = TAIL_SHORT,
  live = false,
}: {
  children: ReactNode;
  /** True on the live pages, where the tab bar must navigate. */
  live?: boolean;
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
          <TabSlot live={live} href={LIVE_TABS.track}>
            <TrackTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: TAB_IDLE }}>
              Track
            </span>
          </TabSlot>
          <TabSlot live={live} href={LIVE_TABS.performance}>
            <PerformanceTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: INDIGO }}>
              Performance
            </span>
          </TabSlot>
          <TabSlot live={live} href={LIVE_TABS.research}>
            <ResearchTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: TAB_IDLE }}>
              Research
            </span>
          </TabSlot>
          <TabSlot live={live} href={LIVE_TABS.profile}>
            <ProfileTabIcon size={TAB_ICON} />
            <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: TAB_IDLE }}>
              Profile
            </span>
          </TabSlot>
        </div>
      </nav>
    </div>
  );
}
