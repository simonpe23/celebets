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
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

function PerformanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M5 20v-6M12 20V6M19 20v-10" />
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
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-md items-stretch rounded-3xl bg-white/95 p-1.5 shadow-[0_12px_34px_-14px_rgba(46,16,80,0.5)] ring-1 ring-neutral-900/5 backdrop-blur dark:bg-[#171226]/95 dark:ring-white/10">
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold ${
                active
                  ? "text-[#7C3AED] dark:text-[#A78BFA]"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-xl ${
                  active ? "bg-[#7C3AED]/12 dark:bg-[#A78BFA]/15" : ""
                }`}
              >
                <Icon />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
