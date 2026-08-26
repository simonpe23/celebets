# Mockup briefs: the Performance redesign

Written 26 August 2026 for the owner's mockup designer, who works in
another tool. **Seven blocks: one shared brief, then one prompt per
surface.** Paste the shared brief at the top of every prompt, then send
the prompts one at a time.

1. Lab
2. Compare (inside Lab)
3. Home
4. Totals
5. All Bets
6. Insights

Rules for future edits: the "structure that cannot move" list is drawn
from `docs/decisions.md`. Style is deliberately open, including the
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
UX, the best pages you have ever drawn for anyone. Treat every screen as
the one that decides whether a user keeps the app.

What Actuals does: users type in every sports bet they place. They enter
the stake and the exact amount To Collect, never odds (odds are derived
and shown, never typed). Actuals then tells them the truth about their
betting: where the money leaks and what they are actually good at. The
tone of the whole product follows from that: honest, calm, never
salesy, never a casino.

Performance is one of three tabs in the app (Track, Performance,
Research). Inside Performance sit three sub tabs: **Home, Lab, Totals**.

### On every single screen, no exceptions

- **The three tab switcher at the top: Home, Lab, Totals.** Active tab
  clearly marked. This switcher may be a pill; it is the one pill
  allowed on the page.
- **The app's bottom tab bar** (Track, Performance, Research) with
  Performance active.
- Screens that are NOT one of the three tabs (All Bets, Insights, the
  opened Compare view) still live inside Performance: they keep the
  bottom tab bar and need a clear way back.

### Structure that cannot move (product law, not style)

- The taxonomy: five domains (Sports, Politics, Economics, Culture,
  Other), each with its own topics (Football, Crypto), categories
  (Moneyline, Price Direction) and markets (Match Winner). Competition
  (Premier League) and Period (1st Half) are separate dimensions that
  combine freely with the rest, inside one domain.
- **Things from different domains never combine.** Football plus
  Moneyline is fine, both are Sports. Football plus Price Direction is
  structurally impossible, and the UI must make it unthinkable, not
  merely disabled.
- **Records, never percents.** A win rate is written 12-4, not 75%. The
  owner's reason: 30-16 is more impressive than 5-0, and a percent
  hides that. This holds on every chip, row, tile and panel.
- Money is USD with two decimals, always signed in results: +$2,658.40,
  -$440.00. Odds are decimal with two decimals: 1.85.
- Green and red mean money outcomes and nothing else. Never buttons.
- Words we never use anywhere: wallet, deposit, withdrawal, withdraw,
  bankroll. We say Tracking Balance, Add, Remove, Balance history.
- Plain punctuation in all copy. No em dashes.
- **One statement of any fact per row, per card, per screen.** If a row
  says "Moneyline is making you +$2,658.40", that figure does not
  appear again on the right hand side of the same row. Never a period
  chip above a control that repeats the same period. This exact
  duplication has been rejected twice in our history.
- **An icon must never contradict its own row.** If a row is an earner
  with a green figure, its icon points the same way. One direction per
  row.
- **A caption must be true.** Do not label a grid "sized by amount bet"
  unless the tiles really are different sizes. We would rather have an
  honest uniform grid than a caption that lies.
- **One door per destination on a screen.** Not a sparkle in the header
  AND an insights card at the foot. Not a "Check out our Lab" card that
  then repeats itself with a "Go to Lab" link inside it.
- **Peers look like peers.** Three sort options are three of the same
  object. One of them does not carry a value the others lack, and none
  of them wears a dropdown chevron.
- **Do not title a screen with the name of the tab that is already
  selected.** The tab bar and the switcher already say where the user
  is. A big "Performance review" heading is height we have already
  rejected once.

### Style, where you are free

Our current profile, so you know the starting point. **Design these
mockups in LIGHT MODE.** Our light theme is a very soft off-white page
(#F7F7FB) carrying white cards, each drawn by a hairline ring rather
than a shadow. One purple accent means exactly one thing, "you can
press this". A warm amber (#B45309 in light) marks AI insights only.
Green and red are reserved for money outcomes. Links are written as
ink with a chevron, never coloured.

The app also has a dark theme (a near-black navy, #04081B) and every
screen must eventually work in both, but this round is light only.

You are free to evolve all of it. Nothing visual is locked. If you can
beat the palette, beat it. The one discipline worth keeping in some
form: each accent colour keeps a single meaning. A colour that means
seven things means nothing; that lesson cost us weeks.

**The fonts are explicitly open.** Today words are Geist and numbers
are Inter Tight, and the owner does not love them. Propose better,
especially for the numerals: this app is wall to wall money figures and
records, the numbers are the voice of the product. Tabular figures are
a must. Show your proposed faces working at three sizes: a hero money
figure, a chip record, a table row.

Shape language: the Home / Lab / Totals switcher may be a pill.
Everything below it is squared (rounded rectangles), as in the earlier
mockups.

### The demo record, use it on every screen

Design with this one self-consistent record so the screens agree with
each other. Never lorem, never round numbers.

- Sports: Football 31-17, +$1,204.50. Basketball 9-14, -$440.00.
  Tennis 12-4, +$610.20. Baseball 7-9, -$120.30. Ice Hockey 5-3,
  +$88.00. Table Tennis 1-2, -$35.00.
- Football leagues: Premier League 12-5, +$402.10. Champions League
  6-4, +$155.00. La Liga 4-3, -$60.25. The rest behind More leagues.
- Categories: Moneyline 30-16, +$2,658.40. Totals (Over/Under) 9-8,
  +$95.50. Player Props 8-11, -$310.75. Correct Score 2-6, -$210.00.
- Football periods: Full Time 20-11, 1st Half 7-4, 2nd Half 4-2.
- How: Singles 41-19, +$1,750.90. Parlays 6-19, -$523.10.
- Risk: Low (1.01-1.80) 28-10, +$620.15. Medium (1.81-3.00) 15-17,
  -$95.30. High (3.01+) 4-11, +$182.60. Yes, High is profitable on a
  losing record; that is realism, big odds pay for many misses.
- The worked example used across prompts: Football + Moneyline is
  18-8, +$914.20, 26 bets.
- The all-time totals, for the result panel on Home: net profit
  +$1,227.80, record 65-58, 66 bets, staked $8,420.00, returned
  $9,647.80, ROI 14.6%.

### Format

- Phone screens only, 390 wide.
- **Light mode only.** Every screen on the soft off-white page, not on
  a dark one. The dark theme is a later round.
- Design the full-record state. Empty and loading states are a later
  round, do not spend screens on them.

---

## Block 1: Lab

Design LAB, the middle tab of Performance and the flagship screen of
Actuals.

The job: the user builds a question out of chips and the page answers
it instantly. Tap Football, then Moneyline, and the page becomes "my
Football Moneyline record". Every tap re-scopes the answer in place,
with no submit step and no results page. It should feel like an
instrument, not a form. This is the screen we will put in the App Store
listing; design it like that.

### Anatomy, top to bottom

1. The Performance header with the Home / Lab / Totals switcher, Lab
   active. The bottom tab bar with Performance active.
2. Six chip groups, each under a small group header. Order and content:

   **SPORT.** Chips for the user's sports with their records: Football
   31-17, Basketball 9-14, Tennis 12-4, Baseball 7-9, Ice Hockey 5-3,
   Table Tennis 1-2. The group header itself carries a small arrow: a
   quiet dropdown holding the other four domains (Politics, Economics,
   Culture, Other). Sports is the default. Picking another domain
   re-scopes the entire page to that domain's own topics and
   categories, and the header then reads that domain's name. This
   control must be discoverable but deliberately quieter than the
   chips: the owner's words, "clearly more hidden".

   **LEAGUE.** One row only, directly under Sport, scoped to the
   selected sport. For Football: Premier League 12-5, Champions League
   6-4, La Liga 4-3, then a "More leagues" affordance. Never a second
   row, never a wall of leagues. A sport and its league are two
   different facts (Baseball is not MLB), which is why this is its own
   row and not more sport chips.

   **WHAT YOU BET.** The categories: Moneyline 30-16, Totals
   (Over/Under) 9-8, Player Props 8-11, Correct Score 2-6, and the
   rest (Spread / Handicap, Match Props, Tournament Winner, Awards,
   Transfers & Moves). Tapping a category reveals its markets beneath
   it: Moneyline opens Match Winner and To Advance. Categories without
   markets simply do not open. Design the revealed state so a market
   reads as the child of its category, not as a seventh group. These
   words are due for a vocabulary rewrite later, so design the
   pattern, not the poetry of the labels.

   **WHEN.** Periods for the selected sport only. Football: Full Time
   20-11, 1st Half 7-4, 2nd Half 4-2. Sport-aware: Tennis would show
   sets, and a sport with no period data shows no WHEN group at all.

   **HOW.** Single 41-19, Parlay 6-19.

   **RISK.** Low (1.01-1.80) 28-10, Medium (1.81-3.00) 15-17, High
   (3.01+) 4-11.

3. The answer panel, the payoff of the page. For Football + Moneyline:
   the fact stated as a sentence ("Your Football Moneyline picks"), the
   record 18-8, the profit +$914.20, and a door: "See these 26 bets",
   which opens the All Bets page filtered to exactly those 26. Decide
   whether this panel sits pinned at the bottom, at the top under the
   switcher, or inline; make the case with the design.

### Chip behaviour, each state needs to be drawn or evident

- **Resting.** Label plus record: "Football 31-17". The record is
  quieter than the name but always legible.
- **Selected.** Unmistakably on. Purple is our current "pressable"
  accent; re-map it if your palette proposal changes, but selection
  must never rely on colour alone.
- **Re-priced.** THE signature behaviour. Every chip is priced at the
  intersection it would create. With Moneyline selected, the Football
  chip stops showing 31-17 (Football overall) and shows 18-8 (Football
  Moneyline). The whole grid becomes a live preview of its own
  answers. Numbers everywhere shift on every tap; the motion design
  can be subtle, but the mockup must show re-priced values, not the
  resting ones, in any selected-state screen.
- **Dimmed.** Chips that cannot pair with the current selection (a
  different domain) dim. The rule teaches itself at the moment you try
  to break it. No extra colour coding, no error messages.
- **Thin.** Table Tennis 1-2 renders exactly like Football 31-17, just
  with small numbers. Thin evidence is a finding ("you have barely
  tried this"), never hidden, never greyed for being thin.
- **A category opened**, its markets revealed beneath it.

### Rules that shape the layout

- Selections in different groups combine and narrow: Football + 
  Moneyline + 1st Half.
- Selections inside one group compare. Compare lives here inside Lab,
  and it has its own prompt (the next one); in this prompt, just make
  the two-selected state look intentional.
- With nothing selected, Lab is clean and calm: every group at resting
  prices, an invitation to build, not an empty state. The owner asked
  for this explicitly: "a view inside the lab that is clean from
  selections."
- Removing the last chip returns to that clean state, never bounces to
  Home.

### Draw four screens

1. Clean Lab, nothing selected.
2. Football + Moneyline selected: dimming, re-priced chips, the answer
   panel live with 18-8, +$914.20, "See these 26 bets".
3. The domain dropdown open over the page.
4. Moneyline opened, showing its markets.

---

## Block 2: Compare, inside Lab

Design COMPARE, the one part of Lab where we are asking you to invent.
Compare lives inside Lab; that is settled. How it looks and behaves is
genuinely open, and we will treat what you send as a proposal, so bring
a real idea, not a safe one.

The rule it must obey: **compare only exists within one group.** Two
sports can be compared. Two leagues can be compared. A sport and a
category can only combine (that is Lab's normal narrowing), never
compare. And nothing ever crosses domains.

What triggers it: the user selects two or more chips in the same group.
Football 31-17 and Tennis 12-4, say.

What it must answer, in order of importance:

1. Which one is better for me, visible in one glance.
2. By how much: profit (+$1,204.50 vs +$610.20) and record (31-17 vs
   12-4) side by side.
3. The honest context: 48 bets on one side, 16 on the other. A
   comparison that hides sample size lies.

Two threads of the owner's own thinking, both open:

- He floated a Compare button that appears when two things in one
  group are selected, then immediately doubted it: "this is not clear
  for me yet."
- His favourite mockup compares a whole family at once, scoped to the
  current selection: every sport in one view, every league of the
  selected sport in one view.

You may pick either, merge them, or beat them both. What we will judge:
does a user who has never seen the app understand, within two seconds,
what is being compared and which side is winning?

Also decide and show: how the user leaves a comparison (back to the
combined view, or to a clean Lab), and what a three-way comparison
looks like (Football vs Basketball vs Tennis), or make the case that
two is the maximum.

### Draw three screens

1. The moment two same-group chips are selected: whatever your
   mechanism is, mid-flow.
2. The comparison itself, Football vs Tennis, full glory.
3. Three leagues compared: Premier League 12-5, Champions League 6-4,
   La Liga 4-3.

---

## Block 3: Home

Design HOME, the first tab of Performance and the first thing a user
sees when they open the page.

The job: a performance review, not a statistics page. Within seconds
the user knows what they are good at and where the money leaks. It
opens with findings, never with graphs. The founding question of the
whole product is the one this screen answers on sight: "where am I
leaking, baseball, hockey or football?"

### The result panel, and it opens the page

**This is the most refined object in Actuals today and it must survive
the redesign.** It took many rounds to arrive at, and every part of it
is there because something else was tried and failed. Improve its
craft; do not remove its parts.

It is ONE panel, not five floating things. Top to bottom inside it:

1. **The headline result: net profit, all time.** +$1,227.80 for our
   demo record. This is the number the user opens the app for. It sits
   ON the panel, not floating above it, with the record beside it.
2. **The chart**: a running profit line across time. It should be
   scrubbable (dragging along it reads out that day's figure), so
   design it as an instrument, not a decoration.
3. **Six facts in a grid under the line**, on the same panel: Bets 66,
   Record 65-58, Hit rate 30-16, Staked $8,420.00, Returned $9,647.80,
   ROI 14.6%.

Hard-won lessons about this panel, all from real rejections:

- **A tall chart is dead space.** The owner: "so much white, ugly, not
  exciting, dead space". A rising profit line leaves a big empty
  triangle above it, so height makes it worse. The six facts sit under
  the line precisely because facts fill a screen and stretching does
  not.
- **The number belongs ON the panel**, with the chart. It was once a
  floating figure above a separate chart card and the gap between them
  read as a hole.
- **Never state the time period twice.** An "ALL TIME" label above the
  number while "All" sits selected in the chart below it is the same
  fact twice, and it was rejected.

Then the findings. The panel answers "how am I doing"; everything below
answers "why".

### What lives below it, order is yours to argue

**The ranked list, the core of the page.** Facts written as sentences,
each with its evidence:

- "Moneyline is making you +$2,658.40" with the tag EARNER · WHAT YOU
  BET and the record 30-16.
- "Basketball is costing you -$440.00" with LEAK · SPORT and 9-14.
- "Parlays are costing you -$523.10" with LEAK · HOW and 6-19.

The family tag matters: it tells the user which kind of fact this is,
because the list deliberately mixes kinds (a category next to a sport
next to a risk band). Rows must scan as a list yet each read as a
finding, not a table row.

**A row carries four things at most**: the sentence (with its money
figure inside it), the record, the family tag, and one indicator of
direction. The money figure appears ONCE. A row that prints
+$2,658.40 inside its sentence and again on its right edge is a bug,
not a layout.

**The sort control.** Profit, ROI, Hit rate. All three options visible
at once, no cycling control that hides its choices (one was built and
rejected as annoying). Profit is the default. Under Hit rate, rows lead
with records (30-16), never percents.

The three are peers and must be drawn as peers: same object, same
size, no dropdown chevron on any of them, and none of them carrying a
number the other two lack. The only difference between them is which
one is on.

**The map.** A mosaic where every tile is one slice of the record,
sized by how much was bet, coloured by profit or loss, labelled with
name and record. The one-glance answer to "where is my money actually
going". Big tiles are where the money went; green tiles are where it
came back.

Two warnings. **The sizing must be real**: Football at $3,100 staked
draws a genuinely larger tile than Table Tennis at $180. A uniform grid
wearing a "sized by amount bet" caption is worse than no map. And
**the colour must not shout**: six saturated red and green blocks turn
the page into a Christmas tree. Find the restrained version, where
profit and loss are unmistakable at a glance and the page still feels
calm.

**What Changed.** The movement over the last 30 days: "Tennis flipped
from leak to earner", with the before and after figures. Quiet, a strip
or a card, not a feed and not a timeline. Write the heading in real
English: "What changed" over "In the last 30 days", never "Since your
last 30 days".

**The door to Lab.** "Check out our Lab. Build your Performance View."
The owner wants this door kept and visible. It is ONE door: the card
does not then repeat itself with a "Go to Lab" link inside it. The
whole card is the button.

**The sparkle.** Our amber insight trigger, present here as everywhere
in the app. Amber marks insights only; it is never a button colour for
anything else.

**Exactly one way into insights on this screen.** Either the sparkle in
the header or an insights card lower down, not both. If you choose the
card, it must carry a real insight ("Tennis flipped from leak to
earner this month") and not an empty promise like "AI insights found,
tap to see what stands out". Actuals never teases; it states what is
true.

### Behaviour

- Tapping any ranked row or any map tile jumps to Lab with that fact
  selected. Home hands questions to Lab; it never grows its own
  filters.
- Home ranks by profit because it answers "where is the money". Lab
  chips carry records because Lab answers "am I good at this". Keep
  that split; do not put percents anywhere.

### What to avoid, learned the hard way

- **No page title.** The tab bar says Performance and the switcher says
  Home. A "Performance review" heading is height we already rejected
  once, and a subtitle promising "the truth at a glance" is worse if
  the glance is not delivered above the fold.
- **No dead space at the top.** The old page was rejected for exactly
  that, and the fix was facts, not stretching.
- **No number stated twice** in one row or one card.
- **No duplicated statements of the time period.**
- **Nothing on this page grows its own filters.** Questions go to Lab.

### Draw two screens

1. **Home as it opens**: the result panel (net profit, the chart, the
   six facts), then the sort control and the first findings.
2. **The scroll**: the rest of the findings, the map, What changed, and
   the door to Lab.

---

## Block 4: Totals

Design TOTALS, the third tab of Performance.

The job: the quick scan of every slice, then the full ledger. No
building, no ranking cleverness, no sentences. The honest tables a
spreadsheet person would make, elevated by world class typography and
rhythm. Home tells you what matters; Totals lets you check anything.

### The five sections, in order

1. **Sports breakdown.** Every sport, record and profit: Football
   31-17 +$1,204.50, Basketball 9-14 -$440.00, Tennis 12-4 +$610.20,
   Baseball 7-9 -$120.30, Ice Hockey 5-3 +$88.00, Table Tennis 1-2
   -$35.00. Down to the sport with one bet. Nothing hidden.
2. **Odds groups.** Low (1.01-1.80) 28-10 +$620.15, Medium (1.81-3.00)
   15-17 -$95.30, High (3.01+) 4-11 +$182.60.
3. **Singles vs Parlays.** Singles 41-19 +$1,750.90, Parlays 6-19
   -$523.10.
4. **Categories.** Moneyline 30-16 +$2,658.40, Totals (Over/Under) 9-8
   +$95.50, Player Props 8-11 -$310.75, Correct Score 2-6 -$210.00.
5. **All bets.** The ledger itself, at the bottom: the latest 50 bets,
   newest first. Each row: what was picked, the sport, the date, the
   stake, the To Collect, and how it ended (won, lost, pending, cashed
   out), with won and lost carried by our money colours. A parlay is
   one bet with its legs listed within the row. After the 50th bet, a
   button: "Show all bets", which opens the All Bets page (next
   prompt). Design the row once, beautifully; it repeats hundreds of
   times.

### The design challenge

Five list sections on one scrolling phone page that stay calm and
scannable instead of becoming a wall of rows. The numbers must line up
beautifully (tabular figures), the sections must breathe, and a loss
must read differently from a win at a glance without the page turning
into a Christmas tree. If section headers need to do work (counts,
mini-summaries), propose it.

### Draw two screens

1. The top: sports breakdown, odds groups, singles vs parlays.
2. The scroll: categories, then the ledger with the "Show all bets"
   button visible.

---

## Block 5: All Bets

Design ALL BETS, a full page and a new one: today the app has no single
place that lists every bet ever placed.

Two ways in, one page:

1. From Totals, the "Show all bets" button under the latest 50.
2. From Lab, "See these 26 bets" on the answer panel. Same page,
   arriving with a filter applied.

### The page

- A header that always states what is being shown. Unfiltered: "All
  bets · 66". Filtered from Lab: "26 bets · Football · Moneyline",
  with an obvious way to clear the filter and see everything.
- The list itself, newest first, grouped by month (August 2026, July
  2026) so scrolling has landmarks.
- Each row: the pick, the sport, the date, the stake, the To Collect,
  the outcome (won, lost, pending, cashed out). Parlays show their
  legs inside one row. Reuse the exact row you designed for the Totals
  ledger; the two must be the same row.
- Wins and losses carried by the money colours, quietly. A losing
  month should be visible while scrolling without the page shouting.
- A clear way back to where the user came from.

This page is the record of truth, the place a user goes when they doubt
a number elsewhere in the app. It should feel like a well-kept ledger:
dense, calm, trustworthy. No editing, no swipe actions in this round.

### Draw two screens

1. Unfiltered, mid-scroll, a month boundary visible.
2. Filtered from Lab: "26 bets · Football · Moneyline" with the clear
   affordance.

---

## Block 6: Insights

Design INSIGHTS, the page behind the sparkle. It exists today and it is
bleak: a heading, then a flat list of grey sentence rows. Your job is
to make it the most alive page in the app without breaking its honesty.

What insights are: statements Actuals surfaces on its own from the
user's settled bets, after the fact. The user never asks; Actuals
noticed. Examples in our voice, use these:

- "Tennis flipped from leak to earner this month."
- "You have won 7 of your last 10 Football picks."
- "Parlays have cost you $523.10 all time. Your singles record is
  41-19."
- "Your 1st Half picks (7-4) beat your Full Time picks (20-11)."

Rules of the page:

- **Amber is the insight colour** in our current system: the sparkle,
  the AI badge, the trophy. Insights are the ONE place amber may
  shine. If your palette proposal changes the accent, insights keep a
  dedicated accent that appears nowhere else.
- Every insight must carry its evidence (the record or the amount) in
  the statement itself. No vibes, no advice, no "consider betting
  less". Actuals states what is true and stops.
- Records not percents, money signed with two decimals, as everywhere.
- An insight should be tappable into Lab with the relevant fact
  selected; show that affordance.
- The page is reachable from the sparkle everywhere in the app, and
  arrives as a page inside Performance (bottom tab bar, way back).
- If you propose hierarchy (a lead insight above the rest, grouping by
  kind, freshness), make the ranking legible: why is this one first?

The feeling to hit: opening this page should feel like a sharp friend
looked at your record overnight and left you notes. Personal, precise,
a little delightful, never gimmicky.

### Draw two screens

1. The Insights page, five to seven insights, your hierarchy visible.
2. The arrival moment from the sparkle (sheet, page transition, or
   whatever you propose): how an insight presents when it is fresh.
