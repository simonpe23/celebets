"use client";

// UPGRADE A, "THE SORTED LAB", as a WIREFRAME. Local preview,
// gitignored. Grey boxes and real numbers on purpose: judge the
// mental model, not the design.
//
// THE MODEL. Same board as V1 Lab, one new law: RELEVANCE IS
// COMPUTED, NEVER ASSUMED. A dimension matters when its values
// disagree about your money; the board ranks groups by that signal,
// opens only the strongest, and folds the rest itself, each folded
// line saying why. One personal sentence explains the ranking. The
// ranking is contextual: select Football and every group re-scores
// and re-ranks inside Football.
//
// Everything else is V1 Lab: tap facts to combine, same group to
// compare, "All X" to compare a whole group, answer card on top.

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

export default function Sorted({ bets }: { bets: BetWithLegs[] }) {
  const [selected, setSelected] = useState<Chip[]>([]);
  // The user may open a folded group or fold an open one; their
  // choice beats the automatic one for that group.
  const [foldOverride, setFoldOverride] = useState<Record<string, boolean>>({});

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
    const marketsPerCategory = new Map<string, Set<string>>();
    for (const bet of settled) {
      for (const leg of bet.legs) {
        for (const g of GROUP_ORDER) {
          if (g === "what") continue;
          const v = valueOf(bet, leg, g);
          if (v !== null)
            groups.get(g)!.set(v, { group: g, kind: "plain", value: v });
        }
        const cat = leg.subcategory ?? "No category";
        groups.get("what")!.set(cat, { group: "what", kind: "category", value: cat });
        if (leg.market) {
          const set = marketsPerCategory.get(cat) ?? new Set();
          set.add(leg.market);
          marketsPerCategory.set(cat, set);
        }
      }
    }
    for (const [, markets] of marketsPerCategory) {
      if (markets.size < 2) continue;
      for (const m of markets)
        groups.get("what")!.set(`m:${m}`, { group: "what", kind: "market", value: m });
    }
    return groups;
  }, [settled]);

  const selKey = (c: Chip) => `${c.group}|${c.kind}|${c.value}`;
  const selectedKeys = new Set(selected.map(selKey));

  // THE SIGNAL. Per group, inside the other groups' selections:
  // how far apart are this group's values about your money? A group
  // whose values agree is noise for you and folds itself.
  const scored = GROUP_ORDER.map((g) => {
    const context = selected.filter((c) => c.group !== g);
    const rows = [...board.get(g)!.values()]
      .map((chip) => ({ chip, s: statsFor([...context, chip]) }))
      .filter(
        ({ chip, s }) =>
          s.wins + s.losses > 0 || selectedKeys.has(selKey(chip))
      )
      .sort((a, b) => {
        const am = MUTED.has(a.chip.value) ? 1 : 0;
        const bm = MUTED.has(b.chip.value) ? 1 : 0;
        if (am !== bm) return am - bm;
        return b.s.profit - a.s.profit;
      });
    const real = rows.filter(
      ({ chip, s }) => !MUTED.has(chip.value) && s.wins + s.losses >= 2
    );
    const signal =
      real.length < 2
        ? -1
        : Math.max(...real.map((r) => r.s.profit)) -
          Math.min(...real.map((r) => r.s.profit));
    return { g, rows, signal };
  })
    .filter(({ rows }) => rows.length > 0)
    .sort((a, b) => b.signal - a.signal);

  // Open the two strongest groups; the rest fold themselves. A group
  // holding part of the question never folds, and the user's own
  // fold or unfold always wins.
  const autoOpen = new Set(scored.slice(0, 2).map(({ g }) => g));
  function isFolded(g: GroupKey): boolean {
    if (g in foldOverride) return foldOverride[g];
    if (selected.some((c) => c.group === g)) return false;
    return !autoOpen.has(g);
  }

  const answer = statsFor(selected);
  // The personal line speaks about the strongest group you have NOT
  // already chosen from: "splits most by sport inside Football" was
  // the selected group talking about itself, which is nonsense.
  const strongest = scored.find(
    ({ g }) => !selected.some((c) => c.group === g)
  );
  const whyLine =
    strongest === undefined
      ? ""
      : `Your money splits most by ${GROUP_LABELS[
          strongest.g
        ].toLowerCase()}${
          selected.length > 0
            ? ` inside ${selected.map((c) => c.value).join(" · ")}`
            : ""
        }.`;

  function tapChip(chip: Chip) {
    if (selectedKeys.has(selKey(chip)))
      setSelected(selected.filter((c) => selKey(c) !== selKey(chip)));
    else setSelected([...selected, chip]);
    // A new question re-ranks everything, so the automatic folds
    // must speak again: user overrides reset on every tap.
    setFoldOverride({});
  }

  return (
    <div className="swrap">
      <style>{`
        .swrap { min-height: 100svh; background: #fff; color: #111;
          padding: 20px 16px 40px; }
        [data-theme="dark"] .swrap { background: #111; color: #eee; }
        .swrap * { box-sizing: border-box; }
        .s-max { max-width: 460px; margin: 0 auto; }
        .s-note { border: 1px dashed #bbb; padding: 8px 10px; font-size: 11px;
          color: #888; margin-bottom: 14px; }
        .s-answer { border: 2px solid #111; padding: 14px; margin-bottom: 8px; }
        [data-theme="dark"] .s-answer { border-color: #eee; }
        .s-q { font-size: 12px; color: #888; margin: 0 0 6px;
          text-transform: uppercase; letter-spacing: 0.06em; }
        .s-big { font-size: 30px; font-weight: 700; margin: 0; }
        .s-why { font-size: 13px; margin: 0 0 16px; padding: 9px 10px;
          background: #f1f1f1; border-left: 3px solid #111; }
        [data-theme="dark"] .s-why { background: #1c1c1c; border-color: #eee; }
        .s-group { margin-bottom: 14px; }
        .s-gh { display: flex; align-items: baseline; gap: 8px; }
        .s-gtitle { background: none; border: none; padding: 0; cursor: pointer;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #111; font-family: inherit; }
        [data-theme="dark"] .s-gtitle { color: #eee; }
        .s-reason { font-size: 11px; color: #999; }
        .s-all { margin-left: auto; font-size: 12px; color: #888;
          background: none; border: none; padding: 0; cursor: pointer;
          font-family: inherit; }
        .s-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .s-chip { border: 1px solid #999; background: none; color: inherit;
          padding: 7px 10px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; gap: 6px; align-items: baseline;
          font-family: inherit; }
        .s-chip.on { background: #111; color: #fff; border-color: #111; }
        [data-theme="dark"] .s-chip.on { background: #eee; color: #111; }
        .s-chip.mut { color: #999; border-color: #ccc; font-weight: 400; }
        .s-chip small { font-size: 11px; }
        .pos { color: #15803d; } .neg { color: #dc2626; }
        [data-theme="dark"] .pos { color: #34d399; }
        [data-theme="dark"] .neg { color: #f87171; }
        .s-chip.on .pos, .s-chip.on .neg { color: inherit; }
        .s-folded { border-top: 1px solid #ddd; padding: 8px 0; }
        [data-theme="dark"] .s-folded { border-top-color: #333; }
        .s-tail { margin-top: 18px; }
      `}</style>
      <div className="s-max">
        <p className="s-note">
          WIREFRAME of Upgrade A, THE SORTED LAB. Same board as V1, one
          new law: groups rank themselves by how much they split YOUR
          money, only the strongest open, the rest fold and say why.
          Tap Football and watch everything re-rank inside Football.
        </p>

        <div className="s-answer">
          <p className="s-q">
            {selected.length === 0
              ? "Everything you track"
              : selected.map((c) => c.value).join(" · ")}
          </p>
          <p className={`s-big ${answer.profit >= 0 ? "pos" : "neg"}`}>
            {money(answer.profit)}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            {answer.wins}-{answer.losses} record
            {selected.length > 0 && (
              <>
                {" · "}
                <button
                  type="button"
                  onClick={() => {
                    setSelected([]);
                    setFoldOverride({});
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    color: "#888",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  clear
                </button>
              </>
            )}
          </p>
        </div>

        <p className="s-why">
          THE ONE PERSONAL LINE, computed, never canned: {whyLine}
        </p>

        {/* THE RANKED BOARD. Strongest signal first, weakest folded. */}
        {scored.map(({ g, rows, signal }, rank) => {
          const folded = isFolded(g);
          if (folded) {
            return (
              <div key={g} className="s-folded">
                <div className="s-gh">
                  <button
                    type="button"
                    className="s-gtitle"
                    onClick={() =>
                      setFoldOverride({ ...foldOverride, [g]: false })
                    }
                  >
                    ▸ {GROUP_LABELS[g]}
                  </button>
                  <span className="s-reason">
                    {signal < 0
                      ? "folded itself: too little data to rank you"
                      : `folded itself: less split than the groups above (spread ${money(
                          signal
                        )})`}
                  </span>
                </div>
              </div>
            );
          }
          return (
            <div key={g} className="s-group">
              <div className="s-gh">
                <button
                  type="button"
                  className="s-gtitle"
                  onClick={() =>
                    setFoldOverride({ ...foldOverride, [g]: true })
                  }
                >
                  ▾ {GROUP_LABELS[g]}
                </button>
                <span className="s-reason">
                  {rank === 0
                    ? `#1 signal for you: spread ${money(signal)} between your best and worst`
                    : `spread ${money(signal)}`}
                </span>
                <span className="s-all">All ›</span>
              </div>
              <div className="s-chips">
                {rows.map(({ chip, s }) => (
                  <button
                    key={selKey(chip)}
                    type="button"
                    className={`s-chip ${
                      selectedKeys.has(selKey(chip)) ? "on" : ""
                    } ${MUTED.has(chip.value) ? "mut" : ""}`}
                    onClick={() => tapChip(chip)}
                  >
                    {chip.value}
                    <small className={s.profit >= 0 ? "pos" : "neg"}>
                      {money(s.profit)}
                    </small>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <p className="s-tail s-reason">
          Nothing is gone: a folded group is one tap open, and every
          chip and comparison from V1 still exists underneath.
        </p>
      </div>
    </div>
  );
}
