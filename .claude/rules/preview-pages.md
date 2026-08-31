---
description: How the design preview pages work and what they are for
paths:
  - "src/app/preview/**"
---

# Preview page rules

These are design previews, not product. They exist so the owner can
judge a change on a real phone before it ships.

## They are committed and deployed

`.gitignore` used to block this folder, which meant the previews were
never deployed AND never backed up. Days of design work lived only
inside one temporary container.

Committed since 24 August 2026, by the owner's ruling.

**The old note about Tailwind skipping gitignored files no longer
applies.** Utility classes generate here normally now. Inline styles are
no longer required as a workaround.

## They are public, by ruling

Since 28 August 2026, `src/middleware.ts` treats `/preview/*` as a
public page in every environment, like the footer pages. The owner's
words: "open the preview without login, nothing needs to be locked."
They carry made up demo numbers, never user data.

Do not "fix" this by adding a gate back. And never put real user data
on a preview page: public is the standing state.

## What is live here

- `src/app/preview/pf/`, the Portfolio prototype for the Performance
  rebuild. Engine, skin and motion are all reusable. See
  `docs/performance-rebuild.md`.
- Everything else under `/preview` is an older, rejected concept. Kept
  so the history is not lost, not because it is worth reading.

## design-check reads every preview now

Ruled 26 August 2026, after the rule audit found the checker skipping
the whole folder on a stale belief that it "never ships". Nothing under
`/preview` is skipped any more.

**Exempt here, and only here: the three COLOUR rules.** Is this hex in
the palette (4), green is not an action colour (4b), and the brand
purple must come from `globals.css` (8b). The previews are where the new
design is being explored, and the owner ruled that the mockup colours
win: "my mockup designer is better at design than our current palette."
Holding a preview to the old palette is backwards.

**Everything else applies in full:** the font lock, the banned finance
vocabulary, em dashes, the old brand name, the hand cursor, the money
numeral face, the shared components. Those are correctness, not taste.

**The exemption ends when the new palette is approved.** At that point
the new palette becomes the checked palette and the previews go back
under all three colour rules. Delete `paletteExempt` in
`design-check.mjs` then. See `docs/open-questions.md`.

## Every Performance preview reads one file

`src/app/preview/performance-ui.ts` holds the colours, the font, the
type scale, the two weights, the radii and the shared heights for
`performance-home`, `-lab`, `-totals`, `-compare`, `-bets` and
`-heatmap`. **Never write a hex, a font family or a shared size inside
one of those pages. Add a line to that file and import it.** Spacing
used once, on one page, stays on the page.

Three things are shared components, not copies:
`performance-shell.tsx` (the column, the face and the tab bar),
`performance-menu.tsx` (Home / Lab / Totals) and
`performance-header.tsx` (the back header).

ANY chat may edit those files without asking or pausing. The existing
convention holds: whoever merges second merges `main` in first.

## Testing them

- `pftest.mjs <port>` proves every topic is reachable in the prototype's
  pickers. It exists because an absence is what a screenshot cannot
  show.
- `motiontest.mjs <port>` proves the motion is alive.
- Both need a running dev server.
