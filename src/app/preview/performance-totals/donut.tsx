"use client";

// The Profit by Sport ring from "2. Totals.png", with one honest
// change: a profit donut cannot draw a negative slice, and his record
// has losing sports in it. So each slice is sized by how much that
// sport MOVED the result (its profit either way) and coloured by
// which way it moved: indigo weights for the sports that made money,
// red weights for the ones that cost it. The net sits in the middle,
// exactly as the sheet draws it.

import {
  DONUT_EARNER,
  DONUT_EMPTY,
  DONUT_LEAK,
  GREY_TEXT,
  INK,
} from "../performance-ui";

const EARNER = DONUT_EARNER;
const LEAK = DONUT_LEAK;
const NOTHING = DONUT_EMPTY;

export type Slice = { key: string; value: number; profit: number };

export function Donut({
  slices,
  center,
  caption,
  size = 150,
}: {
  slices: Slice[];
  center: string;
  caption: string;
  size?: number;
}) {
  const stroke = 21;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((sum, s) => sum + Math.abs(s.value), 0);

  let earners = 0;
  let leaks = 0;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={NOTHING}
          strokeWidth={stroke}
        />
        {total > 0 &&
          slices.map((s) => {
            const frac = Math.abs(s.value) / total;
            const len = frac * c;
            const colour =
              s.profit >= 0
                ? EARNER[Math.min(earners++, EARNER.length - 1)]
                : LEAK[Math.min(leaks++, LEAK.length - 1)];
            const el = (
              <circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={colour}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[14px] font-bold leading-none" style={{ color: INK }}>
          {center}
        </p>
        <p className="mt-[3px] text-[7.5px] font-semibold" style={{ color: GREY_TEXT }}>
          {caption}
        </p>
      </div>
    </div>
  );
}
