# The Portfolio: view architecture (22 August 2026)

The owner's ten mockup sheets in public/mockups/performance/ are the
spec. This file names every view, maps the navigation, lists the
shared components, and records the owner's rulings as they land.
Views are built ONE PER ROUND into the living preview, in the order
at the bottom.

## The views, by the owner's names

1. PORTFOLIO HOME (01_portfolio_home.png). The Performance tab
   itself. "Things worth knowing" teaser card (two insight lines +
   See all insights), then "Your performance, ranked by what matters
   most" with a "By impact" selector: numbered ranked rows (green
   1..5), sparklines, money + ROI. Then "Needs attention": the leak
   rows in red tint, numbering continuing (6, 7).
2. FACT PAGE (02_fact_page.png). Icon, name, "Core strength" pill,
   money, inline stats strip, big axis chart with period chips
   (1M 3M 6M 1Y ALL), four stat boxes, "Inside <fact>" rows with See
   all, then Compare (outline) and Add a fact (filled) buttons.
3. COMPARE (03_compare.png). Two fact cards with a vs badge, metric
   toggle ($ Profit | ROI | Hit rate), dual-line chart, period
   chips, Key stats rows, Explore button.
4. ALL FACTS (04_all_facts.png). FOLDED INTO 5 by the owner, 22
   August. Its search field and filter chips moved into the Add a
   fact sheet; there is no separate All Facts page.
5. ADD A FACT (05_add_a_fact.png), which is now also the directory.
   Search, a filter chip (All, Winning, Losing, Hot), tabs (Popular,
   Markets, Leagues, Other), ranked rows with +, and "Create custom
   fact: build your own combination".
6. MAP VIEW (06_map_view.png). The treemap as a full view: solid
   green/red tiles graded by profit, grey "Others" bucket, legend
   ("More profit ... More loss", "Size shows impact on your
   results"), list/map toggle icons.
7. WHAT CHANGED (07_what_changed.png). "Since yesterday": movement
   cards (arrow + rank delta, NEW), each with the fact, its money,
   the day's delta, and the sentence ("Moved up to #1"). View all
   changes, then "Ask Actuals: why did this change?".
8. INSIGHT / QUESTION CARD (08_insight_question_card.png). A modal
   sheet over the dimmed home: badge icon, "Biggest opportunity",
   one sentence naming an intersection, four stat rows, "Explore
   <fact>" primary button, "Ask Actuals why" secondary.
9. INTERSECTION VIEW (09_New Lab V1 View.png). The power mode: fact
   header + token row (+ Add a fact), the V1 answer card with chart,
   "Tap any chip to refine your view", POPULAR FACTS grid with +
   buttons, YOUR SELECTED FACTS tokens with a live stats strip.
10. The overview sheet (10_Portfolio_all.png) ties 1-8 together and
    adds: the four-tab bar labeled Track, Performance, Research,
    Profile; footer wordmark "Open. Tap. Compare. Map. Improve."

## Navigation map (proposed where the sheets leave it open)

- Home rows and Needs-attention rows -> Fact Page. Deeper Inside
  rows -> deeper Fact Pages (intersections).
- Home "Things worth knowing" -> insights list -> Question Card
  modal; "See all insights" likewise.
- Fact Page -> Compare, -> Add a fact sheet -> Intersection View.
- All Facts <- proposed entry: a quiet "All facts" link at the foot
  of the home list (matches sheet 4's Add-a-fact button placement).
- Map View <- proposed entry: the list/map toggle sitting beside
  "By impact" on Home (sheet 6 carries the same toggle icons).
- What Changed <- proposed entry: tapping the "Updated today" line
  on the Things-worth-knowing card.

## Shared components (build once, reuse everywhere)

RankedRow (icon, name, stats line, sparkline, money+ROI, chevron,
rank badge, movement badge) · FactHeader (icon, name, strength pill,
money) · StatStrip · StatBoxes (four) · BigChart (axes, period
chips) · TokenBar (+ Add a fact) · PopularFactCard (+) · CompareCard
· MetricToggle · TreemapTile + legend · InsightLine · ChangeCard ·
ModalSheet · FilterChips · SearchField · TabBar (four tabs pending
ruling).

Palette: already pixel-sampled from the earlier sheets (light white
+ #430EDB electric purple, dark #090B17 + #8538EA line). Sparklines
on Home are PURPLE in the mockup, matching the owner's "charts are
purple" ruling; the v2 preview's green/red sparklines will be
corrected to purple.

## Owner rulings (22 August)

- Four tabs: DEFERRED. Not needed for the rebuild; previews keep the
  three-tab bar. Decide before the real build ships.
- Fact Page stat boxes: Bets, Record, Hit rate, ROI now. Avg odds
  (decimal) and Profit per bet may join later. Units needs its own
  product decision first.
- Intersection View: the whole card RE-SCOPES when a fact is added.
  One screen, one truth; the tokens say what is included.
- The overall record: a quiet total line under "Your performance" on
  Home, AND the Intersection View with no filters IS the overall
  record page (it has the chart already). It carries a "Show overall
  record" / "Remove filters" button.
- "Create custom fact" = save-and-name an intersection as a reusable
  fact. Confirmed. Built late.
- CHART RULE (owner's wording): "Purple line for profit and red for
  losses." CONFIRMED, and it stands. `docs/design-system.md` contradicted
  it for weeks by saying "there is no purple data line"; that page is
  corrected. Two parts are still open: the exact purple (the sheets were
  sampled at #430EDB and #8538EA, neither of which is in the palette),
  and whether the live Track chart changes too. See
  `docs/open-questions.md`.
  Applies everywhere: a leaking fact's chart draws red;
  compare lines color by each side's sign (two-profitable-facts case
  to be solved with two purple weights and shown at the Compare
  round).
- "By impact" selector options: By impact (default), By profit,
  By ROI, By hit rate.
- What changed: daily as drawn, with a designed quiet-day state
  ("Nothing moved yesterday").

## Build order (one view per round, each into the living preview)

1. Portfolio Home (the spine; engine exists)
2. Fact Page (the second spine; Inside rows are the navigation core)
3. Add a Fact + Intersection View (the power layer)
4. All Facts (directory, filters, search)
5. Compare
6. Map View (reskin of the existing engine)
7. What Changed
8. Insight / Question Card modal + the insights list
Then the motion pass, then the real-build plan in phases.

## Status

- 22 August: architecture pass delivered; the eight rulings landed.
- View 1, PORTFOLIO HOME: APPROVED 22 August, after five rounds.
  Final shape follows v2_01_portfolio_home.png with the owner's
  edits: no Overall score, profit as the hero, "Build your
  Performance View", "Explore Your Heatmap", darker green #069F41.
- View 2, THE FACT PAGE, now THE GOLDEN VIEW: rebuilt to
  v3_02_fact_page.png as the chart builder. The "Inside" list was
  cut (it duplicated adding a fact); in its place the token bar, the
  See-the-bets link and the EXPLORE THIS PERFORMANCE card grid whose
  + refines the page where it stands. Ten cards before View all
  facts. Owner edits applied: primary-fact icon, no duplicate stats
  row, slim period control, measured card geometry, a serious dark
  blue + with no circle.
- View 5, ADD A FACT: built to 05_add_a_fact.png. THREE doors, all
  wired: Home's "Build your Performance View" opens it with NO
  context (build a question from scratch), and on a fact page both
  the token pill and the bottom button open it scoped. Tabs Popular
  / Markets / Leagues / Other; every row priced at the intersection
  it would create. "Create custom fact" is drawn but inert by
  ruling. Home now always shows exactly five ranked rows, per the
  v2 sheet: everything beyond them lives in the builder.
- View 3, COMPARE: built to 03_compare.png. Reached from the fact
  page's Compare button, which opens the sheet in "Compare with"
  mode (ranked against the whole record, same-group rivals allowed,
  no custom-fact card). Two cards with the vs badge, the $ Profit /
  ROI / Hit rate toggle redrawing both series from one cumulative
  engine pass, period chips, Key stats, Explore. The chart rule
  holds: each side coloured by its own sign, with a second weight
  and a legend dot when both share one.
- View 6, MAP VIEW: built to 06_map_view.png. Reached from Home's
  "Explore Your Heatmap"; the list/map toggle returns. Solid tiles
  graded green by profit, one red for losses, a grey Others bucket,
  the legend and the "Size shows impact" caption. Tiles are ranked
  by money moved (a percentage cutoff once folded the biggest leak
  into Others, leaving a heatmap with no red in it), and type is
  sized from each tile's real pixels so a narrow column never prints
  a number wider than itself. Tapping a tile opens that fact.
- View 7, WHAT CHANGED: built to 07_what_changed.png. Reached from
  Home's "Updated today" line. Ranks are recomputed as of the past
  and compared with today, so every badge is earned: an arrow with
  the number of places moved, NEW for a fact that was not in the top
  list before, and a neutral "#rank" for one that held its place. A
  fact that did not move is NOT a fall, which the first draft drew
  as a red down arrow pointing at zero. NEW cards print no day
  delta, because their whole profit is the change. The quiet-day
  state is designed, per the ruling: "Nothing moved yesterday".
- View 8, INSIGHT / QUESTION CARD: built to
  08_insight_question_card.png. A modal over the dimmed home,
  opened from the "Things worth knowing" header or "See all
  insights". The finding is COMPUTED, never canned: the strongest
  two-fact intersection with at least four picks behind it, worded
  by its sign (Biggest opportunity in purple, Biggest leak in red,
  with the ring following). Four stat rows, a filled Explore button
  that opens that exact intersection in the builder, and an
  outlined "Ask Actuals why".
- ALL TEN VIEWS ARE WALKABLE end to end at /preview/pf.

## The polish pass (22 August, after all views were built)

Ruled by the owner: one pass, emoji left alone for now, All Facts
folded into the builder.

WHAT THE SEAMS WERE. Seven views built one per round, each solving
its own sheet, had drifted into: four different back bars, three
segmented controls with two different active states, ten corner
radii, section gaps from 4px to 26px, three chevrons, and a third
green (#009B07) on the strength pill. None of it was visible in any
single screenshot, which is exactly why it survived seven rounds.

WHAT IS SHARED NOW, in src/app/preview/pf/theme.tsx and nowhere else:
- Three radii (--pf-r-card / -inner / -small) and two vertical
  rhythms (--pf-gap-section / -block). A fourth value is a bug.
- PfTopBar: one back bar, with a right slot for whatever a view
  keeps up there.
- PfSegments: one period control. The active state is SOLID PURPLE
  everywhere. Home's lavender-on-white pill lost because it is
  barely a state on a white card and vanishes on the dark page.
- .pf-door: the full-width bordered card that opens something
  bigger. Home's builder and What Changed's full list were three
  different shapes for one job.
- .pf-chev, and :active / :focus-visible feedback. Nothing in the
  prototype acknowledged a tap before this, which reads as broken.

TWO DUPLICATIONS REMOVED, both the same mistake CLAUDE.md records
from the last Performance rebuild: Home and the fact page each
carried an "All time ▾" chip directly above a segmented control that
said the same thing. The chips are gone. Home's label now names the
window ("Last 30 days profit"), so it does work instead of saying
"Profit".

Sub-lines that are READ now take --pf-sub at weight 500 everywhere.
--pf-muted survives only on uppercase micro labels and chart axes.

TWO DELIBERATE DEVIATIONS FROM THE SHEETS, for the owner to rule:
- "View all" beside Key stats on 03_compare.png is removed. It
  promised a page that exists in none of the ten sheets.
- The insight card (08) keeps its pill buttons while the fact page
  and Compare keep rounded rectangles, because that is what the two
  sheets draw. The sheets disagree; the owner drew them.

- The living preview is one tappable prototype at /preview/pf.
  Engine and skin: src/app/preview/pf/ (engine.ts, theme.tsx).
