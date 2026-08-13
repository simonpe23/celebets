# Turns a string into SVG path data using a real font, with proper
# shaping and kerning via harfbuzz. Outputs one combined path plus the
# per-glyph x positions, so the logo builder can hang the "l" notch on
# the right letter.
import json
import sys

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform


def shape(font_path, text, size, tracking=0.0):
    """tracking is extra space between glyphs in em units."""
    blob = hb.Blob.from_file_path(font_path)
    face = hb.Face(blob)
    hbfont = hb.Font(face)
    upem = face.upem

    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf)

    tt = TTFont(font_path)
    glyph_set = tt.getGlyphSet()
    glyph_order = tt.getGlyphOrder()

    scale = size / upem
    x_cursor = 0.0
    paths = []
    positions = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        gname = glyph_order[info.codepoint]
        pen = SVGPathPen(glyph_set)
        # y flip: fonts are y-up, SVG is y-down
        t = Transform(scale, 0, 0, -scale,
                      (x_cursor + pos.x_offset * scale), 0)
        glyph_set[gname].draw(TransformPen(pen, t))
        d = pen.getCommands()
        if d:
            paths.append(d)
        positions.append({
            "glyph": gname,
            "x": x_cursor,
            "advance": pos.x_advance * scale,
        })
        x_cursor += pos.x_advance * scale + tracking * size

    return {
        "d": " ".join(paths),
        "width": x_cursor - tracking * size,
        "positions": positions,
        "upem": upem,
    }


if __name__ == "__main__":
    font_path, text, size, tracking = (
        sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]))
    print(json.dumps(shape(font_path, text, size, tracking)))
