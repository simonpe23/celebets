"use client";

import { round2 } from "@/lib/format";

// Three ways to set the prefix. The digits are always black.
//   1  one size, one weight, no split at all
//   2  smaller prefix, aligned to the top of the digits
//   3  smaller prefix, aligned to the baseline
export type NumberStyle = "1" | "2" | "3";

interface Props {
  label: string;
  profit: number;
  roi: number | null;
  style: NumberStyle;
}

// Splits money into prefix and digits so the sign and the dollar sign
// never compete with the number itself.
function parts(value: number): { prefix: string; digits: string } {
  const rounded = round2(value);
  const sign = rounded < 0 ? "-" : "+";
  const digits = Math.abs(rounded).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return { prefix: `${sign}$`, digits };
}

export default function HeadlineProfit({ label, profit, roi, style }: Props) {
  const { prefix, digits } = parts(profit);
  const up = round2(profit) >= 0;

  const ink = "text-neutral-900 dark:text-white";

  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </p>

      {style === "1" ? (
        <p
          className={`mt-1.5 text-5xl font-bold tracking-tight tabular-nums ${ink}`}
        >
          {prefix}
          {digits}
        </p>
      ) : (
        <p
          className={`mt-1.5 flex justify-center gap-0.5 ${
            style === "2" ? "items-start" : "items-baseline"
          }`}
        >
          <span
            className={`text-3xl font-bold leading-none ${ink} ${
              style === "2" ? "mt-1" : ""
            }`}
          >
            {prefix}
          </span>
          <span
            className={`text-5xl font-bold leading-none tracking-tight tabular-nums ${ink}`}
          >
            {digits}
          </span>
        </p>
      )}

      {roi !== null && (
        <p className="mt-3">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
              up
                ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-600/10 text-red-700 dark:text-red-400"
            }`}
          >
            {roi > 0 ? "+" : ""}
            {roi.toFixed(1)}% ROI
          </span>
        </p>
      )}
    </div>
  );
}
