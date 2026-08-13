# Builds the Actuals brand files as clean vector SVG. Version 4.
#
# The owner's v3 audit, and what each point actually was:
#
# 1. "The symbol is skewed, the lines overlap, you can see the seam."
#    The seam was a DROP SHADOW filter on the front leg. A drop shadow
#    paints a dark edge wherever the shape sits over anything, so it
#    drew a hard diagonal line across the inside of the fold. Gone.
#    The fold is now shading built into the back leg's own gradient,
#    which cannot leave an edge because it is not a separate object.
#
# 2. "The dot is not symmetric." It had a gradient STROKE around a
#    gradient fill, and the two gradients disagreed at the rim. It is
#    a plain filled circle now.
#
# 3. "The l looks like an i." Both earlier attempts drew the flag as a
#    separate shape sitting ABOVE the stem. The owner is right that
#    the mockup does not do that: in the mockup the top of the l IS
#    the coloured part, cut diagonally, inside the letter's own
#    outline. So the flag is no longer a shape at all. The whole word
#    becomes a clipping path, and a coloured block is painted through
#    it. Nothing can stick out, because nothing exists outside the
#    letters.
#
# 4. "Wrong font, why?" Fixed for real: the owner sent Satoshi as a
#    file. It is a VARIABLE font, so Bold (700) and Medium (500) are
#    instantiated from it with fontTools rather than downloaded.
#    Regenerate those two with:
#      from fontTools.varLib.instancer import instantiateVariableFont
#      instantiateVariableFont(TTFont("SatoshiVariable.ttf"),
#                              {"wght": 700}).save("Satoshi-Bold.ttf")
#    Every measurement below is read from the font at runtime,
#    including where the l's tip is cut, so a font change needs no
#    hand editing anywhere.
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textpath import shape

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/user/celebets/brand/actuals"
FONT_BOLD = os.path.join(HERE, "Satoshi-Bold.ttf")
FONT_MED = os.path.join(HERE, "Satoshi-Medium.ttf")

P_LILAC = "#A855F7"
P_VIOLET = "#8B3DFF"
P_BLUE = "#3B82F6"
P_DEEP = "#5B21B6"
INK_LIGHT = "#F8FAFC"
INK_DARK = "#05050B"

os.makedirs(OUT, exist_ok=True)

# ----------------------------------------------------------- the mark
# A 512 square. Two rounded bars meeting at a peak, plus a dot that
# carries the left bar's line down to the ground.
#
# The bars are polygons drawn with a thick round-join stroke of their
# own colour, which is how you get evenly rounded corners on an
# arbitrary quad in plain SVG.
FRONT_ROUND = 34
BACK_ROUND = 26

# Front (right) bar: peak at the top, flat foot on the ground.
FRONT = "M226.0 110.6 L304.0 79.4 L441.8 424.0 L351.3 424.0 Z"
# Back (left) bar: starts UNDER the front bar and runs down-left. Its
# top corners sit inside the front bar's silhouette, so the peak reads
# as one folded ribbon rather than two crossed sticks.
BACK = "M252.8 121.4 L307.2 158.6 L177.2 348.6 L122.8 311.4 Z"
DOT_CX, DOT_CY, DOT_R = 108.0, 386.0, 38.0


def mark_defs(p):
    return f"""
    <linearGradient id="{p}front" x1="300" y1="60" x2="420" y2="440" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#C9A0FF"/>
      <stop offset="0.30" stop-color="{P_LILAC}"/>
      <stop offset="0.62" stop-color="{P_VIOLET}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
    <linearGradient id="{p}back" x1="290" y1="145" x2="150" y2="335" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#4A1A93"/>
      <stop offset="0.35" stop-color="{P_DEEP}"/>
      <stop offset="1" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="{p}dotg" x1="80" y1="356" x2="136" y2="416" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="#7C3AED"/>
    </linearGradient>
    <filter id="{p}soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>"""


def mark_group(p, glow=False):
    fs = f'stroke-width="{FRONT_ROUND}" stroke-linejoin="round"'
    bs = f'stroke-width="{BACK_ROUND}" stroke-linejoin="round"'
    art = f"""
    <g>
      <path d="{BACK}" fill="url(#{p}back)" stroke="url(#{p}back)" {bs}/>
      <circle cx="{DOT_CX}" cy="{DOT_CY}" r="{DOT_R}" fill="url(#{p}dotg)"/>
      <path d="{FRONT}" fill="url(#{p}front)" stroke="url(#{p}front)" {fs}/>
    </g>"""
    if not glow:
        return art
    return f"""
    <g filter="url(#{p}soft)" opacity="0.5">
      <path d="{BACK}" fill="url(#{p}back)" stroke="url(#{p}back)" {bs}/>
      <circle cx="{DOT_CX}" cy="{DOT_CY}" r="{DOT_R}" fill="url(#{p}dotg)"/>
      <path d="{FRONT}" fill="url(#{p}front)" stroke="url(#{p}front)" {fs}/>
    </g>{art}"""


def ring_defs(p):
    return f"""
    <linearGradient id="{p}ring" x1="60" y1="40" x2="460" y2="480" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#C026D3"/>
      <stop offset="0.5" stop-color="{P_VIOLET}"/>
      <stop offset="1" stop-color="#2E7DF6"/>
    </linearGradient>"""


def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content.strip() + "\n")
    print("wrote", name)


def svg(viewbox, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">'
            f"{body}\n</svg>")


MARK_VB = "58 50 412 402"
write("symbol.svg", svg(MARK_VB, f"<defs>{mark_defs('s')}</defs>{mark_group('s')}"))


def tile(p, dark):
    bg = INK_DARK if dark else "#FFFFFF"
    glow_op = "0.9" if dark else "0.3"
    return f"""
  <defs>{mark_defs(p)}{ring_defs(p)}
    <filter id="{p}gr" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="{14 if dark else 8}"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="{bg}"/>
  <rect x="56" y="56" width="400" height="400" rx="108" fill="none" stroke="url(#{p}ring)" stroke-width="13" filter="url(#{p}gr)" opacity="{glow_op}"/>
  <rect x="56" y="56" width="400" height="400" rx="108" fill="none" stroke="url(#{p}ring)" stroke-width="9"/>
  <g transform="translate(112,119) scale(0.545)">{mark_group(p, glow=dark)}</g>"""


write("symbol-tile-dark.svg", svg("0 0 512 512", tile("t", True)))
write("symbol-tile-light.svg", svg("0 0 512 512", tile("u", False)))

write("app-icon-master.svg", svg("0 0 512 512", f"""
  <defs>{mark_defs('i')}</defs>
  <rect width="512" height="512" fill="{INK_DARK}"/>
  <g transform="translate(47,57) scale(0.79)">{mark_group('i', glow=True)}</g>"""))

write("favicon.svg", svg("0 0 512 512", f"""
  <defs>{mark_defs('f')}</defs>
  <rect width="512" height="512" rx="96" fill="{INK_DARK}"/>
  <g transform="translate(29,40) scale(0.86)">{mark_group('f')}</g>"""))

# ------------------------------------------------------- the wordmark
WORD_SIZE = 100
word = shape(FONT_BOLD, "actuals", WORD_SIZE, tracking=-0.005)
WORD_W = word["width"]

# The l's stem, measured from the font itself so a font swap needs no
# hand editing.
_tt = TTFont(FONT_BOLD)
_gs = _tt.getGlyphSet()
_upem = _tt["head"].unitsPerEm
_bp = BoundsPen(_gs)
_gs[_tt.getBestCmap()[ord("l")]].draw(_bp)
_lx0, _, _lx1, _ly1 = [v / _upem * WORD_SIZE for v in _bp.bounds]

l_pos = next(p for p in word["positions"] if p["glyph"] == "l")
STEM_L = l_pos["x"] + _lx0
STEM_R = l_pos["x"] + _lx1
L_TOP = -_ly1                       # the l's own ascender, in SVG's y-down

# The diagonal that divides the l: the tip above it is coloured, the
# rest stays ink. Expressed as a fraction of the l's height so it
# scales with any font.
CUT_L = L_TOP + 0.235 * _ly1        # left side of the stem
CUT_R = L_TOP + 0.155 * _ly1        # right side, higher: the lean


def word_defs(p):
    return f"""
    <linearGradient id="{p}tip" x1="{STEM_L:.1f}" y1="{CUT_L:.1f}" x2="{STEM_R + 6:.1f}" y2="{L_TOP - 6:.1f}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_BLUE}"/>
      <stop offset="1" stop-color="{P_LILAC}"/>
    </linearGradient>
    <linearGradient id="{p}ink" x1="0" y1="{L_TOP:.0f}" x2="0" y2="6" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#CBD2E0"/>
    </linearGradient>
    <clipPath id="{p}word">
      <path d="{word['d']}"/>
    </clipPath>"""


def tip_block():
    """Everything above the diagonal, wide enough to cover the stem.
    Clipped to the word, so only the l's tip is painted."""
    x0 = STEM_L - 14
    x1 = STEM_R + 14
    return (f'M{x0:.1f} {CUT_L:.1f} L{x1:.1f} {CUT_R:.1f} '
            f'L{x1:.1f} {L_TOP - 40:.1f} L{x0:.1f} {L_TOP - 40:.1f} Z')


def wordmark_body(p, ink_expr):
    return f"""
  <defs>{word_defs(p)}</defs>
  <path d="{word['d']}" fill="{ink_expr}"/>
  <g clip-path="url(#{p}word)">
    <path d="{tip_block()}" fill="url(#{p}tip)"/>
  </g>"""


WORD_VB = f"-6 {L_TOP - 12:.0f} {WORD_W + 20:.0f} {abs(L_TOP) + 26:.0f}"
write("wordmark-dark.svg", svg(WORD_VB, wordmark_body("wd", "url(#wdink)")))
write("wordmark-light.svg", svg(WORD_VB, wordmark_body("wl", INK_DARK)))


# ------------------------------------------------- horizontal lockups
def lockup_body(p, ink_expr):
    return f"""
  <defs>{mark_defs(p)}{word_defs(p)}</defs>
  <g transform="translate(-32,-120) scale(0.335)">{mark_group(p)}</g>
  <g transform="translate(158,0)">
    <path d="{word['d']}" fill="{ink_expr}"/>
    <g clip-path="url(#{p}word)">
      <path d="{tip_block()}" fill="url(#{p}tip)"/>
    </g>
  </g>"""


LOCKUP_VB = f"-20 -112 {WORD_W + 200:.0f} 136"
write("logo-dark.svg", svg(LOCKUP_VB, lockup_body("ld", "url(#ldink)")))
write("logo-light.svg", svg(LOCKUP_VB, lockup_body("ll", INK_DARK)))

# --------------------------------------------- stacked, with tagline
TAG_SIZE = 21
tags = [shape(FONT_MED, t, TAG_SIZE, tracking=0.24)
        for t in ["TRACK.", "ANALYZE.", "IMPROVE."]]
TAG_COLORS = [P_LILAC, P_VIOLET, P_BLUE]
BULLET_GAP = 34
tag_total = sum(t["width"] for t in tags) + 2 * BULLET_GAP
FULL_W = max(WORD_W, tag_total) + 24


def tagline_group(y):
    x = (FULL_W - tag_total) / 2
    parts = []
    for i, t in enumerate(tags):
        parts.append(f'<g transform="translate({x:.1f},{y})">'
                     f'<path d="{t["d"]}" fill="{TAG_COLORS[i]}"/></g>')
        x += t["width"]
        if i < 2:
            parts.append(f'<circle cx="{x + BULLET_GAP / 2:.1f}" cy="{y - 7}" '
                         f'r="3.6" fill="{TAG_COLORS[i + 1]}"/>')
            x += BULLET_GAP
    return "\n  ".join(parts)


def full_body(p, ink_expr, dark):
    ts = 0.47
    tile_x = (FULL_W - 512 * ts) / 2
    word_x = (FULL_W - WORD_W) / 2
    bg = INK_DARK if dark else "#FFFFFF"
    return f"""
  <defs>{mark_defs(p)}{ring_defs(p)}{word_defs(p)}
    <filter id="{p}gr" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="{14 if dark else 8}"/>
    </filter>
  </defs>
  <g transform="translate({tile_x:.1f},0) scale({ts})">
    <rect width="512" height="512" rx="0" fill="{bg}" opacity="0"/>
    <rect x="56" y="56" width="400" height="400" rx="108" fill="none" stroke="url(#{p}ring)" stroke-width="13" filter="url(#{p}gr)" opacity="{0.9 if dark else 0.3}"/>
    <rect x="56" y="56" width="400" height="400" rx="108" fill="none" stroke="url(#{p}ring)" stroke-width="9"/>
    <g transform="translate(112,119) scale(0.545)">{mark_group(p, glow=dark)}</g>
  </g>
  <g transform="translate({word_x:.1f},352)">
    <path d="{word['d']}" fill="{ink_expr}"/>
    <g clip-path="url(#{p}word)">
      <path d="{tip_block()}" fill="url(#{p}tip)"/>
    </g>
  </g>
  {tagline_group(404)}"""


FULL_VB = f"-12 -6 {FULL_W + 24:.0f} 442"
write("logo-full-dark.svg", svg(FULL_VB, full_body("fd", "url(#fdink)", True)))
write("logo-full-light.svg", svg(FULL_VB, full_body("fl", INK_DARK, False)))

print("done")
