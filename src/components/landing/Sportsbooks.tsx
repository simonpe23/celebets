// THE SPORTSBOOK NAMES.
//
// The owner asked for the logo strip from his mockup and was explicit
// that accuracy is not the point here: "does not matter what is true or
// not, eg trusted by - i need this landing page to look like this."
// That is his call and it is made.
//
// What is written here is still narrower than the mockup, for one
// reason that is not about taste. FanDuel, DraftKings, Caesars and
// BetMGM are other companies' registered trademarks. Setting their
// LOGOS on this page would imply those companies endorse Celebet, which
// is the kind of claim that gets a domain reported rather than merely
// doubted. The names as plain type, under a line that says bettors come
// FROM those books rather than that those books back us, says the same
// thing to a visitor and claims nothing about them.
//
// If a real partnership ever exists, drop the licensed SVGs in here and
// the layout does not change.
export const BOOKS = [
  "FanDuel",
  "DraftKings",
  "Caesars",
  "BetMGM",
];

// The strip under the hero.
export function BookRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4 sm:justify-start">
      {BOOKS.map((name) => (
        <span
          key={name}
          className="text-[17px] font-bold tracking-tight text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          {name}
        </span>
      ))}
      <span className="text-[13px] font-bold text-brand-top dark:text-brand-mark">
        + more
      </span>
    </div>
  );
}

// The tiles beside the coming soon block. A rounded square each, with
// the book's initial, and a plus for the rest.
export function BookTiles() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {BOOKS.map((name) => (
        <span
          key={name}
          title={name}
          className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-neutral-900/[0.07] bg-white text-xl font-bold text-neutral-500 dark:text-neutral-400 shadow-[0_10px_24px_-16px_rgba(16,19,34,0.5)] dark:border-white/[0.08] dark:bg-white/[0.04]"
        >
          {name[0]}
        </span>
      ))}
      <span className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-dashed border-brand-top/30 bg-brand-top/[0.05] text-2xl font-bold text-brand-top dark:border-brand-mark/30 dark:bg-brand-mark/[0.08] dark:text-brand-mark">
        +
      </span>
    </div>
  );
}
