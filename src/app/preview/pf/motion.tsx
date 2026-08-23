"use client";

// MOTION FOR THE PORTFOLIO PROTOTYPE. Local preview, gitignored.
// Levels A and B, built 23 August 2026. Level C (shared element
// flights) is parked in IDEAS.md as idea 30.
//
// WHY MOTION IS NOT DECORATION HERE. Before this, a sheet and a page
// appeared exactly the same way: instantly, filling the screen. So
// nothing told you whether Back would close a sheet or leave a page,
// and nothing told you where you had come from. Direction is the
// information; the animation is only how it is delivered.
//
// LEVEL A, THE RULE: a view that takes you DEEPER slides in from the
// right. A view you go BACK to slides in from the left. A sheet
// comes up from the bottom, because a sheet is temporary and the
// bottom is where you can throw it away.
//
// We animate the ARRIVING view only, never the leaving one. Holding
// two screens mounted to cross-fade them is the clever version, and
// it needs the router to keep a dead component alive with stale
// data. Direction alone carries almost all of the meaning, at none
// of that risk.
//
// LEVEL B: the chart line draws itself, big money counts up to its
// new value, and ranked rows arrive in sequence. All of it is tied
// to a key, so it replays exactly when the underlying number
// changes and never on an unrelated re-render.
//
// EVERY ANIMATION IS OFF under prefers-reduced-motion, which is a
// real accessibility setting people turn on for motion sickness,
// not a nicety.

import { useEffect, useRef, useState } from "react";

export type Dir = "fwd" | "back";

// The class every full page wears on its <main>.
export function pageCls(dir: Dir): string {
  return `pf pf-page${dir === "back" ? " back" : ""}`;
}

export const MOTION_CSS = `
  @keyframes pf-in-fwd {
    from { opacity: 0; transform: translate3d(14px, 0, 0); }
    to { opacity: 1; transform: none; }
  }
  @keyframes pf-in-back {
    from { opacity: 0; transform: translate3d(-14px, 0, 0); }
    to { opacity: 1; transform: none; }
  }
  @keyframes pf-sheet-up {
    from { transform: translate3d(0, 26px, 0); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
  @keyframes pf-sheet-down {
    from { transform: none; opacity: 1; }
    to { transform: translate3d(0, 26px, 0); opacity: 0; }
  }
  @keyframes pf-scrim-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pf-scrim-out { from { opacity: 1; } to { opacity: 0; } }
  @keyframes pf-row-in {
    from { opacity: 0; transform: translate3d(0, 8px, 0); }
    to { opacity: 1; transform: none; }
  }

  /* The page arriving. 260ms with a decelerating curve: it starts
     fast and settles, which is what a real object does. */
  .pf-page { animation: pf-in-fwd 0.26s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .pf-page.back { animation-name: pf-in-back; }

  /* A sheet or popup: the panel rises, the scrim behind it fades. */
  .pf-rise { animation: pf-sheet-up 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .pf-rise.leaving { animation: pf-sheet-down 0.2s ease-in both; }
  .pf-fade { animation: pf-scrim-in 0.22s ease-out both; }
  .pf-fade.leaving { animation: pf-scrim-out 0.2s ease-in both; }

  /* LEVEL B. Ranked rows arrive one after another. The delay is set
     inline per row, capped so a long list never crawls. */
  .pf-stagger { animation: pf-row-in 0.34s cubic-bezier(0.22, 1, 0.36, 1) both; }

  /* LEVEL B. The line draws itself left to right. The dash length is
     set inline from the path's measured length. */
  .pf-draw { animation: pf-dash 0.62s cubic-bezier(0.33, 1, 0.68, 1) both; }
  @keyframes pf-dash { to { stroke-dashoffset: 0; } }

  /* The soft area under the line waits for the line to be most of
     the way across. Fading both together makes the fill look like
     it is leading, which is backwards. */
  .pf-fill { animation: pf-scrim-in 0.4s ease-out 0.26s both; }

  @media (prefers-reduced-motion: reduce) {
    .pf-page, .pf-page.back, .pf-rise, .pf-rise.leaving,
    .pf-fade, .pf-fade.leaving, .pf-stagger, .pf-draw, .pf-fill {
      animation: none !important;
    }
    .pf-draw { stroke-dashoffset: 0 !important; }
  }
`;

// A sheet that plays its exit before it unmounts. The component owns
// its own closing state, so no parent has to know motion exists:
// call close() anywhere you used to call onClose().
export function useDismiss(onClose: () => void, ms = 200) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    []
  );
  function close() {
    if (leaving) return;
    setLeaving(true);
    timer.current = setTimeout(onClose, ms);
  }
  return { leaving, close };
}

// LEVEL B: a number that counts to its new value. Money moving to a
// new figure instantly reads as a different number appearing; money
// that travels reads as the same number changing, which is the
// truth. Keyed by the value, so it runs on a real change only.
export function useCountUp(value: number, ms = 520): number {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      from.current = value;
      setShown(value);
      return;
    }
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      // Same decelerating feel as the page transitions.
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(start + (value - start) * eased);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else from.current = value;
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      from.current = value;
    };
  }, [value, ms]);

  return shown;
}
