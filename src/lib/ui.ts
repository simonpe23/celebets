// Surfaces and controls, in one place, matched to the owner's mockups.
//
// The dark card is a cool near-black with a visible hairline, not a
// purple-cast panel. The light card is white on a near-white page. Both
// carry a real border, because the mockup's cards are defined by their
// edge, not by a shadow.
export const CARD =
  "rounded-2xl bg-white ring-1 ring-neutral-900/[0.06] shadow-[0_1px_2px_rgba(16,16,26,0.04)] dark:bg-[#0E1228] dark:ring-white/[0.07] dark:shadow-none";

// The inner row inside a card: pending bets sit on this.
export const INNER =
  "rounded-xl bg-neutral-50 ring-1 ring-neutral-900/[0.05] dark:bg-white/[0.03] dark:ring-white/[0.06]";

// The primary action. text-base is 13px on the app's one list, which
// is exactly what this button was before phase 2 of the size and
// layout job: it is the one control whose size did not move. Nearly
// square corners, and the mockup's own
// vertical gradient: #5525C6 at the top down to #4915AD at the foot,
// both sampled from mobile-dark-10.png. The owner chose this over the
// flatter, darker #4C1D95 he had been shown before.
//
// The shape is still squarer than instinct suggests. He rejected
// rounded-xl and rounded-lg as too much of a pill.
export const BTN =
  "rounded-md bg-gradient-to-b from-brand-top to-brand-bottom text-base font-semibold text-white active:from-brand-bottom active:to-brand-press disabled:opacity-60";

// Add to any row that scrolls sideways. iOS paints a grey bar along
// the bottom of the row while a finger is on it, and in a row of chips
// that bar runs straight through the buttons: the owner sent a
// screenshot of it cutting a filter in half. Added August 2026 and
// swept across every sideways row in the app at the same time, because
// they all had it and he only happened to hit one of them.
// Nothing is lost. A row of chips that visibly runs off the edge
// already tells you it scrolls.
export const NO_SCROLLBAR =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// THE ONE JOB RULE (August 2026). The owner: "the purple color is too
// overwhelming, it's just too much purple, everywhere."
//
// He was right, and the cause was not the shade. Purple was doing seven
// jobs at once: brand, button, active tab, link, badge, data line and
// decoration. Twelve purple objects sat on the first screen. A color
// that means seven things means nothing, so nothing looked important.
//
// Purple now means ONE thing: something you press. The primary button,
// the active tab, and the primary capture tile.
//
// Everything else found another way to be seen:
//   links        ink plus a chevron, not a color
//   data lines   green up, red down, or neutral when not money
//   insights     the accent below, the app's one secondary color
//   brand        the wordmark and the avatar, kept purple by the owner
//
// INSIGHT ACCENT. Warm amber against the navy: the opposite temperature
// to purple, which is what gives the app variety instead of a second
// shade of the same thing. It marks insights and nothing else, so
// Performance reads as its own place rather than more of Track.
export const ACCENT = "text-[#B45309] dark:text-[#FBBF24]";
// Unused right now: the AI badge that carried it was removed by
// the owner. Kept because the accent needs a tinted form the moment
// anything else on Performance is marked as an insight.
export const ACCENT_TINT =
  "bg-[#B45309]/10 text-[#B45309] dark:bg-[#FBBF24]/15 dark:text-[#FBBF24]";

// A link inside a card. Ink, with a chevron doing the pointing. This
// replaced four purple links on the Track page alone.
export const CARD_LINK =
  "shrink-0 text-sm font-semibold text-neutral-600 dark:text-neutral-300";

// An outcome control on a pending pick: a quiet tinted pill that names
// what happened. Never a filled bar, which shouted louder than the bet.
// The green and red are the mockup's own, brighter than Tailwind's
// emerald-600 and red-600, and the same in both themes so a settled
// pick reads identically wherever it is seen.
export const OUTCOME =
  "rounded-lg border px-4 py-1.5 text-sm font-bold disabled:opacity-50";
export const OUTCOME_WON =
  "border-[#22C55E]/35 bg-[#22C55E]/10 text-[#22C55E] active:bg-[#22C55E]/20";
export const OUTCOME_LOST =
  "border-[#EF4444]/35 bg-[#EF4444]/10 text-[#EF4444] active:bg-[#EF4444]/20";

// ===================================================================
// THE PAGE'S OWN SHAPES.
//
// Added 31 August 2026, pass two of the design system job. His order:
// "I want to change one thing in one file and have it update across
// every page. Font, font size, a colour, a height, a corner radius,
// spacing."
//
// The type scale and the corner radii are in `globals.css`, because
// they are Tailwind's own theme and every page reaches them by name.
// What is here is the handful of strings the pages were repeating
// word for word: the page frame, its column, the title at the top and
// the heading on a card. Each was written out seven to eleven times.
//
// Same rule as everywhere else: a value used once, on one page, stays
// on that page.
// ===================================================================

// The page frame. Every full screen in the app is this: a column that
// fills the height, with the tab bar as its last child.
export const PAGE = "flex min-h-svh flex-col px-4 pt-6 pb-2 sm:px-6";

// The readable column inside it. Phone width, centred on anything
// wider, with a standard gap between blocks.
export const COLUMN = "mx-auto w-full max-w-md space-y-4";

// EVERY SIZE HERE IS A NAME FROM THE ONE SCALE, since 31 August 2026,
// phase 2 of the size and layout job. They used to be hand written
// pixels. The list lives in `src/app/globals.css` and nowhere else,
// and `design-check.mjs` rule 14 fails the build on a size typed by
// hand anywhere in the app.

// The page's own name, top left. One per screen.
export const PAGE_TITLE = "text-2xl font-bold tracking-tight";

// The heading on a card. Track's "Track a bet", Settings' "Your
// account", Research's "Coming to Research".
export const SECTION_HEAD = "text-lg font-bold";

// A money figure inside a card, in the numeral face. It is the same
// size as SECTION_HEAD today and deliberately a separate line: a
// heading and a number are different jobs, and moving one should not
// move the other.
export const CARD_FIGURE = "font-money text-lg font-bold tabular-nums";
