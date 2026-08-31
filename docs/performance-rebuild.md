# The Performance rebuild (in flight)

Status as of 31 August 2026. **The rebuilt Performance area is LIVE at
`/stats`** on real numbers. The old page is still reachable at
`/stats-old`, his ruling. See "The Performance area is LIVE" below.

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

## The shared design file, 31 August 2026

All six preview pages read `src/app/preview/performance-ui.ts` for
every value more than one of them uses: the colours, the Figtree face,
a ten step type scale, the two weights, six radii, the page column,
the tab bar, the menu's height and pill, the two back header shapes
and the four chart heights. Spacing used once on one page stays on the
page.

Three blocks that used to be copied are now one component each:
`performance-shell.tsx` (the column, the face and the tab bar, which
was byte identical in all six `page.tsx` files),
`performance-menu.tsx` (Home / Lab / Totals, which existed twice) and
`performance-header.tsx` (the back header, which existed three times
and had already drifted).

`icons.tsx` moved from `performance-home/` to
`src/app/preview/performance-icons.tsx`. Six pages import it.

**Nothing looks different.** Proved with `shotdiff.mjs`: 24
screenshots of the old code and the new, compared pixel by pixel, all
identical. `jumptest.mjs` passed 46 doors.

**The lock on `performance-home/` is gone**, permanently. See
`docs/decisions.md`.

Still to come, pass two of the same job: the live pages (Track,
Research, Settings, today's `/stats`) and a build check that fails on
a colour or a font written inside a page.

## Home computes its numbers, 31 August 2026

Home's five ranked rows, its KPI figures, its hero number, its chart
and its insight sentence were all literals copied off the mockup.
Nothing computed them, so Home could disagree with Lab and Totals
about the same bets. They read one engine; Home read nothing.

`home-model.ts` now builds everything Home shows from bets.
`charts.tsx` draws from values instead of the traced arrays. The
money is still never computed here: `pf/engine.ts` groups the facts
and imports every money rule from `src/lib/stats.ts`.

**Verified before wiring, by running both over the same bets:** the
engine and `netProfitOf` agree to the cent ($2,636.93). There is one
money definition, not two.

**His ruling on what the list contains, 31 August 2026:** "the top 5
best performing, across all variations, based on profit." No
one-per-family rule and no guaranteed losing row.

**What the wiring exposed, all of it now fixed:**

- The five rows were not the top five by profit. They are now
  Moneyline, Match Winner, Parlays, Medium odds and Football.
- Rows that survived still had invented figures: Moneyline showed 60%
  hit and ROI +31%, against a real 65% and +56%.
- `rankedFacts` returns `spark: []` on purpose, so the sparklines drew
  as flat lines until each fact asked for its own `sparkFor`.
- The axis and the line now share ONE scale, on round numbers. Reading
  them off the data alone produced labels like "-$16".
- The insight card said "Player Props drove most of your losses this
  month". Player Props is not in the list and is not the biggest leak.
  The sentence is computed from the worst fact now.

**`jumptest.mjs` reads the rows off Home** instead of listing them.
The rows are computed, so a hardcoded list would go stale the moment
the data changes. It proves every fact Home ranks arrives in Lab
showing the same record, which is the alignment guarantee itself.

**Still not computed on Home:** the "This month" selector. It is inert
and the number beside it is all time, so the label overstates. Lab's
panel says "All time" for exactly this reason. Flagged, not changed.

## The Performance area is LIVE, 31 August 2026

`/stats` now serves the rebuilt Performance area on the signed in
user's own bets. Today's old page moved to `/stats-old`, unchanged,
his ruling.

| Address | Page |
|---|---|
| `/stats` | Home |
| `/stats/lab` | Lab |
| `/stats/totals` | Totals |
| `/stats/compare`, `/stats/bets`, `/stats/heatmap` | The pages inside |
| `/stats-old` | The old page, real numbers, design untouched |

**One component serves both surfaces.** Every page takes its bets and
its route set from the caller. The public preview hands it demo bets
and `PREVIEW_ROUTES`; the live page hands it `loadUserBets()` and
`LIVE_ROUTES`. Neither page knows which it is, so the preview cannot
drift away from the thing it is previewing.

**The bottom tab bar navigates only on the live pages.** A preview is
a picture of a design and a tap that left the preview area would be a
surprise; on the live pages an inert bar would strand you on
Performance.

**Proved invisible:** 24 preview screenshots before and after, pixel
identical, twice. `jumptest.mjs` passes all 6 doors. Every live route
redirects a signed out visitor to `/login`.

**Tested against a new account** (`emptytest.mjs` pattern): no bets,
one bet and three bets all render without throwing. An account with no
range at all draws its chart with no axis labels rather than the
nonsense "$0, -$1, -$2, -$3".

**Still to do, and he knows:** the empty state itself. A brand new
account gets a page with no ranked rows, a flat line and "- ROI",
which does not crash but was never designed.

## Home, Lab and Totals are ONE page, 31 August 2026

They were three routes. Switching tabs meant a server round trip, a
fresh database query, and Next showing `/stats/loading` in between,
which was the OLD design's skeleton: the word Performance, three grey
cards and the three tab bottom bar. His words after the first look at
the live site: "it's very slow when jumping tabs... it's loading this
page in between, not at all a smooth experience. i dont want that. i
want the transition to be a clean smooth swap. i want to see the tab
bar slide over."

`performance-area.tsx` now holds all three. The bets load once, the
frame and the menu stay mounted, and the tab is React state.
**Measured: zero server requests per switch, and roughly a tenth of a
second to render.**

- **The addresses still work.** Each tab keeps its own route for deep
  links and for the jump from Home; those routes render the same area
  with a different starting tab. Switching uses `pushState`, and the
  back button is wired to it.
- **The pill slides.** It is one element with a stable key, so the
  browser animates the move instead of React replacing it.
- **The selection travels as a PROP, not in the address.** `pushState`
  does not refresh `useSearchParams`, so a jump that relied on the
  address arrived at an unscoped Lab, and Lab then overwrote the
  address with its own empty state.
- **`/stats/loading.tsx` no longer shows the old design.** It is a
  blank frame in the page's own colour, and it is only ever seen on a
  cold arrival now.

**A test that was lying, fixed.** `jumptest.mjs` asserted only that the
fact's record appeared somewhere on Lab. Every chip in Lab prints its
own record, so "30-16" was on screen whether or not the jump landed:
five of six jumps passed while the feature was broken. It now asserts
that Lab is SCOPED, that the empty Lab says so, and that the fact is
named in the tray.

## The period filter, 31 August 2026

His words after the first live look: "i did fix the month toggle in
the top corner on the lab page. they added a time filter there, so i
should be able to see result from all time, year, month, week, day and
then add custom as well, just as the old performance page."

- **Home's corner pill was a picture of a control.** It read "This
  month" above an all time number. It is the real control now, the
  same `PeriodPill` Lab and Totals already used, so all four screens
  read as one product.
- **Custom is in.** It was deliberately left out while these were demo
  pages with a generated record; they are the live pages now. The old
  page's own behaviour is copied: the from date starts at midnight,
  the to date ends at 23:59:59.999, and a half filled range is open at
  that end. A chosen range names itself on the pill ("From 1 Aug"),
  so the window is never hidden behind the word Custom.
- **ONE window for the whole area.** The period used to live inside
  Lab and inside Totals and travel between them in the address. It
  lives in `performance-area.tsx` now: change it on Home and Lab is
  already looking at the same window.
- **Totals no longer changes the period by navigating.** It used
  `router.replace`, which is a server round trip: inside the shared
  area that meant reloading the page to change a filter. Its "View
  all" links into Lab switch in place too, measured at zero server
  requests.

**`periodtest.mjs` proves it filters.** A control that looks right and
filters nothing is exactly the bug this page already had, and a
screenshot cannot tell the difference between a working control and a
picture of one. The script checks every period changes the numbers,
that Custom offers two dates and names itself, and that the window
survives a tab switch.

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
  chart order shaped to Home's early-dip-then-climb arc).
- **ROUND 3 IS ACCEPTED and merged, 29 August 2026**, his words after
  checking the live preview: "merged, checked the phone, works
  well." Recorded at that confidence: it works, he did not call it
  finished. Lab is live at `/preview/performance-lab`.
- **The menu taps are live both ways**, and the other chat's jump
  doors from Home's ranked rows land correctly in this Lab: all
  seven cases of `jumptest.mjs` pass against the merged tree.
- **TOTALS IS BUILT, awaiting his reaction.** At
  `src/app/preview/performance-totals/`, from his sheet
  `2. Totals.png`. All three menu tabs now reach each other and
  `jumptest.mjs` proves all four menu doors. Its four deliberate
  differences from the sheet are in `docs/decisions.md`.
- **COMPARE IS BUILT AND MERGED, 29 August 2026.** He merged it
  without a verdict and moved on, so it is live at
  `/preview/performance-compare` and NOT recorded as accepted. Its own page at
  `src/app/preview/performance-compare/`, built to his sheet
  `1. Compare.png` with Home and Lab's colours and face, his order
  of 29 August 2026. Reached from Lab's door at exactly two
  selections, carrying both chips in the address; the back arrow
  returns to Lab with both still selected. The Soon badge is gone.
  Five deliberate differences from the sheet are listed with their
  reasons in `docs/decisions.md`, along with his first edit list
  (lavender winner tint out, insights strip out, bigger cards, the
  wins pill folded into the grey one), all applied.
- **THE HEAT MAP IS BUILT, awaiting his reaction.** At
  `src/app/preview/performance-heatmap/`, from his sheet
  `2. heat map.png`, on his order of 29 August 2026. Its own page at
  `/preview/performance-heatmap`, reached from the Heat Map pill on
  Home, back arrow returns there. Four compact insight cards
  (Strongest Edge, Biggest Leak, New Pattern, Cooling Off) in two
  rows of two, 64px each, then a tall squarified
  treemap where a tile's area is the money that fact moved and every
  tile opens Lab on that fact. **No filter on the map**, his ruling
  of 29 August 2026: the tiles are `rankedFacts([], 5)`, the same
  call Home's ranked rows make, so the map shows the best and worst
  facts across every group at once. Those facts overlap, so the
  tiles do not add up to the record and there is no Others tile.
  **Eight tiles, with the top three earners and the top three leaks
  guaranteed a seat**, his ruling. `jumptest.mjs` asserts the map
  mixes groups, shows eight tiles with three of each colour, and
  crops no figure.
  The deliberate differences from the sheet are in
  `docs/decisions.md`.
- **THE NUMBERED JOB LIST. Written 29 August 2026 at his request** so
  he can start one by saying its number. **These numbers are stable.
  Never renumber them.** When a job is done, mark it DONE here and
  leave the number in place. New jobs take the next free number.
  Order is most value per hour first, and things today's `/stats`
  already does before things it never did.

  1. **The bottom tab bar works on every preview page.** Track to
     `/app`, Performance to `/stats`, Research to `/recommendations`,
     the three the real `src/components/TabBar.tsx` already uses.
     Profile is the fourth tab he ruled on 26 August 2026 and has no
     page: point it at `/settings`, which IS Profile today, until job
     13. Touches all five preview pages plus the protected Home
     folder, so it needs the Home unlock.
  2. **Totals' six Per Category rows open Lab** with that category
     selected. Identical mechanic to Home's ranked rows, which is
     built and proved by `jumptest.mjs`.
  3. **DONE, 29 August 2026. Totals' two "View all" links open Lab**
     at that group. Profit by Sport goes to the Sport group, Per
     Category to the Category group. No new page: Lab is the full
     list. The six groups all fit on one screen at the bottom of Lab,
     so scrolling alone could not say which one you were sent to; the
     arrival is marked with the selected-chip lavender and fades after
     two seconds. `jumptest.mjs` checks the mark, not the scroll.
  4. **DONE for three of four pages, 29 August 2026. The period
     control works** on Totals, Lab and the Heat Map. Home's "This
     month" pill is still dead because that folder is locked to this
     chat, his ruling: "Home folder will not be unlocked. I will
     organize that in the home chat." **So Home and the other three
     disagree until his Home chat wires it.** The control is
     `performance-lab/PeriodPill.tsx` reading
     `performance-lab/period.ts`, which uses the live app's own
     periods and `periodStart` from `src/lib/stats.ts`, the same
     function Track's balance band uses. The period travels between
     the three pages in the address and survives picking a chip.
  5. **DONE, 29 August 2026. The All Bets page** at
     `/preview/performance-bets`, closing both of Lab's and Totals'
     bet doors. (It does not close a third: Compare has no such door
     drawn, which the numbered list wrongly claimed.) It reads the
     same `?sel=` and `?period=` address Lab writes, so arriving from
     either page shows what that page was showing, and the back arrow
     returns you there with your selection intact.
  6. **DONE, 29 August 2026. The (i) dots explain their number.** One
     popover, `performance-lab/Explain.tsx`, reading one dictionary,
     `performance-lab/explain.ts`. Nine entries, serving all nine
     dots across Lab, Totals, Compare and the Heat Map.
  7. **DONE, 29 August 2026. Lab's six group labels expand the row.**
     Tapping "All sports" wraps that row instead of scrolling it, so
     every fact in the group is on screen; the label becomes "Show
     less". No new page, no vocabulary sheet.
  8. **Delete "What changed?" from Home.** CLAUDE's suggestion, not
     his decision. The Heat Map's New Pattern and Cooling Off cards
     already answer "what moved lately", and two answers to one
     question is how a page gets confusing. Needs the Home unlock.
  9. **Real numbers.** The four pages read `lab-data.ts`, a demo
     fixture. Point them at his actual record through the same
     engine. The biggest unknown in the whole rebuild: a thin record
     may leave the Heat Map nearly empty.
  10. **Dark theme** on all four pages. They are light only today.
  11. **Empty states.** What a new user with no settled bets sees on
      Home, Lab, Totals and the Heat Map.
  12. **Swap `/stats` over.** The new Performance replaces today's
      page at its own address. Nothing reaches a real user before
      this. Build order is his: "Home, Lab, Totals are the main
      pages", Home ships first, Totals holds today's `/stats`
      content unredesigned on day one, Lab wears a Soon badge.
  13. **The Profile tab rework.** Profile IS today's Settings page
      promoted to a tab, his ruling of 26 August 2026, and it is due
      a rework. A separate product job, not a wiring one.

- **EVERY CONTROL WAS CLICKED, 29 August 2026.** Not read, clicked,
  across all five preview pages and their states. Everything below
  is drawn and inert: it looks tappable and does nothing. None of it
  is a bug, all of it is a door to something not built yet, and all
  of it is what the owner will find by hand if nobody writes it down.
  - **Home:** "This month" (the period picker) and "What changed?".
  - **Lab:** "See these N bets" (needs the All Bets page), and the
    six group labels: All sports, All leagues, All categories, All
    periods, All types, All ranges (need the vocabulary sheets).
  - **Totals:** "All time" (period picker), both "View all" links,
    "See all bets", and the six Per Category rows.
  - **Every page:** the Track, Research and Profile tabs in the
    bottom bar, and the small (i) info dots.
  Everything else works and was verified: Home's five ranked rows,
  Explore Lab, the Heat Map pill, all three menu tabs on all three
  pages, all 31 chip and tray buttons in Lab, its domain dropdown,
  Add a fact (it scrolls the groups into view), the Compare door,
  Compare's three metric and five period buttons, all four Heat Map
  insight cards, all eight tiles, and every back arrow.

- **Colours are one dial now, Home included**: every colour Home,
  Lab, Compare, Totals, the Heat Map and All Bets draw comes from
  `performance-ui.ts` and none of those folders contains a raw
  hex. Home joined on 30 August 2026, with the owner's permission to
  open the protected folder for that one job. Nothing moved and no
  shade changed: the before and after screenshots of Home, phone and
  laptop, are identical files. See `docs/decisions.md`.
- **`jumptest.mjs` now covers Compare**: the door exists at two
  selections and is gone at three, it opens on the two chosen
  facts, and back keeps them. Eleven cases, all passing.
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
- **Where every Performance colour lives:** `performance-ui.ts`.
  It started as a copy of Home's own constants; since 30 August 2026
  Home imports it too, so there is one source and no copy. Home's icons are imported
  from `../performance-home/icons` (importing reads the reference,
  it does not edit it); Lab's own chip icons are drawn in the same
  language in `lab-icons.tsx`. All numbers flow through the pf
  engine (`../pf/engine`), which speaks `src/lib/stats.ts`.
- **Round 1 judgment calls awaiting his reaction** are recorded in
  `docs/open-questions.md`.
- **Not built yet:** Compare (its own page, waiting on his mockup),
  the full vocabulary sheets behind each group's All link (today the
  rows scroll and show only facts the record contains), the All bets
  page behind the See these N bets door, the insight popup, dark
  theme, real user numbers, and any Soon badge work.

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

**TWO OF THE THREE JUMPS ARE WIRED AND TEST-PROVEN, 29 August
2026**, at the owner's ask once Lab's preview existed: "can we open
up the two other doors to lab page now?" The transport is the
address: LabApp reads `?sel=group~kind~value` (the Lab chat built
the receiver, the Home chat the taps).

- **Ranked row: WIRED.** Each of Home's five rows is a `Link`
  carrying its fact (the `sel` field in the `ROWS` array of
  `src/app/preview/performance-home/page.tsx`). Landing on Lab, the
  answer panel recomputes to that fact's own record.
- **Explore Lab door: WIRED.** The whole Lab card links to
  `/preview/performance-lab` with nothing selected, the ruling: an
  empty Lab.
- **Heatmap tile: STILL MISSING.** No heatmap grid exists on Home;
  the Heat Map header pill is still a dead `<span>`. That door gets
  built with the heatmap itself.
- **`jumptest.mjs <port>` proves the doors in a real browser**: each
  row tap must arrive showing that fact's record, the Explore door
  must land empty, and the menus must link both ways. A tap is a
  gesture, and gestures need a script, not a screenshot.

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
   switch while the numbers are checked. **RULED, 31 August 2026, and
   he has repeated it: the old page does not die.** His words: "want
   today's /stats to be reachable with my numbers in the future.
   that's all i want." So swap day includes one small job: today's
   `/stats` page moves to its own address (working name `/stats-old`),
   behind his login, reading his real numbers, design untouched. It
   stays until he himself retires it. The demo-data mirror at
   `/preview/performance` is NOT this; it shows fake numbers and does
   not satisfy the ruling.
4. **One colour dial for all pages. DONE, 30 August 2026.** It was
   parked by the owner on 29 August 2026: "I don't feel the need to
   do anything drastic right now... what is important is that pages
   stay consistent across the board yet protected and not getting
   edited without my control. and the biggest thing for me: that we
   can edit colors and details across pages once this creation
   process is done." He unparked it on 30 August 2026 and gave a one
   job permission to open the protected Home folder. Every
   Performance page now reads `src/app/preview/performance-ui.ts`
   and holds no colour of its own. Zero visual change, proven by
   identical before and after screenshots at both widths.
