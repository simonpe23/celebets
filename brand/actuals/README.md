# The Actuals brand files

Every file here is real vector art or rendered from it, so it is sharp
at any size. Nothing needs a font installed: the letters are converted
to outlines.

## Which file to use where

THE RULE THAT SOLVES THE TAGLINE PROBLEM: the tagline exists only in
the `logo-full-*` files, and those are for LARGE placements only. At
small sizes a tagline turns to unreadable dust and drags the whole
logo down with it. So:

| Situation | File |
| --- | --- |
| Marketing page hero, posters, big social images | `logo-full-dark.svg` / `logo-full-light.svg` (600px wide or more, never smaller) |
| Website header, email header, most everyday use | `logo-dark.svg` / `logo-light.svg` |
| When the name appears without the mark | `wordmark-dark.svg` / `wordmark-light.svg` |
| Tiny spaces: avatars, app icon, favicon | `symbol.svg`, `symbol-tile-dark.svg` / `symbol-tile-light.svg`, the favicon and app icon files |
| Link previews in chats and feeds | `og-card.png` (1200 by 630) |

`-dark` means FOR dark backgrounds (light text). `-light` means for
light backgrounds (dark text).

## Ready-to-upload files

- `app-icon-1024.png`: full-bleed square. Apple and Google round the
  corners themselves, so this file has none.
- `favicon.ico` plus `favicon-16/32/48.png` and `favicon.svg`: the
  browser tab set.
- `og-card.png`: the social preview card.

## Colors

MEASURED from the owner's reference renders in `reference/`, 13 August
2026. These supersede the older guideline chips, because the renders
the owner approved run hotter:

- Front bar fade: `#F56EFC` magenta, `#A640FA` violet, `#0B70FC` blue
- Back bar fade: `#9A1FF6` to `#6C1BF3`
- Dot: `#C932FC` to `#5A22FA`
- Ring: `#F45FFC` through `#B44CF9` to `#4E93FA`
- Ink: `#F8FAFC` on dark, `#05050B` on light, backgrounds pure black

The `reference/` folder holds the owner's original renders. They are
the spec; the SVGs here were fitted to them by measurement (the
generator's comments say how). If the mark ever changes, re-measure
rather than eyeball.

## The font: a real conflict you must decide

**The generator uses real Satoshi.** The owner sent the variable font
on 13 August; Bold (700) and Medium (500) are instantiated from it and
committed in `tools/`. An earlier version of this file wrongly said
Poppins. That was stale text, not what the code did, and it is
corrected here.

**But the reference renders are NOT set in Satoshi.** Proven by
comparing letterforms against `reference/logo_whitebg.png`:

- The reference's `a` is SINGLE-storey: a circle with a straight stem,
  like Futura or Poppins.
- Satoshi's `a` is DOUBLE-storey, with a bowl and an arch above it, at
  every weight from 300 to 900.

Two different letters. No weight, size or spacing setting bridges
that. The brand sheet says Satoshi because the image generator wrote
the word "Satoshi" as part of the picture; it did not typeset anything
in Satoshi, because AI image tools draw letter-shaped forms rather
than using real fonts.

So there is a genuine either/or, and it is a brand decision:

| Choice | Result |
| --- | --- |
| Keep **Satoshi** | Matches the written brand sheet. Does not match the look of the renders. |
| Switch to a **geometric single-storey** face (Poppins, Jost, Questrial) | Matches the renders' letterforms. Contradicts the sheet's stated font. |

Poppins SemiBold is the closest match to the renders of the three
tested. Switching is a two-line change: point FONT_BOLD and FONT_MED
at the file and rerun. Every measurement, including where the l's tip
is cut, is read from the font at runtime, so nothing else moves.

## Regenerating

`tools/genbrand.py` builds every SVG from scratch (needs Python with
fontTools and uharfbuzz, plus the two font files). The PNG renders come
from a headless browser screenshotting the SVGs. If the design changes,
change the generator and rerun rather than editing SVGs by hand, so the
whole family stays consistent.

## Licenses

- Poppins: SIL Open Font License. Free for commercial use, outlines in
  logos included.
- Satoshi (if swapped in): Fontshare's ITF Free Font License. Free for
  commercial use.
