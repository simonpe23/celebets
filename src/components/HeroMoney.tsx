"use client";

import { round2 } from "@/lib/format";

// The one big money number, used on the analytics headline and on the
// balance card. Set in Inter Tight at weight 600, matched to the
// owner's mockups: one size, one weight, one color.
//
// Inter Tight is a display cut. It belongs on numbers above 30 pixels
// and nowhere else. Everything smaller stays in Geist.
export default function HeroMoney({
  value,
  signed = true,
  className = "text-[42px]",
}: {
  value: number;
  // Wallet balance shows no plus sign, profit does.
  signed?: boolean;
  className?: string;
}) {
  const rounded = round2(value);
  const digits = Math.abs(rounded).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = rounded < 0 ? "-" : signed ? "+" : "";

  return (
    <span
      className={`font-money leading-none tabular-nums ${className}`}
      style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
    >
      {sign}${digits}
    </span>
  );
}
