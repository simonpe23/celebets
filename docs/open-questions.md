# Open questions

Live as of 26 August 2026. Nothing here is decided. Nothing here may be
built without the owner saying so.

**Rule for this file:** record what he actually said, at the confidence
he actually said it. "Not a terrible idea" is not "settled".

---

## Blocking the Lab design

**1. RESOLVED 26 August 2026.** Lab's first group carries a domain
switcher. Domains never combine, and picking one rescopes the whole
page. See `docs/decisions.md`.

**2. RESOLVED 26 August 2026.** WHAT YOU BET shows categories. Tapping
one reveals its markets, where real markets exist. See
`docs/decisions.md`.

**3. RESOLVED 26 August 2026.** The owner supplied the period
vocabulary for all 14 sports rather than let the UI work around a thin
taxonomy. WHEN is sport-aware and data-driven. See `docs/decisions.md`.

**All three Lab-blocking questions are now closed.**

## Parked with his consent, its own session

**The category and market vocabulary rewrite.** Raised 26 August 2026
and deliberately set aside so it would not swallow the Lab design: "let's
focus on that another time."

**It is two problems, not one, and they must not be confused.**

1. **The words.** He cannot read them, and he is the founder: "None of
   these words is truly understandable for me. moneyline and match
   winner sounds the same to me?" Moneyline is American. Props is
   jargon. Roughly 60 category and market words came in from Kalshi and
   from American sportsbooks, never from a decision.
2. **The grouping.** Separate and possibly worse: "why does not correct
   score go under match props for example?" The tree itself may be wrong,
   not only its labels.

**Nothing may be renamed until both are answered together.** Renaming
words inside a broken tree just makes the wrong shape easier to read.

**This is a data migration, not a copy edit.** Existing rows carry the
old words, and every provider mapper points at them.

## Not blocking, still open

**The third Performance tab's name.** Totals, Lists, Breakdown, or
something else.

**Whether that third tab is real, or is Lab with nothing selected.**
Raised and not yet answered.

**Where Compare lives.** He floated a Compare button appearing when two
things are selected in Lab, then immediately doubted it: "this is not
clear for me yet." His mockup shows a different mechanism: comparing a
whole family at once, scoped to the selection.

**Where betting history sits.** He said Home, Lab and the third tab are
all plausible.

**The topic picker's door label.** He asked for a new name and did not
give one. "Something else" is a placeholder. "Category" is the obvious
word and is already taken by the taxonomy.

**"Other" under every domain.** Stated as a principle, not scheduled.
Four new words (Other Sport, Other Politics, Other Economics, Other
Culture) plus a migration, and it pushes the non-sports row toward
domain headings.

**Four tabs or three.** Deferred. It must land before the rebuild ships,
because the tab bar is on every screen.

**Pills or squared buttons in the rebuild.** His own mockups disagree
with each other: the insight card draws pills, the fact page and Compare
draw rounded rectangles.

**Dead ends still in the prototype.** "See the N bets", "View all
changes", "Ask Actuals" in two places, share and the three dots, the
gear on the prototype home. Several are pure removals.

## Found by the rule audit, 26 August 2026

These are places where two written rules disagree and no ruling settles
it. Nothing here may be built until he rules. Full context in
`docs/history.md`.

**1. The purple chart line: how far does it reach?** `PORTFOLIO-VIEWS.md`
records his wording, "Purple line for profit and red for losses", and
purple stands. What is not written anywhere: whether the LIVE Track and
Performance charts turn purple too, or only the Performance rebuild.
They draw green and red today.

**2. Which purple is the chart line?** The rebuild sheets were sampled
at `#430EDB` light and `#8538EA` dark. Neither is a brand purple, and
neither is in the palette. Until one is chosen and added to
`globals.css`, `design-check` fails any file that draws a purple line,
so the ruling cannot actually be built.

**3. Three tabs or four.** `CLAUDE.md` and `docs/decisions.md` say
"three tabs and only three". His own overview sheet draws four (Track,
Performance, Research, Profile) and this file already carries "four tabs
or three, deferred". One of those two has to give.

**4. How big is a card heading?** The app ships both `text-lg` (18px)
and 17px. `docs/design-system.md` stated both, in two different tables.

**5. How big is a page title?** Same shape: `text-2xl` (24px) in one
table, 22px in another. The app ships both.

**6. How big is the primary button?** `docs/design-system.md` said 52px
tall at 16px text. The shared button in `src/lib/ui.ts` is 44px at 13px,
and `design-check`'s own error message says buttons are "text-sm font-bold"
while that button is 13px semibold. Three sources, three answers.

**7. Should `design-check` check the preview pages?** It skips them, and
its comment says the folder "is local only and never ships". That has
been false since 24 August 2026: previews are committed and deployed.
The whole Performance rebuild is being designed in a folder no check
looks at.

## Not design questions, but unscoped

**Empty states.** Every view assumes a full record. Someone who signed
up an hour ago has no ranked facts, no chart, no insight, no heatmap.
None of these screens exist.

**Loading states.** The prototype computes instantly on demo data. The
real page waits on the database.

**How the swap to `/stats` happens.** Replace the old page in one go, or
run both behind a switch while the numbers are checked?

## Long-standing, recorded in IDEAS.md

- **Idea 29:** the three taxonomy gaps. Periods per sport is DONE,
  26 August 2026. Still open: the screenshot importer not classifying,
  and categories for Politics and Culture.
- **Idea 30:** motion level C, the shared-element flights. Parked with a
  written trigger.
- **Idea 31:** manual entry for the non-sports. The picker is BUILT and
  logs any of the five domains. The category vocabulary behind it is
  still empty for three domains, which is gap (c) of idea 29.
- **Per-sport ROI.** Still has no honest formula, because a parlay stake
  spans sports. Needs a rule from the owner before Performance can show
  it.
