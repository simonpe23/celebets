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
- **Round 2 was rejected too**: "it looks like a fake cheap copy."
  The causes and their lessons live in `failed-approaches.md`.
- **Round 3, 28 August 2026, built to `0. Chat Aug 28.png`**, the
  combined master mockup, under his final orders: the mockup's own
  indigo (sampled `#3614F0` text, `#3708E4` fills), a similar font at
  the mockup's exact sizes (Figtree, chosen by measured proportions),
  the Heat Map pill and the colour wash restored (his designer forgot
  both), the menu high, everything on one phone screen, and the tab
  bar floating and sticky like the app's other pages. Built with a
  measurement loop, not by eye: a probe script measures ink boxes on
  the mockup and the same probes measure a screenshot of the render,
  and the build was adjusted until every box agreed to about 2px. The
  chart line and the five sparklines are traced point by point from
  the mockup's own pixels. Merged and approved 29 August 2026: "much
  better!"
- **Round 4, 29 August 2026: the improvement phase.** His ruling ended
  the copying: "we're now passed copying it. WE're now improving what
  we have." His nine edits are recorded in `docs/decisions.md` and
  applied: standalone insight card, flexible page height (no gap, no
  hidden Lab card), the big chart sheet's fade restored, lighter
  number, taller menu, tighter KPI row, shorter chart, the list up and
  more prominent.
- **Round 4 merged and ACCEPTED, 29 August 2026**: "this version will
  do, good job. i knew you could do it." The Home design is settled at
  `/preview/performance-home`. What remains before it can replace
  `/stats` is not design: real numbers through `src/lib/stats.ts`,
  dark theme, empty and loading states, wired taps, and the swap
  itself. See "Before this can ship" below and
  `docs/open-questions.md`.
- The process stands: he shares a mockup, it is built identically on
  this chat's branch, he merges, then reviews on his phone at the
  preview address. Ship order: Home first, then Lab, then Totals.

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

## Lab wears Home's design. This is a ruling, not taste

His words, 29 August 2026: "the lab page has to follow Home's design
and style." And: "i do not have a mockup for lab, because the old one
i have only show the structure but has the old design."

**So the Lab chat works from two sources, one per job:**

1. **Design and style: the accepted Home, and only it.** The living
   reference is `src/app/preview/performance-home/` (`page.tsx` holds
   the colour constants and sizes, `icons.tsx` the line-art style,
   `charts.tsx` the chart treatment). The essentials, all sampled
   from his designer's sheet: indigo `#3614F0` for text, lines and
   icons and `#3708E4` for fills, the Figtree face, near-white
   `#FBFBFC` page, lavender `#F0EEFB` tiles and pills, cards defined
   by soft tint or hairline (`#EDEDEF`), rounded pills for switches,
   the floating sticky tab bar, and the flexible page height. The
   code is the source of truth; do not restate its values, read them.
2. **Structure: his quick Lab mockup, and the rules in the next
   section.** His framing, 29 August 2026: "a very quickly made Lab
   mockup... For STRUCTURE and idea, DESIGN must COME FROM the code
   and style as HOME." It shows the six-group layout; its group order
   and some names are wrong and his corrected list below wins. Where
   the mockup disagrees with a recorded ruling, the ruling wins: he
   confirmed heat map on Home only for now, Compare appearing at
   exactly two selections, and chips as records, never an amount.

**`docs/design-system.md` describes the OLD app and does not govern
this page.** The previews' colour-rule exemption in `design-check`
covers Lab's preview the same way it covered Home's.

## The Lab build (in flight)

Started 29 August 2026, in the Lab chat, on branch
`claude/actuals-lab-redesign-onv3s8`. His process order: one piece at
a time, a screenshot after each, his reaction before the next.

- **His structure mockup is `1. LAB-mock.png`**, repo root, uploaded
  29 August 2026. Structure only; its skin, order, some words, and
  its four recorded clashes are overruled (see the section below).
- **Round 1 was REJECTED the same day it was shown**, 29 August 2026:
  "the ugliest page ive never seen... i particularly hate your
  icons. they all look the same." Full quotes and the three rulings
  it produced (mockup's look for the chip area, Compare parked, the
  premium bar) are in `docs/decisions.md`.
- **Round 2 rebuilt the chip area to the mockup's anatomy and
  parked Compare**: colour identity icons for sports and leagues
  (platform emoji, the mockup's own icon set), quiet slate outline
  glyphs for the abstract groups, compact bare chips, uppercase
  group headers with All links, the side by side view deleted, and a
  Soon-badged Compare door at exactly two selections.
- **Round 2 was rejected with a five point list** ("better but still
  absolutely hideous"), all five recorded with quotes in
  `docs/decisions.md`. **Round 3 applied every point**: transparent
  tray pills, the green ROI and Record line restored under the
  number, the mockup's door cards, borderless floating chips, and
  the hero rebuilt as the accepted Home's hero block exactly (wash
  placed as Home places it, desaturated to beige, KPI dividers,
  chart order shaped to Home's early-dip-then-climb arc). Awaiting
  his reaction.
- **Round 1's mechanics, all still live and test-proven.** At
  `src/app/preview/performance-lab/`, on the accepted Home's design.
  Live and test-proven in a real browser: the current view tray with
  removal, the answer panel (net profit, the cumulative chart in
  Home's chart language, then Bets, Record, Hit Rate, ROI), chips
  re-pricing at the intersection they would create, Compare
  appearing at exactly two selections and flipping to a side by side
  reading, gone at three, the domain drop down on the Sport header
  rescoping the page, markets unfolding under a selected category,
  the See these N bets door, the clean empty state, and the
  selection arriving by URL (`?sel=sport~plain~Football`), which is
  the transport Home's taps will use.
- **The demo numbers are engineered to agree with Home.** Lab has
  its own fixture, `lab-data.ts`, GENERATED by `gen.mjs` in the same
  folder (edit that, not the output). It solves 87 picks backwards
  from Home's list: Moneyline 30–16 (+$2,658), Premier League 14–8
  (+$743), Low odds 18–11 (+$612), Singles 24–18 (+$440), Player
  Props 7–11 (-$440), whole record 49–38, +$2,637, 24.1% ROI.
- **Where Lab's design values live:** `performance-lab/ui.ts`, copied
  once from Home's `page.tsx`, because Home's constants are not
  exported and that folder is protected. Home's icons are imported
  from `../performance-home/icons` (importing reads the reference,
  it does not edit it); Lab's own chip icons are drawn in the same
  language in `lab-icons.tsx`. All numbers flow through the pf
  engine (`../pf/engine`), which speaks `src/lib/stats.ts`.
- **Round 1 judgment calls awaiting his reaction** are recorded in
  `docs/open-questions.md`.
- **Not built yet:** the taps on Home (blocked on him unlocking the
  protected folder for tap wiring), the full vocabulary sheets
  behind each group (today the rows scroll and show only facts the
  record contains), the All bets page behind the door, the insight
  popup, dark theme, real user numbers, and any Soon badge work.

## Lab's rules so far

- **Six groups, renamed and reordered by the owner, 29 August 2026,**
  in his words: "Correct order and words: Sport, League (swap name
  from Where), Category (Swap What you Bet), When, Bet Type (Swap
  from How), Risk (Odds Range)." Older notes use the old names
  (SPORT, WHAT YOU BET, WHERE, WHEN, HOW, RISK); the rules attached
  to them carry over to the new names.
- **The group name headlines live once, above each section.** His
  order, 29 August 2026: "Remove the pill shaped row with the
  headlines horizontally Sports, What you bet etc.. it does not need
  to be there, its already shown below as a category headline."
- **Lab's KPIs under the chart are Bets, Record, Hit Rate, ROI.** His
  order, 29 August 2026: "Remove wagered and returned." This is Lab's
  answer panel; Home's own KPI row is unchanged.
- **Sport carries the domain arrow.** Sports is default and keeps its
  single tap. Picking another domain rescopes the whole page. Bet
  Type and Risk do not rescope; they mean the same in every domain.
  His sketch of the control, 29 August 2026: "Envisioning a drop down
  menu when clicking sport, do see other domains, such as Economy or
  Culture." Envisioning is the confidence level: the drop down is his
  lean, not a settled control.
- **League is its own group, directly under Sport, and it REPLACES
  the old inner league row.** Asked directly on 29 August 2026 whether
  the 26 August "league row sits under SPORT" ruling survives the
  rename, he chose: the League group replaces it. Leagues appear once
  on the page.
- **Category lists categories**, and tapping one opens its markets
  where real markets exist.
- **When is sport-aware.** It offers only the periods that belong to
  the current sport and actually appear in the user's data.
- **Chips read as a record (12-4), never a percent and never an
  amount.** Extended 29 August 2026 against his own mockup's +$
  chips: "Chips read as a record (12-4), never an amount." Hit rate
  is the score in Lab; profit is the score on Home.
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

## How Home connects to Lab (the state of the seam)

Written 29 August 2026 for whichever chat builds Lab. Three jumps are
ruled: a ranked row opens Lab with that fact selected, a heatmap tile
does the same, and the Build your Performance View button lands on an
empty Lab (all in `docs/decisions.md`).

**Menu switching is LIVE both ways since 29 August 2026**, by his
order after the Lab merge: Home's menu links to Lab and Lab's menu
links to Home, plain navigation, no selection carried. The three
selection-carrying jumps below are still unbuilt.

**On the accepted Home, NONE of the three jumps exist.**
`src/app/preview/performance-home/page.tsx` is a static picture: it
contains no onClick, no href and no Link anywhere (grep confirms
zero). Concretely:

- The five ranked rows are plain divs, the `ROWS.map` block.
- The Explore Lab button is a `<span>` inside the Lab card block.
- The Heat Map header pill is a `<span>`, and **no heatmap grid is
  built at all**: the pill is the only trace of the heatmap on Home.
- There is no Lab page to land on: `/preview/performance-home` is the
  only screen of the new design. **The Lab chat is building both ends
  of every jump**, and also choosing the transport: an address (a
  query param carrying the selection survives refresh and can be
  linked) or shared state (the prototype's way, which dies on
  refresh). Nothing is ruled on this; it is an open build decision.

**The old prototype has working jumps to mine**, but into its own
fact view, which predates the six-group Lab design and is NOT Lab:

- `src/app/preview/pf/App.tsx` holds the mechanism: a `path` array of
  chips is the whole navigation state. Empty path renders Home; a
  non-empty path renders `Fact.tsx`. Every jump is just `setPath`.
- Ranked row: `Home.tsx` fires `onOpen(f.chip)` (line ~118) and
  `App.tsx` does `setPath([chip])`.
- Heatmap tile: `MapView.tsx` fires `onOpen(chip)`, same `setPath`.
- Insight card: `InsightCard.tsx` fires `onExplore(finding.path)`,
  landing on a pre-filled path.
- The prototype's Build your Performance View button does NOT jump
  anywhere: it opens the Add a fact sheet in place
  (`setSheetOpen(true)` in `Home.tsx`). Its comment explains why.

The engine those jumps select into (`engine.ts`) is reusable; the
`path`-of-chips idea matches how Lab's chips are meant to combine.
The seam to build is Home side (make row, tile, pill and button real
controls), Lab side (a page that accepts an incoming selection or an
empty one), and the transport between them.

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
