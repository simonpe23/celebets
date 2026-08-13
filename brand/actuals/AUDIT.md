# Mockup versus vector: the full audit

The owner asked for an honest, complete list of every difference
between his AI-rendered mockup and the vector files in this folder,
plus a straight answer on whether an identical copy is achievable.

## The straight answer

**An identical copy is not achievable by this route, and it is worth
knowing exactly why rather than trying a fifth time.**

Two hard limits, neither of them about effort:

1. **I cannot open the mockup as a file.** The PNGs arrive as pictures
   in a conversation. I can look at them, but I cannot load them,
   sample their pixels, measure their angles, or auto-trace them. So
   every coordinate here is reconstructed by eye from a description
   of what I see. That is a fundamentally lower-precision process than
   what a designer does with the actual file open in Illustrator.
2. **The mockup is a 3D render, not vector art.** It has soft
   volumetric lighting, subtle bevels on every edge, and light
   wrapping around forms. SVG can approximate that with gradients and
   blurs, but the approximation always reads flatter. Every attempt to
   fake it with overlay shapes made things worse, twice.

So the honest position: this folder holds a clean, correct, technically
sound vector logo built to the mockup's design. It is not a clone of
the render.

## What was genuinely wrong, and is now fixed

These were real defects, not stylistic disagreements. All four came
from specific mistakes:

| The owner said | The actual cause | Fixed by |
| --- | --- | --- |
| "You can see the line behind the notch, it looks like actuais" | The tip was drawn as a SEPARATE shape floating above a shortened stem. A short stem with a mark over it is the letter i. | The tip is no longer a shape. The whole word is a clipping path and a coloured block is painted through it, so the top of the l IS coloured, inside the letter's own outline. Nothing can stick out because nothing exists outside the letters. |
| "The lines are overlapping, you can see the seam" | A drop-shadow filter on the front bar. A drop shadow paints a dark edge wherever the shape sits over anything, so it drew a hard diagonal across the fold. | The filter is gone. The fold is shading inside the back bar's own gradient, which cannot leave an edge because it is not a separate object. |
| "The symbol is skewed" | The back bar's top corners sat outside the front bar's silhouette, so a wedge poked past the peak and the A read as two crossed sticks. | The back bar's corners are now positioned by calculation, checked against the front bar's stroked outline, so both are provably inside it. |
| "The dot is not symmetric" | It had a gradient stroke around a gradient fill. The two gradients disagreed at the rim and thickened one side. | A plain filled circle. |

## What is still different, and why

**The font.** The mockup's brand sheet names Satoshi. Satoshi is
distributed only from fontshare.com, which this build sandbox cannot
reach; four separate sources were tried and all are blocked. These
files use Outfit, which is much closer to Satoshi than the Poppins
used earlier, but it is not Satoshi.

Worth knowing: the mockup's own lettering is probably not Satoshi
either. AI image generators do not typeset with real fonts, they draw
letter-shaped forms. So matching the mockup's wordmark exactly means
matching something that is not a font at all. Using real Satoshi is
the right goal, not matching the render.

FIX: the owner downloads Satoshi from fontshare.com, the two TTF files
go beside `tools/genbrand.py`, FONT_BOLD and FONT_MED point at them,
rerun. Every measurement is taken from the font at runtime, including
where the l's tip is cut, so nothing needs hand adjusting.

**Surface quality.** The render's bars have soft bevelled edges and
light that wraps around the form. The vector bars have flat gradients
with rounded corners. This is the 3D-versus-vector gap described
above and it does not close by iterating.

**The glow.** The render's glow is volumetric and sits in the image.
The vector glow is a blurred copy of the artwork beneath itself. Close
in spirit, thinner in fact.

## The two honest ways forward

1. **Split the job by size.** Use the owner's renders as the display
   artwork on big surfaces where they look their best, and these
   vector files only where sharpness at small sizes matters and the
   render would blur: favicon, app icon, website header. Plenty of
   real brands work exactly this way, and it costs nothing.
2. **Pay a designer to vectorise the render.** With the actual PNG
   open in Illustrator this is a one to two hour job, and it will be
   exact in a way this route cannot be. Expect roughly 50 to 150
   dollars. This is the route to take if pixel-identical is the
   requirement.

Either way, nothing about the app is blocked on it: the file names,
sizes and the tagline rule in README.md all stay valid whichever
artwork ends up inside them.
