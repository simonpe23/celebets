// What the Heat Map knows. Every fact and every insight is computed
// from Lab's fixture through the same engine the other three pages
// use, so nothing here can disagree with them.
//
// Three rules this file exists to keep:
//
// 1. EVIDENCE FLOOR. A fact with a 2-0 record is not an edge, and the
//    owner's rule is old and firm: "30-16 is a better and more
//    impressive hit rate than 5-0 in betting." A fact must clear
//    MIN_PICKS before it can be called an edge or a leak, and the
//    card always shows the record behind the claim.
//
// 2. TWINS. Every American Football bet is an NFL bet, so the two are
//    one set of picks under two names. Showing both in a treemap
//    doubles that money's area, and showing one on a card while the
//    other sits in the map names the same bets twice on one screen.
//    Twins are found by comparing the ACTUAL picks a fact covers, not
//    by comparing records, because two unrelated facts can share a
//    record by coincidence. Where a twin pair loses a member, the
//    SPORT survives: the founding question is "where am I leaking,
//    baseball, hockey or football", and those words must never
//    disappear.
//
// 3. THE MAP IS A PARTITION OF ONE GROUP. Every pick has exactly one
//    sport, one category, one league, one period, one bet type and one
//    odds bucket, so the values inside a single group never overlap.
//    Draw the map from one group and the tiles add up to the record's
//    net profit exactly, every tile carries its own true figure, and
//    the small tail is one honest Others.
//
//    Mixing groups is what breaks it. Ranked by size alone, Moneyline,
//    Parlays, Medium odds and Football all draw the same money: eight
//    tiles summed to $11,637 on a $2,637 record under a caption saying
//    size means impact. Picking mixed facts that merely do not overlap
//    is no better: it leaves a grey Others bigger than every real tile.

import { domainOf, type Domain } from "@/lib/taxonomy";
import type { Sport } from "@/lib/types";
import { legShares } from "@/lib/stats";
import { MUTED, type Chip, type Engine, type GroupKey, type Stats } from "../pf/engine";

export const MIN_PICKS = 12;

export type Fact = {
  chips: Chip[];
  label: string;
  key: string;
  domain: Domain;
  s: Stats;
  roi: number | null;
  picks: number;
  // Every pick this fact covers, as "betId#legIndex". Two facts are
  // the same fact when these match.
  covers: Set<string>;
};

const GROUPS: GroupKey[] = ["sport", "what", "where", "when", "how", "risk"];

// His corrected names and order, 29 August 2026: "Sport, League (swap
// name from Where), Category (Swap What you Bet), When, Bet Type (Swap
// from How), Risk (Odds Range)."
export const MAP_GROUPS: { key: GroupKey; label: string }[] = [
  { key: "sport", label: "Sport" },
  { key: "where", label: "League" },
  { key: "what", label: "Category" },
  { key: "when", label: "When" },
  { key: "how", label: "Bet Type" },
  { key: "risk", label: "Risk" },
];

// Values the engine invents when a bet says nothing. They are real
// picks, so the map must still count them, but they are not choices he
// made and a card must never call one an edge: "Strongest Edge: Full
// time (Parlays)" was the first build's headline finding.
const FILLER = new Set([...MUTED, "Full time"]);
export const isFiller = (f: Fact) => f.chips.some((c) => FILLER.has(c.value));

type AnyBet = Engine["settled"][number];
type AnyLeg = AnyBet["legs"][number];

// The same reading the engine uses, including its fallbacks, so a
// fact here is the same fact there.
function valueOf(bet: AnyBet, leg: AnyLeg, g: GroupKey): string | null {
  if (g === "sport") return leg.sport;
  if (g === "what") return leg.subcategory ?? "No category";
  if (g === "where") return leg.competition ?? "No competition set";
  if (g === "when") return leg.period ?? "Full time";
  if (g === "how") return bet.legs.length > 1 ? "Parlays" : "Singles";
  if (leg.odds === null) return null;
  const o = Number(leg.odds);
  return o <= 1.8 ? "Low odds" : o <= 3 ? "Medium odds" : "High odds";
}

const matches = (bet: AnyBet, leg: AnyLeg, chips: Chip[]) =>
  chips.every((c) => valueOf(bet, leg, c.group) === c.value);

function build(engine: Engine, chips: Chip[], label: string): Fact | null {
  const covers = new Set<string>();
  let domain: Domain = "Sports";
  for (const bet of engine.settled)
    bet.legs.forEach((leg, i) => {
      if (!matches(bet, leg, chips)) return;
      if (covers.size === 0) domain = domainOf(leg.sport as Sport);
      covers.add(`${bet.id}#${i}`);
    });
  if (covers.size === 0) return null;
  const s = engine.statsFor(chips);
  const picks = s.wins + s.losses;
  if (picks === 0) return null;
  return {
    chips,
    label,
    key: chips.map((c) => `${c.group}|${c.value}`).join("+"),
    domain,
    s,
    picks,
    roi: s.staked > 0 ? s.profit / s.staked : null,
    covers,
  };
}

export function singleFacts(engine: Engine): Fact[] {
  const seen = new Map<string, Chip>();
  for (const bet of engine.settled)
    for (const leg of bet.legs)
      for (const g of GROUPS) {
        const v = valueOf(bet, leg, g);
        if (v === null || MUTED.has(v)) continue;
        const key = `${g}|${v}`;
        if (!seen.has(key))
          seen.set(key, {
            group: g,
            kind: g === "what" ? "category" : "plain",
            value: v,
          } as Chip);
      }
  return [...seen.values()]
    .map((chip) => build(engine, [chip], chip.value))
    .filter((f): f is Fact => f !== null);
}

// Pairs across two different groups, the way his sheet names them:
// "Player Props (NBA)". Only pairs that clear the evidence floor are
// built, so a claim never rests on two picks, and a pair that simply
// repeats one of its halves is not a finding.
export function pairFacts(engine: Engine, singles: Fact[]): Fact[] {
  const out: Fact[] = [];
  const base = singles.filter((f) => f.picks >= MIN_PICKS);
  for (let i = 0; i < base.length; i++)
    for (let j = i + 1; j < base.length; j++) {
      const a = base[i].chips[0];
      const b = base[j].chips[0];
      if (a.group === b.group) continue;
      const fact = build(engine, [a, b], `${a.value} (${b.value})`);
      if (!fact || fact.picks < MIN_PICKS) continue;
      if (fact.covers.size === base[i].covers.size) continue;
      if (fact.covers.size === base[j].covers.size) continue;
      out.push(fact);
    }
  return out;
}

const FAMILY_RANK: Record<string, number> = {
  sport: 0,
  what: 1,
  where: 2,
  when: 3,
  how: 4,
  risk: 5,
};

const coverKey = (f: Fact) => [...f.covers].sort().join(",");

// Rule 2. Applied to EVERY list the page shows, so one set of picks
// wears one name across the whole screen.
export function dropTwins(facts: Fact[]): Fact[] {
  const winner = new Map<string, Fact>();
  for (const f of facts) {
    const k = coverKey(f);
    const held = winner.get(k);
    const better =
      !held ||
      f.chips.length < held.chips.length ||
      (f.chips.length === held.chips.length &&
        FAMILY_RANK[f.chips[0].group] < FAMILY_RANK[held.chips[0].group]);
    if (better) winner.set(k, f);
  }
  return facts.filter((f) => winner.get(coverKey(f)) === f);
}

// Rule 3. One group, every value in it, biggest first. The values of
// a group never share a pick, so the tiles below are a true partition
// of the record: their figures sum to its net profit, and each figure
// is what Lab shows for that same fact.
export function groupTiles(
  engine: Engine,
  group: GroupKey,
  maxTiles: number
): { tiles: Fact[]; othersProfit: number; othersPicks: number } {
  const values = new Set<string>();
  for (const bet of engine.settled)
    for (const leg of bet.legs) {
      const v = valueOf(bet, leg, group);
      if (v !== null) values.add(v);
    }

  const facts = [...values]
    .map((v) =>
      build(
        engine,
        [
          {
            group,
            kind: group === "what" ? "category" : "plain",
            value: v,
          } as Chip,
        ],
        v
      )
    )
    .filter((f): f is Fact => f !== null)
    .sort((a, b) => Math.abs(b.s.profit) - Math.abs(a.s.profit));

  const tiles = facts.filter((f) => Math.abs(f.s.profit) >= 1).slice(0, maxTiles);
  const used = new Set<string>();
  for (const f of tiles) for (const c of f.covers) used.add(c);

  // Everything no tile covers: the small tail, plus any pick the group
  // cannot place (a leg with no odds has no risk bucket). This is a
  // real remainder because the tiles above it never overlap.
  let othersProfit = 0;
  let othersPicks = 0;
  for (const bet of engine.settled) {
    const shares = legShares(bet);
    bet.legs.forEach((leg, i) => {
      if (used.has(`${bet.id}#${i}`)) return;
      othersProfit += shares[i] ?? 0;
      if (leg.result !== "pending") othersPicks += 1;
    });
  }
  return { tiles, othersProfit, othersPicks };
}

// A fact's most recent picks, through the engine's own reading of a
// leg, so a streak card cannot disagree with Lab about the same fact.
export function recentForm(
  engine: Engine,
  chips: Chip[],
  n: number
): { wins: number; losses: number; picks: number } {
  const flags: boolean[] = [];
  const ordered = [...engine.settled].sort(
    (a, b) =>
      new Date(a.settled_at ?? 0).getTime() - new Date(b.settled_at ?? 0).getTime()
  );
  for (const bet of ordered)
    for (const leg of bet.legs) {
      if (!matches(bet, leg, chips)) continue;
      const result = leg.result === "pending" && bet.status !== "pending" && bet.cashed_out
        ? bet.status
        : leg.result;
      if (result === "pending") continue;
      flags.push(result === "won");
    }
  const last = flags.slice(-n);
  return {
    wins: last.filter(Boolean).length,
    losses: last.filter((w) => !w).length,
    picks: last.length,
  };
}

export const hitOf = (s: { wins: number; losses: number }) =>
  s.wins + s.losses > 0 ? s.wins / (s.wins + s.losses) : null;
