# Builds the Actuals brand files as clean vector SVG. Version 2,
# after the owner rejected v1: "looks like it's made by a child in
# paint... my mockup has a glow, colors that are fading in a classy
# way." He was right. What changed:
#
# - Every corner of the mark is ROUNDED (round-join stroke trick), the
#   single biggest difference between clip art and a drawn mark.
# - The fold is a real cast shadow from the front leg onto the back
#   leg, not a pasted triangle.
# - The back leg runs a deeper violet gradient than the front leg,
#   which is what makes the ribbon read as two faces of one strip.
# - A sheen pass brightens the front leg's top, so the gradient fades
#   the way his mockup does instead of banding.
# - Dark-surface versions carry a true neon glow: a blurred colored
#   copy of the artwork underneath itself.
# - The l notch: the stem is CUT with a mask (a diagonal slice of it
#   is erased), and the flag floats above the cut with a deliberate
#   gap. v1 slapped the flag over an intact stem and the stem showed
#   through behind it.
#
# The wordmark is Poppins outlines standing in for Satoshi, which is
# unreachable from this sandbox. Swap: put Satoshi-Bold.ttf and
# Satoshi-Medium.ttf beside this script, point FONT_BOLD and FONT_MED
# at them, rerun. The notch follows the l automatically.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textpath import shape

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/user/celebets/brand/actuals"
FONT_BOLD = os.path.join(HERE, "Poppins-600.ttf")
FONT_MED = os.path.join(HERE, "Poppins-500.ttf")

P_LILAC = "#A855F7"
P_VIOLET = "#8B3DFF"
P_BLUE = "#3B82F6"
P_DEEP = "#5B21B6"
INK_LIGHT = "#F8FAFC"
INK_DARK = "#05050B"

os.makedirs(OUT, exist_ok=True)

# ----------------------------------------------------------- the mark
# Geometry in a 512 square. The front (right) leg runs from the apex
# to the ground with a horizontal foot. The back (left) leg slides
# under the fold at a matching angle and is cut square to its own
# direction. The dot continues the back leg's line, a data point
# falling out of the A.
ROUND = 36  # round-join stroke width; corners get half this as radius


def mark_defs(p):
    return f"""
    <linearGradient id="{p}front" x1="300" y1="60" x2="430" y2="445" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#C084FC"/>
      <stop offset="0.35" stop-color="{P_LILAC}"/>
      <stop offset="0.65" stop-color="{P_VIOLET}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
    <linearGradient id="{p}back" x1="280" y1="130" x2="150" y2="345" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9B45F5"/>
      <stop offset="1" stop-color="{P_DEEP}"/>
    </linearGradient>
    <linearGradient id="{p}dotg" x1="92" y1="380" x2="146" y2="455" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_VIOLET}"/>
    </linearGradient>

    <filter id="{p}fold" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="-5" dy="6" stdDeviation="7" flood-color="#1B0A3C" flood-opacity="0.38"/>
    </filter>
    <filter id="{p}soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>"""


# The back leg: perpendicular end caps, so its bottom cut slopes with
# the stroke. Corners from centreline (275,90) to (165,322), half
# width 40 (plus the round stroke it grows to ~53).
BACK = "M261 110 L310.7 143.5 L176.5 342.5 L126.8 309 Z"
# The front leg: fold seam at the top, horizontal foot on the ground,
# and a slight taper: narrower at the apex than at the foot.
FRONT = "M254 106 L314 72 L452 424 L370 424 Z"
DOT = 'cx="99" cy="405" r="40"'


def mark_group(p, glow=False):
    """The artwork. glow=True adds the blurred colored copy below."""
    stroke = f'stroke-width="{ROUND}" stroke-linejoin="round"'
    bstroke = 'stroke-width="20" stroke-linejoin="round"'
    art = f"""
    <g>
      <path d="{BACK}" fill="url(#{p}back)" stroke="url(#{p}back)" {bstroke}/>
      <circle {DOT} fill="url(#{p}dotg)" stroke="url(#{p}dotg)" stroke-width="6"/>
      <g filter="url(#{p}fold)">
        <path d="{FRONT}" fill="url(#{p}front)" stroke="url(#{p}front)" {stroke}/>
      </g>
    </g>"""
    if not glow:
        return art
    return f"""
    <g filter="url(#{p}soft)" opacity="0.5">
      <path d="{BACK}" fill="url(#{p}back)" stroke="url(#{p}back)" {bstroke}/>
      <circle {DOT} fill="url(#{p}dotg)" stroke="url(#{p}dotg)" stroke-width="6"/>
      <path d="{FRONT}" fill="url(#{p}front)" stroke="url(#{p}front)" {stroke}/>
    </g>{art}"""


def ring_defs(p):
    return f"""
    <linearGradient id="{p}ring" x1="60" y1="40" x2="460" y2="480" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="0.55" stop-color="{P_VIOLET}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>"""


def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content.strip() + "\n")
    print("wrote", name)


def svg(viewbox, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">'
            f"{body}\n</svg>")


# Mark bounds after stroke growth: x 64..465, y 48..437 with the dot.
MARK_VB = "35 23 456 456"

write("symbol.svg", svg(MARK_VB, f"<defs>{mark_defs('s')}</defs>{mark_group('s')}"))

# The display tile, dark: glowing ring and glowing mark on the brand
# near-black. This is the owner's mockup icon.
tile_dark = f"""
  <defs>{mark_defs('t')}{ring_defs('t')}
    <filter id="tglowr" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="{INK_DARK}"/>
  <rect x="58" y="58" width="396" height="396" rx="104" fill="none" stroke="url(#tring)" stroke-width="12" filter="url(#tglowr)" opacity="0.85"/>
  <rect x="58" y="58" width="396" height="396" rx="104" fill="none" stroke="url(#tring)" stroke-width="9"/>
  <g transform="translate(106,107) scale(0.56)">{mark_group('t', glow=True)}</g>"""
write("symbol-tile-dark.svg", svg("0 0 512 512", tile_dark))

# The display tile, light: same anatomy on white, soft shadows instead
# of glow. A glow needs darkness.
tile_light = f"""
  <defs>{mark_defs('u')}{ring_defs('u')}
    <filter id="uglowr" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="#FFFFFF"/>
  <rect x="58" y="58" width="396" height="396" rx="104" fill="none" stroke="url(#uring)" stroke-width="10" filter="url(#uglowr)" opacity="0.35"/>
  <rect x="58" y="58" width="396" height="396" rx="104" fill="none" stroke="url(#uring)" stroke-width="9"/>
  <g transform="translate(106,107) scale(0.56)">{mark_group('u')}</g>"""
write("symbol-tile-light.svg", svg("0 0 512 512", tile_light))

# App icon master: full bleed, subtle glow, no ring. The OS rounds the
# corners and adds its own edge.
icon = f"""
  <defs>{mark_defs('i')}</defs>
  <rect width="512" height="512" fill="{INK_DARK}"/>
  <g transform="translate(63,64) scale(0.72)">{mark_group('i', glow=True)}</g>"""
write("app-icon-master.svg", svg("0 0 512 512", icon))

# Favicon: mark large on the dark tile, no ring. At 16px a ring is
# noise and the mark needs every pixel.
fav = f"""
  <defs>{mark_defs('f')}</defs>
  <rect width="512" height="512" rx="96" fill="{INK_DARK}"/>
  <g transform="translate(47,49) scale(0.78)">{mark_group('f')}</g>"""
write("favicon.svg", svg("0 0 512 512", fav))

# ------------------------------------------------------- the wordmark
WORD_SIZE = 100
word = shape(FONT_BOLD, "actuals", WORD_SIZE, tracking=-0.005)
WORD_W = word["width"]

l_pos = next(p for p in word["positions"] if p["glyph"] == "l")
lx = l_pos["x"]
# Poppins SemiBold l at size 100: stem runs x = lx+8.4 .. lx+18.6,
# top at y = -74.4. Measured from the glyph, not guessed.
STEM_L = lx + 8.4
STEM_R = lx + 18.6

# The diagonal cut through the stem, leaning like the mark's fold.
# Everything above this line is ERASED from the l, then the flag
# floats above it with a visible gap, exactly as in the owner's sheet.
CUT_YL = -64.0   # cut height at the stem's left edge
CUT_YR = -69.0   # higher at the right edge
GAP = 2.0


def word_defs(p):
    return f"""
    <linearGradient id="{p}flag" x1="{STEM_L:.0f}" y1="-92" x2="{STEM_R + 14:.0f}" y2="-60" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
    <linearGradient id="{p}ink" x1="0" y1="-80" x2="0" y2="4" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{INK_LIGHT}"/>
      <stop offset="1" stop-color="#C9CEDC"/>
    </linearGradient>
    <mask id="{p}cut">
      <rect x="-20" y="-120" width="{WORD_W + 60:.0f}" height="160" fill="white"/>
      <path d="M{STEM_L - 4:.1f} {CUT_YL:.1f} L{STEM_R + 6:.1f} {CUT_YR:.1f} L{STEM_R + 6:.1f} -120 L{STEM_L - 4:.1f} -120 Z" fill="black"/>
    </mask>"""


def flag():
    # The flag continues the stem: same width plus a small overhang to
    # the right, base flush on the slice bar a hairline, rising 24
    # above it with a slight lean. The stem plus flag reads as one
    # tall letter with a purple tip.
    x0, x1 = STEM_L, STEM_R + 6.0
    base_l = CUT_YL - GAP
    base_r = CUT_YR - GAP - 2.7
    top_l = base_l - 24
    top_r = base_r - 24
    lean = 5.0
    return (f'M{x0:.1f} {base_l:.1f} L{x1:.1f} {base_r:.1f} '
            f'L{x1 + lean:.1f} {top_r:.1f} L{x0 + lean:.1f} {top_l:.1f} Z')


def wordmark_body(p, ink_expr):
    return f"""
  <defs>{word_defs(p)}</defs>
  <path d="{word['d']}" fill="{ink_expr}" mask="url(#{p}cut)"/>
  <path d="{flag()}" fill="url(#{p}flag)"/>"""


WORD_VB = f"-6 -104 {WORD_W + 20:.0f} 114"
write("wordmark-dark.svg", svg(WORD_VB, wordmark_body("wd", "url(#wdink)")))
write("wordmark-light.svg", svg(WORD_VB, wordmark_body("wl", INK_DARK)))

# ------------------------------------------------- horizontal lockups
def lockup_body(p, ink_expr):
    return f"""
  <defs>{mark_defs(p)}{word_defs(p)}</defs>
  <g transform="translate(-40,-152) scale(0.34)">{mark_group(p)}</g>
  <g transform="translate(158,0)">
    <path d="{word['d']}" fill="{ink_expr}" mask="url(#{p}cut)"/>
    <path d="{flag()}" fill="url(#{p}flag)"/>
  </g>"""


LOCKUP_VB = f"-24 -122 {WORD_W + 214:.0f} 148"
write("logo-dark.svg", svg(LOCKUP_VB, lockup_body("ld", "url(#ldink)")))
write("logo-light.svg", svg(LOCKUP_VB, lockup_body("ll", INK_DARK)))

# --------------------------------------------- stacked, with tagline
TAG_SIZE = 21
tags = [shape(FONT_MED, t, TAG_SIZE, tracking=0.24) for t in
        ["TRACK.", "ANALYZE.", "IMPROVE."]]
TAG_COLORS = [P_LILAC, P_VIOLET, P_BLUE]
BULLET_GAP = 34
tag_total = sum(t["width"] for t in tags) + 2 * BULLET_GAP
FULL_W = max(WORD_W, tag_total) + 24


def tagline_group(y):
    x = (FULL_W - tag_total) / 2
    parts = []
    for i, t in enumerate(tags):
        parts.append(
            f'<g transform="translate({x:.1f},{y})"><path d="{t["d"]}" '
            f'fill="{TAG_COLORS[i]}"/></g>')
        x += t["width"]
        if i < 2:
            parts.append(
                f'<circle cx="{x + BULLET_GAP / 2:.1f}" cy="{y - 7}" r="3.6" '
                f'fill="{TAG_COLORS[i + 1]}"/>')
            x += BULLET_GAP
    return "\n  ".join(parts)


def full_body(p, ink_expr, tile):
    tile_scale = 0.46
    tile_x = (FULL_W - 512 * tile_scale) / 2
    word_x = (FULL_W - WORD_W) / 2
    return f"""
  <defs>{mark_defs(p)}{ring_defs(p)}{word_defs(p)}
    <filter id="{p}glr" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>
  <g transform="translate({tile_x:.1f},0) scale({tile_scale})">{tile}</g>
  <g transform="translate({word_x:.1f},352)">
    <path d="{word['d']}" fill="{ink_expr}" mask="url(#{p}cut)"/>
    <path d="{flag()}" fill="url(#{p}flag)"/>
  </g>
  {tagline_group(404)}"""


def tile_inner(p, dark):
    ring_glow = (f'<rect x="58" y="58" width="396" height="396" rx="104" fill="none" '
                 f'stroke="url(#{p}ring)" stroke-width="12" filter="url(#{p}glr)" '
                 f'opacity="{0.85 if dark else 0.35}"/>')
    return f"""
    {ring_glow}
    <rect x="58" y="58" width="396" height="396" rx="104" fill="none" stroke="url(#{p}ring)" stroke-width="9"/>
    <g transform="translate(106,107) scale(0.56)">{mark_group(p, glow=dark)}</g>"""


FULL_VB = f"-12 -6 {FULL_W + 24:.0f} 442"
write("logo-full-dark.svg",
      svg(FULL_VB, full_body("fd", "url(#fdink)", tile_inner("fd", True))))
write("logo-full-light.svg",
      svg(FULL_VB, full_body("fl", INK_DARK, tile_inner("fl", False))))

print("done")
