# The Performance page

Where we landed, after 24 hours of rethinking it.

This is not a list of instructions. It is the thinking behind the
redesign, written down so that anyone working on it understands what we
are trying to build and why, and can make good decisions in the places
we have not thought of yet.

---

## The reset

We spent weeks building a concept called Portfolio: ten views, a home
page with a score out of 100, a fact page, a picker, a compare screen, a
map, a What Changed feed. It was good work and we have gone back on it.

The reason is simple. Before Portfolio there was an idea called Lab V1,
and Lab V1 was right. It is the only version of this page where the user
asks their own question instead of reading ours.

The detour was not wasted. It produced the map, the ranked home page and
What Changed, all three of which survive. It also proved which spine we
wanted, which is the kind of thing you only learn by building the other
one.

So: back to Lab as the heart of Performance, with the best of Portfolio
arranged around it.

---

## What Performance is for

Actuals has four tabs along the bottom.

**Track** is where you capture data. You type in the bet you placed, the
stake, and the exact amount you stand to collect. You never type odds;
we derive them.

**Research** is where you understand the game before your next bet. It
happens before, and it is active: you go looking.

**Performance** is where you understand yourself. It happens after, and
much of it is passive: we noticed something and we are telling you.

**Profile** sits in the bottom right corner. It is new, decided after
the rest of this brief was written, and its contents are not designed
yet. What matters for the screens described here is only that the tab
bar now carries four items rather than three, and that Performance is
no longer the middle one.

The first three are a timeline: before a bet, the bet itself, after the
bet. Profile stands outside that, which is why it sits at the end.

Performance is a **performance review, not a statistics page**. That
distinction has done more work than any other in this project. A
statistics page shows you every number it has. A review tells you how
you are doing, then explains why. The difference is that a review has an
opinion about what matters.

The founding question of the whole product, in the owner's words, is
"where am I leaking, baseball, hockey or football?" Every screen inside
Performance is judged on how fast it answers that.

---

## The three tabs inside it

Performance itself opens onto a switcher with three tabs: **Home, Lab,
Totals.** These sit at the top of the page and are separate from the
four tabs along the bottom of the app.

The cleanest way to hold them in your head:

> **Home tells you what matters. Lab lets you investigate it. Totals
> lets you verify it.**

Home has an opinion. Lab has no opinion and answers whatever you ask.
Totals has no opinion and no questions; it just shows you everything,
honestly, so you can check any number you doubt.

They are three different relationships with the same data, and the user
moves between them constantly. Home hands questions to Lab. Lab hands
lists of bets to the ledger at the bottom of Totals. Nothing is a dead
end.

**One thing sits on all three, and on every other screen in the app: the
sparkle.** It is a small amber control in the top right, and it opens
Insights. Insights are reachable from everywhere, so the sparkle is
drawn everywhere. It is the only amber thing in Actuals.

---

## Lab, the heart of it

Lab is the screen we will put in the App Store listing. It is where
Actuals stops being a spreadsheet and becomes an instrument.

The idea: the user builds a question out of chips, and the page answers
it instantly. Tap Football, then Moneyline, and the page becomes "my
Football Moneyline record". There is no submit button and no results
page. Every tap re-scopes the answer where it stands.

### The six groups

The chips are grouped, each under a small header:

- **Sport** (Football, Basketball, Tennis)
- **League** (Premier League, Champions League)
- **What you bet** (Moneyline, Player Props, Correct Score)
- **When** (Full Time, 1st Half, 2nd Half)
- **How** (Single, Parlay)
- **Risk** (Low, Medium and High odds bands)

These are independent dimensions, not a ladder. You can ask about 1st
Half picks across every league without first walking down through a
league, which is exactly what an earlier breadcrumb design got wrong.

Two of the groups have a second level inside them. **What you bet lists
categories, and tapping one opens the markets underneath it**: Moneyline
opens Match Winner and To Advance. Categories with no markets simply do
not open. **League shows only three or four** for the current sport,
one row and never two, with a way to reach the rest.

### The signature behaviour

**Every chip is priced at the intersection it would create.** With
Moneyline already selected, the Football chip stops showing Football
overall and starts showing Football-Moneyline. The whole grid becomes a
live preview of its own answers, so you can see what a question is worth
before you ask it.

This is the single thing that makes Lab feel like an instrument rather
than a filter panel, and it is worth protecting at the cost of almost
anything else on the screen.

### Combining and comparing

Chips in **different** groups combine and narrow: Football plus
Moneyline plus 1st Half.

Chips in the **same** group compare: Football against Tennis, Premier
League against La Liga.

That rule is not arbitrary. Two sports are alternatives to each other; a
sport and a category are not.

**Compare lives inside Lab, and it needs a visible control.** When two
chips in the same group are selected, a Compare button appears and
opens the comparison. It must be drawn.

What the comparison has to answer, in this order: which one is better
for me, by how much in both profit and record, and how many bets sit
behind each side. A comparison that hides its sample sizes lies.

The exact form of that screen is the one place where we want the
designer's own proposal rather than our instruction. Draw it. We will
treat it as a proposal, and that is the only part of Lab where that is
true.

### Domains never combine

Underneath everything sits a taxonomy of five domains: Sports, Politics,
Economics, Culture and Other. Each has its own topics, its own
categories and its own markets.

**Things from different domains can never be combined.** Football plus
Moneyline is fine, both live in Sports. Football plus Price Direction is
structurally impossible: no single bet can be both, so the answer would
always be zero.

The Sport header carries a small arrow that drops down the other four
domains. Sports is the default and keeps its single tap; the other
domains are deliberately quieter, because almost nobody will want them
and they should not compete with the sports chips. Picking one re-scopes
the whole page, so the categories change with it. How and Risk do not
change, because a parlay is a parlay in every domain.

Where a combination is impossible, the chips simply dim. The rule
teaches itself at the moment you try to break it, with no error message
and no colour coding.

### Records, not percentages

Chips carry a record: **12-4**, never 75%.

The reason is the owner's and it is a good one: "30-16 is a better and
more impressive hit rate than 5-0 in betting." A percentage flatters
thin evidence, and a betting app of all things should not make five
lucky picks look like mastery. A record carries its own sample size, so
the user needs no statistics to know which fact to trust.

This is also why **thin groups stay visible**. A chip reading 1-2 is a
finding: you have barely tried this. Hiding it would be hiding a fact.

### The clean state

With nothing selected, Lab is calm and complete: every group at its
resting price, an invitation to build. Removing the last chip returns
there rather than bouncing the user back to Home.

---

## Home

Home is where you land, and it has two beats.

**First the result.** Your net profit, all time, with the line that drew
it and a handful of supporting figures: bets, record, hit rate, staked,
returned, ROI. This lives as one confident object, not five floating
pieces, and it answers "how am I doing" before the user has scrolled.

**Then the findings.** A ranked list of what is actually driving that
number, written as sentences rather than table rows:

> Moneyline is making you +$2,658.40
> Basketball is costing you -$440.00
> Parlays are costing you -$523.10

Each carries its record and a small tag naming what kind of fact it is,
because the list deliberately mixes kinds: a category next to a sport
next to a risk band. The tag is what stops that from being confusing.

The list can be sorted by profit, ROI or hit rate, with all three
visible at once. We tried a control that cycled through them and it was
rejected for hiding its own options. We also tried ranking by a computed
"impact" score and removed it, because nobody could explain the number,
including us. A number a user cannot verify does not belong in a
product.

**Home ranks by profit. Lab scores by hit rate.** Home is answering
"where is the money", which is a dollar question. Lab is answering "am I
good at this", where money misleads, because a chip's stake size is not
its skill.

Below that sits **the heatmap**, and it is not a decoration. When the
owner re-listed what survives from the old work, this was the first
thing he named: "of course, the heat map. I forgot about it. The heat
map stays."

It is a mosaic. Each tile is one slice of the record, **sized by how
much was bet** and **coloured by whether that money came back**. Big
tiles are where the money went; the colour says whether that was a good
idea. It is the one-glance version of the founding question, and it
answers it faster than the ranked list does, because size and colour
land before words do.

Two things it must actually do. **The sizing has to be real**: a sport
with $3,100 staked draws a visibly bigger tile than one with $180. A
uniform grid wearing a "sized by amount bet" caption is worse than no
heatmap at all. And **the colour has to stay calm**: six saturated red
and green blocks turn the quietest page in the app into a Christmas
tree. It has been drawn with the label "Money map", which is a good
name for it.

Then **What changed**, a quiet strip of movement over the last 30 days:
"Tennis flipped from leak to earner", with the before and after figures.

Then a door into **Lab**, kept deliberately: "Check out our Lab. Build
your Performance View."

Tapping any finding, or any tile on the heatmap, opens Lab with that
fact already selected. Home never grows filters of its own. It hands
questions to Lab.

**Two things were cut from Home and should not come back.** A modal
insight card that appeared over the page, and All Facts as a page of
its own. Both duplicated work that Lab and Insights already do.

---

## Totals

Totals is the honest scan. No opinion, no building, no cleverness.

Four sections of plain numbers: every sport, the three odds bands,
singles against parlays, and every category. Nothing is hidden, down to
the sport with a single bet.

Then, at the bottom, **the ledger**: the latest 50 bets, newest first,
each with what was picked, the stake, the amount to collect and how it
ended. Below the fiftieth, a button opens the full **All bets** page.

The design problem here is not what to include. It is keeping five list
sections on one phone page from becoming a wall of rows.

---

## All bets, and Insights

**All bets** is one page reached through several doors. From Totals it
opens unfiltered. From Lab, "See these 26 bets" opens the same page
already filtered to exactly those 26. It is the record of truth: the
place a user goes when they doubt a number somewhere else in the app.

**Insights** is the page behind the sparkle, reachable from anywhere.
Insights are statements Actuals surfaced on its own, after the fact,
from the user's own data. They always carry their evidence in the
sentence itself:

> Your 1st Half picks (7-4) beat your Full Time picks (20-11).

Actuals states what is true and stops. It does not give advice, and it
never teases with something like "AI insights found, tap to see". Today
this page is a flat list of grey sentences and it deserves better.

---

## Smaller decisions worth knowing

**Baseball and MLB are two different things.** A sport is not its
biggest league, even when every bet on that sport happens to sit in one.
That is why League is its own row rather than more sport chips, and why
that row shows only three or four leagues plus a way to reach the rest.

**Periods now exist for every sport.** They used to exist for football
only, and the temptation was to hide the When group because of it. We
wrote the vocabulary for all fourteen sports instead. We did not want to
make a design decision around a gap in the data.

**The category words are wrong and we know it.** Moneyline, Props,
Correct Score: these came from American sportsbooks and from Kalshi, not
from a decision. The founder cannot read them, which is a bad sign for
everyone else. Rewriting them is real work, both the words and the way
they are grouped, and it is deliberately parked so it does not swallow
this design.

**Money is USD to two decimals and always signed in a result.** Odds are
decimal to two decimals. We never say wallet, deposit, withdrawal or
bankroll anywhere a person can read.

---

## How it should feel

Actuals is not a casino and it is not a fintech dashboard. It is honest
about money in a category built on not being honest about money.

That has a look, and we already found it. Numbers carry the page rather
than boxes: a large figure with a small quiet label beneath it. Lists
share one card and are divided by hairlines rather than chopped into
competing boxes. White space is the material.

**Purple means exactly two things: something you can press, and the
profit line on the chart.** The chart line is purple, with a soft purple
gradient fading beneath it, the way it has always been drawn in our
mockups. Nothing else is purple: no links, no badges, no decoration, no
filled panels.

**Green and red mean money moved, and nothing else.** They belong to
figures and to the heatmap's tiles. Never to a tag background, never to
a button, and never to the chart line.

The type should have editorial presence rather than the look of a
generic dashboard. **The typefaces are the one thing genuinely open**:
today words are Geist and numbers are Inter Tight, and we do not love
them. The numerals matter most, because this app is wall to wall money
figures and records. Tabular figures are a requirement.

**One shape note.** The Home / Lab / Totals switcher at the top may be a
pill. Everything below it is squared: rounded rectangles, not pills.

The principle we keep coming back to: **make fewer things feel more
important.** Every screen described here can be built as a dense
dashboard that satisfies every requirement and is worth nothing. The
work is in deciding what gets to be big.
