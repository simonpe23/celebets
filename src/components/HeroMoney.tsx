"use client";

import { round2 } from "@/lib/format";

// The one big money number, used on the analytics headline and on the
// wallet card. Set in Inter Tight at weight 500, flat: one size, one
// weight, one color, the way a trading app sets it.
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
      className={`leading-none tabular-nums ${className}`}
      style={{
        fontFamily: "var(--font-inter-tight)",
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      {sign}${digits}
    </span>
  );
}
