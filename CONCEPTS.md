# The Lab concepts (August 2026)

**STATUS, 26 August 2026: THIS ROUND IS OVER. Read it as history.**
Every concept below is marked "IN REVIEW", and none of them still is.
The Portfolio won the round, ten views were built from it, and then the
owner returned to Lab V1 as the spine. Its "meaningfulness" ranking, the
thing several concepts here are built on, was removed: "remove impact
(no idea what it means)". The live plan is `docs/performance-rebuild.md`
and the rulings are in `docs/decisions.md`.

The Performance rebuild produced one shipped-quality candidate and a
field of challengers. This file tracks them so nothing blurs across
days. The judging frame is fixed: every concept is shown on the same
demo data, in the same two states (opened cold, and after one tap on
Football), always against V1 Lab as the reference.

The design principle being tested, in the owner's words: the database
should be complex, the interface shouldn't have to be. Users should
experience the intelligence the taxonomy enables, not the complexity
of the underlying data model.

## V1 Lab (reference)

The faceted board: six groups of fact chips with money, tap to
combine or compare, answer card on top. Preview: /preview/lab2.
Owner: visual execution good enough to launch; but too much cognitive
load, every dimension gets equal weight, feels like the taxonomy
exposed directly.

## Upgrade A: The Sorted Lab (IN REVIEW)

V1's exact skin, reordered by signal. Groups auto-rank by how much
they split this user's money; only the strongest open expanded, the
rest fold themselves. One personal line explains the ranking.
Wireframe: /preview/sorted. Mockup: /preview/lab2-sorted.

## Upgrade B: Questions First (IN REVIEW)

The Lab opens as a stack of ready-made tappable questions ranked from
the user's data; one tap loads the answer with tokens filled. No
typing anywhere. The board waits folded under "Build your own
question". Wireframe: /preview/questions. Mockup:
/preview/lab2-questions. The question engine generates: biggest
earner, biggest leak, strongest two-fact combination, and the two
comparisons whose values disagree most, ranked by money at stake.

## Concept 1: The Money Map (IN REVIEW)

The record as territory: a real treemap of tiles sized by the money
each fact moves, colored by profit and loss. Drilling is zooming and
re-splitting; the auto-split prefers dimensions that draw an actual
map (one value holding 80%+ of the money is demoted). Facts too
small to map sit on a shelf, never lost. Wireframe: /preview/map.
Mockup: /preview/map-mock.

## Concept 2: The Portfolio (IN REVIEW, the owner's favourite going in)

One ranked list mixing ALL dimensions freely. The principle, in the
owner's words: it prioritizes information by relevance to the user,
rather than by the structure of the database. Actuals continuously
asks "what are the most meaningful facts about this bettor right
now?" and ranks them; the taxonomy stays sophisticated underneath
and invisible until relevant. Ranking is meaningfulness, not raw
P&L: money weighted by evidence (|profit| x sqrt(picks/(picks+10)))
in the preview, growing later with exposure, recency, consistency,
change over time. Leaks sink to their own section. Every fact has
its own page with "Inside" rows (ready-made intersections), each a
deeper page. Layers can be stolen in later: Upgrade B's questions,
the Money Map as an alternate view. Wireframe: /preview/portfolio.
Mockup: /preview/portfolio-mock.

## The Portfolio v2 (IN REVIEW, built from the review round)

The Portfolio with the six improvements applied, all computed live:
ranking = money x evidence x actionability (bet types and
competitions above risk bands) x recency; movement badges (NEW, up,
down, cooling) against the ranking as of a week earlier, plus a
computed "This week" line; sparklines on every row; one urgent card
when a leak is still active; leak rows name their biggest driver;
and V1 Lab's tokens live on every fact page ("+ Add a fact" opens a
ranked flat panel), so any page becomes any intersection. The Money
Map is reachable as a view of the same ranking (List | Map).
Wireframe: /preview/portfolio2. Mockup: /preview/portfolio2-mock.

## Rejected

- Findings Deck (a feed of finished finding cards): not good enough,
  owner's call, 22 August.
- Ask (type your question): typing is work before answers. May
  return much later as an ActualsBOT layer, never as the door.
