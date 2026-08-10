"use client";

import Link from "next/link";
import TabBar from "@/components/TabBar";
import { CARD, CARD_LINK, INNER } from "@/lib/ui";

// The Research tab, the third layer of the product.
//
// Research happens BEFORE a bet. It is active: the user goes looking.
// That is what separates it from insights, which happen AFTER a bet and
// which Celebet surfaces on its own. The owner drew that line himself
// and it is why insights live inside Performance and not here.
//
// Nothing on this page is built yet. Every door needs data Celebet does
// not have: squads, lines, weather, a model. Soon badges rather than
// dead links, ruled by the owner in August 2026.
//
// The badge sits on the search field only. The doors are under a
// heading that already says "Coming to Research", and six identical
// SOON pills down one column said the same thing six times.
//
// The icons are ink, not colored. Colour would say "this works". They
// earn a colour when they ship.

const DOORS = [
  {
    title: "Who is playing",
    detail: "Line-ups, injuries and who is rested, before you back them.",
    icon: (
      <>
        <path d="M16 20v-1.5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3V20" />
        <circle cx="10" cy="7.5" r="3.2" />
        <path d="M20 20v-1.5a3 3 0 0 0-2.2-2.9M15.5 4.6a3.2 3.2 0 0 1 0 5.9" />
      </>
    ),
  },
  {
    title: "Team and player trends",
    detail: "Recent form, home and away splits, head to head.",
    icon: (
      <>
        <path d="M3.5 15.5 9 10l3.5 3.5L20.5 5.5" />
        <path d="M15.5 5.5h5v5" />
      </>
    ),
  },
  {
    title: "Compare odds",
    detail: "The same bet across the books, so you see who pays most.",
    icon: (
      <>
        <path d="M12 4v16" />
        <path d="M5 8h14" />
        <path d="M5 8 2.8 13.2a2.8 2.8 0 0 0 4.4 0Z" />
        <path d="M19 8l2.2 5.2a2.8 2.8 0 0 1-4.4 0Z" />
      </>
    ),
  },
  {
    title: "Weather",
    detail: "Wind and rain, which move totals more than most people think.",
    icon: (
      <>
        <path d="M7.5 18.5h9.2a3.8 3.8 0 0 0 .3-7.6 5.5 5.5 0 0 0-10.5-1A3.9 3.9 0 0 0 7.5 18.5Z" />
      </>
    ),
  },
  {
    title: "What the community thinks",
    detail: "Where the money is going, and where it is going against you.",
    icon: (
      <>
        <path d="M20.5 12.5a7.5 7.5 0 0 1-10.6 6.8L4 20.5l1.2-5.6A7.5 7.5 0 1 1 20.5 12.5Z" />
      </>
    ),
  },
  {
    title: "Ask CeleBOT",
    detail: "A question in plain words, answered from the same data.",
    icon: (
      <>
        <rect x="4" y="7.5" width="16" height="11" rx="3" />
        <path d="M12 3.5v4M8.5 12.5h.01M15.5 12.5h.01M9.5 16h5" />
      </>
    ),
  },
];

function Soon() {
  return (
    <span className="shrink-0 rounded-full bg-neutral-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500 dark:bg-white/10 dark:text-neutral-400">
      Soon
    </span>
  );
}

export default function Research({ activeHref }: { activeHref?: string }) {
  return (
    <main className="flex min-h-svh flex-col px-4 pt-6 pb-2 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight">Research</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Everything you want to know before you place a bet. Track is
            where you log it, Performance is where you learn from it.
          </p>
        </header>

        {/* Inert on purpose. It is drawn because it is the shape the page
            will take, and it says so rather than pretending to search. */}
        <div className={`${CARD} p-4`}>
          <div className="flex items-center gap-2.5 rounded-xl bg-neutral-100 px-3 py-3 dark:bg-white/[0.04]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-[18px] w-[18px] shrink-0 text-neutral-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.8-3.8" />
            </svg>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Search a team, player or match
            </span>
            <span className="ml-auto">
              <Soon />
            </span>
          </div>
        </div>

        <section className={`${CARD} p-4`}>
          <h2 className="text-[17px] font-bold">Coming to Research</h2>
          <div className="mt-3 space-y-2">
            {DOORS.map((door) => (
              <div
                key={door.title}
                className={`${INNER} flex items-center gap-3 px-3 py-3`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[22px] w-[22px] shrink-0 text-neutral-700 dark:text-neutral-300"
                  aria-hidden="true"
                >
                  {door.icon}
                </svg>
                <span className="min-w-0 grow">
                  <span className="block text-sm font-semibold">
                    {door.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {door.detail}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* The one thing here that does work today. It is not research,
            so it is a footnote rather than a section: a pointer back to
            where insights actually live. */}
        <div className={`${CARD} flex items-center justify-between gap-3 p-4`}>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              Looking for your own numbers?
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              Everything Celebet has noticed lives in Performance.
            </span>
          </span>
          <Link href="/insights" className={CARD_LINK}>
            Insights ›
          </Link>
        </div>
      </div>
      <TabBar activeHref={activeHref} />
    </main>
  );
}
