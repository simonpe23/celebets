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
const ICON = "h-[23px] w-[23px]";

// The active purple is the Set balance button's purple, ruled by the
// owner: one purple, not two shades of it on the same screen. On light
// that is the button's own #5525C6.
//
// Dark cannot use it. #5525C6 on the #0C1125 bar is a contrast ratio of
// about 2.3, so the selected tab reads as switched off. Dark takes the
// mockup's own answer, #9A57FC, which is what it sets its active tab in.
// Light uses the button's own top shade, dark uses the mark, which
// lifts off the navy bar. Both come from globals.css.
const ACTIVE = "text-brand-top dark:text-brand-mark";

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
// The bar's own surface. Three things the owner ruled in August 2026:
//
//   SHADE   it was white on the #F7F7FB page, so it blurred into
//           everything. It now sits a step darker than the page on
//           light, and a step lighter than it on dark, so it reads as
//           a bar in both.
//   HEIGHT  it was 78px of a 844px screen. Now 62.
//   RADIUS  rounded-[26px] was, in his word, childish. Squared down to
//           match the buttons, which he already ruled square.
//
// He chose this shade from three, side by side: tinted, white and a
// dark ink bar. The other two are gone rather than left in as options,
// because an unused variant is how the purple sprawl started.
const SURFACE =
  "bg-[#ECECF3] ring-1 ring-neutral-900/[0.07] dark:bg-[#111731] dark:ring-white/[0.09]";

export default function TabBar({
  activeHref,
  inline = false,
}: {
  activeHref?: string;
  // Drops the fixed positioning so the local preview can place the bar
  // in the flow. Tailwind v4 skips gitignored files when it generates
  // classes, so the preview cannot override `fixed` from its own file.
  // The app never passes this.
  inline?: boolean;
}) {
  // usePathname is called unconditionally on purpose. Writing
  // `activeHref ?? usePathname()` short-circuits, which skips the hook
  // on some renders and breaks the rules of hooks. It compiled locally
  // and failed the real build.
  const currentPath = usePathname();
  const pathname = activeHref ?? currentPath ?? "";

  // STICKY, NOT FIXED. The owner: "when i scroll slowly the menu bar is
  // shaking."
  //
  // Fixed pins the bar to the bottom of the browser WINDOW. Chrome on a
  // phone resizes that window continuously while it slides its toolbar
  // away, and the bar chases it a frame behind the whole time. That is
  // the shake, and no styling of the bar can fix it, because the bar is
  // not the thing that is moving.
  //
  // Sticky puts the bar in the page instead. It clings to the bottom of
  // what you can see, but it is laid out with the content, so it moves
  // with the content rather than with the window. It also takes up its
  // own space at the foot of the page, so nothing hides behind it at
  // the very bottom any more and the pages no longer need pb-32.
  //
  // For sticky to work the bar must be the LAST CHILD of the scrolling
  // element and no ancestor may clip overflow. It is the last child of
  // <main> on every page. Move it and it silently stops sticking.
  //
  // mt-auto is why every page turned into `flex min-h-svh flex-col`.
  // On a page shorter than the screen there is nothing to stick to, and
  // without it the bar would sit halfway up under the content.
  //
  // Whether this fully kills the shake is a phone question. A headless
  // browser has no collapsing toolbar to shake against, so only a real
  // phone can answer it.
  return (
    <nav
      className={
        inline
          ? ""
          : "sticky bottom-0 z-40 -mx-4 mt-auto px-4 pt-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6"
      }
    >
      <div
        className={`mx-auto flex w-full max-w-md items-stretch rounded-xl p-1 shadow-[0_6px_20px_-10px_rgba(16,16,26,0.4)] ${SURFACE}`}
      >
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold ${
                active ? ACTIVE : "text-neutral-500 dark:text-neutral-400"
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
