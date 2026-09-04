"use client";

// THE SINCE RESTART BUTTON, his order of 4 September 2026: "add a
// since restart button, that looks good."
//
// It was one entry in the period menu until then, two taps down and
// invisible until you opened it. As a button it is on the screen, it
// says which record you are reading without being opened, and it is
// one tap.
//
// IT IS NOT ONE OF THE PERIODS. The button chooses WHICH RECORD, the
// period control beside it chooses WHICH WINDOW inside that record, so
// "Since restart" and "This month" read as one sentence rather than a
// contradiction. They were the same control for about an hour and
// printed the same words twice, side by side, which is exactly what
// the first screenshot showed.
//
// It wears Lab's selected chip, because that is what it is: a
// selection that is on or off.
//
// ONE COMPONENT, TWO CONTROLS. `PeriodPill` draws it beside the period
// pill on Home, Lab, Totals and the Heat Map. Compare draws it under
// its header, because Compare has never taken the shared period and
// keeps its own 1M / 3M / 6M / 1Y / All control. Two copies of this
// markup would be two chances for the two halves of Performance to
// disagree about what a restart looks like.

import {
  CARD,
  INDIGO_FILL,
  ON_BRAND,
  SELECTOR_INK,
  T_SMALL,
  W_SEMI,
} from "@/components/performance/ui";

// The lift under a resting capsule, shared with the period pill's own
// trigger so two controls sitting next to each other cannot drift.
export const LIFT = "0 1px 3px rgba(30,25,60,0.07)";

export default function RestartChip({
  on,
  onChange,
}: {
  /** True while the page is counting from the restart. */
  on: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange?.(!on)}
      aria-pressed={on}
      aria-label="Count from your restart"
      className={`flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-full px-[10px] ${T_SMALL} ${W_SEMI}`}
      style={
        on
          ? { background: INDIGO_FILL, color: ON_BRAND }
          : { background: CARD, color: SELECTOR_INK, boxShadow: LIFT }
      }
    >
      Since restart
    </button>
  );
}
