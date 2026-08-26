# Mockup briefs: the Performance redesign

Written 26 August 2026 for the owner's mockup designer, who works in
another tool. Four blocks: one shared brief, then one prompt per page.
**Paste the shared brief at the top of every page prompt.**

Rules for future edits: the "structure that cannot move" list is drawn
from `docs/decisions.md`. Style is deliberately left open, including the
fonts, which the owner reopened on 26 August 2026.

---

## Block 0: the shared brief

You are designing for Actuals (actuals.cc), the mobile-first manual
sports bet tracker. You have designed for us before: the landing page
and the early Performance explorations are yours, and we love them. The
calm, airy confidence of that work is exactly our taste.

This brief is bigger than anything we have asked of you. The Performance
page is the heart of Actuals, the reason the product exists. We are
asking you to step past your previous work: world class UI, world class
UX, the best page you have ever drawn for anyone.

What Actuals does: users type in every sports bet they place. They enter
the stake and the exact amount To Collect, never odds (odds are derived
and shown, never typed). Actuals then tells them the truth about their
betting: where the money leaks and what they are actually good at.

Performance is one of three tabs in the app (Track, Performance,
Research). Inside Performance sit three sub tabs: Home, Lab, Totals.
Each has its own prompt.

### Structure that cannot move (product law, not style)

- The taxonomy: five domains (Sports, Politics, Economics, Culture,
  Other), each with its own topics (Football, Crypto), categories
  (Moneyline, Price Direction) and markets (Match Winner). Competition
  (Premier League) and Period (1st Half) are separate dimensions.
- Things from different domains never combine. Football plus Moneyline
  is fine, both are Sports. Football plus Price Direction is
  structurally impossible and the UI must make that unthinkable.
- Records, never percents. A win rate is written 12-4, not 75%. The
  owner's reason: 30-16 is more impressive than 5-0, and a percent
  hides that.
- Money is USD with two decimals, always signed in results: +$2,658.40,
  -$440.00. Odds are decimal with two decimals: 1.85.
- Words we never use anywhere: wallet, deposit, withdrawal, withdraw,
  bankroll. We say Tracking Balance, Add, Remove, Balance history.
- Plain punctuation in all copy. No em dashes.

### Style, where you are free

Our current profile, so you know the starting point: a near-black navy
(#04081B) dark theme; one purple accent that means exactly one thing,
"you can press this"; a warm amber that marks AI insights only; green
and red reserved for money outcomes; cards drawn by a hairline edge, not
a shadow; links written as ink with a chevron.

You are free to evolve all of it. Nothing visual is locked. If you can
beat the palette, beat it. The one discipline worth keeping in some
form: each accent colour should keep a single meaning.

The fonts are explicitly open. Today words are Geist and numbers are
Inter Tight, and the owner does not love them. Propose better,
especially for the numerals: this app is wall to wall money figures and
records, the numbers are the voice of the product. Tabular figures are
a must.

Shape language: the Home / Lab / Totals switcher at the top of the page
may be a pill. Everything below it is squared (rounded rectangles), as
in the earlier mockups.

### Format

- Phone screens only, 390 wide. Dark theme first, as before.
- Design with realistic data, never lorem: Football 31-17 +$1,204.50,
  Basketball 9-14 -$440.00, that grade of realism, and keep the numbers
  self-consistent across screens.

---

## Block 1: Lab

Design LAB, the middle tab of Performance and the flagship screen of
Actuals.

The job: the user builds a question out of chips and the page answers it
instantly. Tap Football, then Moneyline, and the page becomes "my
Football Moneyline record". Every tap re-scopes the answer in place. It
should feel like an instrument, not a form.

Anatomy, top to bottom:

1. The Performance header with the Home / Lab / Totals switcher, Lab
   active.
2. Six chip groups, each under a small header:
   - SPORT. Chips for the user's sports (Football 31-17, Basketball
     9-14, Tennis 12-4...). The header itself carries a small arrow:
     a quiet dropdown holding the other four domains (Politics,
     Economics, Culture, Other). Sports is the default. Picking another
     domain re-scopes the entire page to that domain's own topics and
     categories. This control is deliberately quieter than the chips:
     present, discoverable, not competing.
   - LEAGUE. One row only, directly under Sport: three or four leagues
     for the selected sport (Premier League, La Liga, Champions
     League), then a "More leagues" affordance. Never more than one
     row.
   - WHAT YOU BET. The categories: Moneyline, Spread / Handicap,
     Totals (Over/Under), Correct Score, Player Props, Match Props,
     Tournament Winner, Awards, Transfers & Moves. Tapping a category
     reveals its markets beneath it (Moneyline opens Match Winner, To
     Advance) where markets exist. These words are due for a rewrite
     later, so design the pattern, not the poetry of the labels.
   - WHEN. Periods for the selected sport only: Football shows Full
     Time, 1st Half, 2nd Half. This group is sport-aware and only shows
     periods that exist in the user's data.
   - HOW. Single, Parlay.
   - RISK. The odds bands: Low (1.01-1.80), Medium (1.81-3.00),
     High (3.01+).
3. The answer panel: the built fact stated as a sentence, its profit,
   its record, and a "See these 26 bets" door into betting history.

Chip behaviour to design:

- Every chip wears its record (12-4), priced at the intersection it
  would create. With Moneyline selected, the Football chip shows the
  Football Moneyline record, not Football overall. The grid is a live
  preview of its own answers.
- Selections in different groups combine (Football + Moneyline + 1st
  Half narrows).
- Selections inside one group compare (Football vs Tennis). How the
  comparison is presented is genuinely open, and we want your best
  idea. This is the one part of the page where we are asking you to
  invent, and we will treat it as a proposal.
- Chips that cannot pair with the current selection dim. The rule
  teaches itself at the moment you try to break it, with no extra
  colour coding.
- Thin evidence stays visible. A 1-2 chip is a finding (you have barely
  tried this), never hidden.
- With nothing selected, Lab is clean and calm, an invitation to build.

Draw three screens: (1) clean Lab with nothing selected, (2) Football +
Moneyline selected with the answer panel live, (3) two sports selected,
showing your comparison idea.

---

## Block 2: Home

Design HOME, the first tab of Performance and the first thing a user
sees when they open the page.

The job: a performance review, not a statistics page. Within seconds
the user knows what they are good at and where the money leaks. It
opens with findings, never with graphs.

What lives here:

- The ranked list, the core of the page. Facts written as sentences:
  "Moneyline is making you +$2,658.40", "Basketball is costing you
  -$440.00". Each row wears a small family label (EARNER · WHAT YOU
  BET, LEAK · SPORT). Ranked by profit.
- The sort control: Profit, ROI, Hit rate. All three options visible at
  once, no cycling control that hides its choices. Profit is the
  default. When Hit rate sorts the list, rows show records (30-16),
  never percents.
- The map: a mosaic where every tile is one slice of the record, sized
  by how much was bet, coloured by profit or loss. The single glance
  answer to "where is my money actually going".
- What Changed: the movement since they last looked. "Tennis flipped
  from leak to earner." Quiet, a strip or a card, not a feed.
- The door to Lab: "Check out our Lab. Build your Performance View."
- The sparkle, our amber insight trigger, present here as everywhere in
  the app.

Behaviour: tapping any ranked row or any map tile jumps to Lab with
that fact selected. Home hands questions to Lab; it never grows its own
filters.

Draw one screen, two if the scroll needs showing.

---

## Block 3: Totals

Design TOTALS, the third tab of Performance.

The job: the quick scan of every slice. No building, no ranking
cleverness, no sentences. The honest tables a spreadsheet person would
make, elevated by world class typography and rhythm. Home tells you
what matters; Totals lets you check anything.

The four sections, in order:

1. Sports breakdown. Every sport with its record and profit: Football
   31-17 +$1,204.50, down to the sport with one bet. Nothing hidden.
2. Odds groups. Low (1.01-1.80), Medium (1.81-3.00), High (3.01+),
   each with record and profit.
3. Singles vs Parlays. Two rows, record and profit.
4. Categories. Moneyline, Player Props and the rest, record and profit.

The design challenge: four list sections on one scrolling phone page
that stay calm and scannable instead of becoming a wall of rows. The
numbers must line up beautifully (tabular figures), the sections must
breathe, and a loss must read differently from a win at a glance
without the page turning into a Christmas tree.

Draw one screen, two if the scroll needs showing.
