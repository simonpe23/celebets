"use client";

// THE PERIOD PILL, job 4. One control, three pages: Lab, Totals and
// the Heat Map. It wears the accepted Home's own period pill, the
// white capsule with a chevron sitting beside "Net profit", so the
// four screens read as one product. The menu below it is Lab's domain
// dropdown, same geometry and same shadow, for the same reason.

import { ChevDown } from "../performance-icons";
import { Chev } from "../performance-icons";
import {
  CARD,
  HAIRLINE,
  INDIGO,
  NET_LABEL,
  R_INNER,
  SELECTOR_INK,
  T_LABEL,
  T_SMALL,
  T_STRONG,
  W_BOLD,
  W_SEMI,
} from "../performance-ui";
import { PERIODS, labelOf, type PeriodKey } from "./period";

export default function PeriodPill({
  period,
  onPick,
  open,
  setOpen,
  align = "right",
  size = "pill",
}: {
  period: PeriodKey;
  onPick: (key: PeriodKey) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  align?: "left" | "right";
  size?: "pill" | "plain";
}) {
  return (
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
                boxShadow: "0 1px 3px rgba(30,25,60,0.07)",
              }
            : { color: SELECTOR_INK }
        }
      >
        {labelOf(period)}
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
            } top-[26px] z-20 w-[136px] ${R_INNER} py-[5px]`}
            style={{
              background: CARD,
              boxShadow: `0 10px 24px rgba(28,24,58,0.14), inset 0 0 0 1px ${HAIRLINE}`,
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => {
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
          </div>
        </>
      ) : null}
    </div>
  );
}
