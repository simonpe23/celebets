// THE PERFORMANCE PAGE SHELL. One component, drawn by all six pages.
//
// Added 30 August 2026. Every one of the six page.tsx files used to
// repeat the same three things: the Figtree face, the 390pt phone
// column, and the whole four icon floating tab bar. The tab bar was
// byte for byte identical in all six, which means six places to miss
// when anything about it changes.
//
// What a page keeps for itself is its content. What every page shares
// is here, and the measurements come from `./ui`.
//
// THE TAB BAR IS NOT HERE ANY MORE, since 31 August 2026. It is the
// app's own `src/components/TabBar.tsx`, the one every other page has
// always drawn. This file used to hold a second one, and the two
// disagreed about how many tabs the app has.

import type { ReactNode } from "react";
import TabBar from "@/components/TabBar";
import { PAGE_FRAME } from "@/lib/ui";
import {
  COL_W,
  FONT_CLASS,
  FONT_FAMILY,
  INK,
  PAGE_BG,
  PerfTail,
  TAIL_SHORT,
} from "./ui";

export default function PerfPage({
  children,
  tail = TAIL_SHORT,
  live = false,
}: {
  children: ReactNode;
  /** True on the live pages, where the tab bar must navigate. */
  live?: boolean;
  // The spacer at the foot of the column, which decides how leftover
  // height is shared out. Home and Lab pass TAIL_TALL because they
  // have their own growing gaps higher up and this one has to lose.
  tail?: PerfTail;
}) {
  return (
    <div
      className={`${FONT_CLASS} ${PAGE_FRAME}`}
      style={{
        background: PAGE_BG,
        color: INK,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        // THE COLUMN STRETCHES ON A PHONE AND A LAPTOP, AND STOPS
        // ABOVE THAT, since 31 August 2026, phase 3.
        //
        // `flex-1` is what feeds Home's growing gaps: it makes this
        // column as tall as the window, and the spacers inside share
        // out whatever is left over. That was tuned on a phone, where
        // the leftover is a few dozen pixels.
        //
        // On a window taller than any laptop the leftover is five
        // hundred, and it has to go somewhere. Stretching it made
        // Home four visible holes; capping the spacers moved the same
        // emptiness to the foot of the column, above the bar. Both are
        // the dead band he asked to be rid of.
        //
        // So above 1000px of window height the column simply sizes to
        // its content and PAGE_FRAME centres the whole page, bar
        // included, which is the option he picked. 1000 is clear of
        // every phone (his biggest is 932) and of his laptop (950), so
        // NOTHING CHANGES ON ANYTHING HE LOOKS AT. Verified by
        // measuring every spacer at 320, 390, 430 and 1512 before and
        // after: identical.
        className={`relative mx-auto flex w-full ${COL_W} flex-col [@media(max-height:1000px)]:flex-1`}
      >
        {children}
        <div className={tail} />
      </div>

      {/* THE BAR IS THE APP'S OWN NOW, 31 August 2026, phase 1 of the
          size and layout job. His words: "we're gonna fix the bottom
          menu bar", and on which of the two wins: "I prefer Track's
          wide grey bar."

          This file used to draw its own: four tabs in a floating white
          card, 382px wide, while the rest of the app drew three tabs in
          a 448px grey one. Two bars in two files is why the bar changed
          shape as you moved around the app. There is one now.

          `padded` IS GONE, 31 August 2026, phase 3. This frame carries
          the app's own horizontal padding now, like every other page,
          so the bar has nothing to compensate for. `links` off on the
          previews keeps the bar untappable there, exactly as it was.
          `light` because these pages paint themselves light in both
          themes, his ruling, and a navy bar under a white page looked
          broken. */}
      <TabBar
        light
        links={live}
        activeHref={live ? undefined : "/stats"}
      />
    </div>
  );
}
