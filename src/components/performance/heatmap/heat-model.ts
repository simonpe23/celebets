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
// 3. THE MAP IS HOME'S MECHANICS. His ruling, 29 August 2026: "i
//    don't want to filter on category or sport here. i want same
//    mechanics as the home page - regardless of sport, league,
//    category, market - this heat maps should show best performances
//    regardless of what filter." So the tiles come straight from the
//    engine's own `rankedFacts([], 5)`, the exact call Home's ranked
//    rows and the prototype's old heat map both make: every fact in
//    every group, scored by impact, nothing filtered out.
//
//    THE CONSEQUENCE, NAMED: those facts overlap. One Moneyline bet
//    on Arsenal is a Moneyline pick AND a Premier League pick AND a
//    Football pick, so the tiles do NOT add up to the record's net
//    profit and are not meant to. A tile's size is how much THAT fact
//    moved, which is what the sheet's caption claims: "Size shows
//    impact on your results."

import { domainOf, type Domain } from "@/lib/taxonomy";
import type { Sport } from "@/lib/types";
import { legShares } from "@/lib/stats";
import { MUTED, type Chip, type Engine, type GroupKey, type Stats } from "@/app/preview/pf/engine";

export const MIN_PICKS = 12;
// The floor Home's ranked rows and the prototype's heat map both pass
// to rankedFacts. Keeping it means the map ranks what Home ranks.
export const RANK_MIN_PICKS = 5;

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
  // A fact belongs to a domain only when every pick under it agrees.
  // "Medium odds" spans the whole record, and reading the domain off
  // the first matching leg once sent it to Lab in Economics mode.
  const domains = new Set<Domain>();
  for (const bet of engine.settled)
    bet.legs.forEach((leg, i) => {
      if (!matches(bet, leg, chips)) return;
      domains.add(domainOf(leg.sport as Sport));
      covers.add(`${bet.id}#${i}`);
    });
  const domain: Domain = domains.size === 1 ? [...domains][0] : "Sports";
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

// Rule 3. Home's ranked facts, biggest mover first. `rankedFacts`
// scores every fact in every group at once and is the same call
// Home's rows make, so the map and the ranked list cannot disagree
// about what matters. Five picks is the floor both use.
//
// NO OTHERS TILE. His sheet draws a small grey "Others", and it is
// the one thing here that cannot be computed honestly: these facts
// overlap, so netting the ones left over counted the same money
// nineteen times and produced a +$3,225 tile, bigger than every real
// one on a $2,637 record. A number nobody can tap into and nobody can
// check does not belong on this page.
export function rankedTiles(
  engine: Engine,
  total: number,
  minGood: number,
  minBad: number
): Fact[] {
  const ranked = engine
    .rankedFacts([], RANK_MIN_PICKS)
    .map((r) => build(engine, [r.chip], r.chip.value))
    .filter((f): f is Fact => f !== null)
    // A filler value is not a bet he placed, so it is never a tile.
    .filter((f) => !isFiller(f) && Math.abs(f.s.profit) >= 1);

  // Twins are hidden HERE, because size is the map's whole message:
  // two tiles for one set of bets (Baseball and MLB) paint the same
  // money twice and make it look like double the impact.
  //
  // The order is rankedFacts' own, which is Home's order: impact, not
  // raw profit. Re-sorting by profit put three views of the same
  // winning bets at the top (Moneyline, Parlays, Medium odds) and cut
  // Premier League and Player Props, which are the facts Home's rows
  // and his sheet both name.
  const facts = dropTwins(ranked);
  // BOTH COLOURS ARE GUARANTEED. His ruling, 29 August 2026: "i want
  // at least three red and at least three green. So even if all of
  // them are red or all of them are green, at the top eight, I need
  // to have top three from each color." So the top three earners and
  // the top three leaks take their seats first, and the remaining
  // seats go to whatever moved the most money next, either colour.
  // Ranked purely by size the record's biggest leak once came ninth
  // and the map had no red on it at all, which is the failure already
  // written down for Totals: "cutting the list at six hid Basketball,
  // the record's single biggest leak."
  //
  // A record with fewer than three losing facts shows every one it
  // has. Nothing is invented to fill a seat.
  const bySize = (a: Fact, b: Fact) =>
    Math.abs(b.s.profit) - Math.abs(a.s.profit);
  const good = facts.filter((f) => f.s.profit > 0).sort(bySize);
  const bad = facts.filter((f) => f.s.profit < 0).sort(bySize);

  const taken = [...good.slice(0, minGood), ...bad.slice(0, minBad)];
  const rest = [...good.slice(minGood), ...bad.slice(minBad)].sort(bySize);
  while (taken.length < total && rest.length > 0) taken.push(rest.shift()!);
  return taken.sort(bySize);
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
