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
4. ALL FACTS (04_all_facts.png). The directory: search, filter chips
   (All, Profit, Loss, Hot, New), flat ranked rows, Add a fact.
5. ADD A FACT (05_add_a_fact.png). Sheet with tabs (Popular,
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
  losses." Applies everywhere: a leaking fact's chart draws red;
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

- 22 August: architecture pass delivered, rulings pending. No view
  built yet.
