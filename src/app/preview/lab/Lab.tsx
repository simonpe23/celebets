"use client";

// THE LAB, as a WIREFRAME. Local preview, gitignored, never deployed.
//
// Deliberately unstyled: grey boxes, real numbers, no brand, so the
// owner judges the information architecture and not the colors. The
// only color is money, because red-means-leak is semantics, not
// decoration.
//
// THE TWO RULES (agreed with the owner, 21 August 2026):
//   1. Tap facts to build your question. Facts from different groups
//      COMBINE (Moneyline + Premier League). Facts from the same
//      group COMPARE (Football vs Baseball).
//   2. Tap a group's name to compare across the whole group.
// Selection, never drill-down: the dimensions stay independent and
// any order of taps reaches the same answer.
//
// Facets re-score after every tap: every chip's money is computed
// inside the selections of the OTHER groups, so you see where money
// hides before you tap. A chip with no picks in context disappears.

import { useMemo, useState } from "react";
import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";

type GroupKey = "what" | "where" | "when" | "how" | "sport";

type Chip = {
  group: GroupKey;
  // Category chips match the pick's category; market chips match the
  // controlled market. Promotion: a market becomes its own chip when
  // its category holds two or more markets with data, so BTTS sits
  // beside Moneyline and nobody needs to know it "belongs to" Match
  // Props.
  kind: "category" | "market" | "plain";
  value: string;
};

const GROUP_LABELS: Record<GroupKey, string> = {
  what: "What you bet",
  where: "Where",
  when: "When",
  how: "How",
  sport: "Sport",
};

const GROUP_ORDER: GroupKey[] = ["sport", "what", "where", "when", "how"];

const MUTED = new Set(["No category", "Unclassified", "No competition set"]);

function legValue(bet: BetWithLegs, leg: Leg, chip: Chip): boolean {
  if (chip.group === "sport") return leg.sport === chip.value;
  if (chip.group === "what") {
    if (chip.kind === "market") return (leg.market ?? "") === chip.value;
    return (leg.subcategory ?? "No category") === chip.value;
  }
  if (chip.group === "where")
    return (leg.competition ?? "No competition set") === chip.value;
  if (chip.group === "when") return (leg.period ?? "Full time") === chip.value;
  return (bet.legs.length > 1 ? "Parlays" : "Singles") === chip.value;
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

export default function Lab({ bets }: { bets: BetWithLegs[] }) {
  const [pane, setPane] = useState<"review" | "lab">("lab");
  // The question: selected chips, any groups, any order.
  const [selected, setSelected] = useState<Chip[]>([]);
  // Rule 2: a whole group opened as a comparison.
  const [compareGroup, setCompareGroup] = useState<GroupKey | null>(null);
  const [showBets, setShowBets] = useState(false);

  const settled = useMemo(
    () => bets.filter((b) => b.status !== "pending" && b.settled_at !== null),
    [bets]
  );

  // Stats over the picks matching every chip in `filters` (a pick
  // must satisfy one chip per represented group; several chips in
  // one group mean "any of them", which is what comparison columns
  // pass one at a time anyway).
  function statsFor(filters: Chip[]): Stats {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters) {
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    }
    const s: Stats = { wins: 0, losses: 0, profit: 0, staked: 0, bets: 0 };
    for (const bet of settled) {
      const shares = legShares(bet);
      const stakes = legStakeShares(bet);
      const isSingle = bet.legs.length === 1;
      let any = false;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => legValue(bet, leg, c))) return;
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

  // The board: every chip that exists in the data at all, grouped.
  const board = useMemo(() => {
    const groups = new Map<GroupKey, Map<string, Chip>>();
    for (const g of GROUP_ORDER) groups.set(g, new Map());
    const marketsPerCategory = new Map<string, Set<string>>();
    for (const bet of settled) {
      for (const leg of bet.legs) {
        const cat = leg.subcategory ?? "No category";
        groups.get("sport")!.set(leg.sport, {
          group: "sport",
          kind: "plain",
          value: leg.sport,
        });
        groups.get("what")!.set(cat, {
          group: "what",
          kind: "category",
          value: cat,
        });
        if (leg.market) {
          const set = marketsPerCategory.get(cat) ?? new Set();
          set.add(leg.market);
          marketsPerCategory.set(cat, set);
        }
        const comp = leg.competition ?? "No competition set";
        groups.get("where")!.set(comp, {
          group: "where",
          kind: "plain",
          value: comp,
        });
        groups.get("when")!.set(leg.period ?? "Full time", {
          group: "when",
          kind: "plain",
          value: leg.period ?? "Full time",
        });
        groups
          .get("how")!
          .set(bet.legs.length > 1 ? "Parlays" : "Singles", {
            group: "how",
            kind: "plain",
            value: bet.legs.length > 1 ? "Parlays" : "Singles",
          });
      }
    }
    // Market promotion: only from categories holding 2+ markets.
    for (const [cat, markets] of marketsPerCategory) {
      if (markets.size < 2) continue;
      for (const m of markets) {
        groups.get("what")!.set(`m:${m}`, {
          group: "what",
          kind: "market",
          value: m,
        });
      }
      void cat;
    }
    return groups;
  }, [settled]);

  const selKey = (c: Chip) => `${c.group}|${c.kind}|${c.value}`;
  const selectedKeys = new Set(selected.map(selKey));

  function tapChip(chip: Chip) {
    setShowBets(false);
    if (compareGroup === chip.group) setCompareGroup(null);
    if (selectedKeys.has(selKey(chip))) {
      setSelected(selected.filter((c) => selKey(c) !== selKey(chip)));
    } else {
      setSelected([...selected, chip]);
    }
  }

  function tapGroup(g: GroupKey) {
    setShowBets(false);
    // Comparing a group replaces any picks inside it.
    setSelected(selected.filter((c) => c.group !== g));
    setCompareGroup(compareGroup === g ? null : g);
  }

  // What the answer shows. Same-group multi-select and a group
  // comparison both render as a ranked table; otherwise one answer.
  const groupsInSelection = new Map<GroupKey, Chip[]>();
  for (const c of selected) {
    groupsInSelection.set(c.group, [
      ...(groupsInSelection.get(c.group) ?? []),
      c,
    ]);
  }
  const multiGroup =
    compareGroup ??
    [...groupsInSelection.entries()].find(([, chips]) => chips.length > 1)?.[0] ??
    null;

  const otherFilters = selected.filter((c) => c.group !== multiGroup);

  let compareRows: { label: string; s: Stats }[] = [];
  if (multiGroup !== null) {
    const candidates =
      compareGroup !== null
        ? [...board.get(multiGroup)!.values()]
        : groupsInSelection.get(multiGroup)!;
    compareRows = candidates
      .map((chip) => ({
        label: chip.value,
        s: statsFor([...otherFilters, chip]),
      }))
      .filter((r) => r.s.wins + r.s.losses > 0)
      .sort((a, b) => b.s.profit - a.s.profit);
  }

  const answer = statsFor(selected);
  const roi =
    answer.staked > 0 ? ((answer.profit / answer.staked) * 100).toFixed(1) : null;

  const questionText =
    selected.length === 0 && compareGroup === null
      ? "Everything you track"
      : compareGroup !== null
        ? `${GROUP_LABELS[compareGroup]}, compared${
            otherFilters.length > 0
              ? " · " + otherFilters.map((c) => c.value).join(" · ")
              : ""
          }`
        : selected.map((c) => c.value).join(" · ");

  const behind = settled.filter((b) => {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of selected)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    return b.legs.some((leg) => {
      for (const [, chips] of byGroup) {
        if (!chips.some((c) => legValue(b, leg, c))) return false;
      }
      return true;
    });
  });

  // The Review's ranked answers: every single fact scored, biggest
  // money first, worded as a finding. Each opens the Lab preloaded.
  const reviewCards = useMemo(() => {
    const total = statsFor([]);
    const facts: { chip: Chip; s: Stats }[] = [];
    for (const g of GROUP_ORDER) {
      for (const chip of board.get(g)!.values()) {
        if (MUTED.has(chip.value)) continue;
        const s = statsFor([chip]);
        if (s.wins + s.losses < 5) continue;
        // A fact covering most of the record is the record restated
        // (Full time, Singles): true but useless. The real build
        // ranks by deviation from the user's baseline; the wireframe
        // just drops the trivially broad ones.
        if (s.wins + s.losses > 0.7 * (total.wins + total.losses)) continue;
        facts.push({ chip, s });
      }
    }
    return facts.sort((a, b) => Math.abs(b.s.profit) - Math.abs(a.s.profit)).slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, settled]);

  const total = statsFor([]);

  return (
    <div className="labwrap">
      <style>{`
        .labwrap { min-height: 100svh; background: #fff; color: #111;
          font-family: inherit; padding: 20px 16px 40px; }
        [data-theme="dark"] .labwrap { background: #111; color: #eee; }
        .labwrap * { box-sizing: border-box; }
        .lab-note { border: 1px dashed #bbb; padding: 8px 10px; font-size: 11px;
          color: #888; margin-bottom: 14px; }
        .lab-panes { display: flex; gap: 8px; margin-bottom: 16px; }
        .lab-pane { border: 1px solid #999; padding: 8px 14px; font-size: 14px;
          font-weight: 600; background: none; color: inherit; }
        .lab-pane.on { background: #111; color: #fff; }
        [data-theme="dark"] .lab-pane.on { background: #eee; color: #111; }
        .lab-answer { border: 2px solid #111; padding: 14px; margin-bottom: 18px; }
        [data-theme="dark"] .lab-answer { border-color: #eee; }
        .lab-q { font-size: 12px; color: #888; margin: 0 0 6px; text-transform: uppercase;
          letter-spacing: 0.06em; }
        .lab-big { font-size: 30px; font-weight: 700; margin: 0; }
        .lab-facts { display: flex; gap: 18px; margin-top: 10px; font-size: 13px; }
        .lab-facts b { display: block; font-size: 15px; }
        .lab-chart { border: 1px dashed #bbb; color: #999; font-size: 11px;
          text-align: center; padding: 18px 0; margin-top: 12px; }
        .lab-table { width: 100%; border-collapse: collapse; margin-top: 10px;
          font-size: 13px; }
        .lab-table td, .lab-table th { border-top: 1px solid #ddd; padding: 7px 4px;
          text-align: right; }
        [data-theme="dark"] .lab-table td, [data-theme="dark"] .lab-table th
          { border-top-color: #333; }
        .lab-table td:first-child, .lab-table th:first-child { text-align: left; }
        .lab-table th { font-size: 10px; text-transform: uppercase; color: #888;
          letter-spacing: 0.06em; border-top: none; }
        .lab-group { margin-bottom: 14px; }
        .lab-gh { background: none; border: none; padding: 0; font-size: 11px;
          font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #666; cursor: pointer; }
        [data-theme="dark"] .lab-gh { color: #999; }
        .lab-gh span { font-weight: 400; text-transform: none; letter-spacing: 0;
          color: #999; }
        .lab-gh.on { color: #111; text-decoration: underline; }
        [data-theme="dark"] .lab-gh.on { color: #fff; }
        .lab-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .lab-chip { border: 1px solid #999; background: none; color: inherit;
          padding: 7px 10px; font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; gap: 6px; align-items: baseline; }
        .lab-chip.on { background: #111; color: #fff; border-color: #111; }
        [data-theme="dark"] .lab-chip.on { background: #eee; color: #111;
          border-color: #eee; }
        .lab-chip.muted { color: #999; border-color: #ccc; font-weight: 400; }
        .lab-chip small { font-size: 11px; font-weight: 500; }
        .pos { color: #15803d; } .neg { color: #dc2626; }
        [data-theme="dark"] .pos { color: #34d399; }
        [data-theme="dark"] .neg { color: #f87171; }
        .lab-chip.on .pos, .lab-chip.on .neg { color: inherit; }
        .lab-bets { border: 1px solid #999; background: none; color: inherit;
          width: 100%; padding: 10px; font-size: 13px; font-weight: 600;
          margin-top: 6px; cursor: pointer; }
        .lab-betrow { border-top: 1px solid #ddd; padding: 7px 2px; font-size: 12px;
          display: flex; justify-content: space-between; gap: 8px; }
        [data-theme="dark"] .lab-betrow { border-top-color: #333; }
        .lab-card { border: 1px solid #999; padding: 12px; margin-bottom: 8px; }
        .lab-card p { margin: 0; }
        .lab-card .k { font-size: 10px; letter-spacing: 0.08em; color: #888;
          text-transform: uppercase; margin-bottom: 3px; }
        .lab-open { background: none; border: none; padding: 0; font-size: 12px;
          color: #888; text-decoration: underline; cursor: pointer; margin-top: 6px; }
        .lab-max { max-width: 440px; margin: 0 auto; }
      `}</style>
      <div className="lab-max">
        <p className="lab-note">
          WIREFRAME. Boxes and real numbers only. No visual design yet, on
          purpose: judge where things are and what a tap does.
        </p>

        <div className="lab-panes">
          <button
            type="button"
            className={`lab-pane ${pane === "review" ? "on" : ""}`}
            onClick={() => setPane("review")}
          >
            Review
          </button>
          <button
            type="button"
            className={`lab-pane ${pane === "lab" ? "on" : ""}`}
            onClick={() => setPane("lab")}
          >
            Lab
          </button>
        </div>

        {pane === "review" ? (
          <>
            <div className="lab-answer">
              <p className="lab-q">Your record</p>
              <p className="lab-big">{money(total.profit)}</p>
              <div className="lab-facts">
                <span>
                  Record <b>{total.wins}-{total.losses}</b>
                </span>
                <span>
                  Hit rate{" "}
                  <b>
                    {Math.round(
                      (total.wins / Math.max(1, total.wins + total.losses)) * 100
                    )}
                    %
                  </b>
                </span>
                <span>
                  ROI{" "}
                  <b>
                    {total.staked > 0
                      ? `${((total.profit / total.staked) * 100).toFixed(1)}%`
                      : "-"}
                  </b>
                </span>
              </div>
              <div className="lab-chart">[ trend chart ]</div>
            </div>
            <p className="lab-q">Ranked answers, biggest money first</p>
            {reviewCards.map(({ chip, s }) => (
              <div key={selKey(chip)} className="lab-card">
                <p className="k">
                  {s.profit >= 0 ? "Earner" : "Leak"} ·{" "}
                  {GROUP_LABELS[chip.group]}
                </p>
                <p>
                  <b>{chip.value}</b> is{" "}
                  {s.profit >= 0 ? "making" : "costing"} you{" "}
                  <b className={s.profit >= 0 ? "pos" : "neg"}>
                    {money(s.profit)}
                  </b>{" "}
                  ({s.wins}-{s.losses})
                </p>
                <button
                  type="button"
                  className="lab-open"
                  onClick={() => {
                    setSelected([chip]);
                    setCompareGroup(null);
                    setPane("lab");
                  }}
                >
                  Open in Lab ›
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="lab-answer">
              <p className="lab-q">{questionText}</p>
              {multiGroup !== null && compareRows.length > 0 ? (
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>{GROUP_LABELS[multiGroup]}</th>
                      <th>Record</th>
                      <th>P&L</th>
                      <th>ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((r) => (
                      <tr key={r.label}>
                        <td>{r.label}</td>
                        <td>
                          {r.s.wins}-{r.s.losses}
                        </td>
                        <td className={r.s.profit >= 0 ? "pos" : "neg"}>
                          {money(r.s.profit)}
                        </td>
                        <td>
                          {r.s.staked > 0
                            ? `${((r.s.profit / r.s.staked) * 100).toFixed(0)}%`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <p className={`lab-big ${answer.profit >= 0 ? "pos" : "neg"}`}>
                    {money(answer.profit)}
                  </p>
                  <div className="lab-facts">
                    <span>
                      Record{" "}
                      <b>
                        {answer.wins}-{answer.losses}
                      </b>
                    </span>
                    <span>
                      Hit rate{" "}
                      <b>
                        {answer.wins + answer.losses > 0
                          ? `${Math.round(
                              (answer.wins / (answer.wins + answer.losses)) * 100
                            )}%`
                          : "-"}
                      </b>
                    </span>
                    <span>
                      ROI <b>{roi === null ? "-" : `${roi}%`}</b>
                    </span>
                  </div>
                  <div className="lab-chart">[ trend chart for this question ]</div>
                </>
              )}
              {(selected.length > 0 || compareGroup !== null) && (
                <button
                  type="button"
                  className="lab-open"
                  onClick={() => {
                    setSelected([]);
                    setCompareGroup(null);
                    setShowBets(false);
                  }}
                >
                  Clear question
                </button>
              )}
            </div>

            {GROUP_ORDER.map((g) => {
              const chips = [...board.get(g)!.values()]
                .map((chip) => {
                  // Facet re-scoring: this chip inside the OTHER
                  // groups' selections.
                  const context = selected.filter((c) => c.group !== g);
                  const s = statsFor([...context, chip]);
                  return { chip, s };
                })
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
              // A dimension with nothing to choose melts away, but a
              // group holding part of the question must stay, or the
              // selection could never be untapped.
              const holdsSelection = chips.some(({ chip }) =>
                selectedKeys.has(selKey(chip))
              );
              if (chips.length < 2 && compareGroup !== g && !holdsSelection)
                return null;
              return (
                <div key={g} className="lab-group">
                  <button
                    type="button"
                    className={`lab-gh ${compareGroup === g ? "on" : ""}`}
                    onClick={() => tapGroup(g)}
                  >
                    {GROUP_LABELS[g]} <span>· tap to compare all</span>
                  </button>
                  <div className="lab-chips">
                    {chips.map(({ chip, s }) => (
                      <button
                        key={selKey(chip)}
                        type="button"
                        className={`lab-chip ${
                          selectedKeys.has(selKey(chip)) ? "on" : ""
                        } ${MUTED.has(chip.value) ? "muted" : ""}`}
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

            <button
              type="button"
              className="lab-bets"
              onClick={() => setShowBets((v) => !v)}
            >
              {showBets
                ? "Hide the bets"
                : `See the ${behind.length} ${
                    behind.length === 1 ? "bet" : "bets"
                  } behind this ›`}
            </button>
            {showBets &&
              behind.slice(0, 12).map((b) => (
                <div key={b.id} className="lab-betrow">
                  <span>
                    {b.legs.map((l) => l.description).join(" + ")}
                  </span>
                  <span
                    className={
                      Number(b.payout ?? 0) - Number(b.stake) >= 0
                        ? "pos"
                        : "neg"
                    }
                  >
                    {money(Number(b.payout ?? 0) - Number(b.stake))}
                  </span>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}
