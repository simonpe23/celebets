"use client";

// THE (i) DOT, job 6. It was drawn on five screens and opened nothing.
// Now it opens one line of plain English from explain.ts.
//
// The card is Lab's own dropdown: same white, same radius, same
// shadow, same hairline. Nothing new was designed for this.

import { useEffect, useRef, useState } from "react";
import { InfoDot } from "../performance-icons";
import { EXPLAIN } from "./explain";
import {
  CARD,
  GREY_TEXT,
  HAIRLINE,
  INK,
  R_INNER,
  T_BODY,
  T_SMALL,
  W_BOLD,
  W_SEMI,
} from "../performance-ui";

export default function Explain({
  term,
  size = 13,
}: {
  term: keyof typeof EXPLAIN | string;
  size?: number;
}) {
  const [open, setOpen] = useState(false);
  const dot = useRef<HTMLButtonElement>(null);
  // The card is anchored to the dot, and a dot near the right edge
  // would push it off a 320px phone. So it is nudged back inside on
  // open. Measured, not guessed: a fixed left or right alignment gets
  // this wrong on one page or the other.
  const [box, setBox] = useState({ width: 236, shift: 0 });
  useEffect(() => {
    if (!open || !dot.current) return;
    const EDGE = 12;
    const vw = document.documentElement.clientWidth;
    const width = Math.min(236, vw - EDGE * 2);
    const left = dot.current.getBoundingClientRect().left;
    let shift = 0;
    if (left + width > vw - EDGE) shift = vw - EDGE - width - left;
    if (left + shift < EDGE) shift = EDGE - left;
    setBox({ width, shift });
  }, [open]);
  const entry = EXPLAIN[term];
  if (!entry) return <InfoDot size={size} />;
  return (
    <span className="relative inline-flex">
      <button
        ref={dot}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label={`What ${entry.title} means`}
        className="inline-flex items-center"
      >
        <InfoDot size={size} />
      </button>
      {open ? (
        <>
          <button
            aria-label="Close explanation"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
            className="fixed inset-0 z-40"
          />
          <span
            className={`absolute left-0 top-[20px] z-50 block ${R_INNER} px-[13px] py-[11px]`}
            style={{
              width: box.width,
              marginLeft: box.shift,
              background: CARD,
              boxShadow: `0 10px 24px rgba(28,24,58,0.16), inset 0 0 0 1px ${HAIRLINE}`,
            }}
          >
            <span className={`block ${T_BODY} ${W_BOLD}`} style={{ color: INK }}>
              {entry.title}
            </span>
            <span
              className={`mt-[3px] block ${T_SMALL} ${W_SEMI} leading-[1.45]`}
              style={{ color: GREY_TEXT }}
            >
              {entry.line}
            </span>
          </span>
        </>
      ) : null}
    </span>
  );
}
