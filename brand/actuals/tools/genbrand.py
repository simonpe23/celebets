# Builds the Actuals brand files as clean vector SVG. Version 5.
#
# THIS VERSION IS MEASURED, NOT EYEBALLED. The owner uploaded his
# reference renders into the repo (brand/actuals/reference/), so every
# number below comes from reading his actual pixels:
#
# - The mark lives in the reference icon's own 1254x1254 space, so
#   coordinates here are literally positions in his file.
# - Both bars meet at the apex; the back bar runs BEHIND the front all
#   the way up. Its visible edges match the reference's measured edge
#   lines (left edge x=445 at y=551, slope -0.554) exactly.
# - The back bar is measurably slimmer than the front (139 true width
#   against 156), which is why earlier guesses could never tuck it in.
# - The palette is hotter than the old guideline chips: the reference
#   fades magenta #F56EFC through violet into blue #0B70FC, and the
#   dot is magenta-to-indigo. Sampled, not chosen.
# - The lockup proportions (word 0.536 of tile height, 70px gap at
#   330px tile, tagline letterspaced to exactly the word's width) are
#   measured from logo_whitebg.png.
#
# The wordmark is real Satoshi, instantiated from the owner's variable
# font at weights 700 and 500.
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

INK_LIGHT = "#F8FAFC"
INK_DARK = "#05050B"

os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------ the mark, 1254-space
# Each bar is a capsule: the quad is the centreline rectangle shrunk
# by the corner radius r on every side, drawn with a round-join stroke
# of width 2r, which restores the true width and rounds every corner.
#
# FRONT bar: centreline (626,390) to (890,880), true width 156, r 50.
FRONT = "M601.4 403.2 L650.6 376.8 L914.6 866.8 L865.4 893.2 Z"
FRONT_STROKE = 100
# BACK bar: centreline (618,385) to (450,685), true width 139, r 40.
# Its top cap sits at the apex, fully behind the front bar.
BACK = "M576.3 399.6 L627.7 428.4 L492.7 669.4 L441.3 640.6 Z"
BACK_STROKE = 80
DOT = 'cx="414" cy="827" r="95"'

# Ring: outer box and radius measured off the reference.
RING = 'x="166" y="170" width="922" height="914" rx="224"'
RING_STROKE = 24


def mark_defs(p):
    return f"""
    <linearGradient id="{p}front" x1="626" y1="350" x2="905" y2="895" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F56EFC"/>
      <stop offset="0.28" stop-color="#DF51FC"/>
      <stop offset="0.52" stop-color="#A640FA"/>
      <stop offset="0.78" stop-color="#3A4AFA"/>
      <stop offset="1" stop-color="#0B70FC"/>
    </linearGradient>
    <linearGradient id="{p}back" x1="618" y1="385" x2="450" y2="690" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9A1FF6"/>
      <stop offset="1" stop-color="#6C1BF3"/>
    </linearGradient>
    <linearGradient id="{p}dotg" x1="340" y1="750" x2="490" y2="905" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#C932FC"/>
      <stop offset="1" stop-color="#5A22FA"/>
    </linearGradient>
    <linearGradient id="{p}ring" x1="166" y1="170" x2="1088" y2="1084" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F45FFC"/>
      <stop offset="0.55" stop-color="#B44CF9"/>
      <stop offset="1" stop-color="#4E93FA"/>
    </linearGradient>
    <filter id="{p}soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="{p}rsoft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="{p}fold" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="11"/>
    </filter>"""


def mark_art(p, dark):
    """The bars and the dot. On dark surfaces the fold gets a soft
    shade along the seam; on white it stays clean, like the owner's
    white reference."""
    fs = f'stroke-width="{FRONT_STROKE}" stroke-linejoin="round"'
    bs = f'stroke-width="{BACK_STROKE}" stroke-linejoin="round"'
    shade = ""
    if dark:
        shade = (f'<line x1="622" y1="412" x2="712" y2="588" stroke="#000000" '
                 f'stroke-width="30" stroke-linecap="round" opacity="0.32" '
                 f'filter="url(#{p}fold)"/>')
    return f"""
      <path d="{BACK}" fill="url(#{p}back)" stroke="url(#{p}back)" {bs}/>
      <circle {DOT} fill="url(#{p}dotg)"/>
      {shade}
      <path d="{FRONT}" fill="url(#{p}front)" stroke="url(#{p}front)" {fs}/>"""


def mark_glow(p):
    fs = f'stroke-width="{FRONT_STROKE}" stroke-linejoin="round"'
    bs = f'stroke-width="{BACK_STROKE}" stroke-linejoin="round"'
    return f"""
    <g filter="url(#{p}soft)" opacity="0.45">
      <path d="{BACK}" fill="url(#{p}back)" stroke="url(#{p}back)" {bs}/>
      <circle {DOT} fill="url(#{p}dotg)"/>
      <path d="{FRONT}" fill="url(#{p}front)" stroke="url(#{p}front)" {fs}/>
    </g>"""


def ring_art(p, dark):
    glow = (f'<rect {RING} fill="none" stroke="url(#{p}ring)" '
            f'stroke-width="{RING_STROKE + 4}" filter="url(#{p}rsoft)" '
            f'opacity="{0.7 if dark else 0.3}"/>')
    return f"""
    {glow}
    <rect {RING} fill="none" stroke="url(#{p}ring)" stroke-width="{RING_STROKE}"/>"""


def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content.strip() + "\n")
    print("wrote", name)


def svg(viewbox, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">'
            f"{body}\n</svg>")


# The bare mark (favicon and tight spaces). Bounds measured after
# stroke growth: x 322..965, y 346..937.
write("symbol.svg", svg("306 330 675 623",
      f"<defs>{mark_defs('s')}</defs>{mark_art('s', dark=False)}"))

# The tile, the owner's reference icon: 1254 canvas, black, glowing
# ring and mark.
write("symbol-tile-dark.svg", svg("0 0 1254 1254", f"""
  <defs>{mark_defs('t')}</defs>
  <rect width="1254" height="1254" fill="#000000"/>
  {ring_art('t', True)}
  {mark_glow('t')}
  <g>{mark_art('t', dark=True)}</g>"""))

write("symbol-tile-light.svg", svg("0 0 1254 1254", f"""
  <defs>{mark_defs('u')}</defs>
  <rect width="1254" height="1254" fill="#FFFFFF"/>
  {ring_art('u', False)}
  <g>{mark_art('u', dark=False)}</g>"""))

# App icon: full bleed black, mark alone, larger. The OS rounds its
# own corners.
write("app-icon-master.svg", svg("0 0 1254 1254", f"""
  <defs>{mark_defs('i')}</defs>
  <rect width="1254" height="1254" fill="#000000"/>
  {mark_glow('i')}
  <g transform="translate(-209.5,-207) scale(1.3)">
    <g transform="translate(161,159) scale(0.769)"></g>
  </g>
  <g transform="translate(-209.5,-207) scale(1.3)">{mark_art('i', dark=True)}</g>"""))

write("favicon.svg", svg("0 0 1254 1254", f"""
  <defs>{mark_defs('f')}</defs>
  <rect width="1254" height="1254" rx="235" fill="#000000"/>
  <g transform="translate(-306,-303) scale(1.45)">{mark_art('f', dark=True)}</g>"""))

# ------------------------------------------------------- the wordmark
WORD_SIZE = 100
word = shape(FONT_BOLD, "actuals", WORD_SIZE, tracking=-0.005)
WORD_W = word["width"]

_tt = TTFont(FONT_BOLD)
_gs = _tt.getGlyphSet()
_upem = _tt["head"].unitsPerEm
_bp = BoundsPen(_gs)
_gs[_tt.getBestCmap()[ord("l")]].draw(_bp)
_lx0, _, _lx1, _ly1 = [v / _upem * WORD_SIZE for v in _bp.bounds]

l_pos = next(p for p in word["positions"] if p["glyph"] == "l")
STEM_L = l_pos["x"] + _lx0
STEM_R = l_pos["x"] + _lx1
L_TOP = -_ly1

# The tip: the reference colours only the top ~10 percent of the l,
# violet into blue, cut on the same diagonal as the mark's fold.
CUT_L = L_TOP + 0.115 * _ly1
CUT_R = L_TOP + 0.055 * _ly1


def word_defs(p):
    return f"""
    <linearGradient id="{p}tip" x1="{STEM_L:.1f}" y1="{L_TOP:.1f}" x2="{STEM_R + 4:.1f}" y2="{CUT_L:.1f}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8B3BF7"/>
      <stop offset="1" stop-color="#2F6BFC"/>
    </linearGradient>
    <linearGradient id="{p}ink" x1="0" y1="{L_TOP:.0f}" x2="0" y2="4" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#D6DBE6"/>
    </linearGradient>
    <clipPath id="{p}word"><path d="{word['d']}"/></clipPath>"""


def tip_block(p):
    x0, x1 = STEM_L - 10, STEM_R + 10
    return (f'<g clip-path="url(#{p}word)"><path d="M{x0:.1f} {CUT_L:.1f} '
            f'L{x1:.1f} {CUT_R:.1f} L{x1:.1f} {L_TOP - 30:.1f} '
            f'L{x0:.1f} {L_TOP - 30:.1f} Z" fill="url(#{p}tip)"/></g>')


def word_art(p, ink_expr):
    return f"""
  <path d="{word['d']}" fill="{ink_expr}"/>
  {tip_block(p)}"""


WORD_VB = f"-6 {L_TOP - 10:.0f} {WORD_W + 20:.0f} {abs(L_TOP) + 22:.0f}"
write("wordmark-dark.svg",
      svg(WORD_VB, f"<defs>{word_defs('wd')}</defs>{word_art('wd', 'url(#wdink)')}"))
write("wordmark-light.svg",
      svg(WORD_VB, f"<defs>{word_defs('wl')}</defs>{word_art('wl', INK_DARK)}"))

# ------------------------------------------- the lockups, measured
# From logo_whitebg.png: tile 330 tall, word ascender 177, so the tile
# is word_height / 0.536. Tile-to-word gap 70/330 of the tile. Word
# top sits 48/330 of the tile below the tile's top.
TILE_H = abs(L_TOP) / 0.536          # 138.8 at word size 100
TILE_SCALE = TILE_H / 914            # ring box height in mark space
TILE_W = 922 * TILE_SCALE
GAP = TILE_H * (70 / 330)
TILE_TOP = L_TOP - TILE_H * (48 / 330)
WORD_X = TILE_W + GAP

# The tile inside a lockup has no background: it inherits the page,
# exactly as in the reference where the ring sits straight on white.
def lockup_tile(p, dark):
    return (f'<g transform="translate({-166 * TILE_SCALE:.2f},'
            f'{TILE_TOP - 170 * TILE_SCALE:.2f}) scale({TILE_SCALE:.4f})">'
            f'{ring_art(p, dark)}{mark_glow(p) if dark else ""}'
            f'<g>{mark_art(p, dark)}</g></g>')


def lockup_body(p, ink_expr, dark):
    return f"""
  <defs>{mark_defs(p)}{word_defs(p)}</defs>
  {lockup_tile(p, dark)}
  <g transform="translate({WORD_X:.1f},0)">{word_art(p, ink_expr)}</g>"""


LOCK_W = WORD_X + WORD_W + 10
LOCK_VB = f"-6 {TILE_TOP - 8:.1f} {LOCK_W + 12:.1f} {TILE_H + 24:.1f}"
write("logo-dark.svg", svg(LOCK_VB, lockup_body("ld", "url(#ldink)", True)))
write("logo-light.svg", svg(LOCK_VB, lockup_body("ll", INK_DARK, False)))

# Full lockup adds the tagline, letterspaced to EXACTLY the word's
# width, as measured: its caps are 26/330 of the tile, its baseline
# 78/330 of the tile below the word's.
TAG_SIZE = (TILE_H * (26 / 330)) / 0.717
TAG_BASE = TILE_H * (78 / 330)
TAG_COLORS = ["#D060F7", "#6C35FA", "#0B85FD"]
TAG_WORDS = ["TRACK.", "ANALYZE.", "IMPROVE."]


def solve_tagline():
    """Find the tracking that makes the tagline span WORD_W."""
    lo, hi = 0.05, 0.8
    for _ in range(24):
        mid = (lo + hi) / 2
        tags = [shape(FONT_MED, t, TAG_SIZE, tracking=mid) for t in TAG_WORDS]
        gap = TAG_SIZE * (1.4 + mid)
        total = sum(t["width"] for t in tags) + 2 * gap
        if total < WORD_W:
            lo = mid
        else:
            hi = mid
    return [shape(FONT_MED, t, TAG_SIZE, tracking=lo) for t in TAG_WORDS], TAG_SIZE * (1.4 + lo)


def tagline_group(x0, y):
    tags, gap = solve_tagline()
    x = x0
    parts = []
    for i, t in enumerate(tags):
        parts.append(f'<g transform="translate({x:.1f},{y:.1f})">'
                     f'<path d="{t["d"]}" fill="{TAG_COLORS[i]}"/></g>')
        x += t["width"]
        if i < 2:
            parts.append(f'<circle cx="{x + gap / 2:.1f}" cy="{y - TAG_SIZE * 0.33:.1f}" '
                         f'r="{TAG_SIZE * 0.16:.1f}" fill="{TAG_COLORS[i + 1]}"/>')
            x += gap
    return "\n  ".join(parts)


def full_body(p, ink_expr, dark):
    return f"""
  <defs>{mark_defs(p)}{word_defs(p)}</defs>
  {lockup_tile(p, dark)}
  <g transform="translate({WORD_X:.1f},0)">{word_art(p, ink_expr)}</g>
  {tagline_group(WORD_X, TAG_BASE)}"""


FULL_VB = f"-6 {TILE_TOP - 8:.1f} {LOCK_W + 12:.1f} {TILE_H + 40:.1f}"
write("logo-full-dark.svg", svg(FULL_VB, full_body("fd", "url(#fdink)", True)))
write("logo-full-light.svg", svg(FULL_VB, full_body("fl", INK_DARK, False)))

print("done")
