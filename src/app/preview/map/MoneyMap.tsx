"use client";

// CONCEPT 1, "THE MONEY MAP". Local preview, gitignored. One engine,
// two skins: the wireframe (wire=true, grey boxes, laws annotated)
// and the mockup (V1's sampled palette).
//
// THE MODEL. Your record is territory. Every fact is a tile: its
// SIZE is how much money it moves for you (|profit|), its COLOR is
// whether that money comes or goes. Unequal weight becomes physics:
// what matters is literally big, what doesn't is literally small,
// and facts too small to map sit on a quiet shelf below, never lost.
//
// The map opens split by the dimension that divides your money most
// (computed, not designed), with the other dimensions one tap away
// on the SPLIT BY row. Tapping a tile ZOOMS: the context narrows to
// that fact and the territory re-splits inside it by the next best
// dimension. "Out" backs up one level. There is no hierarchy
// anywhere: any dimension can split any territory in any order.

import { useMemo, useState } from "react";
import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";

type GroupKey = "sport" | "what" | "where" | "when" | "how" | "risk";
type Chip = { group: GroupKey; kind: "category" | "market" | "plain"; value: string };

const GROUP_LABELS: Record<GroupKey, string> = {
  sport: "Sport",
  what: "What you bet",
  where: "Where",
  when: "When",
  how: "How",
  risk: "Risk",
};
const GROUP_ORDER: GroupKey[] = ["sport", "what", "where", "when", "how", "risk"];
const MUTED = new Set(["No category", "Unclassified", "No competition set"]);

const ICONS: Record<string, string> = {
  Football: "⚽",
  Baseball: "⚾",
  Tennis: "\u{1F3BE}",
  Crypto: "\u{1FA99}",
  "Ice Hockey": "\u{1F3D2}",
  "American Football": "\u{1F3C8}",
  esports: "\u{1F3AE}",
  Basketball: "\u{1F3C0}",
  Moneyline: "\u{1F3AF}",
  "Spread / Handicap": "⚖️",
  "Match Props": "\u{1F9E9}",
  BTTS: "\u{1F945}",
  "Totals (Over/Under)": "\u{1F522}",
  Corners: "\u{1F6A9}",
  "First to Score": "⚡",
  "Player Props": "\u{1F3C3}",
  "Price Direction": "\u{1F4C8}",
  "Premier League":
    "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "Champions League": "\u{1F3C6}",
  "La Liga": "\u{1F1EA}\u{1F1F8}",
  Eredivisie: "\u{1F1F3}\u{1F1F1}",
  "Ligue 1": "\u{1F1EB}\u{1F1F7}",
  Bundesliga: "\u{1F1E9}\u{1F1EA}",
  "Serie A": "\u{1F1EE}\u{1F1F9}",
  MLB: "⚾",
  NBA: "\u{1F3C0}",
  NHL: "\u{1F3D2}",
  NFL: "\u{1F3C8}",
  ATP: "\u{1F3BE}",
  WTA: "\u{1F3BE}",
  "Full time": "⏱️",
  "1st Half": "\u{1F551}",
  Singles: "\u{1F3AB}",
  Parlays: "\u{1F9FE}",
  "Low odds": "\u{1F7E2}",
  "Medium odds": "\u{1F7E1}",
  "High odds": "\u{1F534}",
};

function riskOf(leg: Leg): string | null {
  if (leg.odds === null) return null;
  const o = Number(leg.odds);
  if (o <= 1.8) return "Low odds";
  if (o <= 3) return "Medium odds";
  return "High odds";
}
function valueOf(bet: BetWithLegs, leg: Leg, g: GroupKey): string | null {
  if (g === "sport") return leg.sport;
  if (g === "what") return leg.subcategory ?? "No category";
  if (g === "where") return leg.competition ?? "No competition set";
  if (g === "when") return leg.period ?? "Full time";
  if (g === "how") return bet.legs.length > 1 ? "Parlays" : "Singles";
  return riskOf(leg);
}
function chipMatches(bet: BetWithLegs, leg: Leg, c: Chip): boolean {
  if (c.group === "what" && c.kind === "market")
    return (leg.market ?? "") === c.value;
  return valueOf(bet, leg, c.group) === c.value;
}
function pickCount(bet: BetWithLegs): number {
  return Math.max(1, (bet.bet_buys ?? []).length);
}
interface Stats { wins: number; losses: number; profit: number }
function money(v: number): string {
  const r = Math.round(v);
  return `${r < 0 ? "-" : "+"}$${Math.abs(r).toLocaleString("en-US")}`;
}

// A plain squarified treemap in a 0..100 x 0..100 space.
interface Rect { x: number; y: number; w: number; h: number }
function squarify<T extends { value: number }>(
  items: T[],
  rect: Rect
): (T & Rect)[] {
  const out: (T & Rect)[] = [];
  let rest = [...items].sort((a, b) => b.value - a.value);
  let { x, y, w, h } = rect;
  let total = rest.reduce((s, i) => s + i.value, 0);
  while (rest.length > 0) {
    if (total <= 0) break;
    const vertical = w < h;
    const side = vertical ? w : h;
    let row: T[] = [];
    let rowSum = 0;
    let bestWorst = Infinity;
    for (const item of rest) {
      const tryRow = [...row, item];
      const trySum = rowSum + item.value;
      const thickness = (trySum / total) * (vertical ? h : w);
      let worst = 0;
      for (const r of tryRow) {
        const len = (r.value / trySum) * side;
        const ratio = Math.max(len / thickness, thickness / len);
        worst = Math.max(worst, ratio);
      }
      if (worst <= bestWorst) {
        row = tryRow;
        rowSum = trySum;
        bestWorst = worst;
      } else break;
    }
    const thickness = (rowSum / total) * (vertical ? h : w);
    let offset = 0;
    for (const r of row) {
      const len = (r.value / rowSum) * side;
      out.push(
        vertical
          ? { ...r, x: x + offset, y, w: len, h: thickness }
          : { ...r, x, y: y + offset, w: thickness, h: len }
      );
      offset += len;
    }
    if (vertical) {
      y += thickness;
      h -= thickness;
    } else {
      x += thickness;
      w -= thickness;
    }
    rest = rest.slice(row.length);
    total -= rowSum;
  }
  return out;
}

export default function MoneyMap({
  bets,
  wire,
}: {
  bets: BetWithLegs[];
  wire: boolean;
}) {
  // The zoom path: each entry narrows the territory.
  const [context, setContext] = useState<Chip[]>([]);
  // null means "auto": the dimension with the most signal wins.
  const [splitDim, setSplitDim] = useState<GroupKey | null>(null);

  const settled = useMemo(
    () => bets.filter((b) => b.status !== "pending" && b.settled_at !== null),
    [bets]
  );

  function statsFor(filters: Chip[]): Stats {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const s: Stats = { wins: 0, losses: 0, profit: 0 };
    for (const bet of settled) {
      const shares = legShares(bet);
      const isSingle = bet.legs.length === 1;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        const result = effectiveResult(bet, leg);
        const picks = isSingle ? pickCount(bet) : 1;
        if (result === "won") s.wins += picks;
        if (result === "lost") s.losses += picks;
        s.profit += shares[i] ?? 0;
      });
    }
    return s;
  }

  const board = useMemo(() => {
    const groups = new Map<GroupKey, Map<string, Chip>>();
    for (const g of GROUP_ORDER) groups.set(g, new Map());
    for (const bet of settled) {
      for (const leg of bet.legs) {
        for (const g of GROUP_ORDER) {
          const v = valueOf(bet, leg, g);
          if (v !== null)
            groups.get(g)!.set(v, {
              group: g,
              kind: g === "what" ? "category" : "plain",
              value: v,
            });
        }
      }
    }
    return groups;
  }, [settled]);

  // Rank the dimensions that can still split this territory.
  const dims = GROUP_ORDER.filter(
    (g) => !context.some((c) => c.group === g)
  )
    .map((g) => {
      const rows = [...board.get(g)!.values()]
        .map((chip) => ({ chip, s: statsFor([...context, chip]) }))
        .filter(({ s }) => s.wins + s.losses > 0);
      const real = rows.filter(
        ({ chip, s }) => !MUTED.has(chip.value) && s.wins + s.losses >= 2
      );
      const signal =
        real.length < 2
          ? -1
          : Math.max(...real.map((r) => r.s.profit)) -
            Math.min(...real.map((r) => r.s.profit));
      // A split where one tile would swallow the map (one value
      // holding nearly all the money) makes a poster, not a map:
      // demote it so a dimension that actually draws territory wins
      // the auto-pick. The user can still choose it by hand.
      const abs = rows.map((r) => Math.abs(r.s.profit));
      const sum = abs.reduce((a, b) => a + b, 0);
      const topShare = sum > 0 ? Math.max(...abs) / sum : 1;
      const auto = signal * (topShare > 0.8 ? 0.3 : 1);
      return { g, rows, signal, auto };
    })
    .filter(({ rows }) => rows.length >= 2)
    .sort((a, b) => b.auto - a.auto);

  const active =
    dims.find(({ g }) => g === splitDim) ?? dims[0] ?? null;

  // Tiles vs shelf: a fact earns map space by the money it moves.
  // The shelf keeps the small ones visible without letting them
  // steal legibility from the territory.
  const sumAbs =
    active === null
      ? 0
      : active.rows.reduce((s, r) => s + Math.abs(r.s.profit), 0);
  const tiles =
    active === null
      ? []
      : active.rows.filter(
          (r) =>
            Math.abs(r.s.profit) >= 0.04 * sumAbs && !MUTED.has(r.chip.value)
        );
  const shelf =
    active === null
      ? []
      : active.rows.filter((r) => !tiles.includes(r));
  const placed = squarify(
    tiles.map((r) => ({ ...r, value: Math.abs(r.s.profit) })),
    { x: 0, y: 0, w: 100, h: 100 }
  );

  const answer = statsFor(context);
  const here =
    context.length === 0
      ? "Everything you track"
      : context.map((c) => c.value).join(" · ");

  function zoomInto(chip: Chip) {
    setContext([...context, chip]);
    setSplitDim(null);
  }
  function out() {
    setContext(context.slice(0, -1));
    setSplitDim(null);
  }

  const cls = wire ? "mmw" : "mmk";

  return (
    <div className={cls}>
      <style>{wire ? WIRE_CSS : MOCK_CSS}</style>
      <div className={`${cls}-max`}>
        {wire && (
          <p className="mmw-note">
            WIREFRAME of Concept 1, THE MONEY MAP. Your record as
            territory. TILE SIZE = money the fact moves (|profit|).
            COLOR = comes or goes. SPLIT BY row picks the dimension,
            auto-ranked by signal. Tap a tile to ZOOM inside it; Out
            backs up. Small facts sit on the shelf, never lost.
          </p>
        )}

        <div className={`${cls}-head`}>
          <div>
            <p className={`${cls}-here`}>
              {context.length > 0 && (
                <button type="button" className={`${cls}-out`} onClick={out}>
                  ‹ Out
                </button>
              )}
              {here}
            </p>
            <p className={`${cls}-stats`}>
              <b className={answer.profit >= 0 ? "pos" : "neg"}>
                {money(answer.profit)}
              </b>{" "}
              · {answer.wins}-{answer.losses} record
            </p>
          </div>
        </div>

        <div className={`${cls}-splits`}>
          <span className={`${cls}-splitlabel`}>
            Split by{wire ? " · auto-picked by signal" : ""}
          </span>
          {dims.map(({ g }) => (
            <button
              key={g}
              type="button"
              className={`${cls}-splitchip ${
                active !== null && active.g === g ? "on" : ""
              }`}
              onClick={() => setSplitDim(g)}
            >
              {GROUP_LABELS[g]}
            </button>
          ))}
        </div>

        <div className={`${cls}-map`}>
          {placed.map((t) => {
            const big = t.w * t.h > 600;
            const mid = t.w * t.h > 220;
            return (
              <button
                key={t.chip.value}
                type="button"
                className={`${cls}-tile ${t.s.profit >= 0 ? "up" : "down"}`}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: `${t.w}%`,
                  height: `${t.h}%`,
                }}
                onClick={() => zoomInto(t.chip)}
              >
                <span className={`${cls}-tname`}>
                  {!wire && ICONS[t.chip.value]
                    ? `${ICONS[t.chip.value]} `
                    : ""}
                  {t.chip.value}
                </span>
                {mid && (
                  <span className={`${cls}-tmoney`}>
                    {money(t.s.profit)}
                  </span>
                )}
                {big && (
                  <span className={`${cls}-trec`}>
                    {t.s.wins}-{t.s.losses}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {shelf.length > 0 && (
          <div className={`${cls}-shelf`}>
            <span className={`${cls}-shelflabel`}>
              {wire ? "The shelf: too small to map, never lost" : "Small"}
            </span>
            {shelf.map((r) => (
              <button
                key={r.chip.value}
                type="button"
                className={`${cls}-shelfchip ${
                  MUTED.has(r.chip.value) ? "mut" : ""
                }`}
                onClick={() => zoomInto(r.chip)}
              >
                {r.chip.value}
                <small className={r.s.profit >= 0 ? "pos" : "neg"}>
                  {money(r.s.profit)}
                </small>
              </button>
            ))}
          </div>
        )}

        <p className={`${cls}-foot`}>
          {wire
            ? "Tapping a tile zooms the map into that fact and re-splits by the next best dimension. A tile that cannot split further opens the answer card (V1's), with the bets behind it."
            : `See the bets behind ${here} ›`}
        </p>
      </div>
    </div>
  );
}

const WIRE_CSS = `
  .mmw { min-height: 100svh; background: #fff; color: #111;
    padding: 20px 16px 40px; }
  [data-theme="dark"] .mmw { background: #111; color: #eee; }
  .mmw * { box-sizing: border-box; }
  .mmw-max { max-width: 460px; margin: 0 auto; }
  .mmw-note { border: 1px dashed #bbb; padding: 8px 10px; font-size: 11px;
    color: #888; margin-bottom: 14px; }
  .mmw .pos { color: #15803d; } .mmw .neg { color: #dc2626; }
  [data-theme="dark"] .mmw .pos { color: #34d399; }
  [data-theme="dark"] .mmw .neg { color: #f87171; }
  .mmw-here { font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.06em; color: #888; margin: 0; }
  .mmw-out { border: 1px solid #999; background: none; color: inherit;
    font: inherit; padding: 1px 7px; margin-right: 8px; cursor: pointer; }
  .mmw-stats { font-size: 15px; margin: 4px 0 10px; }
  .mmw-splits { display: flex; gap: 6px; flex-wrap: wrap;
    align-items: baseline; margin-bottom: 10px; }
  .mmw-splitlabel { font-size: 11px; color: #888; }
  .mmw-splitchip { border: 1px solid #999; background: none; color: inherit;
    font-family: inherit; font-size: 12px; font-weight: 600;
    padding: 4px 8px; cursor: pointer; }
  .mmw-splitchip.on { background: #111; color: #fff; }
  [data-theme="dark"] .mmw-splitchip.on { background: #eee; color: #111; }
  .mmw-map { position: relative; width: 100%; aspect-ratio: 1 / 1.05;
    outline: 1px solid #999; }
  .mmw-tile { position: absolute; border: 1px solid #fff;
    font-family: inherit; cursor: pointer; overflow: hidden;
    display: flex; flex-direction: column; align-items: flex-start;
    justify-content: flex-start; padding: 6px; text-align: left; }
  [data-theme="dark"] .mmw-tile { border-color: #111; }
  .mmw-tile.up { background: rgba(21,128,61,0.16); color: inherit; }
  .mmw-tile.down { background: rgba(220,38,38,0.16); color: inherit; }
  .mmw-tname { font-size: 12px; font-weight: 700; }
  .mmw-tmoney { font-size: 12px; }
  .mmw-trec { font-size: 11px; color: #888; }
  .mmw-shelf { display: flex; gap: 6px; flex-wrap: wrap;
    align-items: baseline; margin-top: 10px; }
  .mmw-shelflabel { font-size: 11px; color: #888; width: 100%; }
  .mmw-shelfchip { border: 1px dashed #999; background: none; color: inherit;
    font-family: inherit; font-size: 12px; font-weight: 600;
    padding: 4px 8px; cursor: pointer; display: flex; gap: 6px; }
  .mmw-shelfchip.mut { color: #999; }
  .mmw-shelfchip small { font-size: 11px; }
  .mmw-foot { font-size: 12px; color: #888; margin-top: 14px; }
`;

const MOCK_CSS = `
  .mmk { min-height: 100svh; background: #FFFFFF; color: #171717;
    padding: 20px 16px 48px;
    --mm-muted: #737373; --mm-inner: #F6F6F8;
    --mm-up: rgba(18,161,80,0.14); --mm-down: rgba(239,68,68,0.13);
    --mm-upink: #0E7A3D; --mm-downink: #B42318;
    --mm-ring: rgba(23,23,23,0.10); }
  [data-theme="dark"] .mmk { background: #090B17; color: #F4F4F6;
    --mm-muted: #9CA3AF; --mm-inner: #1B1D30;
    --mm-up: rgba(74,222,128,0.16); --mm-down: rgba(248,113,113,0.15);
    --mm-upink: #4ADE80; --mm-downink: #F87171;
    --mm-ring: rgba(255,255,255,0.08); }
  .mmk * { box-sizing: border-box; }
  .mmk-max { max-width: 430px; margin: 0 auto; }
  .mmk .pos { color: #12A150; } .mmk .neg { color: #EF4444; }
  [data-theme="dark"] .mmk .pos { color: #4ADE80; }
  [data-theme="dark"] .mmk .neg { color: #F87171; }
  .mmk-here { font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--mm-muted); margin: 0;
    display: flex; align-items: center; gap: 8px; }
  .mmk-out { border: none; background: var(--mm-inner); color: inherit;
    font-family: inherit; font-size: 12px; font-weight: 700;
    padding: 4px 10px; border-radius: 999px; cursor: pointer; }
  .mmk-stats { font-size: 26px; font-weight: 600; margin: 6px 0 12px;
    font-variant-numeric: tabular-nums; }
  .mmk-stats b { font-weight: 600; }
  .mmk-splits { display: flex; gap: 6px; align-items: center;
    margin-bottom: 12px; overflow-x: auto; }
  .mmk-splitlabel { font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--mm-muted); flex: none; }
  .mmk-splitchip { border: none; background: var(--mm-inner);
    color: inherit; font-family: inherit; font-size: 13px;
    font-weight: 600; padding: 7px 12px; border-radius: 999px;
    cursor: pointer; flex: none; }
  .mmk-splitchip.on { background: linear-gradient(#5525C6, #4915AD);
    color: #fff; }
  .mmk-map { position: relative; width: 100%; aspect-ratio: 1 / 1.08;
    border-radius: 18px; overflow: hidden;
    box-shadow: 0 0 0 1px var(--mm-ring); }
  .mmk-tile { position: absolute; border: 2px solid #FFFFFF;
    font-family: inherit; cursor: pointer; overflow: hidden;
    display: flex; flex-direction: column; align-items: flex-start;
    justify-content: flex-start; gap: 1px;
    padding: 8px; text-align: left; border-radius: 10px; }
  [data-theme="dark"] .mmk-tile { border-color: #090B17; }
  .mmk-tile.up { background: var(--mm-up); }
  .mmk-tile.down { background: var(--mm-down); }
  .mmk-tname { font-size: 13px; font-weight: 700; }
  .mmk-tile.up .mmk-tmoney { color: var(--mm-upink); }
  .mmk-tile.down .mmk-tmoney { color: var(--mm-downink); }
  .mmk-tmoney { font-size: 13px; font-weight: 700;
    font-variant-numeric: tabular-nums; }
  .mmk-trec { font-size: 11px; color: var(--mm-muted);
    font-variant-numeric: tabular-nums; }
  .mmk-shelf { display: flex; gap: 6px; flex-wrap: wrap;
    align-items: center; margin-top: 12px; }
  .mmk-shelflabel { font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--mm-muted); }
  .mmk-shelfchip { border: none; background: var(--mm-inner);
    color: inherit; font-family: inherit; font-size: 12px;
    font-weight: 600; padding: 6px 10px; border-radius: 999px;
    cursor: pointer; display: flex; gap: 6px; align-items: baseline; }
  .mmk-shelfchip.mut { opacity: 0.55; }
  .mmk-shelfchip small { font-size: 11px;
    font-variant-numeric: tabular-nums; }
  .mmk-foot { font-size: 13px; font-weight: 600; margin-top: 14px;
    color: #430EDB; }
  [data-theme="dark"] .mmk-foot { color: #8B5CF6; }
`;
