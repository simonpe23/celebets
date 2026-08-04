"use client";

import { round2 } from "@/lib/format";

interface Props {
  label: string;
  profit: number;
  roi: number | null;
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

export default function HeadlineProfit({ label, profit, roi }: Props) {
  const { prefix, digits } = parts(profit);
  const up = round2(profit) >= 0;

  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-400">
        {label}
      </p>

      <p className="mt-1.5 flex items-center justify-center gap-1">
        {/* Small enough that the dollar sign's stroke stays inside the
            height of the digits, then centered against them. */}
        <span className="text-2xl font-bold leading-none text-neutral-600 dark:text-neutral-400">
          {prefix}
        </span>
        <span className="text-5xl font-bold leading-none tracking-tight tabular-nums text-neutral-900 dark:text-white">
          {digits}
        </span>
      </p>

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
