"use client";

// THE PERIOD PILL, job 4. One control, three pages: Lab, Totals and
// the Heat Map. It wears the accepted Home's own period pill, the
// white capsule with a chevron sitting beside "Net profit", so the
// four screens read as one product. The menu below it is Lab's domain
// dropdown, same geometry and same shadow, for the same reason.

import { ChevDown } from "@/components/performance/icons";
import { Chev } from "@/components/performance/icons";
import {
  CARD,
  HAIRLINE,
  INDIGO,
  INDIGO_FILL,
  NET_LABEL,
  ON_BRAND,
  R_INNER,
  SELECTOR_INK,
  T_LABEL,
  T_SMALL,
  T_STRONG,
  W_BOLD,
  W_SEMI,
} from "@/components/performance/ui";
import {
  EMPTY_RANGE,
  PERIODS,
  labelOf,
  type CustomRange,
  type PeriodKey,
} from "./period";

// The lift under a resting capsule. One string, used by the trigger
// and by the Since restart button beside it, so two controls sitting
// next to each other cannot drift apart.
const LIFT = "0 1px 3px rgba(30,25,60,0.07)";

export default function PeriodPill({
  period,
  onPick,
  open,
  setOpen,
  align = "right",
  size = "pill",
  range = EMPTY_RANGE,
  onRange,
  hasRestart = false,
  restarted = false,
  onRestarted,
}: {
  period: PeriodKey;
  onPick: (key: PeriodKey) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  align?: "left" | "right";
  size?: "pill" | "plain";
  /** The custom window. Either end may be empty, meaning open there. */
  range?: CustomRange;
  onRange?: (r: CustomRange) => void;
  /** True once this person has restarted their record. */
  hasRestart?: boolean;
  /** True while the page is counting from that restart. */
  restarted?: boolean;
  onRestarted?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-[6px]">
      {/* SINCE RESTART, HIS ORDER OF 4 SEPTEMBER 2026: "add a since
          restart button". It was one entry in the menu below, two taps
          down and invisible until you opened it. As a button it is on
          the screen, it says which record you are reading without
          being opened, and it is one tap.

          It wears Lab's selected chip exactly, because that is what it
          is: a selection that is on or off. Tapping it on counts from
          your restart, tapping it off returns to your whole record.

          IT IS NOT ONE OF THE PERIODS BESIDE IT. The button chooses
          WHICH RECORD, the menu chooses WHICH WINDOW inside it, so
          "Since restart" and "This month" read as one sentence. They
          were the same control for an hour and printed the same words
          twice, side by side.

          It is drawn ONLY for somebody who has restarted. To everybody
          else it would name a line that does not exist and behave
          exactly like All time. */}
      {hasRestart ? (
        <button
          onClick={() => onRestarted?.(!restarted)}
          aria-pressed={restarted}
          aria-label="Count from your restart"
          className={`flex h-[24px] shrink-0 items-center whitespace-nowrap rounded-full px-[10px] ${T_SMALL} ${W_SEMI}`}
          style={
            restarted
              ? { background: INDIGO_FILL, color: ON_BRAND }
              : { background: CARD, color: SELECTOR_INK, boxShadow: LIFT }
          }
        >
          Since restart
        </button>
      ) : null}
      <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change the period"
        className={
          size === "pill"
            ? `flex h-[24px] items-center gap-[3px] rounded-full px-[12px] ${T_SMALL} ${W_SEMI}`
            : `flex items-center gap-[4px] ${T_STRONG} ${W_BOLD}`
        }
        style={
          size === "pill"
            ? {
                background: CARD,
                color: SELECTOR_INK,
                boxShadow: LIFT,
              }
            : { color: SELECTOR_INK }
        }
      >
        {labelOf(period, range)}
        <ChevDown size={size === "pill" ? 11 : 10} />
      </button>
      {open ? (
        <>
          <button
            aria-label="Close periods"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10"
          />
          <div
            className={`absolute ${
              align === "right" ? "right-0" : "left-0"
            } top-[26px] z-20 ${
              period === "custom" ? "w-[188px]" : "w-[136px]"
            } ${R_INNER} py-[5px]`}
            style={{
              background: CARD,
              boxShadow: `0 10px 24px rgba(28,24,58,0.14), inset 0 0 0 1px ${HAIRLINE}`,
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  // Custom keeps the menu open: the two dates are
                  // chosen in it, and closing first would hide them.
                  if (p.key === "custom") {
                    onPick("custom");
                    return;
                  }
                  setOpen(false);
                  onPick(p.key);
                }}
                className={`flex w-full items-center justify-between px-[13px] py-[7px] text-left ${T_LABEL} ${W_SEMI}`}
                style={{ color: p.key === period ? INDIGO : NET_LABEL }}
              >
                {p.label}
                {p.key === period ? <Chev size={9} color={INDIGO} /> : null}
              </button>
            ))}
            {period === "custom" && onRange ? (
              <div
                className="mt-[3px] px-[13px] pb-[7px] pt-[7px]"
                style={{ borderTop: `1px solid ${HAIRLINE}` }}
              >
                {(["from", "to"] as const).map((end) => (
                  <label key={end} className="mb-[5px] block">
                    <span
                      className={`mb-[2px] block ${T_LABEL} ${W_SEMI}`}
                      style={{ color: NET_LABEL }}
                    >
                      {end === "from" ? "From" : "To"}
                    </span>
                    <input
                      type="date"
                      value={range[end]}
                      onChange={(e) =>
                        onRange({ ...range, [end]: e.target.value })
                      }
                      className={`w-full rounded-[8px] px-[7px] py-[5px] ${T_LABEL} ${W_SEMI}`}
                      style={{
                        color: SELECTOR_INK,
                        background: CARD,
                        boxShadow: `inset 0 0 0 1px ${HAIRLINE}`,
                      }}
                    />
                  </label>
                ))}
                <button
                  onClick={() => setOpen(false)}
                  className={`mt-[2px] w-full rounded-[8px] py-[6px] ${T_LABEL} ${W_BOLD} text-white`}
                  style={{ background: INDIGO }}
                >
                  Done
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
      </div>
    </div>
  );
}
