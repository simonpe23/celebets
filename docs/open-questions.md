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

**New fonts.** He reopened the fonts on 26 August 2026: "i do not like
our font." The mockup designer will propose; nothing is chosen and the
build keeps Geist and Inter Tight until he approves.

**How Compare is presented.** WHERE it lives is settled (inside Lab, 26
August 2026). The mechanism is not: he floated a Compare button, then
doubted it ("this is not clear for me yet"), and his mockup shows a
whole family compared at once. The mockup designer is asked to propose;
whatever comes back is a proposal, not a decision.

**The topic picker's door label.** He asked for a new name and did not
give one. "Something else" is a placeholder. "Category" is the obvious
word and is already taken by the taxonomy.

**"Other" under every domain.** Stated as a principle, not scheduled.
Four new words (Other Sport, Other Politics, Other Economics, Other
Culture) plus a migration, and it pushes the non-sports row toward
domain headings.

**Four tabs or three.** Deferred. It must land before the rebuild ships,
because the tab bar is on every screen.

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
