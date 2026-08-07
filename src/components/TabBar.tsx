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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 16l5-5 4 4 7-7" />
      <path d="M20 8v5h-5" />
    </svg>
  );
}

function ResearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

const ICONS = [TrackIcon, PerformanceIcon, ResearchIcon];

export default function TabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-300/70 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0B0D14]/90">
      <div className="mx-auto flex w-full max-w-md items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-bold ${
                active
                  ? "text-[#58287F] dark:text-[#A97FD0]"
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
