"use client";

import { round2 } from "@/lib/format";

// The one big money number, used on the Performance headline and on
// the balance card. Inter Tight at weight 500, the owner's choice from
// 5 August 2026: one size, one weight, one color.
//
// The weight is 500, not 600. I raised it during the Track rebuild and
// the owner asked for the original back. It also matches the number
// ladder in CLAUDE.md, which said 500 the whole time.
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
      style={{ fontWeight: 500, letterSpacing: "-0.02em" }}
    >
      {sign}${digits}
    </span>
  );
}
