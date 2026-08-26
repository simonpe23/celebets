# Failed approaches

Things that were built and thrown away, and the lesson each one bought.
Read this before proposing something that feels obvious.

---

## A delete-everything button in Settings

**What happened:** The owner asked for a way to reset the tracking
balance so a user could start over. A delete-all button was built.

**Why it failed:** "i think data is still valuable despite wanting a
fresh reset of your tracking."

**What replaced it:** The restart LINE. Nothing is deleted; the stats
just count from a date.

**Second rejection, same feature:** the first version of the line had no
undo. "too much risk in the start fresh button. there must be an option
to regret the start fresh... i don't want people to accidentally loose
all their data." Undo now has no time limit.

**Third correction, same feature:** Undo was given a proper button in
the Your data card. Cut: "a restart is uncommon. to undo a restart is
even more unique. we can't have a big button that talks about such a
minor part of the app."

---

## Reskinning the old design system to match a mockup

**What happened:** Two attempts to build the Track page from the owner's
mockups poured the mockup into the existing components.

**Why it failed:** "a reskin is far from enough", "a fake cheap copy".

**The lesson:** A mockup is an anatomy, not a palette. Copy the skeleton
first (what is in the card, in what order, at what size), then the
colour. The old system's habits are the tell: uppercase labels
everywhere, full width action bars, three-column stat grids, five rows
of text where the mockup has two.

---

## Eyeballing colours instead of measuring them

**What happened:** The colour system was rewritten three times, and only
the third time from measurements.

**Why it failed:** Two guesses were wrong for weeks and neither was
visible in isolation. The dark page was built neutral grey-black when
the mockup was navy, and the purple was corrected past the mockup into
something darker than he had ever asked for.

**The lesson:** Sample the mockup with Pillow. Ten minutes ended six
rounds of argument. Keep the mockup files; if they are lost, ask for
them again rather than matching by eye.

---

## The breadcrumb navigation model for Performance

**What happened:** An early Performance design let you narrow from
domain to sport to league, one step at a time.

**Why it failed:** It turned a multidimensional analytical model into a
linear path. You get lost the moment you want BTTS across several
leagues, because the breadcrumb assumes you drilled down through a
league first.

**What replaced it:** Independent dimensions. Domain, topic,
competition and period are not a ladder.

---

## Ten views built from the "Portfolio" concept

**What happened:** Weeks of work produced Home, Fact page, a picker,
Compare, Heatmap, What Changed and an insight card modal, built to ten
mockup sheets.

**Why it was rewound:** The owner returned to the earlier Lab V1 idea as
the spine.

**Why it was NOT wasted:** it produced the heatmap, the ranked home,
What Changed, and the proof that Lab was right. The owner's own view:
"we got so many good things out of it even though we go back to lab v
one. That's why I challenge you."

---

## Three separate surfaces for picking a fact

**What happened:** The prototype ended up with an All Facts sheet, a Lab
grouped chip grid, and an "Explore this performance" card grid. All
three did the same job.

**Why it failed:** Three places listing the same rows is three places
for those lists to disagree, and a user who taps "All facts" then "Add a
fact" cannot tell why they landed somewhere different.

---

## De-duplicating facts with identical numbers

**What happened:** The ranking engine hid any fact whose record exactly
matched a higher-ranked one, so the list would not show two rows for the
same bets.

**Why it failed catastrophically:** In a real record that rule deletes
SPORTS. Every American Football bet is an NFL bet, so the two are
identical to the dollar, and a competition scores higher than a sport.
American Football, Baseball, Basketball and Ice Hockey all vanished from
search, from the compare picker and from the builder. Basketball at
-$440 was the biggest leak in the record and it was invisible.

**The deeper error:** the owner's founding question for the whole design
was "where am I leaking, baseball, hockey or football", and the tool had
quietly removed two of those three words.

**What replaced it:** the rule applies only where showing a twin would
lie about size (a ranked list, a treemap). The vocabulary never hides
anything. Guarded by `pftest.mjs`, because an absence is exactly what a
screenshot cannot show.

---

## The topic picker, three wrong builds in a row

1. **Flat strip of every non-sport.** Put Politics and Economics
   (domains) beside Crypto and Weather (topics under them) as if they
   were peers.
2. **The door chip displaying the selection.** Put a purple "Crypto"
   chip immediately after Table Tennis, wearing a coin emoji, looking
   exactly like a sport. "which is and always will be wrong."
3. **All three rows stacked at once.** Put a row of domains directly
   underneath a row of sports. "domains can never be under a row of
   sports."

**The lesson:** when the data model has levels, the UI must show one
level at a time. Every one of these bugs was the same mistake wearing a
different shape.

---

## "Impact" as a sort mode

**What happened:** The ranked list sorted by a computed meaningfulness
score: money times evidence times actionability times recency.

**Why it failed:** "remove impact (no idea what it means)". A number
nobody can explain does not belong in a product, and the user cannot
verify why row 1 beats row 2.

**The problem it was solving is still real:** sorting by hit rate puts
the thinnest evidence on top, because a 5-0 record shows 100%. The
honest fixes are a minimum-bets floor or ranking by net wins, not a
hidden score.

---

## Two duplicate statements of the same fact

**What happened, twice:** A card carried an "All time" chip directly
above a segmented control with "All" selected. The same fact, twice, on
one card. The first time it was one of four causes of "there's too much
dead space on the performance page at the top."

**The lesson:** one statement of the period per card. Make the label do
real work ("Last 30 days profit") instead of repeating a control.

---

## A test that found its target by copy

**What happened:** `scrubtest.mjs` located the chart panel by searching
for the word "PROFIT". That label was later deleted as redundant, so the
test silently pointed at a different card and reported the gesture dead
when it was fine.

**What replaced it:** `data-chart-panel`, a test hook that is not a
style. Never let a test find its target by copy.
