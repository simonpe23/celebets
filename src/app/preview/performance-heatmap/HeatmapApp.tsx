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
// 2. THE TILES ARE HOME'S RANKED FACTS. His ruling, 29 August 2026:
//    "i don't want to filter on category or sport here. i want same
//    mechanics as the home page - regardless of sport, league,
//    category, market - this heat maps should show best performances
//    regardless of what filter." The map calls the engine's own
//    `rankedFacts([], 5)`, the same call Home's ranked rows make, so
//    the two screens cannot disagree about what matters. Twins are
//    dropped, because two tiles for one set of bets would paint the
//    same money twice.
//
//    Those facts overlap by design, so the tiles do not add up to the
//    record's net profit and are not meant to. A tile's size is how
//    much THAT fact moved, which is exactly what the caption claims.
//
// Tapping a tile opens Lab with that fact selected, his ruling of
// 26 August 2026, and the figure on the tile is the figure Lab shows.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { money, makeEngine, type Chip } from "../pf/engine";
import { labBets } from "../performance-lab/lab-data";
import { chipIcon } from "../performance-lab/LabApp";
import Explain from "../performance-lab/Explain";
import PeriodPill from "../performance-lab/PeriodPill";
import {
  betsIn,
  isPeriod,
  withPeriod,
  type PeriodKey,
} from "../performance-lab/period";
import { Chev, GoldSparkle, InfoDot } from "../performance-home/icons";
import {
  AMBER_TILE,
  CARD,
  GLYPH,
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
  rankedTiles,
  hitOf,
  isFiller,
  MIN_PICKS,
  pairFacts,
  recentForm,
  singleFacts,
  type Fact,
} from "./heat-model";

// Eight tiles, with the top three earners and the top three leaks
// guaranteed a seat. His ruling, 29 August 2026: "i would like to
// have at least eight performance map cards, and i want at least
// three red and at least three green." There is no Others tile: see
// heat-model.ts, rule 3.
const MAP_TILES = 8;
const MIN_GOOD_TILES = 3;
const MIN_BAD_TILES = 3;
// The layout frame. Vertical size is exact in px; horizontal size is a
// percentage of this width, so the map fills a 320px phone and a 390px
// phone alike instead of overflowing the narrow one.
//
// The map is TALL because he ruled it the point of the page: "I want
// the heat map cards to take off more space... The performance map is
// the most important thing of this." The four insight cards above it
// gave up more than half their height to pay for this.
const MAP_W = 342;
const MAP_H = 486;
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
const labUrl = (f: Fact, period: PeriodKey) =>
  withPeriod(
    `/preview/performance-lab?sel=${encodeURIComponent(selOf(f.chips))}` +
      (f.domain === "Sports" ? "" : `&domain=${encodeURIComponent(f.domain)}`),
    period
  );

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

// A COMPACT card, his ruling of 29 August 2026: "i want the strongest
// edge, biggest leak, new pattern, and cooling off cards to be much
// smaller. They don't need to take up almost half the page." Still two
// rows of two, as he asked, but the disc moved beside the text instead
// of sitting above it, and the headline and the record share one line.
// That is 119px of card down to 55px, and the map took the difference.
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
      className="flex min-w-0 flex-1 items-center gap-[8px] rounded-[13px] py-[9px] pl-[9px] pr-[10px]"
      style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
    >
      <span
        className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full"
        style={{ background: disc }}
      >
        {kind === "edge" ? (
          <GoldSparkle size={12} />
        ) : (
          <Arrow kind={kind} colour={accent} size={12} />
        )}
      </span>
      <span className="block min-w-0 flex-1">
        <span
          className="block truncate text-[8.5px] font-semibold"
          style={{ color: accent }}
        >
          {title}
        </span>
        <span
          className="mt-[1px] block truncate text-[11px] font-bold"
          style={{ color: INK }}
        >
          {name}
        </span>
        <span className="mt-[2px] flex items-baseline gap-[4px]">
          <span
            className="shrink-0 text-[9px] font-bold"
            style={{ color: good ? GREEN : RED }}
          >
            {headline}
          </span>
          <span
            className="min-w-0 truncate text-[8.5px] font-semibold"
            style={{ color: GREY_TEXT }}
          >
            {meta}
          </span>
        </span>
      </span>
    </Link>
  );
}

function Arrow({
  kind,
  colour,
  size = 15,
}: {
  kind: "leak" | "hot" | "cool";
  colour: string;
  size?: number;
}) {
  if (kind === "leak")
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="7" stroke={colour} strokeWidth="1.6" />
        <circle cx="10" cy="10" r="3" stroke={colour} strokeWidth="1.6" />
        <circle cx="10" cy="10" r="0.9" fill={colour} />
      </svg>
    );
  const up = kind === "hot";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
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
  // Job 4. The whole page follows the period: the four cards, the map
  // and the streak windows, because the engine itself is built from
  // the filtered record.
  const params = useSearchParams();
  const rawPeriod = params.get("period");
  const [period, setPeriod] = useState<PeriodKey>(
    isPeriod(rawPeriod) ? rawPeriod : "all"
  );
  const [periodOpen, setPeriodOpen] = useState(false);
  const engine = useMemo(() => makeEngine(betsIn(labBets, period)), [period]);

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

  // The map: the biggest movers in the whole record, whichever group
  // they come from, with the rest of the ranked list gathered into
  // one grey Others exactly as his sheet draws it.
  const tiles = useMemo(() => {
    const taken = rankedTiles(engine, MAP_TILES, MIN_GOOD_TILES, MIN_BAD_TILES);
    if (taken.length === 0) return [];

    const cells = taken.map((f) => ({
      key: f.key,
      label: f.label,
      profit: f.s.profit,
      fact: f,
    }));
    const laid = squarify(
      cells.map((c) => ({ key: c.key, value: Math.abs(c.profit) })),
      MAP_W,
      MAP_H
    );
    const maxGood = Math.max(...cells.map((c) => (c.profit > 0 ? c.profit : 0)), 1);
    const maxBad = Math.max(...cells.map((c) => (c.profit < 0 ? -c.profit : 0)), 1);
    return laid.map((t) => {
      const cell = cells.find((c) => c.key === t.key)!;
      return { ...t, ...cell, ...tintOf(cell.profit, maxGood, maxBad) };
    });
  }, [engine]);

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
      <div className="relative z-30 mt-[8px] flex justify-center">
        <PeriodPill
          period={period}
          onPick={setPeriod}
          open={periodOpen}
          setOpen={setPeriodOpen}
          align="left"
        />
      </div>

      {/* Four findings, each a door into Lab. A card is left out when
          the record cannot support it, rather than inventing one. */}
      <div className="relative mt-[11px] flex gap-[8px] px-[15px]">
        {edge ? (
          <InsightCard
            kind="edge"
            title="Strongest Edge"
            name={edge.label}
            headline={`+${pct(edge.roi)} ROI`}
            meta={`${edge.s.wins}–${edge.s.losses} record`}
            href={labUrl(edge, period)}
          />
        ) : null}
        {leak ? (
          <InsightCard
            kind="leak"
            title="Biggest Leak"
            name={leak.label}
            headline={`${pct(leak.roi)} ROI`}
            meta={`${leak.s.wins}–${leak.s.losses} record`}
            href={labUrl(leak, period)}
          />
        ) : null}
      </div>
      {hot || cool ? (
        <div className="relative mt-[7px] flex gap-[8px] px-[15px]">
          {hot ? (
            <InsightCard
              kind="hot"
              title="New Pattern"
              name={hot.f.label}
              headline="Hot streak"
              meta={`${hot.form.wins}–${hot.form.losses} in last ${hot.form.picks} picks`}
              href={labUrl(hot.f, period)}
            />
          ) : null}
          {cool ? (
            <InsightCard
              kind="cool"
              title="Cooling Off"
              name={cool.f.label}
              headline="Cooling off"
              meta={`${cool.form.wins}–${cool.form.losses} in last ${cool.form.picks} picks`}
              href={labUrl(cool.f, period)}
            />
          ) : null}
        </div>
      ) : null}

      {/* The map. Area is the share of the result, colour is which way
          it went, and every tile opens Lab on that fact. */}
      <div
        className="relative mx-[15px] mt-[10px] rounded-[16px] px-[9px] pb-[11px] pt-[11px]"
        style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
      >
        <p
          className="flex items-center gap-[3px] pl-[3px] text-[10.5px] font-semibold"
          style={{ color: NET_LABEL }}
        >
          Performance map
          <Explain term="Performance map" />
        </p>
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
                  href={labUrl(t.fact!, period)}
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
        <Explain term="Map sizing" size={11} />
        Size shows impact on your results, color shows profit or loss.
      </p>

      <div className="min-h-[8px]" />
    </>
  );
}
