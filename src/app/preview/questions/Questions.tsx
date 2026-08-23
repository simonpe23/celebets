"use client";

// UPGRADE B, "QUESTIONS FIRST", as a WIREFRAME. Local preview,
// gitignored. Grey boxes and real numbers: judge the mental model.
//
// THE MODEL. The Lab opens as a stack of READY-MADE QUESTIONS,
// written and ranked by the app from this user's own record. No
// typing anywhere. One tap on a question loads the full answer with
// the tokens filled in, and from there everything is V1 Lab. The
// board still exists, folded, under "Build your own question", for
// anyone the stack did not serve.
//
// Every question card in the wireframe shows WHY it was asked (the
// computed fact that generated it), because the ranking being honest
// is the whole product.

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

interface Question {
  title: string;
  why: string;
  tokens: Chip[];
  compare: GroupKey | null;
  impact: number;
}

export default function Questions({ bets }: { bets: BetWithLegs[] }) {
  const [selected, setSelected] = useState<Chip[]>([]);
  const [compareGroup, setCompareGroup] = useState<GroupKey | null>(null);

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

  // THE QUESTION ENGINE. Each candidate carries the computed fact
  // that justifies it; the stack is the top five by money at stake.
  const questions = useMemo<Question[]>(() => {
    const total = statsFor([]);
    const out: Question[] = [];

    const facts: { chip: Chip; s: Stats }[] = [];
    for (const g of GROUP_ORDER) {
      for (const chip of board.get(g)!.values()) {
        if (MUTED.has(chip.value)) continue;
        const s = statsFor([chip]);
        if (s.wins + s.losses < 5) continue;
        if (s.wins + s.losses > 0.7 * (total.wins + total.losses)) continue;
        facts.push({ chip, s });
      }
    }
    facts.sort((a, b) => Math.abs(b.s.profit) - Math.abs(a.s.profit));

    const earner = facts.find((f) => f.s.profit > 0);
    if (earner) {
      out.push({
        title: `${earner.chip.value} is carrying you. See why ›`,
        why: `computed: your biggest earner, ${money(earner.s.profit)} on ${
          earner.s.wins
        }-${earner.s.losses}`,
        tokens: [earner.chip],
        compare: null,
        impact: Math.abs(earner.s.profit),
      });
    }
    const leak = facts.find((f) => f.s.profit < 0);
    if (leak) {
      out.push({
        title: `${leak.chip.value} is costing you ${money(
          leak.s.profit
        ).replace("-", "")}. Look closer ›`,
        why: `computed: your biggest leak, ${money(leak.s.profit)} on ${
          leak.s.wins
        }-${leak.s.losses}`,
        tokens: [leak.chip],
        compare: null,
        impact: Math.abs(leak.s.profit),
      });
    }

    // The best two-fact intersection among the top single facts.
    let bestPair: Question | null = null;
    const top = facts.slice(0, 6);
    for (const a of top) {
      for (const b of top) {
        if (a.chip.group === b.chip.group) continue;
        const s = statsFor([a.chip, b.chip]);
        if (s.wins + s.losses < 4) continue;
        if (bestPair !== null && Math.abs(s.profit) <= bestPair.impact)
          continue;
        bestPair = {
          title: `${a.chip.value} in ${b.chip.value}: worth it? ›`,
          why: `computed: your strongest two-fact combination, ${money(
            s.profit
          )} on ${s.wins}-${s.losses}`,
          tokens: [a.chip, b.chip],
          compare: null,
          impact: Math.abs(s.profit),
        };
      }
    }
    if (bestPair) out.push(bestPair);

    // Group comparisons where the group's values disagree the most.
    const compares: { g: GroupKey; title: string; spread: number }[] = [];
    for (const g of GROUP_ORDER) {
      const rows = [...board.get(g)!.values()]
        .filter((c) => !MUTED.has(c.value))
        .map((chip) => statsFor([chip]))
        .filter((s) => s.wins + s.losses >= 2);
      if (rows.length < 2) continue;
      const spread =
        Math.max(...rows.map((s) => s.profit)) -
        Math.min(...rows.map((s) => s.profit));
      const title =
        g === "how"
          ? "Singles vs parlays, settle it ›"
          : g === "risk"
            ? "Which risk level actually pays you? ›"
            : g === "sport"
              ? "Your sports, ranked ›"
              : g === "when"
                ? "Full games or halves: where is your edge? ›"
                : g === "what"
                  ? "Your bet types, compared"
                  : `Your ${GROUP_LABELS[g].toLowerCase()}, compared ›`;
      compares.push({ g, title, spread });
    }
    compares.sort((a, b) => b.spread - a.spread);
    for (const c of compares.slice(0, 2)) {
      out.push({
        title: c.title,
        why: `computed: ${money(c.spread)} between your best and worst ${GROUP_LABELS[
          c.g
        ].toLowerCase()}`,
        tokens: [],
        compare: c.g,
        impact: c.spread * 0.8,
      });
    }

    return out.sort((a, b) => b.impact - a.impact).slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, settled]);

  const answer = statsFor(selected);
  const total = statsFor([]);
  const open = selected.length > 0 || compareGroup !== null;

  let compareRows: { label: string; s: Stats }[] = [];
  if (compareGroup !== null) {
    compareRows = [...board.get(compareGroup)!.values()]
      .map((chip) => ({ label: chip.value, s: statsFor([chip]) }))
      .filter((r) => r.s.wins + r.s.losses > 0)
      .sort((a, b) => b.s.profit - a.s.profit);
  }

  return (
    <div className="qwrap">
      <style>{`
        .qwrap { min-height: 100svh; background: #fff; color: #111;
          padding: 20px 16px 40px; }
        [data-theme="dark"] .qwrap { background: #111; color: #eee; }
        .qwrap * { box-sizing: border-box; }
        .q-max { max-width: 460px; margin: 0 auto; }
        .q-note { border: 1px dashed #bbb; padding: 8px 10px; font-size: 11px;
          color: #888; margin-bottom: 14px; }
        .q-strip { border: 1px solid #999; padding: 8px 12px; font-size: 13px;
          display: flex; justify-content: space-between; margin-bottom: 16px; }
        .q-k { font-size: 12px; color: #888; margin: 0 0 8px;
          text-transform: uppercase; letter-spacing: 0.06em; }
        .q-card { border: 2px solid #111; padding: 12px; margin-bottom: 10px;
          width: 100%; text-align: left; background: none; color: inherit;
          cursor: pointer; font-family: inherit; }
        [data-theme="dark"] .q-card { border-color: #eee; }
        .q-title { font-size: 15px; font-weight: 700; margin: 0; }
        .q-why { font-size: 11px; color: #888; margin: 4px 0 0; }
        .q-answer { border: 2px solid #111; padding: 14px; margin-bottom: 16px; }
        [data-theme="dark"] .q-answer { border-color: #eee; }
        .q-big { font-size: 30px; font-weight: 700; margin: 0; }
        .pos { color: #15803d; } .neg { color: #dc2626; }
        [data-theme="dark"] .pos { color: #34d399; }
        [data-theme="dark"] .neg { color: #f87171; }
        .q-row { display: flex; justify-content: space-between; gap: 8px;
          border-top: 1px solid #ddd; padding: 7px 0; font-size: 13px; }
        [data-theme="dark"] .q-row { border-top-color: #333; }
        .q-build { border-top: 1px solid #ddd; margin-top: 20px; padding-top: 12px; }
        [data-theme="dark"] .q-build { border-top-color: #333; }
        .q-folded { font-size: 13px; color: #888; padding: 7px 0;
          border-bottom: 1px solid #eee; }
        [data-theme="dark"] .q-folded { border-bottom-color: #2a2a2a; }
        .q-clear { background: none; border: none; padding: 0; font: inherit;
          color: #888; text-decoration: underline; cursor: pointer; }
      `}</style>
      <div className="q-max">
        <p className="q-note">
          WIREFRAME of Upgrade B, QUESTIONS FIRST. The Lab opens as
          ready-made questions the app wrote from YOUR record, ranked
          by money at stake. One tap answers. No typing exists. The
          full board waits folded at the bottom for custom questions.
        </p>

        {!open ? (
          <>
            <div className="q-strip">
              <span>Everything you track</span>
              <b className={total.profit >= 0 ? "pos" : "neg"}>
                {money(total.profit)} · {total.wins}-{total.losses}
              </b>
            </div>

            <p className="q-k">Questions for you, biggest money first</p>
            {questions.map((q) => (
              <button
                key={q.title}
                type="button"
                className="q-card"
                onClick={() => {
                  setSelected(q.tokens);
                  setCompareGroup(q.compare);
                }}
              >
                <p className="q-title">{q.title}</p>
                <p className="q-why">{q.why}</p>
              </button>
            ))}

            <div className="q-build">
              <p className="q-k">Build your own question</p>
              {GROUP_ORDER.map((g) => (
                <p key={g} className="q-folded">
                  ▸ {GROUP_LABELS[g]} · the full V1 board lives here,
                  folded until asked
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="q-answer">
              <p className="q-k">
                {compareGroup !== null
                  ? `${GROUP_LABELS[compareGroup]}, compared`
                  : selected.map((c) => c.value).join(" · ")}
              </p>
              {compareGroup !== null ? (
                compareRows.map((r) => (
                  <div key={r.label} className="q-row">
                    <span>{r.label}</span>
                    <span>
                      {r.s.wins}-{r.s.losses}{" "}
                      <b className={r.s.profit >= 0 ? "pos" : "neg"}>
                        {money(r.s.profit)}
                      </b>
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <p className={`q-big ${answer.profit >= 0 ? "pos" : "neg"}`}>
                    {money(answer.profit)}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                    {answer.wins}-{answer.losses} record · from here this
                    is exactly V1 Lab: refine with chips, compare, see
                    the bets
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              className="q-clear"
              onClick={() => {
                setSelected([]);
                setCompareGroup(null);
              }}
            >
              ‹ Back to your questions
            </button>
          </>
        )}
      </div>
    </div>
  );
}
