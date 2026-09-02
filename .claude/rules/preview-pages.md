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

## The first days

`/preview/firstbets` draws every page of the app against six records,
from an account that has done nothing to one with ten settled bets.
Added 2 September 2026 for the silence job, because the owner could not
see what a new user sees and neither could anyone else.

`emptytest.mjs` reads the same records, so what he looks at is what the
build checks. **Change `src/app/preview/firstbets/data.ts` and you
change both.** Its dates are anchored to a fixed day on purpose: a
moving date makes two screenshots of the same record disagree.

## What is live here

- **NOTHING under `/preview` is live any more**, since 31 August 2026.
  The Performance components went to `src/components/performance/` and
  the engine went to `src/lib/performance-engine.ts`.
- `src/app/preview/pf/` is the Portfolio prototype, walkable at
  `/preview/pf`. It still imports the engine, which is where the
  engine started life. See `docs/performance-rebuild.md`.
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

## The Performance area is NOT here any more

It moved to `src/components/performance/` on 31 August 2026. What is
left under `src/app/preview/performance-*/` is six `page.tsx` route
files, three lines each, which exist so the public preview addresses
keep working.

Its rules live in `.claude/rules/performance.md`.

## Testing them

- `pftest.mjs <port>` proves every topic is reachable in the prototype's
  pickers. It exists because an absence is what a screenshot cannot
  show.
- `motiontest.mjs <port>` proves the motion is alive.
- Both need a running dev server.
