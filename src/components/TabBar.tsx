"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The three layers of the product, always on screen.
//
// This is what lets the home page stop being a menu. For months the
// home page carried navigation inside its content, which is why it
// read as a list of unrelated features. Once the three destinations
// live in a bar of their own, the home page is free to be a dashboard
// and the mental model is reinforced on every screen instead of being
// re-explained by headings.
//
// Track captures data. Performance is where you understand yourself,
// insights included. Research is where you understand the game before
// the next bet.
const TABS = [
  { href: "/app", label: "Track", match: (p: string) => p === "/app" },
  {
    href: "/stats",
    label: "Performance",
    match: (p: string) => p.startsWith("/stats"),
  },
  {
    href: "/recommendations",
    label: "Research",
    match: (p: string) => p.startsWith("/recommendations"),
  },
];

function TrackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <path d="M5 20v-6M12 20V6M19 20v-10" />
    </svg>
  );
}

function ResearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

const ICONS = [TrackIcon, PerformanceIcon, ResearchIcon];

// activeHref exists for the local preview, whose URL is /preview and
// would otherwise light no tab at all.
export default function TabBar({ activeHref }: { activeHref?: string }) {
  const pathname = activeHref ?? usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-md items-stretch gap-1 rounded-[26px] bg-white/95 p-2 shadow-[0_10px_34px_-10px_rgba(16,16,26,0.45)] ring-1 ring-neutral-900/[0.07] backdrop-blur-xl dark:bg-[#14141E]/95 dark:ring-white/[0.09]">
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] py-2.5 text-[12px] font-bold transition-colors ${
                active
                  ? "bg-[#6D28D9] text-white shadow-[0_6px_16px_-6px_rgba(109,40,217,0.8)]"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <Icon />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
