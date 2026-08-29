---
name: mockup-build
description: Building a screen from one of the owner's mockup images. Use whenever he supplies a design to match. Covers sampling colours with Pillow, copying anatomy before palette, and the habits that got two builds rejected.
---

# Building from a mockup

**The mockups are the spec, to the pixel.** Two attempts were rejected
outright ("a reskin is far from enough", "a fake cheap copy") because
the mockup had been poured into the existing design system instead of
replacing it.

## 1. Copy the anatomy, not the palette

**A mockup is an anatomy, not a palette.** Copy the skeleton first:
what is in the card, in what order, at what size. Then the colour.

**The old system's habits are the tell** that you reskinned instead of
rebuilt:

- Uppercase labels everywhere. The mockup uses sentence case, and
  uppercase survives only where the mockup itself shouts.
- Full width action bars.
- Three-column stat grids.
- Five rows of text where the mockup has two.

## 2. Sample the colours, never eyeball them

**This is the rule that ended three rounds of argument.** Use Pillow to
read the actual pixels:

```python
from PIL import Image
im = Image.open("public/mockups/....png").convert("RGB")
print(im.getpixel((x, y)))
```

Two guesses had been wrong for weeks and neither was visible in
isolation:

- The dark page is NAVY `#04081B`, not the neutral grey-black that was
  built. The note said "a cool near-black, barely blue"; the blue
  channel actually runs about four times the red. That single error is
  why the build looked flat beside the mockup while each piece looked
  right.
- The purple was DARKER than the mockup, not brighter. The correction
  had overshot past his own design.

Sampling took ten minutes and settled six rounds.

**Keep the mockup files.** If they are lost, ask for them again rather
than matching by eye.

## 3. Measure the geometry too

The build ran about a fifth larger than the mockups for weeks, which is
why the mockup fits Pending Bets on the first screen and the build did
not. Measure card heights, radii and gaps rather than guessing.

## 4. Improve his design, never replace it

Nine drafts of the Track page taught this twice. When you think
something in the mockup is wrong, **say so and show a comparison.** Do
not quietly fix it.

## 5. Diverge only on purpose, and write it down

Where the build deliberately differs from the sheet, say which and why
in the message, and record it. `ROADMAP.md` and `PORTFOLIO-VIEWS.md`
both carry divergence lists.

## 6. Then run the ui-change pre-flight

Use the `ui-change` skill before any screenshot reaches him.

## A trap specific to mockups

**The mockups can disagree with each other, and with his current
words.** When they do, **his current words win.** Say plainly which
source you followed, and flag the conflict rather than silently
resolving it. He confirmed this directly: "what i have said is more true
than the mockup."

## A second trap: inheriting density

Bought 28 August 2026, the same day the scale rules above were followed
for one sheet and then silently reused for the next.

- **Each new sheet brings its own scale and its own air.** Measure the
  new sheet's geometry from zero. Never carry the previous build's
  margins, control heights or type sizes into a new sheet's build, even
  for the same page.
- **When an area has no sheet, ask.** Filling the gap with the old
  design made the whole page read as the old page. The owner: "It looks
  just like the old one, but it's an uglier version."

## A third trap: measuring by eye, or by merged boxes

Bought 28 August 2026, round 2 rejected as "a fake cheap copy" because
nearly every font size had been read off crops by eye or from region
bounding boxes that silently merged neighbours.

- **Isolate before measuring.** A text's size comes from a row profile
  band in a window that contains only that text, checked at high zoom
  with a grid overlay. A value merges with its label, a chart with the
  number beside it; the merged box always lies.
- **Close the loop.** Probe ink boxes on the mockup with a script, then
  probe a screenshot of the render at the mockup's scale with the same
  script, and diff. Adjust until every row agrees to about 2px.
  Measurement bias cancels because both sides use one instrument. The
  round 3 scripts live in the session scratchpad pattern: probe the
  sheet, shoot at deviceScaleFactor sheet-width/390, compare.
- **Pick substitute fonts by measurement**, rendering the sheet's own
  strings and scoring ink width at matched ink height, never by
  reputation.
- **Trace curves per column** from the sheet's pixels into point
  arrays. Redrawn approximations read as fake.
