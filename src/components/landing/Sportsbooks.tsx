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

// The strip under the hero. The names are set at logo weight, in the
// display face, spread across the full row like the mockup's logo
// strip. They are typographic placeholders standing where licensed
// marks would go, per the owner: leave placeholders for images we do
// not have yet.
export function BookRow() {
  return (
    <div className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:justify-between">
      {BOOKS.map((name) => (
        <span
          key={name}
          className="font-display text-[22px] font-extrabold tracking-tight text-neutral-800 dark:text-neutral-200"
        >
          {name}
        </span>
      ))}
      <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-top dark:text-brand-mark">
        + More
      </span>
    </div>
  );
}

// The tiles beside the coming soon block, like a row of app icons. A
// rounded square each with the book's initial, and a plus for the
// rest. Placeholder tiles until real, licensed app icons exist.
//
// They spread to fill their column rather than clustering in the
// middle of it. Centred, the row left a wedge of empty page down the
// right hand side and the whole section read as shunted left.
export function BookTiles() {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-3.5 sm:justify-between">
      {BOOKS.map((name) => (
        <span
          key={name}
          title={name}
          className="flex h-[74px] w-[74px] items-center justify-center rounded-[18px] border border-neutral-900/[0.07] bg-white font-display text-[26px] font-extrabold text-neutral-700 dark:text-neutral-200 shadow-[0_12px_28px_-16px_rgba(16,19,34,0.45)] dark:border-white/[0.08] dark:bg-white/[0.05]"
        >
          {name[0]}
        </span>
      ))}
      <span className="flex h-[74px] w-[74px] items-center justify-center rounded-[18px] border border-dashed border-brand-top/30 bg-brand-top/[0.05] text-3xl font-bold text-brand-top dark:border-brand-mark/30 dark:bg-brand-mark/[0.08] dark:text-brand-mark">
        +
      </span>
    </div>
  );
}
