// THE FIRST DAYS, SIDE BY SIDE. Every page of the app, drawn against
// six records from an empty account to ten settled bets.
//
// Built 2 September 2026 for the silence job, phase 1. He asked to see
// the silence before anything was changed: "Tell me what you find at
// one bet, three bets and five bets on every page, before you change
// anything." This is that, as addresses he can open on his phone
// rather than a list in a chat.
//
// It is also what `emptytest.mjs` reads, so the same records that he
// looks at are the ones the build checks.

import Link from "next/link";
import TabBar from "@/components/TabBar";
import { SET_LABELS, SET_NOTES, SET_ORDER } from "./data";
import { CARD, COLUMN, PAGE, PAGE_TITLE, SECTION_HEAD } from "@/lib/ui";

const VIEWS: { key: string; label: string }[] = [
  { key: "track", label: "Track" },
  { key: "home", label: "Performance, Home" },
  { key: "lab", label: "Lab" },
  { key: "totals", label: "Totals" },
  { key: "heatmap", label: "Heat Map" },
  { key: "compare", label: "Compare" },
  { key: "bets", label: "All Bets" },
];

export default function FirstBetsIndex() {
  return (
    <main className={PAGE}>
      <div className={COLUMN}>
        <div>
          <h1 className={PAGE_TITLE}>The first days</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Every page of the app, drawn against a brand new account and
            against its first ten bets. Demo numbers, never real ones.
          </p>
        </div>

        {SET_ORDER.map((set) => (
          <section key={set} className={`${CARD} p-4`}>
            <h2 className={SECTION_HEAD}>{SET_LABELS[set]}</h2>
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
              {SET_NOTES[set]}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {VIEWS.map((v) => (
                <Link
                  key={v.key}
                  href={
                    v.key === "track"
                      ? `/preview/firstbets/${set}/track`
                      : `/preview/firstbets/${set}?view=${v.key}`
                  }
                  className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-700 dark:bg-white/[0.06] dark:text-neutral-200"
                >
                  {v.label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}
