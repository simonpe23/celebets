// Lab's vocabulary: which chips each group offers, scoped by domain
// and ordered by evidence. Pure computation, no UI.
//
// The numbers themselves come from the pf engine (imported, never
// edited), which speaks src/lib/stats.ts for every dollar, so Lab,
// Home and the prototype all say identical money. This file only
// decides WHICH chips exist and in what order.
//
// Rules it carries (docs/performance-rebuild.md):
// - Six groups: Sport, League, Category, When, Bet Type, Risk.
// - Domain is a mode, not a chip. Picking one rescopes Sport, League,
//   Category and When. Bet Type and Risk mean the same everywhere.
// - The vocabulary is data driven: a chip exists because the record
//   contains it. A group with nothing to show hides, as a DATA state.
// - Thin groups stay visible: 1-2 is a finding, not noise.
// - When offers only real sub periods. The whole game is stored as
//   NULL and is not a chip: it is the resting state of every leg.

import type { BetWithLegs, Sport } from "@/lib/types";
import { domainOf, type Domain } from "@/lib/taxonomy";
import { MUTED, type Chip, type Engine, type GroupKey } from "@/app/preview/pf/engine";

export const DOMAINS: Domain[] = [
  "Sports",
  "Politics",
  "Economics",
  "Culture",
  "Other",
];

export type LabGroup = {
  key: GroupKey;
  title: string;
  allLabel: string;
  chips: Chip[];
};

// The first group's header word per domain. Sports says Sport; a
// non sports domain names itself, because "Sport" over a row of
// Crypto and Companies would be wearing the wrong headline.
export function topicGroupTitle(domain: Domain): string {
  return domain === "Sports" ? "Sport" : domain;
}

const chip = (group: GroupKey, value: string, kind: Chip["kind"] = "plain"): Chip => ({
  group,
  kind,
  value,
});

// Picks (wins plus losses) per value, for ordering chips by how much
// evidence sits behind each. Order is stable: evidence first, then
// name, so chips do not jump around as selections change.
function tally(
  bets: BetWithLegs[],
  domain: Domain,
  of: (bet: BetWithLegs, leg: BetWithLegs["legs"][number]) => string | null
): Map<string, number> {
  const m = new Map<string, number>();
  for (const bet of bets) {
    for (const leg of bet.legs) {
      if (domainOf(leg.sport) !== domain) continue;
      const v = of(bet, leg);
      if (v === null || MUTED.has(v)) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
  }
  return m;
}

function ordered(m: Map<string, number>): string[] {
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([v]) => v);
}

export function buildGroups(
  engine: Engine,
  domain: Domain,
  selection: Chip[]
): LabGroup[] {
  const bets = engine.settled;
  const selectedSports = new Set(
    selection.filter((c) => c.group === "sport").map((c) => c.value)
  );

  const inScope = (leg: BetWithLegs["legs"][number]) =>
    selectedSports.size === 0 || selectedSports.has(leg.sport);

  const sports = ordered(tally(bets, domain, (_b, leg) => leg.sport));

  // League and When narrow to the selected sport(s): they are sport
  // aware by ruling. With no sport picked they show everything the
  // record holds, ordered by evidence.
  const leagues = ordered(
    tally(bets, domain, (_b, leg) => (inScope(leg) ? leg.competition : null))
  );
  const periods = ordered(
    tally(bets, domain, (_b, leg) => (inScope(leg) ? leg.period : null))
  );
  const categories = ordered(
    tally(bets, domain, (_b, leg) => (inScope(leg) ? leg.subcategory : null))
  );

  const groups: LabGroup[] = [
    {
      key: "sport",
      title: topicGroupTitle(domain),
      allLabel: domain === "Sports" ? "All sports" : "All topics",
      chips: sports.map((v) => chip("sport", v)),
    },
    {
      key: "where",
      title: "League",
      allLabel: "All leagues",
      chips: leagues.map((v) => chip("where", v)),
    },
    {
      key: "what",
      title: "Category",
      allLabel: "All categories",
      chips: categories.map((v) => chip("what", v, "category")),
    },
    {
      key: "when",
      title: "When",
      allLabel: "All periods",
      chips: periods.map((v) => chip("when", v)),
    },
    {
      key: "how",
      title: "Bet Type",
      allLabel: "All types",
      chips: [chip("how", "Singles"), chip("how", "Parlays")],
    },
    {
      key: "risk",
      title: "Risk",
      allLabel: "All ranges",
      chips: [chip("risk", "Low odds"), chip("risk", "Medium odds"), chip("risk", "High odds")],
    },
  ];

  // A group with nothing behind it hides, as a data state. Bet Type
  // and Risk always exist once any bet does.
  return groups.filter((g) =>
    g.key === "how" || g.key === "risk" ? sports.length > 0 : g.chips.length > 0
  );
}

// Markets under a selected category, where the record actually holds
// them. "Match Winner" under Moneyline only appears because bets do.
export function marketsUnder(
  engine: Engine,
  domain: Domain,
  category: string
): Chip[] {
  const m = new Map<string, number>();
  for (const bet of engine.settled) {
    for (const leg of bet.legs) {
      if (domainOf(leg.sport) !== domain) continue;
      if (leg.subcategory !== category) continue;
      if (!leg.market || leg.market === category) continue;
      m.set(leg.market, (m.get(leg.market) ?? 0) + 1);
    }
  }
  return ordered(m).map((v) => ({ group: "what", kind: "market", value: v }) as Chip);
}

// The record chips wear: 12-4 with an en dash, never a percent and
// never an amount.
export function recordOf(s: { wins: number; losses: number }): string {
  return `${s.wins}–${s.losses}`;
}

// Which sport a league belongs to, read from the record itself, so a
// league chip can wear its sport's icon.
export function leagueSports(bets: BetWithLegs[]): Map<string, Sport> {
  const m = new Map<string, Sport>();
  for (const bet of bets)
    for (const leg of bet.legs)
      if (leg.competition && !m.has(leg.competition))
        m.set(leg.competition, leg.sport);
  return m;
}
