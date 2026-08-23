"use client";

// CONCEPT 2, "THE PORTFOLIO". Local preview, gitignored. One engine,
// two skins (wire=true grey wireframe, else the sampled palette).
//
// THE MODEL, in the owner's words: ONE RANKED LIST MIXING ALL
// DIMENSIONS FREELY. Actuals continuously asks "what are the most
// meaningful facts about this bettor right now?" and ranks them. The
// user opens "Your performance" and sees Moneyline next to Premier
// League next to Parlays: no groups, no taxonomy, no structure to
// learn. The complexity is not hidden, it is deferred until relevant.
//
// RANKING IS MEANINGFULNESS, NOT RAW P&L. A fact's score is its
// money weighted by the evidence behind it, so two lucky bets cannot
// outrank a two-hundred-bet habit:
//   score = |profit| * sqrt(picks / (picks + 10))
// The real build grows this with exposure, recency, consistency and
// change over time; the shape stays the same. Near-identical facts
// (Baseball and MLB carrying the same bets) dedupe to one line.
//
// EVERY FACT HAS ITS OWN PAGE, like a holding: chart, the four stat
// boxes, then "Inside", ranked rows that are already intersections
// (Moneyline in the Premier League, Moneyline as Parlays), each row
// a deeper page. Leaks sink to their own red-tinted section of the
// list, because "where am I losing" deserves its own address.

import { useMemo, useState } from "react";
import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";

type GroupKey = "sport" | "what" | "where" | "when" | "how" | "risk";
type Chip = { group: GroupKey; kind: "category" | "market" | "plain"; value: string };

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
  Wimbledon: "\u{1F3BE}",
  "Roland Garros": "\u{1F3BE}",
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
interface Stats {
  wins: number;
  losses: number;
  profit: number;
  staked: number;
  bets: number;
}
function money(v: number): string {
  const r = Math.round(v);
  return `${r < 0 ? "-" : "+"}$${Math.abs(r).toLocaleString("en-US")}`;
}

// Meaningfulness: money shrunk by thin evidence.
function scoreOf(s: Stats): number {
  const picks = s.wins + s.losses;
  return Math.abs(s.profit) * Math.sqrt(picks / (picks + 10));
}

interface Fact {
  chip: Chip;
  s: Stats;
  score: number;
}

export default function Portfolio({
  bets,
  wire,
}: {
  bets: BetWithLegs[];
  wire: boolean;
}) {
  // The path: [] is the list; one or more chips is a fact page.
  const [path, setPath] = useState<Chip[]>([]);

  const settled = useMemo(
    () => bets.filter((b) => b.status !== "pending" && b.settled_at !== null),
    [bets]
  );

  function statsFor(filters: Chip[]): Stats {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const s: Stats = { wins: 0, losses: 0, profit: 0, staked: 0, bets: 0 };
    for (const bet of settled) {
      const shares = legShares(bet);
      const stakes = legStakeShares(bet);
      const isSingle = bet.legs.length === 1;
      let any = false;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        any = true;
        const result = effectiveResult(bet, leg);
        const picks = isSingle ? pickCount(bet) : 1;
        if (result === "won") s.wins += picks;
        if (result === "lost") s.losses += picks;
        s.profit += shares[i] ?? 0;
        s.staked += stakes[i] ?? 0;
      });
      if (any) s.bets += 1;
    }
    return s;
  }

  const board = useMemo(() => {
    const out: Chip[] = [];
    const seen = new Set<string>();
    for (const bet of settled) {
      for (const leg of bet.legs) {
        for (const g of GROUP_ORDER) {
          const v = valueOf(bet, leg, g);
          if (v === null) continue;
          const key = `${g}|${v}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            group: g,
            kind: g === "what" ? "category" : "plain",
            value: v,
          });
        }
      }
    }
    return out;
  }, [settled]);

  // Rank facts within a context, mixing every dimension. Near-
  // identical facts (same record, same money: MLB carrying exactly
  // Baseball's bets) collapse to the first by score.
  function rankedFacts(context: Chip[], minPicks: number): Fact[] {
    const facts: Fact[] = [];
    for (const chip of board) {
      if (context.some((c) => c.group === chip.group)) continue;
      if (MUTED.has(chip.value)) continue;
      const s = statsFor([...context, chip]);
      const picks = s.wins + s.losses;
      if (picks < minPicks) continue;
      const whole = statsFor(context);
      if (picks > 0.85 * (whole.wins + whole.losses)) continue;
      facts.push({ chip, s, score: scoreOf(s) });
    }
    facts.sort((a, b) => b.score - a.score);
    const seen = new Set<string>();
    return facts.filter(({ s }) => {
      const sig = `${s.wins}|${s.losses}|${Math.round(s.profit)}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  const listFacts = useMemo(() => rankedFacts([], 5), [board, settled]); // eslint-disable-line react-hooks/exhaustive-deps
  const earners = listFacts.filter((f) => f.s.profit >= 0).slice(0, 7);
  const leaks = listFacts.filter((f) => f.s.profit < 0).slice(0, 4);

  const total = statsFor([]);
  const here = statsFor(path);
  const hereName = path.map((c) => c.value).join(" · ");
  const inside = path.length > 0 ? rankedFacts(path, 2).slice(0, 6) : [];

  const hit = (s: Stats) =>
    s.wins + s.losses > 0
      ? `${Math.round((s.wins / (s.wins + s.losses)) * 100)}%`
      : "-";
  const roiOf = (s: Stats) =>
    s.staked > 0 ? `${((s.profit / s.staked) * 100).toFixed(1)}%` : "-";

  const cls = wire ? "pfw" : "pfk";

  function Row({
    f,
    rank,
    depth,
  }: {
    f: Fact;
    rank: number | null;
    depth: boolean;
  }) {
    return (
      <button
        type="button"
        className={`${cls}-row ${f.s.profit < 0 ? "leak" : ""}`}
        onClick={() => setPath([...path, f.chip])}
      >
        {rank !== null && <span className={`${cls}-rank`}>{rank}</span>}
        {!wire && (
          <span className={`${cls}-ic`}>{ICONS[f.chip.value] ?? "\u{1F4CA}"}</span>
        )}
        <span className={`${cls}-name`}>
          <b>
            {depth ? "" : ""}
            {f.chip.value}
          </b>
          <i>
            {f.s.wins}-{f.s.losses} · {hit(f.s)} hit · {roiOf(f.s)} ROI
          </i>
        </span>
        <span
          className={`${cls}-money ${f.s.profit >= 0 ? "pos" : "neg"}`}
        >
          {money(f.s.profit)}
        </span>
        <span className={`${cls}-chev`}>›</span>
      </button>
    );
  }

  return (
    <div className={cls}>
      <style>{wire ? WIRE_CSS : MOCK_CSS}</style>
      <div className={`${cls}-max`}>
        {wire && (
          <p className="pfw-note">
            WIREFRAME of Concept 2, THE PORTFOLIO. One ranked list
            mixing ALL dimensions freely: Actuals asks what the most
            meaningful facts about this bettor are right now, and
            ranks them. Score = money weighted by evidence
            (|profit| x sqrt(picks/(picks+10))), so two lucky bets
            cannot outrank a long habit. No groups. No taxonomy on
            screen. Tap a fact for its page; its Inside rows are
            ready-made intersections, each a deeper page.
          </p>
        )}

        {path.length === 0 ? (
          <>
            <p className={`${cls}-k`}>Your performance</p>
            <p className={`${cls}-total`}>
              <b className={total.profit >= 0 ? "pos" : "neg"}>
                {money(total.profit)}
              </b>{" "}
              · {total.wins}-{total.losses} · {hit(total)} hit ·{" "}
              {roiOf(total)} ROI
            </p>
            <div className={`${cls}-list`}>
              {earners.map((f, i) => (
                <Row key={f.chip.value} f={f} rank={i + 1} depth={false} />
              ))}
            </div>
            {leaks.length > 0 && (
              <>
                <p className={`${cls}-k ${cls}-leakhead`}>Where you leak</p>
                <div className={`${cls}-list`}>
                  {leaks.map((f) => (
                    <Row key={f.chip.value} f={f} rank={null} depth={false} />
                  ))}
                </div>
              </>
            )}
            <p className={`${cls}-all`}>
              {wire
                ? "All facts › (the demoted directory: every dimension and value, for the rare question the list did not surface)"
                : "All facts ›"}
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`${cls}-back`}
              onClick={() => setPath(path.slice(0, -1))}
            >
              ‹ Back
            </button>
            <p className={`${cls}-k`}>
              {!wire && path.length === 1 && ICONS[path[0].value]
                ? `${ICONS[path[0].value]} `
                : ""}
              {hereName}
            </p>
            <p className={`${cls}-big ${here.profit >= 0 ? "pos" : "neg"}`}>
              {money(here.profit)}
            </p>
            <div className={`${cls}-tiles`}>
              <span>
                <b>{here.bets}</b>
                <i>Bets</i>
              </span>
              <span>
                <b>
                  {here.wins}-{here.losses}
                </b>
                <i>Record</i>
              </span>
              <span>
                <b>{hit(here)}</b>
                <i>Hit rate</i>
              </span>
              <span>
                <b>{roiOf(here)}</b>
                <i>ROI</i>
              </span>
            </div>
            <div className={`${cls}-chart`}>
              {wire ? "[ trend chart for this fact ]" : "[ chart ]"}
            </div>
            {inside.length > 0 && (
              <>
                <p className={`${cls}-k`}>
                  Inside {hereName}
                  {wire && (
                    <span className="pfw-hint">
                      {" "}
                      · ready-made intersections, ranked the same way.
                      Each row is a deeper page.
                    </span>
                  )}
                </p>
                <div className={`${cls}-list`}>
                  {inside.map((f) => (
                    <Row key={f.chip.value} f={f} rank={null} depth />
                  ))}
                </div>
              </>
            )}
            <p className={`${cls}-all`}>
              Compare {hereName} with... › &nbsp;&nbsp; See the{" "}
              {here.bets} bets ›
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const WIRE_CSS = `
  .pfw { min-height: 100svh; background: #fff; color: #111;
    padding: 20px 16px 40px; }
  [data-theme="dark"] .pfw { background: #111; color: #eee; }
  .pfw * { box-sizing: border-box; }
  .pfw-max { max-width: 460px; margin: 0 auto; }
  .pfw-note { border: 1px dashed #bbb; padding: 8px 10px; font-size: 11px;
    color: #888; margin-bottom: 14px; }
  .pfw .pos { color: #15803d; } .pfw .neg { color: #dc2626; }
  [data-theme="dark"] .pfw .pos { color: #34d399; }
  [data-theme="dark"] .pfw .neg { color: #f87171; }
  .pfw-k { font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.06em; color: #888; margin: 14px 0 6px; }
  .pfw-hint { text-transform: none; letter-spacing: 0; }
  .pfw-total { font-size: 15px; margin: 0 0 10px; }
  .pfw-list { border-top: 1px solid #ddd; }
  [data-theme="dark"] .pfw-list { border-top-color: #333; }
  .pfw-row { display: flex; align-items: center; gap: 10px; width: 100%;
    border: none; border-bottom: 1px solid #ddd; background: none;
    color: inherit; font-family: inherit; text-align: left;
    padding: 10px 2px; cursor: pointer; }
  [data-theme="dark"] .pfw-row { border-bottom-color: #333; }
  .pfw-row.leak { background: rgba(220,38,38,0.05); }
  .pfw-rank { font-size: 12px; color: #888; width: 16px; flex: none; }
  .pfw-name { min-width: 0; flex: 1; }
  .pfw-name b { display: block; font-size: 14px; font-weight: 700; }
  .pfw-name i { font-style: normal; font-size: 11px; color: #888; }
  .pfw-money { font-size: 14px; font-weight: 700; flex: none; }
  .pfw-chev { color: #888; flex: none; }
  .pfw-all { font-size: 12px; color: #888; margin-top: 12px; }
  .pfw-back { border: 1px solid #999; background: none; color: inherit;
    font: inherit; padding: 2px 8px; cursor: pointer; margin-bottom: 6px; }
  .pfw-big { font-size: 30px; font-weight: 700; margin: 2px 0 8px; }
  .pfw-tiles { display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 6px; margin-bottom: 10px; }
  .pfw-tiles span { border: 1px solid #ccc; padding: 8px 6px;
    text-align: center; }
  .pfw-tiles b { display: block; font-size: 14px; }
  .pfw-tiles i { font-style: normal; font-size: 9px; color: #888;
    text-transform: uppercase; letter-spacing: 0.06em; }
  .pfw-chart { border: 1px dashed #bbb; color: #999; font-size: 11px;
    text-align: center; padding: 26px 0; margin-bottom: 6px; }
`;

const MOCK_CSS = `
  .pfk { min-height: 100svh; background: #FFFFFF; color: #171717;
    padding: 24px 16px 48px;
    --pf-muted: #737373; --pf-inner: #F6F6F8;
    --pf-ring: rgba(23,23,23,0.10); --pf-leak: rgba(239,68,68,0.06); }
  [data-theme="dark"] .pfk { background: #090B17; color: #F4F4F6;
    --pf-muted: #9CA3AF; --pf-inner: #1B1D30;
    --pf-ring: rgba(255,255,255,0.08); --pf-leak: rgba(248,113,113,0.07); }
  .pfk * { box-sizing: border-box; }
  .pfk-max { max-width: 430px; margin: 0 auto; }
  .pfk .pos { color: #12A150; } .pfk .neg { color: #EF4444; }
  [data-theme="dark"] .pfk .pos { color: #4ADE80; }
  [data-theme="dark"] .pfk .neg { color: #F87171; }
  .pfk-k { font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--pf-muted); margin: 16px 0 8px; }
  .pfk-total { font-size: 22px; font-weight: 600; margin: 0 0 12px;
    font-variant-numeric: tabular-nums; }
  .pfk-total b { font-weight: 600; }
  .pfk-list { background: var(--pf-inner); border-radius: 16px;
    padding: 4px 12px; }
  .pfk-row { display: flex; align-items: center; gap: 10px; width: 100%;
    border: none; border-bottom: 1px solid var(--pf-ring);
    background: none; color: inherit; font-family: inherit;
    text-align: left; padding: 11px 0; cursor: pointer; }
  .pfk-row:last-child { border-bottom: none; }
  .pfk-row.leak { }
  .pfk-rank { font-size: 12px; font-weight: 700; color: var(--pf-muted);
    width: 16px; flex: none; font-variant-numeric: tabular-nums; }
  .pfk-ic { width: 34px; height: 34px; border-radius: 999px;
    background: #FFFFFF; box-shadow: 0 0 0 1px var(--pf-ring);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex: none; }
  [data-theme="dark"] .pfk-ic { background: #131524; }
  .pfk-name { min-width: 0; flex: 1; }
  .pfk-name b { display: block; font-size: 14px; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pfk-name i { font-style: normal; font-size: 11px; color: var(--pf-muted);
    font-variant-numeric: tabular-nums; }
  .pfk-money { font-size: 14px; font-weight: 700; flex: none;
    font-variant-numeric: tabular-nums; }
  .pfk-chev { color: var(--pf-muted); flex: none; font-weight: 700; }
  .pfk-leakhead { color: #EF4444; }
  [data-theme="dark"] .pfk-leakhead { color: #F87171; }
  .pfk-all { font-size: 13px; font-weight: 600; color: #430EDB;
    margin-top: 14px; }
  [data-theme="dark"] .pfk-all { color: #8B5CF6; }
  .pfk-back { border: none; background: var(--pf-inner); color: inherit;
    font-family: inherit; font-size: 12px; font-weight: 700;
    padding: 5px 12px; border-radius: 999px; cursor: pointer;
    margin-bottom: 8px; }
  .pfk-big { font-size: 34px; font-weight: 600; margin: 2px 0 10px;
    font-variant-numeric: tabular-nums; }
  .pfk-tiles { display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; margin-bottom: 12px; }
  .pfk-tiles span { background: var(--pf-inner); border-radius: 12px;
    padding: 10px 6px; text-align: center; }
  .pfk-tiles b { display: block; font-size: 15px; font-weight: 600;
    font-variant-numeric: tabular-nums; }
  .pfk-tiles i { font-style: normal; font-size: 9px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--pf-muted); }
  .pfk-chart { background: var(--pf-inner); border-radius: 14px;
    color: var(--pf-muted); font-size: 11px; text-align: center;
    padding: 34px 0; margin-bottom: 6px; }
`;
