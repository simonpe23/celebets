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

**2. WHAT YOU BET is two taxonomy levels in one group.**
Category (Moneyline, Player Props) and Market (Match Winner, To Advance)
are separate dimensions. The mockup merges them into one row. That may
well be right for humans, but nobody has decided it, and splitting it
later means redrawing Lab.

**3. WHEN is empty for anyone not betting football.**
Periods exist for Football only, so a baseball bettor opens WHEN and
finds one chip, "Full time". Either the vocabulary gets filled per sport
or Lab hides any group with fewer than two chips.

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

**Default sort on the ranked list.** He chose Hit rate, then saw that it
puts the thinnest evidence on top and asked for options. Four were
offered: net wins, plain profit, a minimum-bets floor, or profit on Home
with hit rate as a plain number on Lab chips. Tabled, not resolved.

**Four tabs or three.** Deferred. It must land before the rebuild ships,
because the tab bar is on every screen.

**Pills or squared buttons in the rebuild.** His own mockups disagree
with each other: the insight card draws pills, the fact page and Compare
draw rounded rectangles.

**Dead ends still in the prototype.** "See the N bets", "View all
changes", "Ask Actuals" in two places, share and the three dots, the
gear on the prototype home. Several are pure removals.

## Not design questions, but unscoped

**Empty states.** Every view assumes a full record. Someone who signed
up an hour ago has no ranked facts, no chart, no insight, no heatmap.
None of these screens exist.

**Loading states.** The prototype computes instantly on demo data. The
real page waits on the database.

**How the swap to `/stats` happens.** Replace the old page in one go, or
run both behind a switch while the numbers are checked?

## Long-standing, recorded in IDEAS.md

- **Idea 29:** the three taxonomy gaps. Periods per sport first, then
  the screenshot importer not classifying, then categories for Politics
  and Culture.
- **Idea 30:** motion level C, the shared-element flights. Parked with a
  written trigger.
- **Idea 31:** manual entry for the non-sports. Partly built now; the
  category vocabulary behind it is still empty for three domains.
- **Per-sport ROI.** Still has no honest formula, because a parlay stake
  spans sports. Needs a rule from the owner before Performance can show
  it.
