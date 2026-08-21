# The Lab concepts (August 2026)

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

## Concept 2: The Portfolio (QUEUED)

Betting skills as holdings: one ranked list mixing all dimensions
(no groups), each fact with its own stock-style page (chart, stats,
"Inside" rows that are ready-made intersections, Compare). The
audience already lives in this metaphor on Kalshi.

## Rejected

- Findings Deck (a feed of finished finding cards): not good enough,
  owner's call, 22 August.
- Ask (type your question): typing is work before answers. May
  return much later as an ActualsBOT layer, never as the door.
