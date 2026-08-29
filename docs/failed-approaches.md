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

## Briefing the mockup designer with requirements and no reference

**What happened:** The Home brief specified the architecture in great
detail (every section, every state, every rule), described the palette
in words, and told the designer "nothing visual is locked, if you can
beat the palette, beat it." No previous mockup was attached.

**Why it failed:** He satisfied every requirement and produced a
generic fintech dashboard. Eight findings each in its own outlined box,
a six-cell bordered table for the facts, red and green tag pills on
every row, a loud tiled map. His own verdict: "I optimized for fitting
the brief rather than preserving the Actuals visual language... it does
not feel premium."

**The two causes, and only one was his:**

1. **No visual anchor.** The reference images existed in
   `public/mockups/performance/` the whole time and were never
   attached. Words cannot carry craft.
2. **The brief removed his anchor deliberately.** "Beat the palette"
   was an escalation of the owner's actual words, which were that the
   designer "knows our style, he is free to work with what he already
   knows."

**The lesson:** separate the two passes. Architecture is a specification
and can be exhaustive. Visual direction is a reference and must be
shown, not described. A visual brief that grows past a page is
compensating for a missing image.

**What was NOT wasted:** every product rule in the brief was obeyed.
The anatomy came back correct on the first try, and so did all six
defects fixed from the round before. The skeleton was right; only the
skin was wrong. That is the cheap half to redo.

---

## A test that found its target by copy

**What happened:** `scrubtest.mjs` located the chart panel by searching
for the word "PROFIT". That label was later deleted as redundant, so the
test silently pointed at a different card and reported the gesture dead
when it was fine.

**What replaced it:** `data-chart-panel`, a test hook that is not a
style. Never let a test find its target by copy.

---

## Pouring the new sheets into the old build's density

**What happened:** 28 August 2026 the owner shared four area sheets for
the new Home and asked for an identical copy. The areas were rebuilt
inside the existing preview's scale: its 12px margins, its 25px
switcher, its 10px metas, its cramped rhythm. The new parts were all
there, wearing the old page's density.

**Why it failed:** his words: "the ugliest preview I've seen in my
entire life... It looks just like the old one, but it's an uglier
version... nothing like the screenshots that I have provided."

**The lesson, two halves:**

1. **A new sheet brings its own scale and its own air.** Measure the
   new sheet. Never inherit the previous build's density, even on the
   same page in the same week. The sheets were generous and airy; the
   build squeezed them into the old compactness, which is the same
   disease as the reskin failure above, one level up.
2. **The parts no sheet covers cannot be silently carried over.** The
   title and the switcher came from the old design because no new
   sheet showed them, and they made the whole page read as "the old
   one". When an area has no sheet, ask what it should be. Do not fill
   the gap with the past.

---

## Measuring a mockup by eye, and trusting merged ink boxes

**What happened:** 28 August 2026, round 2 of the Home rebuild was
built from sizes read off the mockup by looking at crops and from
bounding boxes of whole regions. The owner: "still looks hideous and
not close to a pixel by pixel copy... font sizes are off. colors are
off." Round 3 found why: nearly every size read that way was wrong,
some by 40 percent. A region's ink box merges neighbours (a value
merges with its label, a chart line with the number above it, a
sparkline tail with the money next to it), and the eye misjudges scale
across two images even side by side.

**What replaced it, the loop that worked:**

1. **Per glyph bands, not region boxes.** Measure one text's row
   profile in a window that contains only it, at high zoom, with a
   grid. A merged box lies without looking wrong.
2. **The same probes on both sides.** A script measures ink boxes on
   the mockup, the same script measures a screenshot of the render at
   the mockup's scale, and the diff is a table of pixels. Adjust,
   re-shoot, repeat until every row is within about 2px. Threshold and
   antialias bias cancel because both sides are measured identically.
3. **Choose the substitute font by measurement.** Candidate faces were
   scored by rendering the mockup's own strings and comparing ink
   width at matched ink height. Figtree won; the previous choice had
   been picked by reputation and was off by 8 to 15 percent on width.
4. **Trace curves from pixels.** The hero chart and the sparklines are
   per column scans of the mockup, embedded as point arrays, not
   redrawn approximations.

**The lesson:** "Sample the mockup, do not eyeball it" extends to
geometry. Every number in a pixel copy must come from a measurement
that isolates the thing it claims to measure, and the render must be
measured back with the same instrument.
