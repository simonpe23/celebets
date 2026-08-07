// Surfaces and controls, in one place, matched to the owner's mockups.
//
// The dark card is a cool near-black with a visible hairline, not a
// purple-cast panel. The light card is white on a near-white page. Both
// carry a real border, because the mockup's cards are defined by their
// edge, not by a shadow.
export const CARD =
  "rounded-2xl bg-white ring-1 ring-neutral-900/[0.06] shadow-[0_1px_2px_rgba(16,16,26,0.04)] dark:bg-[#13131C] dark:ring-white/[0.07] dark:shadow-none";

// The inner row inside a card: pending bets sit on this.
export const INNER =
  "rounded-xl bg-neutral-50 ring-1 ring-neutral-900/[0.05] dark:bg-white/[0.03] dark:ring-white/[0.06]";

// The primary action. Solid violet with a soft lift, not a hard glow.
export const BTN =
  "rounded-xl bg-[#7C3AED] font-semibold text-white shadow-[0_6px_18px_-8px_rgba(124,58,237,0.9)] active:bg-[#6D28D9] disabled:opacity-60";

// An outcome control on a pending pick: a quiet tinted pill that names
// what happened. Never a filled bar, which shouted louder than the bet.
export const OUTCOME =
  "rounded-lg border px-4 py-1.5 text-sm font-semibold disabled:opacity-50";
export const OUTCOME_WON =
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 active:bg-emerald-500/20 dark:text-emerald-400";
export const OUTCOME_LOST =
  "border-red-500/30 bg-red-500/10 text-red-600 active:bg-red-500/20 dark:text-red-400";
