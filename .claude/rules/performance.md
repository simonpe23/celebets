---
description: The Performance area, which is live code on real user bets
paths:
  - "src/components/performance/**"
  - "src/app/stats/**"
---

# The Performance area

**This is LIVE CODE. It serves actuals.cc/stats on real user bets.**

It moved here from `src/app/preview/performance-*` on 31 August 2026,
because that path read as a sandbox while serving real users. If you
find a doc or a comment pointing at the old path, the doc is stale.

The engine that computes every money figure on every Performance page
is **`src/lib/performance-engine.ts`**. It moved out of
`src/app/preview/pf/engine.ts` on the same day, one commit later. It
does NOT hold money rules: it groups bets into facts and imports every
rule from `src/lib/stats.ts`, the app's one definition.

## One component, two callers

| Caller | Data |
|---|---|
| `src/app/stats/**` | The signed in user's own bets, behind login. |
| `src/app/preview/performance-*/page.tsx` | Demo bets. Public by ruling. |

The six `page.tsx` files under `src/app/preview/` stayed behind because
they ARE the public preview addresses. They are three lines each.

**Never put real user data on a preview page.** Public is the standing
state, ruled 28 August 2026.

## Six views, one page

`area.tsx` renders all six: Home, Lab, Totals, the Heat Map, Compare
and All Bets. The bets are loaded once and switching views asks the
server for nothing.

- **The menu draws three of them.** Home, Lab, Totals. The other three
  wear a back arrow instead.
- **Nothing here may become a `<Link>` that loads a page.** A door
  keeps a real `href` so the address works, and calls the tab area's
  callback on tap. `instanttest.mjs` counts server page requests and
  fails on any.

## The text sizes are the APP'S, not this folder's

Since 31 August 2026. `ui.ts` still exports T_TITLE, T_LEAD, T_STRONG
and the rest, but every one of them is now a name from the one list in
`src/app/globals.css`. Ten hand written steps from 7.6px to 15px
became five steps of the app's list: 11, 12, 13, 15, 17.

Performance uses the SMALL END of that list, which is what keeps it
denser than Track while both obey the same rules. His ruling: "Pages
are allowed to look different from each other for now."

**Never write a text size by hand here.** `design-check` rule 14 fails
the build. The Heat Map's tile figures are the one place with numbers,
because a treemap tile is not a fixed box and the figure must shrink to
fit it; those numbers are still steps off the same list.

## The column is the APP'S, and nothing is positioned in pixels

Since 31 August 2026, phase 3. `COL_W` reads the app's own `max-w-md`,
so Performance is exactly as wide as Track, Settings and Research at
every screen size. It was `max-w-[390px]`, the width of the mockup
image these pages were measured from, and on a laptop it sat 58px
narrower than the bar above it.

**Never position anything here in absolute pixels off a 390px
assumption.** The menu's tabs, the KPI dividers, the ranked row's
columns and both hero charts were all pixel positions that were correct
at exactly one width, and they were why small phones scrolled sideways.
Use fractions, flex or a grid.

`sitecheck.mjs` loads every page at 320, 393 and 1512 in both themes
and fails on sideways scroll, so this cannot come back quietly.

## One file holds every shared value

`src/components/performance/ui.ts` holds the colours, the font, the
type scale, the two weights, the radii and the shared heights.

**Never write a hex, a font family or a shared size inside a view. Add
a line to that file and import it.** Spacing used once, on one page,
stays on the page. `design-check.mjs` rule 12 fails the build on this.

Three things are shared components, not copies: `shell.tsx` (the
column and the face), `menu.tsx` (Home / Lab / Totals) and
`header.tsx` (the back header).

**THE BOTTOM BAR IS NOT ONE OF THEM ANY MORE.** This area drew its own
until 31 August 2026, four tabs in a floating white card, while the
rest of the app drew three in a wide grey one. `shell.tsx` renders
`src/components/TabBar.tsx` now, like every other page, with `light`
(these pages have no dark mode). `design-check` rule 13 stops a second
bar appearing here again.

ANY chat may edit those without asking or pausing. The existing
convention holds: whoever merges second merges `main` in first.

## The edge is the APP'S, and no page sets its own

Since 31 August 2026, phase 3. `shell.tsx` frames itself with
`PAGE_FRAME` from `src/lib/ui.ts`, so Performance keeps the same
16px margin as Track, Settings and Research, and the `padded` prop on
TabBar is deleted.

Each of these six pages used to carry its own inset off whatever
mockup it was measured from: 11px on Totals, 14 on Home and Lab, 15
on the Heat Map and All Bets, 20 on Compare. Content therefore never
lined up with the bar, and the error flipped sign between a phone
(cards up to 5px OUTSIDE the bar) and a laptop (up to 20px inside).

**Never set a horizontal margin or padding on a direct child of the
column.** The frame owns the edge. An indent measured from the card
edge is fine, an inset from the screen edge is not.

`sitecheck.mjs` fails the build if any page's content does not start
and end on the same line as the tab bar.

## Leftover height is spread on a phone, and not above that

`shell.tsx` gives the column `flex-1` only below 1000px of window
height, and `TAIL_TALL`, `TAIL_SHORT` and Home's own three gaps are
capped.

`flex-1` is what feeds Home's growing gaps: it makes the column as
tall as the window and the spacers share out the leftover. That was
tuned on a phone, where the leftover is a few dozen pixels. On a
1400px window it is five hundred, and Home spread it into four
visible holes.

The caps are the measured maximum on his biggest phone (430x932) and
on a 1512x950 laptop, so **nothing changes on anything he uses**.
Above 1000px the column sizes to its content and `PAGE_FRAME` centres
the whole page, bar included, which is what he picked.

Prove any change here with `shotdiff.mjs`, not by eye.

## What design-check does here

**Exempt, and only here: the three COLOUR rules.** Is this hex in the
palette (4), green is not an action colour (4b), and the brand purple
must come from `globals.css` (8b). These pages carry the mockup
designer's palette, and the new palette is not chosen yet. See
`docs/open-questions.md`.

**Everything else applies in full**: the font lock, the banned finance
vocabulary, em dashes, the old brand name, the hand cursor, the money
numeral face, the shared components.

## Home has two modes, and the heading says which

Since 2 September 2026, phase 2 of the silence job.

| Mode | When | Heading |
|---|---|---|
| Ranked | three or more facts clear both gates | "What drives your result" |
| Thin | fewer than three do | "What your record is so far" |
| Waiting | nothing settled at all | the subtitle says so |

**Three, not zero.** One row is not a ranking. Six settled Football
bets clear the gates for exactly one fact, and the page used to head a
single "Medium odds" row with "ranked by contribution".

**`rankedFacts` relaxes its gates rather than return nothing**, in
rungs: both, no floor, no ceiling, neither. Rung one is the old
behaviour exactly, so a rankable record cannot move.

**`factsIn` applies no gates at all** and is what the thin mode lists.
Do not use it for anything that ranks or sums: on one bet, Football and
Premier League and Moneyline are all the same bet, and adding them up
would count it five times.

**The thin mode's groups are Lab's**, in Lab's order, or the two pages
would describe one bet two different ways.

## The restart is a BUTTON beside the pill, and not one of the periods

Since 4 September 2026, his ruling then his order to draw it as a
button. `PeriodPill` renders both, so all four pages get it from one
place. `area.tsx` holds `restarted` beside `period` and threads both,
with `trackingSince`, to the five views that filter. The live
`src/app/stats/**` pages read the date with `loadRestartLine()`; the
previews pass nothing, so no button is drawn.

**THE TWO CONTROLS ANSWER DIFFERENT QUESTIONS.** The button picks WHICH
RECORD, the pill picks WHICH WINDOW inside it, so they compose and
cannot contradict. The restart was one of the periods for about an hour
and the button beside the pill printed the same words twice.

**The line is NOT a date filter and must never be written as one.**
Every period keeps a bet by `settled_at`, which drops anything still
running. The line calls `sinceLine`, which carries a running bet over,
because money still riding belongs to the new record.
`restarttest.mjs` fails the build on the ordinary-date-filter version.

**Compare is the one view that does not follow it.** It has its own
control and has never taken the shared period. Pre-existing, flagged,
undecided.

## Testing

Every one of these needs a running dev server, except `restarttest`.

- `instanttest.mjs <port>` proves nothing loads a page.
- `jumptest.mjs <port>` proves the doors between Home and Lab, and that
  Home's KPI row mirrors Lab's.
- `periodtest.mjs <port>` proves the period filter really filters, and
  that the Since restart button is absent without a line, on by default
  with one, counts differently when tapped off, and stays on while the
  window changes.
- `restarttest.mjs` needs no server. It pins the one rule that a
  screenshot cannot see: a running bet crosses the restart line.
- `controlstest.mjs <port>` clicks every control.
- `shotdiff.mjs` proves a change meant to be invisible is invisible.
