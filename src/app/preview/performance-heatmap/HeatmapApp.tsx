"use client";

// THE HEAT MAP, built to his sheet "2. heat map.png", 29 August 2026.
// Its own page, reached from the Heat Map pill on Home, with the same
// two rules as Compare and Totals: the sheet's anatomy and measured
// sizes, Home and Lab's colours and Figtree face through the one dial.
//
// SIZE MEANS IMPACT HERE, which is the sheet's own caption: "Size
// shows impact on your results, color shows profit or loss." That
// differs from docs/performance-brief.md, which says the tiles are
// "sized by how much was bet". His sheet is the newer instruction, so
// it wins, and the difference is written into docs/decisions.md rather
// than resolved quietly.
//
// What survives from the brief either way is its hard requirement:
// "the sizing has to be real". Two things make it real here:
//
// 1. The tiles are laid out by a squarified treemap, so every tile's
//    AREA is its share of the total. A uniform grid wearing this
//    caption would be worse than no heat map at all.
// 2. The tiles PARTITION the record. The map splits ONE group at a
//    time, chosen from the control on its header and opening on
//    Sport, because only inside a single group do the values never
//    share a pick. So no two tiles contain the same money, the tail
//    is one grey Others, and the figures add up to the record's net
//    profit exactly. The first build mixed groups and ranked by size:
//    Moneyline, Parlays, Medium odds and Football all drew the same
//    money, eight tiles summed to $11,637 on a $2,637 record, and the
//    caption above them said size meant impact. See heat-model.ts.
//
// Tapping a tile opens Lab with that fact selected, his ruling of
// 26 August 2026, and the figure on the tile is the figure Lab shows.

import { useMemo, useState } from "react";
import Link from "next/link";
import { money, makeEngine, type Chip, type GroupKey } from "../pf/engine";
import { labBets } from "../performance-lab/lab-data";
import { chipIcon } from "../performance-lab/LabApp";
import { Chev, ChevDown, GoldSparkle, InfoDot } from "../performance-home/icons";
import {
  AMBER_TILE,
  CARD,
  GLYPH,
  HAIRLINE,
  HEAD_INK,
  INDIGO,
  GREEN,
  GREY_TEXT,
  INK,
  NET_LABEL,
  ORANGE,
  RED,
  TILE_BAD_SOFT,
  TILE_BAD_STRONG,
  TILE_EDGE_BAD_SOFT,
  TILE_EDGE_BAD_STRONG,
  TILE_EDGE_GOOD_SOFT,
  TILE_EDGE_GOOD_STRONG,
  TILE_EDGE_NEUTRAL,
  TILE_GOOD_SOFT,
  TILE_GOOD_STRONG,
  TILE_NEUTRAL,
  TINT_BAD,
  TINT_GOOD,
} from "../performance-lab/ui";
import { squarify } from "./treemap";
import {
  dropTwins,
  groupTiles,
  hitOf,
  isFiller,
  MAP_GROUPS,
  MIN_PICKS,
  pairFacts,
  recentForm,
  singleFacts,
  type Fact,
} from "./heat-model";

// Seven named tiles plus Others is what his sheet draws. The floor
// below is what a tile needs to carry a name and a figure at all.
const MAX_TILES = 7;
const MIN_NAMED_TILES = 3;
const MIN_TILE_W = 64;
const MIN_TILE_H = 42;
// The layout frame. Vertical size is exact in px; horizontal size is a
// percentage of this width, so the map fills a 320px phone and a 390px
// phone alike instead of overflowing the narrow one.
const MAP_W = 342;
const MAP_H = 352;
const GAP = 5;
// A tile below this height loses its icon and shrinks its figure,
// because the number is the one thing here that must stay readable.
// The smallest tile his sheet draws is 68px tall and still wears one.
const ICON_MIN_H = 66;
const SMALL_H = 58;
const BIG_H = 150;

const pct = (v: number | null) => (v === null ? "-" : `${(v * 100).toFixed(1)}%`);
const selOf = (chips: Chip[]) =>
  chips.map((c) => `${c.group}~${c.kind}~${c.value}`).join("|");
// Lab opens in the fact's own domain. Without this a Crypto fact
// landed on a Sports-mode Lab and showed nothing.
const labUrl = (f: Fact) =>
  `/preview/performance-lab?sel=${encodeURIComponent(selOf(f.chips))}` +
  (f.domain === "Sports" ? "" : `&domain=${encodeURIComponent(f.domain)}`);

// Type scales with the phone so a 320px screen shrinks the figures
// instead of clipping them, and never grows past the drawn size.
const fluid = (px: number) => `min(${px}px, ${((px / 390) * 100).toFixed(2)}vw)`;

// The figure on a tile is the one thing on this page that must never
// be cropped, and a treemap will hand you a 44px tile. So the money
// shrinks to fit its own tile. Bold Figtree digits run about 0.6em
// wide each, which is what the divisor is.
const fitMoney = (text: string, boxW: number, want: number) =>
  Math.max(9, Math.min(want, (boxW * 0.94) / (text.length * 0.62)));

function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// The tint strengthens with the size of the result WITHIN ITS OWN
// SIGN. Ramped against one shared maximum, every red on a winning
// record sits at the palest step, and the leak the page exists to
// show would be the quietest thing on it.
function tintOf(profit: number, maxGood: number, maxBad: number) {
  if (profit === 0) return { fill: TILE_NEUTRAL, edge: TILE_EDGE_NEUTRAL };
  const good = profit > 0;
  const max = good ? maxGood : maxBad;
  const t = max > 0 ? Math.min(1, Math.abs(profit) / max) : 1;
  return good
    ? {
        fill: mix(TILE_GOOD_SOFT, TILE_GOOD_STRONG, t),
        edge: mix(TILE_EDGE_GOOD_SOFT, TILE_EDGE_GOOD_STRONG, t),
      }
    : {
        fill: mix(TILE_BAD_SOFT, TILE_BAD_STRONG, t),
        edge: mix(TILE_EDGE_BAD_SOFT, TILE_EDGE_BAD_STRONG, t),
      };
}

function Dots({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      {[5.5, 10, 14.5].map((cx) => (
        <circle key={cx} cx={cx} cy="10" r="1.5" fill={GLYPH} />
      ))}
    </svg>
  );
}

function InsightCard({
  kind,
  title,
  name,
  headline,
  meta,
  href,
}: {
  kind: "edge" | "leak" | "hot" | "cool";
  title: string;
  name: string;
  headline: string;
  meta: string;
  href: string;
}) {
  const good = kind === "edge" || kind === "hot";
  const accent = kind === "edge" ? ORANGE : good ? GREEN : RED;
  const disc = kind === "edge" ? AMBER_TILE : good ? TINT_GOOD : TINT_BAD;
  return (
    <Link
      href={href}
      className="min-w-0 flex-1 rounded-[15px] px-[11px] pb-[12px] pt-[11px]"
      style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
    >
      <span
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full"
        style={{ background: disc }}
      >
        {kind === "edge" ? (
          <GoldSparkle size={15} />
        ) : (
          <Arrow kind={kind} colour={accent} />
        )}
      </span>
      <p className="mt-[8px] text-[9.5px] font-semibold" style={{ color: accent }}>
        {title}
      </p>
      <p className="mt-[3px] truncate text-[11.5px] font-bold" style={{ color: INK }}>
        {name}
      </p>
      <p className="mt-[4px] text-[10px] font-bold" style={{ color: good ? GREEN : RED }}>
        {headline}
      </p>
      <p className="mt-[3px] text-[8.5px] font-semibold" style={{ color: GREY_TEXT }}>
        {meta}
      </p>
    </Link>
  );
}

function Arrow({ kind, colour }: { kind: "leak" | "hot" | "cool"; colour: string }) {
  if (kind === "leak")
    return (
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="7" stroke={colour} strokeWidth="1.6" />
        <circle cx="10" cy="10" r="3" stroke={colour} strokeWidth="1.6" />
        <circle cx="10" cy="10" r="0.9" fill={colour} />
      </svg>
    );
  const up = kind === "hot";
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d={up ? "M3.6 13.8l4.2-4.2 2.8 2.8 5.8-6" : "M3.6 6.2l4.2 4.2 2.8-2.8 5.8 6"}
        stroke={colour}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={up ? "M12.6 5.8h3.8v3.8" : "M12.6 14.2h3.8v-3.8"}
        stroke={colour}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Streak = {
  f: Fact;
  form: { wins: number; losses: number; picks: number };
  lift: number;
};

export default function HeatmapApp() {
  const engine = useMemo(() => makeEngine(labBets), []);

  const singles = useMemo(() => singleFacts(engine), [engine]);
  const pairs = useMemo(() => pairFacts(engine, singles), [engine, singles]);
  // One set of picks wears one name across the whole screen. Without
  // this the cards called the same fourteen picks "NBA" while the map
  // called them "Basketball".
  const proven = useMemo(
    () =>
      dropTwins(
        [...singles, ...pairs].filter(
          (f) => f.picks >= MIN_PICKS && f.roi !== null && !isFiller(f)
        )
      ),
    [singles, pairs]
  );

  // The four cards. Each names the record behind its claim, and a
  // claim has to be coherent: an "edge" that loses more often than it
  // wins is not an edge, however flattering its ROI, and a "leak"
  // that wins more than it loses is not a leak. ROI alone on a thin
  // run produced "Strongest Edge: 3-5" on the first build, which is
  // exactly the flattery his record rule exists to stop.
  const cards = useMemo(() => {
    const byRoi = [...proven].sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0));
    const edge = byRoi.find((f) => f.s.wins > f.s.losses && (f.roi ?? 0) > 0);
    const leak = [...byRoi]
      .reverse()
      .find((f) => f.s.losses > f.s.wins && (f.roi ?? 0) < 0);

    // A streak is a fact running away from its own average, so a hot
    // card must actually be above its average and a cool one below.
    // Without the guard, a record with no cooling fact anywhere still
    // printed "Cooling Off" over its second best form.
    const streaks: Streak[] = proven
      .map((f) => {
        const form = recentForm(engine, f.chips, 10);
        const recent = hitOf(form);
        const overall = hitOf(f.s);
        return {
          f,
          form,
          lift: recent !== null && overall !== null ? recent - overall : 0,
        };
      })
      .filter((x) => x.form.picks >= 6);

    // Four cards, four different facts. Taking the top of each list
    // blindly let one fact fill two cards.
    const used = new Set<string>();
    if (edge) used.add(edge.key);
    if (leak) used.add(leak.key);
    const hot = [...streaks]
      .sort((a, b) => b.lift - a.lift)
      .find((x) => x.lift > 0.05 && !used.has(x.f.key));
    if (hot) used.add(hot.f.key);
    const cool = [...streaks]
      .sort((a, b) => a.lift - b.lift)
      .find((x) => x.lift < -0.05 && !used.has(x.f.key));
    return { edge, leak, hot, cool };
  }, [engine, proven]);

  // The map: one group, drawn whole. Every value of a group is
  // exclusive, so these tiles partition the record and their figures
  // add up to its net profit.
  const [group, setGroup] = useState<GroupKey>("sport");
  const [groupOpen, setGroupOpen] = useState(false);

  const tiles = useMemo(() => {
    const { tiles: taken, othersProfit, othersPicks } = groupTiles(
      engine,
      group,
      MAX_TILES
    );
    if (taken.length === 0) return [];

    type Cell = {
      key: string;
      label: string;
      profit: number;
      fact: Fact | null;
    };
    const named: Cell[] = taken.map((f) => ({
      key: f.key,
      label: f.label,
      profit: f.s.profit,
      fact: f,
    }));
    let rest = othersPicks > 0 ? othersProfit : 0;

    // A treemap will happily hand you a 40px sliver, and a sliver
    // cannot carry a name or a figure. So the smallest tile keeps
    // folding into Others until every tile left can be read. Nothing
    // is lost: Others is a real tile with a real number.
    const withRest = (cells: Cell[], profit: number): Cell[] =>
      Math.abs(profit) >= 1
        ? [...cells, { key: "others", label: "Others", profit, fact: null }]
        : cells;
    const lay = (cells: Cell[]) =>
      squarify(
        cells.map((c) => ({ key: c.key, value: Math.abs(c.profit) })),
        MAP_W,
        MAP_H
      );

    let cells = withRest(named, rest);
    let laid = lay(cells);
    while (
      named.length > MIN_NAMED_TILES &&
      laid.some((t) => t.w - GAP < MIN_TILE_W || t.h - GAP < MIN_TILE_H)
    ) {
      const smallest = named.reduce((a, b) =>
        Math.abs(a.profit) <= Math.abs(b.profit) ? a : b
      );
      named.splice(named.indexOf(smallest), 1);
      rest += smallest.profit;
      cells = withRest(named, rest);
      laid = lay(cells);
    }

    const maxGood = Math.max(...cells.map((c) => (c.profit > 0 ? c.profit : 0)), 1);
    const maxBad = Math.max(...cells.map((c) => (c.profit < 0 ? -c.profit : 0)), 1);
    return laid.map((t) => {
      const cell = cells.find((c) => c.key === t.key)!;
      return { ...t, ...cell, ...tintOf(cell.profit, maxGood, maxBad) };
    });
  }, [engine, group]);

  const { edge, leak, hot, cool } = cards;

  return (
    <>
      {/* The header: back to Home, the title, and the insight sparkle
          the brief puts on every Performance screen. */}
      <div className="relative mt-[10px] flex h-[40px] items-center px-[15px]">
        <Link
          href="/preview/performance-home"
          aria-label="Back to Home"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
          style={{ background: CARD, boxShadow: "0 1px 4px rgba(24,20,50,0.08)" }}
        >
          <span className="rotate-180">
            <Chev size={12} color={INK} />
          </span>
        </Link>
        <p className="pointer-events-none absolute inset-x-0 text-center text-[15px] font-bold">
          Heat Map
        </p>
        <span className="ml-auto flex h-[30px] w-[30px] items-center justify-center">
          <GoldSparkle size={19} />
        </span>
      </div>
      <p
        className="relative mt-[6px] text-center text-[10px] font-semibold"
        style={{ color: GREY_TEXT }}
      >
        See where your money works and where it leaks.
      </p>

      {/* Four findings, each a door into Lab. A card is left out when
          the record cannot support it, rather than inventing one. */}
      <div className="relative mt-[13px] flex gap-[9px] px-[15px]">
        {edge ? (
          <InsightCard
            kind="edge"
            title="Strongest Edge"
            name={edge.label}
            headline={`+${pct(edge.roi)} ROI`}
            meta={`${edge.s.wins}–${edge.s.losses} record`}
            href={labUrl(edge)}
          />
        ) : null}
        {leak ? (
          <InsightCard
            kind="leak"
            title="Biggest Leak"
            name={leak.label}
            headline={`${pct(leak.roi)} ROI`}
            meta={`${leak.s.wins}–${leak.s.losses} record`}
            href={labUrl(leak)}
          />
        ) : null}
      </div>
      {hot || cool ? (
        <div className="relative mt-[9px] flex gap-[9px] px-[15px]">
          {hot ? (
            <InsightCard
              kind="hot"
              title="New Pattern"
              name={hot.f.label}
              headline="Hot streak"
              meta={`${hot.form.wins}–${hot.form.losses} in last ${hot.form.picks} picks`}
              href={labUrl(hot.f)}
            />
          ) : null}
          {cool ? (
            <InsightCard
              kind="cool"
              title="Cooling Off"
              name={cool.f.label}
              headline="Cooling off"
              meta={`${cool.form.wins}–${cool.form.losses} in last ${cool.form.picks} picks`}
              href={labUrl(cool.f)}
            />
          ) : null}
        </div>
      ) : null}

      {/* The map. Area is the share of the result, colour is which way
          it went, and every tile opens Lab on that fact. */}
      <div
        className="relative mx-[15px] mt-[12px] rounded-[16px] px-[9px] pb-[11px] pt-[11px]"
        style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
      >
        <div className="flex items-center justify-between pl-[3px] pr-[2px]">
          <p
            className="flex items-center gap-[3px] text-[10.5px] font-semibold"
            style={{ color: NET_LABEL }}
          >
            Performance map
            <InfoDot size={12} />
          </p>
          {/* One group at a time is what makes the tiles add up, so the
              group is a control rather than a fixed choice. It opens on
              Sport: "where am I leaking, baseball, hockey or
              football" is the question this page was born from. */}
          <div className="relative">
            <button
              onClick={() => setGroupOpen((o) => !o)}
              aria-label="Change what the map splits by"
              className="flex items-center gap-[4px] text-[9px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: HEAD_INK }}
            >
              By {MAP_GROUPS.find((g) => g.key === group)!.label}
              <ChevDown size={11} />
            </button>
            {groupOpen ? (
              <>
                <button
                  aria-label="Close map groups"
                  onClick={() => setGroupOpen(false)}
                  className="fixed inset-0 z-10"
                />
                <div
                  className="absolute right-0 top-[20px] z-20 w-[140px] rounded-[12px] py-[5px]"
                  style={{
                    background: CARD,
                    boxShadow: `0 10px 24px rgba(28,24,58,0.14), inset 0 0 0 1px ${HAIRLINE}`,
                  }}
                >
                  {MAP_GROUPS.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => {
                        setGroupOpen(false);
                        setGroup(g.key);
                      }}
                      className="flex w-full items-center justify-between px-[13px] py-[7px] text-left text-[10.5px] font-semibold"
                      style={{ color: g.key === group ? INDIGO : NET_LABEL }}
                    >
                      {g.label}
                      {g.key === group ? <Chev size={9} color={INDIGO} /> : null}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
        {tiles.length === 0 ? (
          <p
            className="flex h-[120px] items-center justify-center px-[20px] text-center text-[10.5px] font-semibold"
            style={{ color: GREY_TEXT }}
          >
            Settle a few bets and the map fills in.
          </p>
        ) : (
          <div className="relative mt-[8px]" style={{ height: MAP_H }}>
            {tiles.map((t) => {
              const h = t.h - GAP;
              const w = t.w - GAP;
              const band = h >= BIG_H && w >= 120 ? 2 : h >= SMALL_H && w >= 84 ? 1 : 0;
              const pad = band === 0 ? 7 : 9;
              const nameSize = [9.5, 10.5, 11.5][band];
              const figure = money(t.profit);
              const moneySize = fitMoney(figure, w - pad * 2, [12.5, 15.5, 20][band]);
              const withIcon = h >= ICON_MIN_H && w >= 46;
              const neutral = t.fact === null;
              const inner = (
                <>
                  {withIcon ? (
                    <span
                      className="flex items-center justify-center rounded-full"
                      style={{
                        background: neutral ? TILE_EDGE_NEUTRAL : t.edge,
                        width: band === 2 ? 30 : 26,
                        height: band === 2 ? 30 : 26,
                      }}
                    >
                      {neutral ? (
                        <Dots size={14} />
                      ) : (
                        chipIcon(t.fact!.chips[0], false, undefined, band === 2 ? 15 : 13)
                      )}
                    </span>
                  ) : null}
                  <span className="mt-auto block min-w-0">
                    <span
                      className="block truncate font-bold"
                      style={{ color: INK, fontSize: fluid(nameSize) }}
                    >
                      {t.label}
                    </span>
                    <span
                      className="mt-[1px] block truncate font-bold leading-tight"
                      style={{
                        color: neutral ? NET_LABEL : t.profit > 0 ? GREEN : RED,
                        fontSize: fluid(moneySize),
                      }}
                    >
                      {figure}
                    </span>
                  </span>
                </>
              );
              // Horizontal geometry is a percentage of the frame, so
              // the map fits a 320px phone; vertical geometry is the
              // drawn pixels.
              const style = {
                left: `calc(${((t.x / MAP_W) * 100).toFixed(4)}% + ${GAP / 2}px)`,
                width: `calc(${((t.w / MAP_W) * 100).toFixed(4)}% - ${GAP}px)`,
                top: t.y + GAP / 2,
                height: Math.max(0, h),
                background: neutral ? TILE_NEUTRAL : t.fill,
                boxShadow: `inset 0 0 0 1px ${neutral ? TILE_EDGE_NEUTRAL : t.edge}`,
                padding: `${pad}px`,
              } as const;
              const className =
                "absolute flex flex-col overflow-hidden rounded-[11px]";
              return neutral ? (
                <div key={t.key} className={className} style={style}>
                  {inner}
                </div>
              ) : (
                <Link
                  key={t.key}
                  href={labUrl(t.fact!)}
                  className={className}
                  style={style}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <p
        className="relative mt-[9px] flex items-center justify-center gap-[4px] px-[15px] text-center text-[8.5px] font-semibold"
        style={{ color: GREY_TEXT }}
      >
        <InfoDot size={11} />
        Size shows impact on your results, color shows profit or loss.
      </p>

      <div className="min-h-[8px]" />
    </>
  );
}
