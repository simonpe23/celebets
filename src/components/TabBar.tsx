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

// The active tab is a FILLED icon in purple on the bar's own
// background. Ruled by the owner from his own screenshot: no purple
// block behind it. A solid shape reads as selected by itself, and the
// pill was heavier than everything around it.
const ICON = "h-[26px] w-[26px]";

function TrackIcon({ active }: { active: boolean }) {
  return active ? (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={ICON}
      aria-hidden="true"
    >
      <path d="M11.47 3.4a.75.75 0 0 1 1.06 0l8.25 8.25a.75.75 0 0 1-1.06 1.06l-.47-.47v7.51A2.25 2.25 0 0 1 17 22h-2.25a.75.75 0 0 1-.75-.75V17a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v4.25a.75.75 0 0 1-.75.75H7a2.25 2.25 0 0 1-2.25-2.25v-7.51l-.47.47a.75.75 0 0 1-1.06-1.06l8.25-8.25Z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={ICON}
      aria-hidden="true"
    >
      <path d="M3.5 11 12 3.5l8.5 7.5" />
      <path d="M5.5 10v9.5h13V10" />
      <path d="M10 20.5V15h4v5.5" />
    </svg>
  );
}

function PerformanceIcon({ active }: { active: boolean }) {
  // Three bars, short then tall then middling, the shape a chart makes.
  const bars = (
    <>
      <rect x="3.5" y="13.5" width="4" height="7" rx="1.3" />
      <rect x="10" y="6.5" width="4" height="14" rx="1.3" />
      <rect x="16.5" y="10" width="4" height="10.5" rx="1.3" />
    </>
  );
  return active ? (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={ICON}
      aria-hidden="true"
    >
      {bars}
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      className={ICON}
      aria-hidden="true"
    >
      {bars}
    </svg>
  );
}

function ResearchIcon({ active }: { active: boolean }) {
  // A magnifier has no solid form that still reads as a magnifier, so
  // this one thickens instead of filling.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.9}
      strokeLinecap="round"
      className={ICON}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.8-3.8" />
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
      <div className="mx-auto flex w-full max-w-md items-stretch rounded-[26px] bg-white p-2 shadow-[0_8px_28px_-12px_rgba(16,16,26,0.35)] ring-1 ring-neutral-900/[0.06] dark:bg-[#14141E] dark:ring-white/[0.07]">
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[13px] font-semibold ${
                active
                  ? "text-[#7C3AED] dark:text-[#A78BFA]"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              <Icon active={active} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
