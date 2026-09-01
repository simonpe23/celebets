"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
//
// PROFILE JOINED ON 31 AUGUST 2026, phase 1 of the size and layout job.
// It was ruled the fourth tab on 26 August 2026 and had been missing
// here ever since, while the Performance area's own private copy of
// this bar drew all four. That is what made the bar change shape as
// you moved around the app: three tabs on Track, four on Performance.
// Profile IS today's Settings page, promoted to a tab and due a
// rework, so it points at /settings until that happens.
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
  {
    href: "/settings",
    label: "Profile",
    match: (p: string) => p.startsWith("/settings"),
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

// LIGHT ONLY, for the one area that has no dark mode.
//
// The Performance pages paint themselves light in both themes, his
// ruling: no dark mode there until the app wide redesign. Their own
// tab bar used to be hardcoded light to match. When they started
// drawing this bar instead, on 31 August 2026, the page stayed white
// in dark mode and the bar turned navy, which looked broken. These
// are the same three strings with the dark half removed, so that area
// gets back exactly what it had.
const ACTIVE_LIGHT = "text-brand-top";
const IDLE_LIGHT = "text-neutral-500"; // LIGHT ONLY, see above
const SURFACE_LIGHT = "bg-[#ECECF3] ring-1 ring-neutral-900/[0.07]";

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

function ProfileIcon({ active }: { active: boolean }) {
  // A head and shoulders, the same shape the Performance bar drew,
  // redrawn in this bar's idiom: outline idle, solid when selected.
  return active ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M12 14c-4.1 0-7.5 2.4-7.5 5.4 0 .6.5 1.1 1.1 1.1h12.8c.6 0 1.1-.5 1.1-1.1 0-3-3.4-5.4-7.5-5.4Z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      className={ICON}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.2c0-3.2 3.4-5.7 7.5-5.7s7.5 2.5 7.5 5.7" />
    </svg>
  );
}

const ICONS = [TrackIcon, PerformanceIcon, ResearchIcon, ProfileIcon];

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
  padded = false,
  links = true,
  light = false,
}: {
  activeHref?: string;
  // Drops the fixed positioning so the local preview can place the bar
  // in the flow. Tailwind v4 skips gitignored files when it generates
  // classes, so the preview cannot override `fixed` from its own file.
  // The app never passes this.
  inline?: boolean;
  // TRANSITIONAL, phase 1 of the size and layout job, 31 August 2026.
  //
  // Every app page frames itself with `PAGE` from src/lib/ui.ts, which
  // carries px-4 sm:px-6, and this bar cancels that padding and puts
  // it back so it can bleed to the page edge. The Performance area has
  // its own frame with no padding, so the bar has to carry the padding
  // itself there or it would sit flush against the screen edge.
  //
  // Phase 3 gives every page ONE frame and this prop dies with it. Do
  // not add a third case: fix the frame instead.
  padded?: boolean;
  // The public previews under /preview draw a picture of a design. The
  // Performance previews have always had an untappable bar, because a
  // tap that jumped out of the preview and into a login screen would
  // be a surprise. Passing false keeps that exactly as it was.
  links?: boolean;
  // Stay light in both themes. Only the Performance area passes this,
  // because it paints itself light in both. See ACTIVE_LIGHT above.
  light?: boolean;
}) {
  // usePathname is called unconditionally on purpose. Writing
  // `activeHref ?? usePathname()` short-circuits, which skips the hook
  // on some renders and breaks the rules of hooks. It compiled locally
  // and failed the real build.
  const currentPath = usePathname();
  const pathname = activeHref ?? currentPath ?? "";

  // THE TAB LIGHTS UP ON TOUCH, not when the page arrives.
  //
  // The owner: "i've seen them click the menu bar without anything
  // happening." It was happening. Every tab is a server page that asks
  // Supabase who you are and then downloads every bet you own, and
  // until all of that came back the old page sat there fully drawn,
  // looking untapped. usePathname only changes once the navigation is
  // finished, so the bar itself was part of the lie.
  //
  // pending is the tab you just touched. It wins over pathname until
  // the real page arrives, so the bar answers your finger in the same
  // frame. It is cleared by the effect below rather than on a timer,
  // so a navigation that fails or that you cancel does not leave the
  // wrong tab lit.
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    setPending(null);
  }, [currentPath]);
  const shown = pending ?? pathname;

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
          : `sticky bottom-0 z-40 mt-auto pt-4 pb-[calc(0.625rem+env(safe-area-inset-bottom))] ${
              padded
                ? "px-4 sm:px-6"
                : "-mx-4 px-4 sm:-mx-6 sm:px-6"
            }`
      }
    >
      <div
        className={`mx-auto flex w-full max-w-md items-stretch rounded-xl p-1 shadow-[0_6px_20px_-10px_rgba(16,16,26,0.4)] ${
          light ? SURFACE_LIGHT : SURFACE
        }`}
      >
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          const active = tab.match(shown);
          const on = light ? ACTIVE_LIGHT : ACTIVE;
          const off = light ? IDLE_LIGHT : "text-neutral-500 dark:text-neutral-400";
          const cls = `flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-semibold ${
            active ? on : off
          }`;
          const inner = (
            <>
              <Icon active={active} />
              {tab.label}
            </>
          );
          return links ? (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setPending(tab.href)}
              className={cls}
            >
              {inner}
            </Link>
          ) : (
            <span key={tab.href} className={cls}>
              {inner}
            </span>
          );
        })}
      </div>
    </nav>
  );
}
