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

**RESOLVED 31 August 2026: Totals' Per Category is one wide column,
top 3 and bottom 3, his choice.** Nothing truncates any more. See
`docs/decisions.md`. What follows is the record of why it had to
change.

**It used to truncate its names on a phone.** "Moneyline" reads
"Mo...", "Spread / Handicap" reads "Spread /...". Those names used to
fit because they were 7.2px, and 7.2px is not a size, it is a
photograph of one. At 11px, the app's smallest step, two columns on a
390px phone cannot hold a rank, an icon, a name, a record, a figure
and a chevron. There is no size that fixes it: the row needs a
different layout, which is his own tabled question above. Phase 3a
widened the column, which fixed it on a laptop and changed nothing on
a phone, because a phone was never wider than 390 to begin with.

**LIVE AND UNFIXED, 31 August 2026. These are on his live page now.**

**Three are FIXED**, on his say-so the same day.

- **Lab's hardcoded "Actuals noticed" sentence is gone.** Both pages
  call one function, `leakInsight`, so Home and Lab cannot disagree
  about what is losing money.
- **Nothing under Performance loads a page.** The Heat Map went first
  ("go for the heat map and the lab sentence"), then Compare and All
  Bets ("fix all of them, if there's anyone i've missed").
  `instanttest.mjs` counts the server page requests each door causes
  and fails if any appear.

1. **The empty state does not exist.** A brand new account gets a page
   with no ranked rows, a flat line and "- ROI". It does not crash,
   and the axis no longer invents "$0, -$1, -$2, -$3", but nobody has
   designed what it should say. The amber insight card at least no
   longer draws itself with a blank line under its heading when
   nothing is losing: it is left out. CLAUDE's call, not a ruling of
   his.
2. **The pages have no dark mode at all**, by his ruling, until the
   app-wide redesign.
3. **All six pages scroll sideways on a 320px phone**, 22 to 52px,
   from the menu's absolute pixel positions. `sitecheck.mjs` guards
   393px and 1512px; extend it to 320 once fixed. Reported by the Lab
   chat at handover, not yet verified here.
4. **The "This month" label on Home is gone**, so that inconsistency
   is closed, but the period is still not written into the address
   when it changes on Home. A shared link does not carry the window.
5. **Lab's sentence ignores what you selected.** It names the whole
   record's biggest leak, the same sentence Home shows, because that
   is the honest fix and it needed no product decision. Whether Lab's
   sentence should speak about the current selection instead has not
   been asked. CLAUDE's call, his to overturn.
6. **Wagered and Returned are no longer on Home.** They were two of
   its four KPIs until 31 August 2026, when he replaced the row with
   Lab's four. Totals still shows both. Nobody has said Home should
   carry them anywhere else.



**Lab round 2: CLAUDE's judgment calls, 29 August 2026.** Round 1 was
rejected the same day ("the ugliest page ive never seen", full quote
in `docs/decisions.md`); the icon and header calls below were revised
to the mockup's look under his correction. The rest were gaps,
decided to keep building and clearly his to overturn. None is a
ruling of his.

0. **Sport and league chips wear the platform's emoji** as their
   colour identity icons, because the mockup's own icons are the
   emoji set. On his iPhone they render as Apple's glossy set. If he
   wants custom-drawn colour icons instead, that is real design work
   to schedule.

1. **Risk bands wear the code's boundaries**, Low to 1.80, Medium to
   3.00, High above, from `ODDS_BUCKETS` in `src/lib/stats.ts`. His
   mockup drew 1.00-1.70 / 1.71-2.50 / 2.51+. Money rules live in
   stats.ts, so the code won.
2. **The answer panel says All time**, a quiet label, not a time
   control. His mockup copied Home's This month selector. Chips read
   all time records, so the panel says what the numbers are.
3. **A chip is priced as its own fact inside the rest of the
   selection.** With Football and Moneyline on, Basketball reads
   Basketball-Moneyline (3-3), not the widened union a tap would
   create. Siblings stay comparable; tapping still combines.
4. **Tapping a market swaps out its parent category** instead of
   counting as a second selection, so a drill stays one thing and
   Compare does not fire on parent vs child.
5. **The door count matches the KPI**: See these N bets uses picks,
   the same number the Bets KPI shows. Whether the future All bets
   page counts bet slips or picks is undecided.
6. **Risk chips wear a gauge icon** with the needle low, centre or
   high, slate outline like the mockup's. Home's list gives Low odds
   a trend arrow tile. One fact, two icons across pages, flagged.
7. **No top right logo** on Lab. His mockup shows one; the accepted
   Home ruled "the top of Home is the menu, nothing above it" and
   Lab wears Home's design.
8. **The chip type sits at Home's scale, not the sheet's.** The quick
   Lab sheet measures smaller than the accepted Home even in its
   hero number, so its absolute sizes were treated as unreliable and
   its proportions kept instead.
9. **The empty state shows the whole record** across all domains,
   because net profit has one definition. Domain modes scope which
   chips are OFFERED; Bet Type and Risk chips price all domain facts,
   since singles and odds bands mean the same thing everywhere.

**Whether the Home insight card should sit tighter.** 29 August 2026,
reacting to a tall-screen screenshot before checking his phone: "it
needs to be tighter, yet stand alone." After checking the live site he
closed the round with "this version will do, good job." So the shipped
spacing stands and nothing is to be built, but the tighter wish is his
own words and he may reopen it. Full sequence in `docs/decisions.md`.

**New fonts.** He reopened the fonts on 26 August 2026: "i do not like
our font." The mockup designer will propose; nothing is chosen and the
app keeps Geist and Inter Tight until he approves. The Home preview
wears Figtree since 28 August 2026 under his "pick a similar one"
ruling; that is a preview choice, not an app-wide font decision.

**RESOLVED 28 August 2026: how the user says "combine" rather than
"compare".** He was asked and confirmed his written summary as the
ruling: selecting chips combines, and "a Compare button appears that
flips the same two selections from 'added together' to 'side by side'".
"Compare appears whenever exactly two things are selected, whatever
they are, and disappears at three." Two is the maximum. See
`docs/decisions.md`. The exact look of the comparison view is still the
designer's to propose.

**What the purple chart line does below zero.** His ruling on the chart
was recorded as "Purple line for profit and red for losses." Today's
live chart flips from green to red where the line crosses zero. Whether
the purple line turns red below zero, or red stays only on money
figures, has not been asked. Needed at the latest when Home's chart is
built.

**The topic picker's door label.** He asked for a new name and did not
give one. "Something else" is a placeholder. "Category" is the obvious
word and is already taken by the taxonomy.

**"Other" under every domain.** Stated as a principle, not scheduled.
Four new words (Other Sport, Other Politics, Other Economics, Other
Culture) plus a migration, and it pushes the non-sports row toward
domain headings.

**Dead ends still in the prototype.** "See the N bets", "View all
changes", "Ask Actuals" in two places, share and the three dots, the
gear on the prototype home. Several are pure removals.

## The rule audit, 26 August 2026: ALL SEVEN CLOSED

The audit found seven places where two written rules disagreed. He ruled
on every one the same day. Kept here only so nobody reopens them.

1. **Which purple is the chart line.** `#7C3AED` light, `#9A57FC` dark,
   which is the app's existing `--brand-mark`. No new colour.
2. **How far the purple line reaches.** Every chart in the app, not only
   the rebuild. NOT BUILT YET: the live charts still draw green and red.
3. **Three tabs or four.** FOUR: Track, Performance, Research, Profile.
4. **Card heading size.** 17px, by counting the code.
5. **Page title size.** 22px, by counting the code.
6. **Primary button size.** The shared `BTN`: `rounded-md`, 13px
   semibold, 44px tall.
7. **Should the checker inspect the previews.** Yes, and it now does.
   Nothing under `/preview` is skipped. The COLOUR rules are exempt
   there and only those, because the previews are where the new design
   is being explored. See the open question directly below, and
   `docs/decisions.md` for his reasoning.

4, 5 and 6 were delegated ("pick what the code already ships and make
the docs match"), so they are CLAUDE's picks, not his own rulings. The
reasoning is in `docs/decisions.md`.

## The new palette

**Not chosen. This one has a deadline built into the code.**

The preview pages are currently exempt from the three colour rules in
`design-check`, because they carry the mockup designer's colours rather
than the app's. That exemption is temporary by ruling, 26 August 2026.

**What has to happen to close it:**

1. The owner approves the new palette, from the mockups.
2. Those values become the app's palette: `ALLOWED_HEX` in
   `design-check.mjs` is rewritten from them, and the brand values in
   `globals.css` follow.
3. The `paletteExempt` function in `design-check.mjs` is deleted, and
   the previews go back under all three colour rules.

**Until then the previews and the app are two different palettes**, and
only one of them is checked. That is the accepted cost of exploring a
new design, not a state anybody should get used to.

**What is not decided:** which mockup sheet is the palette, whether the
app's purple changes with it, and when. Nothing here may be built.

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

## Should Performance honour a record restart?

Found 2 September 2026 while fixing false copy in Settings.

**Track honours it.** `src/app/app/page.tsx` uses `sinceLine` so net
profit counts only the bets since the restart.

**The live Performance never reads it at all.** Grep `tracking_since`
across `src/app/stats`, `src/components/performance` and
`src/lib/performance-engine.ts`: nothing. So after a restart, Track
shows a fresh number and Performance shows the whole record, and
neither page says which it is doing.

The old page at `/stats-old` does have an All time switch, and the
Settings copy used to promise that switch on Performance. The copy has
been corrected to describe what actually happens. The behaviour is
still his call, because either answer changes numbers he reads.

