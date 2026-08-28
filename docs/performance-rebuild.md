# The Performance rebuild (in flight)

Status as of 28 August 2026. **Nothing here is shipped.** `/stats` still
serves the old Analytics page.

## The build from finished mockups (current stage)

- **RESET, 28 August 2026. Both Home builds of this date are
  DISCARDED.** The identical build of `14. Chat Aug 27.png` and the
  four-sheet area rebuild after it were both rejected. His ruling, in
  his words: "the last 2 previews that you have created from my
  mockups = discard them. erase from your memory. do not make new
  version based on the template. what im giving you now is not
  refinements, its a new layout."
- **Nothing in `src/app/preview/performance-home/` is reference
  material.** No future build may start from it, borrow its scale, its
  sizes or its layout. The next build starts from an empty file when
  the owner uploads the new layout mockups to the repo and reports
  back. Waiting on that upload now.
- His build instruction, quoted: "Make an identical version. Pixel by
  pixel." The one allowed edit: "The purple color. Use Actuals
  pre-defined purple colors instead." So fills use brand-top to
  brand-bottom and lines, links and icons use brand-mark.
- The mockup's word face is matched with Plus Jakarta Sans (closest
  free stand-in for the Circular family). The numerals measured out as
  Inter Tight, the app's own numeral face, and use `font-money`.
- Known divergences from the sheet, all deliberate: no fake status bar
  or home indicator (the real phone provides them), and the purple
  swap above. One oddity copied as drawn and flagged to the owner: the
  small green dot on the football icon.
- The process: he shares a mockup, it is built identically on this
  chat's branch, he merges, then reviews on his phone at the preview
  address. Ship order: Home first, then Lab, then Totals.

## Where the older work lives

- `src/app/preview/pf/`, the Portfolio prototype, walkable end to end.
  Its engine (`engine.ts`), skin (`theme.tsx`) and motion
  (`motion.tsx`) are reusable regardless of which views survive.
- `PORTFOLIO-VIEWS.md`, the view-by-view build log.
- `docs/open-questions.md`, what still blocks drawing Lab.

## The shape the owner wants

**One Performance page, three tabs at the top.**

| Tab | Job |
|---|---|
| **Home** (was Review, name revisitable) | The ranked list mixing everything: Moneyline next to Premier League next to Low odds. Tell the user what they are good at within seconds. |
| **Lab** | The builder. Chips plus a `+`. Click Moneyline, then Tennis, and the answer re-scopes in place. |
| **Totals** (named 26 August 2026) | Today's live `/stats` content: sports breakdown, odds groups, singles vs parlays, categories. The quick scan of every slice. |

**Mockups come first.** The owner's mockup designer, in another tool, is
briefed per page. The briefs live in `docs/mockup-briefs.md`. Style is
his to evolve (including the fonts, reopened); the product rules in the
briefs are law.

**Also alive:** the heatmap (on Home), insights (a popup reachable
everywhere, plus a real page getting a new mockup), What Changed, and
betting history: the latest 50 bets at the bottom of Totals, then a
button to a full All Bets page (a new page to build). Compare lives
inside Lab.

**Cut:** the prototype insight card modal, and All Facts as a page.

## Lab's rules so far

- **Six groups**, from the mockup: SPORT, WHAT YOU BET, WHERE, WHEN,
  HOW, RISK. All six definitions are now settled.
- **SPORT carries the domain arrow.** Sports is default and keeps its
  single tap. Picking another domain rescopes the whole page. HOW and
  RISK do not rescope; they mean the same in every domain.
- **A league row sits under SPORT**, three or four for the current
  sport, one row only, then "More leagues".
- **WHAT YOU BET lists categories**, and tapping one opens its markets
  where real markets exist.
- **WHEN is sport-aware.** It offers only the periods that belong to the
  current sport and actually appear in the user's data.
- **Chips read as a record (12-4), never a percent.** Hit rate is the
  score in Lab; profit is the score on Home.
- **Thin groups stay visible.** Two bets is a finding, not noise.
- **Every chip is priced at the intersection it would create.** With
  Moneyline selected, the Football chip reads Moneyline-in-Football, not
  Football overall. That is what makes the grid a preview of its own
  result.
- **Removing the last chip lands on a clean, empty Lab**, not back on
  Home. The owner asked for this explicitly: "i want a view inside the
  lab that is clean from selections."
- **Compare works across groups**, ruled 26 August 2026: anything can
  be compared inside one domain. Selecting combines; a Compare button
  appears at exactly two selections and flips them to side by side,
  ruled 28 August 2026. See `docs/decisions.md`.
- **The rule teaches itself by dimming** chips you cannot pair with, not
  by colour-coding the groups.

## What Home does

- Ranked rows written as sentences: "Moneyline is making you +$2,658",
  each labelled with its family (EARNER · WHAT YOU BET).
- **Tapping a row jumps to Lab with that fact selected.** Same for a
  heatmap tile.
- Keeps a door to Lab: "Check out our Lab, Build your Performance View".
- Sort by Profit, ROI or Hit rate, **all three visible at once.** No
  cycling control that hides its options.

## Engine notes worth keeping

`src/app/preview/pf/engine.ts` computes every number for the prototype.
Two things in it were hard won:

**`dedupeFacts` is not applied to the vocabulary.** It hides a fact
whose record exactly matches a higher-ranked one, which is right for a
ranked list or a treemap (two rows for one set of bets lies about size)
and catastrophic anywhere else. Applied everywhere, it deleted every
sport that had exactly one league. See `failed-approaches.md`.

**Ranking by "impact" was removed.** The owner could not explain the
number, so neither could a user. The problem it solved, thin evidence
climbing the list, is now answered by showing the record instead of a
percent: 5-0 no longer looks like 100%.

## Motion

Levels A and B are built and tested by `motiontest.mjs`.

- **A:** direction. Deeper slides in from the right, back slides in from
  the left. Sheets rise from the bottom and play back down. This is
  information, not decoration: without it a sheet and a page appear
  identically and you cannot tell what Back will do.
- **B:** the chart line draws itself, money travels to its new value
  instead of snapping, ranked rows arrive in sequence.
- **C** (shared-element flights) is parked as IDEAS.md idea 30, with a
  written trigger: build it when the layouts stop moving.
- Everything is off under `prefers-reduced-motion`.

## Before this can ship

Not design work, and nobody has scoped it:

1. **Empty states.** Every view assumes a full record.
2. **Loading states.** The prototype computes instantly on demo data.
3. **The swap.** Replace `/stats` in one go, or run both behind a
   switch while the numbers are checked.
