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

From the owner's brand sheet, August 2026:

- `#A855F7` lilac (gradient start)
- `#8B3DFF` violet (gradient middle)
- `#3B82F6` blue (gradient end)
- `#5B21B6` deep violet (the fold shadow in the mark)
- `#F8FAFC` near-white ink on dark
- `#05050B` near-black ink and the dark surface

## The font, and one open decision

The brand sheet names Satoshi (free from fontshare.com). Fontshare is
unreachable from the build sandbox, so these files are set in Poppins
SemiBold and Medium, which is also the app's existing wordmark font.
The two are close but not identical.

To move to Satoshi: download Satoshi-Bold.ttf and Satoshi-Medium.ttf
from fontshare.com, drop them next to `tools/genbrand.py`, point
FONT_BOLD and FONT_MED at them, and rerun. Everything regenerates,
including the notch position on the l, which follows the font
automatically.

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
