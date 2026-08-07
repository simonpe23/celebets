// The one card surface and the one primary button, in one place.
//
// Tuned to the owner's mockups (August 2026): white cards floating on
// a lavender-white page in light mode, purple-cast near-black cards on
// a near-black page in dark mode, and a primary button that is a
// vertical violet gradient with a glow, never a flat fill. Flat fills
// were half of why the first pass read as a cheap copy.
export const CARD =
  "rounded-[20px] bg-white ring-1 ring-neutral-900/5 shadow-[0_10px_30px_-18px_rgba(46,16,80,0.45)] dark:bg-[#151022] dark:ring-white/10 dark:shadow-none";

export const BTN =
  "rounded-xl bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] font-bold text-white shadow-[0_10px_24px_-10px_rgba(124,58,237,0.7)] active:from-[#7C3AED] active:to-[#6D28D9] disabled:opacity-60";
