"use client";

import { round2 } from "@/lib/format";

// Three treatments to compare.
//   A  near black digits, quiet prefix, colored ROI chip
//   B  colored digits, quiet prefix, colored ROI chip
//   C  same as A, set in the brand font
export type NumberStyle = "A" | "B" | "C";

interface Props {
  label: string;
  profit: number;
  roi: number | null;
  style: NumberStyle;
}

// Splits money into a quiet prefix and loud digits, so the sign and
// the dollar sign never compete with the number itself.
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

  const digitColor =
    style === "B"
      ? up
        ? "text-emerald-700 dark:text-emerald-400"
        : "text-red-700 dark:text-red-400"
      : "text-neutral-900 dark:text-white";

  const fontClass = style === "C" ? "font-brand" : "";

  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </p>

      <p className={`mt-1 flex items-baseline justify-center gap-0.5 ${fontClass}`}>
        <span
          className={`text-2xl font-semibold ${
            style === "B" ? digitColor : "text-neutral-400"
          }`}
        >
          {prefix}
        </span>
        <span
          className={`text-5xl font-bold tracking-tight tabular-nums ${digitColor}`}
        >
          {digits}
        </span>
      </p>

      {roi !== null && (
        <p className="mt-2">
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
