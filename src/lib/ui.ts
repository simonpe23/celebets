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

// The primary action. Nearly square corners, and the mockup's own
// vertical gradient: #5525C6 at the top down to #4915AD at the foot,
// both sampled from mobile-dark-10.png. The owner chose this over the
// flatter, darker #4C1D95 he had been shown before.
//
// The shape is still squarer than instinct suggests. He rejected
// rounded-xl and rounded-lg as too much of a pill.
export const BTN =
  "rounded-md bg-gradient-to-b from-[#5525C6] to-[#4915AD] text-[13px] font-semibold text-white active:from-[#4915AD] active:to-[#3D0F94] disabled:opacity-60";

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
