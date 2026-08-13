# Builds the Actuals brand files as clean vector SVG.
#
# The AI sheet is the spec: A mark with a data-point dot, purple to
# blue gradient, lowercase wordmark with an angled notch on the l,
# tagline TRACK ANALYZE IMPROVE. This redraws all of it as geometry so
# it stays sharp at every size.
#
# The wordmark is set in Poppins because Satoshi (the sheet's font)
# cannot be downloaded from this sandbox. Every letter is converted to
# outline paths, so no viewer ever needs the font installed. To switch
# to Satoshi later: put Satoshi-Bold.ttf and Satoshi-Medium.ttf next to
# this script and rerun with FONT_BOLD/FONT_MED changed. Nothing else
# moves.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textpath import shape

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/user/celebets/brand/actuals"
FONT_BOLD = os.path.join(HERE, "Poppins-600.ttf")
FONT_MED = os.path.join(HERE, "Poppins-500.ttf")

# The palette, from the owner's sheet.
P_LILAC = "#A855F7"
P_VIOLET = "#8B3DFF"
P_BLUE = "#3B82F6"
P_DEEP = "#5B21B6"
INK_LIGHT = "#F8FAFC"   # text on dark
INK_DARK = "#05050B"    # text on light, and the dark surface

os.makedirs(OUT, exist_ok=True)


def grad_defs(prefix=""):
    """The two gradients every asset shares."""
    return f"""
  <defs>
    <linearGradient id="{prefix}legs" x1="120" y1="60" x2="470" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="0.45" stop-color="{P_VIOLET}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
    <linearGradient id="{prefix}dot" x1="104" y1="356" x2="196" y2="452" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_VIOLET}"/>
    </linearGradient>
    <linearGradient id="{prefix}ring" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
  </defs>"""


def mark_group(prefix=""):
    """The A and its dot, drawn in a 512 square.

    Anatomy: the right leg runs full length, the left leg stops short,
    and the dot lands where the left leg would have. The two legs share
    a diagonal top edge so the apex reads as a folded ribbon, with a
    darker triangle underneath the fold for depth.
    """
    return f"""
  <g>
    <path d="M236 86 L312 64 L464 442 L388 442 Z" fill="url(#{prefix}legs)"/>
    <path d="M236 86 L304 66 L268 156 Z" fill="{P_DEEP}" opacity="0.85"/>
    <path d="M236 86 L304 66 L190 318 L118 318 Z" fill="url(#{prefix}dot)"/>
    <circle cx="148" cy="408" r="44" fill="url(#{prefix}dot)"/>
  </g>"""


def write(name, content):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        f.write(content.strip() + "\n")
    print("wrote", name)


def svg(viewbox, body, w=None, h=None):
    dims = ""
    if w:
        dims = f' width="{w}" height="{h}"'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}"{dims}>'
            f"{body}\n</svg>")


# ---------------------------------------------------------------- text
WORD_SIZE = 100
word = shape(FONT_BOLD, "actuals", WORD_SIZE, tracking=-0.005)

# The notch: an angled flag on the l, echoing the mark's fold. The l's
# stem position comes from the shaper, so a font swap moves it
# automatically.
l_pos = next(p for p in word["positions"] if p["glyph"] == "l")
lx = l_pos["x"]
l_adv = l_pos["advance"]


def notch(color_expr):
    # Poppins' l is a bare stem centred in its advance, top around
    # y=-73 at this size. The flag sits ON the stem and slants up to
    # the right, the same lean as the mark's fold: it must read as the
    # l's own top turning purple, not as a mark floating beside it.
    x0 = lx + 8.0
    x1 = lx + 27.0
    return (f'<path d="M{x0:.1f} -56 L{x0:.1f} -75 L{x1:.1f} -87 '
            f'L{x1:.1f} -68 Z" fill="{color_expr}"/>')


def wordmark_body(ink, prefix):
    return f"""
  <defs>
    <linearGradient id="{prefix}n" x1="{lx:.0f}" y1="-85" x2="{lx + 40:.0f}" y2="-58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
  </defs>
  <path d="{word['d']}" fill="{ink}"/>
  {notch(f'url(#{prefix}n)')}"""


WORD_W = word["width"]
WORD_VB = f"-4 -92 {WORD_W + 16:.0f} 100"

write("wordmark-dark.svg", svg(WORD_VB, wordmark_body(INK_LIGHT, "wd")))
write("wordmark-light.svg", svg(WORD_VB, wordmark_body(INK_DARK, "wl")))

# -------------------------------------------------------------- symbol
write("symbol.svg", svg("60 20 440 440", grad_defs("s") + mark_group("s")))

tile_body = f"""{grad_defs("t")}
  <rect x="10" y="10" width="492" height="492" rx="112" fill="{INK_DARK}"/>
  <rect x="10" y="10" width="492" height="492" rx="112" fill="none" stroke="url(#tring)" stroke-width="10"/>
  <g transform="translate(74,64) scale(0.72)">{mark_group("t")}</g>"""
write("symbol-tile.svg", svg("0 0 512 512", tile_body))

# App icon master: full bleed, the OS rounds its own corners. The mark
# sits slightly above centre because the dot pulls visual weight down.
icon_body = f"""{grad_defs("i")}
  <rect width="512" height="512" fill="{INK_DARK}"/>
  <g transform="translate(90,74) scale(0.66)">{mark_group("i")}</g>"""
write("app-icon-master.svg", svg("0 0 512 512", icon_body))

write("favicon.svg", svg("0 0 512 512", f"""{grad_defs("f")}
  <rect width="512" height="512" rx="96" fill="{INK_DARK}"/>
  <g transform="translate(74,58) scale(0.74)">{mark_group("f")}</g>"""))

# ------------------------------------------------- horizontal lockups
# Mark beside wordmark, no tagline. This is the everyday logo.
def lockup_body(ink, prefix):
    # The mark, tile-less, scaled so its height sits a touch above the
    # ascender, baseline-aligned with the text.
    mark_scale = 0.30  # 512 -> ~154 tall next to 100px text
    return f"""{grad_defs(prefix)}
  <defs>
    <linearGradient id="{prefix}n2" x1="{lx:.0f}" y1="-85" x2="{lx + 40:.0f}" y2="-58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
  </defs>
  <g transform="translate(-14,-120) scale({mark_scale})">{mark_group(prefix)}</g>
  <g transform="translate(136,0)">
    <path d="{word['d']}" fill="{ink}"/>
    {notch(f'url(#{prefix}n2)')}
  </g>"""


LOCKUP_VB = f"-18 -110 {WORD_W + 178:.0f} 130"
write("logo-dark.svg", svg(LOCKUP_VB, lockup_body(INK_LIGHT, "ld")))
write("logo-light.svg", svg(LOCKUP_VB, lockup_body(INK_DARK, "ll")))

# --------------------------------------------- stacked, with tagline
# The full lockup from the owner's sheet. FOR LARGE USE ONLY: the
# README sets the rule that below 600px wide this file is the wrong
# one, because the tagline turns to dust.
TAG_SIZE = 21
tags = [shape(FONT_MED, t, TAG_SIZE, tracking=0.24) for t in
        ["TRACK.", "ANALYZE.", "IMPROVE."]]
TAG_COLORS = [P_LILAC, P_VIOLET, P_BLUE]
BULLET_GAP = 34
tag_total = sum(t["width"] for t in tags) + 2 * BULLET_GAP


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


FULL_W = max(WORD_W, tag_total) + 24


def full_body(ink, prefix):
    tile_scale = 0.42
    tile_x = (FULL_W - 512 * tile_scale) / 2
    word_x = (FULL_W - WORD_W) / 2
    return f"""{grad_defs(prefix)}
  <defs>
    <linearGradient id="{prefix}n3" x1="{lx:.0f}" y1="-85" x2="{lx + 40:.0f}" y2="-58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{P_LILAC}"/>
      <stop offset="1" stop-color="{P_BLUE}"/>
    </linearGradient>
  </defs>
  <g transform="translate({tile_x:.1f},0) scale(0.42)">
    <rect x="10" y="10" width="492" height="492" rx="112" fill="{INK_DARK}"/>
    <rect x="10" y="10" width="492" height="492" rx="112" fill="none" stroke="url(#{prefix}ring)" stroke-width="10"/>
    <g transform="translate(74,64) scale(0.72)">{mark_group(prefix + "x")}</g>
  </g>
  <g transform="translate({word_x:.1f},332)">
    <path d="{word['d']}" fill="{ink}"/>
    {notch(f'url(#{prefix}n3)')}
  </g>
  {tagline_group(384)}"""


FULL_VB = f"-10 -12 {FULL_W + 20:.0f} 420"
# The mark group inside uses its own gradient ids via prefix+x, so
# declare those too by generating defs twice with both prefixes.
def full_svg(ink, prefix):
    body = grad_defs(prefix + "x") + full_body(ink, prefix)
    return svg(FULL_VB, body)


write("logo-full-dark.svg", full_svg(INK_LIGHT, "fd"))
write("logo-full-light.svg", full_svg(INK_DARK, "fl"))

print("done")
