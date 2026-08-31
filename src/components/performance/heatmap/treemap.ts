// A squarified treemap. The brief's hard requirement for this page is
// that "the sizing has to be real": a uniform grid wearing a caption
// about size is worse than no heat map at all. So the tiles are laid
// out by the standard squarified algorithm (Bruls, Huizing, van Wijk),
// where every tile's AREA is proportional to its value and the shapes
// stay as close to square as the values allow.

export type Item = { key: string; value: number };
export type Tile = {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type Rect = { x: number; y: number; w: number; h: number };

const worst = (row: number[], side: number, scale: number): number => {
  const sum = row.reduce((a, b) => a + b, 0) * scale;
  const max = Math.max(...row) * scale;
  const min = Math.min(...row) * scale;
  const s2 = sum * sum;
  const side2 = side * side;
  return Math.max((side2 * max) / s2, s2 / (side2 * min));
};

// Lay one row along the shorter side, then recurse into what is left.
function place(
  values: number[],
  keys: string[],
  rect: Rect,
  scale: number,
  out: Tile[]
) {
  if (values.length === 0) return;
  const horizontal = rect.w >= rect.h;
  const side = horizontal ? rect.h : rect.w;

  let row: number[] = [];
  let i = 0;
  while (i < values.length) {
    const next = [...row, values[i]];
    if (row.length > 0 && worst(next, side, scale) > worst(row, side, scale)) break;
    row = next;
    i += 1;
  }

  const rowSum = row.reduce((a, b) => a + b, 0) * scale;
  const thickness = side > 0 ? rowSum / side : 0;
  let offset = 0;
  row.forEach((v, j) => {
    const length = side > 0 ? (v * scale) / thickness : 0;
    out.push(
      horizontal
        ? { key: keys[j], x: rect.x, y: rect.y + offset, w: thickness, h: length }
        : { key: keys[j], x: rect.x + offset, y: rect.y, w: length, h: thickness }
    );
    offset += length;
  });

  const rest: Rect = horizontal
    ? { x: rect.x + thickness, y: rect.y, w: rect.w - thickness, h: rect.h }
    : { x: rect.x, y: rect.y + thickness, w: rect.w, h: rect.h - thickness };

  place(values.slice(i), keys.slice(i), rest, scale, out);
}

export function squarify(items: Item[], width: number, height: number): Tile[] {
  const clean = items.filter((i) => i.value > 0);
  if (clean.length === 0) return [];
  const total = clean.reduce((sum, i) => sum + i.value, 0);
  const scale = (width * height) / total;
  const out: Tile[] = [];
  place(
    clean.map((i) => i.value),
    clean.map((i) => i.key),
    { x: 0, y: 0, w: width, h: height },
    scale,
    out
  );
  return out;
}
