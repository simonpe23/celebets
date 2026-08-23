"use client";

// THE STYLED LAB + REVIEW, built to the owner's mockup sheets
// (21 August 2026). Local preview, gitignored, never deployed.
//
// The spec is his three sheets: sheet 1 (light) and sheet 3 (dark)
// are the structure, sheet 2's extras stolen in ("Clear all" and
// "See the N bets" living inside the answer card, the Explore in Lab
// button on the Review). His rulings baked in:
//   - Charts draw in PURPLE now (his call, reversing the August "no
//     purple data line" rule for this design). Money NUMBERS stay
//     green/red, ink at break even.
//   - Dark goes BLACKER than the app's navy, to be judged on this
//     preview before the rest of the app follows.
//   - The question is a row of removable purple tokens up top, with
//     a dashed "+ Add a fact". Groups teach comparison inline with
//     "tap to compare all".
// Colors are PIXEL-SAMPLED with Pillow from the repo copies of the
// sheets (1.png dark, 1-white.png light, 3.png states, 21 August
// 2026). 3.png also specs the empty state, the no-results state, the
// share button and the chip legend, still to build.

import { useMemo, useState } from "react";
import TabBar from "@/components/TabBar";
import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";

type GroupKey = "sport" | "what" | "where" | "when" | "how" | "risk";

type Chip = {
  group: GroupKey;
  kind: "category" | "market" | "plain";
  value: string;
};

const GROUP_LABELS: Record<GroupKey, string> = {
  sport: "Sport",
  what: "What you bet",
  where: "Where",
  when: "When",
  how: "How",
  risk: "Risk",
};

const ALL_LABELS: Record<GroupKey, string> = {
  sport: "All sports",
  what: "All categories",
  where: "All competitions",
  when: "All periods",
  how: "All bet types",
  risk: "All odds groups",
};

const GROUP_ORDER: GroupKey[] = [
  "sport",
  "what",
  "where",
  "when",
  "how",
  "risk",
];

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
  "US Open": "\u{1F3BE}",
  CS2: "\u{1F3AE}",
  "League of Legends": "\u{1F3AE}",
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

function moneyClass(v: number): string {
  if (Math.round(v) === 0) return "";
  return v > 0 ? "l2-pos" : "l2-neg";
}

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function shortDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function kMoney(v: number): string {
  const a = Math.abs(v);
  const body =
    a >= 1000 ? `$${(a / 1000).toFixed(a >= 10000 ? 0 : 1)}K` : `$${Math.round(a)}`;
  return v < 0 ? `-${body}` : body;
}

// The purple chart with axes, per the mockup. Dots appear on sparse
// series. An optional second series (orange) draws a versus.
function Chart({
  series,
  series2,
  height = 150,
}: {
  series: { t: number; v: number }[];
  series2?: { t: number; v: number }[];
  height?: number;
}) {
  const w = 360;
  const padL = 40;
  const padB = 20;
  const padT = 8;
  const all = [...series, ...(series2 ?? [])];
  if (all.length < 2) return <div style={{ height }} />;
  const minT = Math.min(...all.map((p) => p.t));
  const maxT = Math.max(...all.map((p) => p.t));
  const minV = Math.min(0, ...all.map((p) => p.v));
  const maxV = Math.max(0, ...all.map((p) => p.v));
  const rangeT = maxT - minT || 1;
  const rangeV = maxV - minV || 1;
  const x = (t: number) => padL + ((t - minT) / rangeT) * (w - padL - 6);
  const y = (v: number) =>
    padT + (1 - (v - minV) / rangeV) * (height - padT - padB);
  const path = (s: { t: number; v: number }[]) =>
    s.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const dates: Date[] = [];
  for (let i = 0; i < 5; i++)
    dates.push(new Date(minT + (rangeT * i) / 4));
  const sparse = series.length <= 8;
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="l2fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--l2-line)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--l2-line)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[maxV, 0, minV]
        .filter((v, i, a) => a.indexOf(v) === i)
        .map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={y(v)}
              x2={w - 4}
              y2={y(v)}
              stroke="var(--l2-hair)"
              strokeDasharray={v === 0 ? "3 4" : undefined}
              strokeWidth="1"
            />
            <text
              x={padL - 6}
              y={y(v) + 3}
              textAnchor="end"
              className="l2-axis"
            >
              {kMoney(v)}
            </text>
          </g>
        ))}
      {dates.map((d, i) => (
        <text
          key={i}
          x={padL + ((w - padL - 6) * i) / 4}
          y={height - 5}
          textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
          className="l2-axis"
        >
          {shortDate(d)}
        </text>
      ))}
      {!series2 && (
        <polygon
          points={`${x(series[0].t)},${y(minV)} ${path(series)} ${x(
            series[series.length - 1].t
          )},${y(minV)}`}
          fill="url(#l2fill)"
        />
      )}
      <polyline
        points={path(series)}
        fill="none"
        stroke="var(--l2-line)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {series2 && (
        <polyline
          points={path(series2)}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {sparse &&
        series.map((p, i) => (
          <circle
            key={i}
            cx={x(p.t)}
            cy={y(p.v)}
            r="3.2"
            fill="var(--l2-line)"
          />
        ))}
    </svg>
  );
}

export default function Lab2({
  bets,
  sorted = false,
  questions = false,
}: {
  bets: BetWithLegs[];
  // Upgrade A, The Sorted Lab: identical skin, but groups rank
  // themselves by how much they split this user's money, only the
  // two strongest open, and one computed line explains the ranking.
  sorted?: boolean;
  // Upgrade B, Questions First: the Lab opens as ready-made tappable
  // questions ranked from the user's record; the board waits folded
  // under "Build your own question". One tap lands in normal V1.
  questions?: boolean;
}) {
  const [pane, setPane] = useState<"review" | "lab">("lab");
  // Sorted and Questions modes open cold: their opening state IS the
  // pitch.
  const [selected, setSelected] = useState<Chip[]>(
    sorted || questions
      ? []
      : [{ group: "what", kind: "category", value: "Moneyline" }]
  );
  const [compareGroup, setCompareGroup] = useState<GroupKey | null>(null);
  const [moreOpen, setMoreOpen] = useState<Record<string, boolean>>({});
  // The board can fold: each group collapses to its header line, and
  // one control folds everything. The owner: the full board "is a
  // bit too busy and should be optional".
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const allFolded = GROUP_ORDER.every((g) => folded[g]);

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

  function seriesFor(filters: Chip[]): { t: number; v: number }[] {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const rows: { t: number; v: number }[] = [];
    const ordered = [...settled].sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );
    let run = 0;
    for (const bet of ordered) {
      const shares = legShares(bet);
      let touched = false;
      bet.legs.forEach((leg, i) => {
        for (const [, chips] of byGroup) {
          if (!chips.some((c) => chipMatches(bet, leg, c))) return;
        }
        run += shares[i] ?? 0;
        touched = true;
      });
      if (touched)
        rows.push({ t: new Date(bet.settled_at as string).getTime(), v: run });
    }
    if (rows.length > 0) rows.unshift({ t: rows[0].t - 86400000, v: 0 });
    return rows;
  }

  // The board.
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
        groups
          .get("what")!
          .set(cat, { group: "what", kind: "category", value: cat });
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
        groups
          .get("what")!
          .set(`m:${m}`, { group: "what", kind: "market", value: m });
    }
    return groups;
  }, [settled]);

  const selKey = (c: Chip) => `${c.group}|${c.kind}|${c.value}`;
  const selectedKeys = new Set(selected.map(selKey));

  function tapChip(chip: Chip) {
    if (compareGroup === chip.group) setCompareGroup(null);
    if (selectedKeys.has(selKey(chip)))
      setSelected(selected.filter((c) => selKey(c) !== selKey(chip)));
    else setSelected([...selected, chip]);
    // A new question re-ranks the board, so the automatic folds must
    // speak again: manual overrides reset on every tap.
    if (sorted) setFolded({});
  }

  function tapGroup(g: GroupKey) {
    setSelected(selected.filter((c) => c.group !== g));
    setCompareGroup(compareGroup === g ? null : g);
  }

  const groupsInSelection = new Map<GroupKey, Chip[]>();
  for (const c of selected)
    groupsInSelection.set(c.group, [
      ...(groupsInSelection.get(c.group) ?? []),
      c,
    ]);
  const versusGroup =
    [...groupsInSelection.entries()].find(([, cs]) => cs.length > 1)?.[0] ??
    null;
  const multiGroup = compareGroup ?? versusGroup;
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
  const isVersus = versusGroup !== null && compareGroup === null;
  const versusChips = isVersus ? groupsInSelection.get(versusGroup!)! : [];

  const answer = statsFor(selected);
  const roi =
    answer.staked > 0
      ? ((answer.profit / answer.staked) * 100).toFixed(1)
      : null;
  const questionWords =
    selected.length === 0
      ? "Everything you track"
      : [...selected]
          .sort(
            (a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
          )
          .map((c) => c.value)
          .join(" · ");

  const total = statsFor([]);
  const totalRoi =
    total.staked > 0 ? ((total.profit / total.staked) * 100).toFixed(1) : "-";

  const reviewCards = useMemo(() => {
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
    const seen = new Set<string>();
    return facts
      .sort((a, b) => Math.abs(b.s.profit) - Math.abs(a.s.profit))
      .filter(({ s }) => {
        const sig = `${s.wins}-${s.losses}-${Math.round(s.profit)}`;
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      })
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, settled]);

  // THE QUESTION ENGINE (Questions First mode). Ready-made questions
  // ranked by money at stake: biggest earner, biggest leak, the
  // strongest two-fact combination, and the comparisons whose values
  // disagree the most. No typing exists anywhere in this model.
  const labQuestions = useMemo(() => {
    if (!questions) return [];
    const totalQ = statsFor([]);
    type Q = {
      icon: string;
      title: string;
      sub: string;
      tokens: Chip[];
      compare: GroupKey | null;
      impact: number;
    };
    const out: Q[] = [];
    const facts: { chip: Chip; s: Stats }[] = [];
    for (const g of GROUP_ORDER) {
      for (const chip of board.get(g)!.values()) {
        if (MUTED.has(chip.value)) continue;
        const s = statsFor([chip]);
        if (s.wins + s.losses < 5) continue;
        if (s.wins + s.losses > 0.7 * (totalQ.wins + totalQ.losses))
          continue;
        facts.push({ chip, s });
      }
    }
    facts.sort((a, b) => Math.abs(b.s.profit) - Math.abs(a.s.profit));
    const earner = facts.find((f) => f.s.profit > 0);
    if (earner) {
      out.push({
        icon: ICONS[earner.chip.value] ?? "↗",
        title: `${earner.chip.value} is carrying you. See why`,
        sub: `${money(Math.round(earner.s.profit))} · ${earner.s.wins}-${
          earner.s.losses
        }`,
        tokens: [earner.chip],
        compare: null,
        impact: Math.abs(earner.s.profit),
      });
    }
    const leak = facts.find((f) => f.s.profit < 0);
    if (leak) {
      out.push({
        icon: ICONS[leak.chip.value] ?? "↘",
        title: `${leak.chip.value} is costing you $${Math.abs(
          Math.round(leak.s.profit)
        ).toLocaleString("en-US")}. Look closer`,
        sub: `${money(Math.round(leak.s.profit))} · ${leak.s.wins}-${
          leak.s.losses
        }`,
        tokens: [leak.chip],
        compare: null,
        impact: Math.abs(leak.s.profit),
      });
    }
    let bestPair: Q | null = null;
    const top = facts.slice(0, 6);
    for (const a of top) {
      for (const b of top) {
        if (a.chip.group === b.chip.group) continue;
        const s = statsFor([a.chip, b.chip]);
        if (s.wins + s.losses < 4) continue;
        if (bestPair !== null && Math.abs(s.profit) <= bestPair.impact)
          continue;
        bestPair = {
          icon: "\u{1F517}",
          title: `${a.chip.value} in ${b.chip.value}: worth it?`,
          sub: `${money(Math.round(s.profit))} · ${s.wins}-${s.losses}`,
          tokens: [a.chip, b.chip],
          compare: null,
          impact: Math.abs(s.profit),
        };
      }
    }
    if (bestPair) out.push(bestPair);
    const cmps: { g: GroupKey; title: string; spread: number }[] = [];
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
          ? "Singles vs parlays, settle it"
          : g === "risk"
            ? "Which risk level actually pays you?"
            : g === "sport"
              ? "Your sports, ranked"
              : g === "when"
                ? "Full games or halves: where is your edge?"
                : g === "what"
                  ? "Your bet types, compared"
                  : `Your ${GROUP_LABELS[g].toLowerCase()}, compared`;
      cmps.push({ g, title, spread });
    }
    cmps.sort((a, b) => b.spread - a.spread);
    for (const c of cmps.slice(0, 2)) {
      out.push({
        icon: "⚖️",
        title: c.title,
        sub: `${money(Math.round(c.spread))} between your best and worst`,
        tokens: [],
        compare: c.g,
        impact: c.spread * 0.8,
      });
    }
    return out.sort((a, b) => b.impact - a.impact).slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, board, settled]);

  const qCold =
    questions && selected.length === 0 && compareGroup === null;

  // THE BOARD, computed once: chips per group, and each group's
  // SIGNAL, the spread between its best and worst money inside the
  // rest of the question. In sorted mode the groups render in signal
  // order; otherwise the fixed order, exactly V1.
  const groupData = GROUP_ORDER.map((g) => {
    const context = selected.filter((c) => c.group !== g);
    const chips = [...board.get(g)!.values()]
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
    const real = chips.filter(
      ({ chip, s }) => !MUTED.has(chip.value) && s.wins + s.losses >= 2
    );
    const signal =
      real.length < 2
        ? -1
        : Math.max(...real.map((r) => r.s.profit)) -
          Math.min(...real.map((r) => r.s.profit));
    return { g, chips, signal };
  });
  const orderedGroups = sorted
    ? [...groupData].sort((a, b) => b.signal - a.signal)
    : groupData;
  // The line speaks about the strongest group not already in the
  // question: a selected group describing itself reads as nonsense.
  const strongest = orderedGroups.find(
    ({ g }) => !selected.some((c) => c.group === g)
  );
  const whyLine =
    strongest === undefined || strongest.signal < 0
      ? null
      : `Your money splits most by ${GROUP_LABELS[
          strongest.g
        ].toLowerCase()}${
          selected.length > 0
            ? ` inside ${selected.map((c) => c.value).join(" · ")}`
            : ""
        }.`;

  const hit = (s: Stats) =>
    s.wins + s.losses > 0
      ? `${Math.round((s.wins / (s.wins + s.losses)) * 100)}%`
      : "-";
  const roiOf = (s: Stats) =>
    s.staked > 0 ? `${((s.profit / s.staked) * 100).toFixed(1)}%` : "-";

  return (
    <main className="l2">
      <style>{CSS}</style>
      <div className="l2-max">
        <header className="l2-head">
          <h1>Performance</h1>
          <span className="l2-gear" aria-hidden="true">
            ⚙
          </span>
        </header>

        <div className="l2-seg">
          <button
            type="button"
            className={pane === "review" ? "on" : ""}
            onClick={() => setPane("review")}
          >
            Review
          </button>
          <button
            type="button"
            className={pane === "lab" ? "on" : ""}
            onClick={() => setPane("lab")}
          >
            Lab
          </button>
        </div>

        {pane === "review" ? (
          <>
            <section className="l2-card">
              <div className="l2-card-top">
                <span className="l2-k">Your record</span>
                <span className="l2-roipill">ROI {totalRoi}%</span>
              </div>
              <p className={`l2-big font-money ${moneyClass(total.profit)}`}>
                {money(total.profit)}
              </p>
              {/* The four data points, the owner's ruling: Bets,
                  Record, Hit rate, ROI, as proper boxes. Staked and
                  Returned were cut by him in the same breath. */}
              <div className="l2-tiles">
                <span>
                  <b className="font-money">{total.bets}</b>
                  <i>Bets</i>
                </span>
                <span>
                  <b className="font-money">
                    {total.wins}-{total.losses}
                  </b>
                  <i>Record</i>
                </span>
                <span>
                  <b className="font-money">{hit(total)}</b>
                  <i>Hit rate</i>
                </span>
                <span>
                  <b className="font-money">{totalRoi}%</b>
                  <i>ROI</i>
                </span>
              </div>
              <Chart series={seriesFor([])} />
            </section>

            <p className="l2-k l2-rank">Ranked answers, biggest money first</p>
            {reviewCards.map(({ chip, s }) => (
              <button
                key={selKey(chip)}
                type="button"
                className="l2-card l2-answercard"
                onClick={() => {
                  setSelected([chip]);
                  setCompareGroup(null);
                  setPane("lab");
                }}
              >
                <span
                  className={`l2-badge ${
                    s.profit >= 0 ? "l2-badge-up" : "l2-badge-down"
                  }`}
                >
                  {ICONS[chip.value] ?? (s.profit >= 0 ? "↗" : "↘")}
                </span>
                <span className="l2-ac-body">
                  <span className="l2-ac-k">
                    {s.profit >= 0 ? "Earner" : "Leak"} ·{" "}
                    {GROUP_LABELS[chip.group]}
                  </span>
                  <span className="l2-ac-line">
                    <b>{chip.value}</b> is {s.profit >= 0 ? "making" : "costing"}{" "}
                    you{" "}
                    <b className={moneyClass(s.profit)}>{money(s.profit)}</b>
                  </span>
                  <span className="l2-ac-sub">
                    {s.wins}-{s.losses} · {hit(s)} Hit Rate · {roiOf(s)} ROI
                  </span>
                </span>
                <span className="l2-chev">›</span>
              </button>
            ))}
            <button
              type="button"
              className="l2-cta"
              onClick={() => setPane("lab")}
            >
              Explore in Lab
            </button>
          </>
        ) : (
          <>
            <div className="l2-tokens">
              {selected.map((c) => (
                <button
                  key={selKey(c)}
                  type="button"
                  className="l2-token"
                  onClick={() => tapChip(c)}
                >
                  {c.value} <span aria-hidden="true">×</span>
                </button>
              ))}
              {compareGroup !== null && (
                <button
                  type="button"
                  className="l2-token l2-token-cmp"
                  onClick={() => setCompareGroup(null)}
                >
                  {GROUP_LABELS[compareGroup]} (compared){" "}
                  <span aria-hidden="true">×</span>
                </button>
              )}
              <span className="l2-addfact">+ Add a fact</span>
            </div>

            {/* QUESTIONS FIRST, cold: the ready-made stack replaces
                the big answer card. One tap fills the tokens and
                lands in normal V1. */}
            {qCold && (
              <>
                <div className="l2-strip">
                  <span className="l2-k">Everything you track</span>
                  <span
                    className={`l2-strip-money font-money ${moneyClass(
                      total.profit
                    )}`}
                  >
                    {money(total.profit)} · {total.wins}-{total.losses}
                  </span>
                </div>
                <p className="l2-k l2-rank">
                  Questions for you, biggest money first
                </p>
                {labQuestions.map((q) => (
                  <button
                    key={q.title}
                    type="button"
                    className="l2-card l2-answercard"
                    onClick={() => {
                      setSelected(q.tokens);
                      setCompareGroup(q.compare);
                      setFolded({});
                    }}
                  >
                    <span
                      className={`l2-badge ${
                        q.title.includes("costing")
                          ? "l2-badge-down"
                          : "l2-badge-up"
                      }`}
                    >
                      {q.icon}
                    </span>
                    <span className="l2-ac-body">
                      <span className="l2-ac-line">
                        <b>{q.title}</b>
                      </span>
                      <span className="l2-ac-sub">{q.sub}</span>
                    </span>
                    <span className="l2-chev">›</span>
                  </button>
                ))}
                <p className="l2-k l2-rank">Build your own question</p>
              </>
            )}

            {!qCold && (
            <section className="l2-card">
              {multiGroup !== null && compareRows.length > 0 ? (
                isVersus && compareRows.length === 2 ? (
                  <>
                    <div className="l2-card-top">
                      <span className="l2-k">
                        {compareRows[0].label} vs {compareRows[1].label}
                        {otherFilters.length > 0
                          ? ` · ${otherFilters.map((c) => c.value).join(" · ")}`
                          : ""}
                      </span>
                    </div>
                    <div className="l2-vs">
                      {compareRows.map((r, i) => (
                        <div key={r.label} className="l2-vs-col">
                          <p className="l2-vs-name">
                            {i === 1 && <i className="l2-vs-orange" />}
                            {i === 0 && <i className="l2-vs-purple" />}
                            {r.label}
                          </p>
                          <p
                            className={`l2-vs-money font-money ${moneyClass(
                              r.s.profit
                            )}`}
                          >
                            {money(r.s.profit)}
                          </p>
                          <p className="l2-vs-sub">
                            {r.s.wins}-{r.s.losses} record
                          </p>
                          <p className="l2-vs-sub">
                            {hit(r.s)} hit · {roiOf(r.s)} ROI
                          </p>
                        </div>
                      ))}
                      <span className="l2-vsbadge">VS</span>
                    </div>
                    <Chart
                      series={seriesFor([
                        ...otherFilters,
                        versusChips[0],
                      ])}
                      series2={seriesFor([...otherFilters, versusChips[1]])}
                    />
                  </>
                ) : (
                  <>
                    <div className="l2-card-top">
                      <span className="l2-k">
                        {GROUP_LABELS[multiGroup]}, compared
                        {otherFilters.length > 0
                          ? ` · ${otherFilters.map((c) => c.value).join(" · ")}`
                          : ""}
                      </span>
                    </div>
                    <div className="l2-cmp">
                      {compareRows.map((r) => (
                        <div key={r.label} className="l2-cmp-row">
                          <span className="l2-cmp-name">
                            {ICONS[r.label] ? `${ICONS[r.label]} ` : ""}
                            {r.label}
                          </span>
                          <span className="l2-cmp-rec font-money">
                            {r.s.wins}-{r.s.losses}
                          </span>
                          <span
                            className={`l2-cmp-money font-money ${moneyClass(
                              r.s.profit
                            )}`}
                          >
                            {money(r.s.profit)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="l2-hint">
                      Tap a group above to explore a different comparison
                    </p>
                  </>
                )
              ) : (
                <>
                  <div className="l2-card-top">
                    <span className="l2-k">{questionWords}</span>
                    <span className="l2-k l2-roik">ROI</span>
                  </div>
                  <div className="l2-moneyrow">
                    <p
                      className={`l2-big font-money ${moneyClass(
                        answer.profit
                      )}`}
                    >
                      {money(answer.profit)}
                    </p>
                    <p className="l2-roibig font-money">
                      {roi === null ? "-" : `${roi}%`}
                    </p>
                  </div>
                  <div className="l2-facts">
                    <span>
                      <b className="font-money">
                        {answer.wins}-{answer.losses}
                      </b>
                      <i>Record</i>
                    </span>
                    <span>
                      <b className="font-money">{hit(answer)}</b>
                      <i>Hit rate</i>
                    </span>
                    <span>
                      <b className="font-money">
                        {roi === null ? "-" : `${roi}%`}
                      </b>
                      <i>ROI</i>
                    </span>
                  </div>
                  <Chart series={seriesFor(selected)} />
                  <div className="l2-card-foot">
                    <button
                      type="button"
                      className="l2-clear"
                      onClick={() => {
                        setSelected([]);
                        setCompareGroup(null);
                      }}
                    >
                      ↺ Clear all
                    </button>
                    <span className="l2-seebets">
                      See the {answer.bets}{" "}
                      {answer.bets === 1 ? "bet" : "bets"} ›
                    </span>
                  </div>
                </>
              )}
            </section>
            )}
            {sorted && whyLine !== null && (
              <p className="l2-why">{whyLine}</p>
            )}
            <div className="l2-boardhead">
              <p className="l2-hint l2-hint-top">
                Tap any chip to refine or compare
              </p>
              <button
                type="button"
                className="l2-foldall"
                onClick={() => {
                  const next: Record<string, boolean> = {};
                  for (const g of GROUP_ORDER) next[g] = !allFolded;
                  setFolded(next);
                }}
              >
                {allFolded ? "Expand all" : "Collapse all"}
              </button>
            </div>

            {orderedGroups.map(({ g, chips }, rank) => {
              // A group disappears only when NOTHING in it has picks.
              // One chip still renders: "within BTTS: Premier League"
              // is information, and hiding it once stranded the user
              // one tap short of BTTS in the Premier League.
              if (chips.length === 0 && compareGroup !== g) return null;
              const open = moreOpen[g] ?? false;
              const shown = open ? chips : chips.slice(0, 6);
              const hidden = chips.length - shown.length;
              // Sorted mode: only the two strongest groups open, the
              // rest fold themselves; a group holding part of the
              // question never auto-folds; the user's own fold wins.
              const holds = selected.some((c) => c.group === g);
              // Questions mode: the whole board waits folded until
              // asked. Sorted mode: only the two strongest open.
              const isFolded =
                folded[g] ??
                ((qCold && !holds) || (sorted && rank >= 2 && !holds));
              return (
                <section key={g} className="l2-group">
                  <div className="l2-ghead">
                    <button
                      type="button"
                      className="l2-gtitle"
                      onClick={() => setFolded({ ...folded, [g]: !isFolded })}
                    >
                      <span
                        className={`l2-fold ${isFolded ? "" : "open"}`}
                        aria-hidden="true"
                      >
                        ›
                      </span>
                      {GROUP_LABELS[g]}
                      {isFolded && <i> · {chips.length}</i>}
                    </button>
                    <button
                      type="button"
                      className="l2-all"
                      onClick={() => tapGroup(g)}
                    >
                      {ALL_LABELS[g]} ›
                    </button>
                  </div>
                  {!isFolded && (
                  <div className="l2-chips">
                    {shown.map(({ chip, s }) => {
                      const on = selectedKeys.has(selKey(chip));
                      return (
                        <button
                          key={selKey(chip)}
                          type="button"
                          className={`l2-chip ${on ? "on" : ""} ${
                            MUTED.has(chip.value) ? "l2-mutedchip" : ""
                          }`}
                          onClick={() => tapChip(chip)}
                        >
                          <span className="l2-chip-name">
                            {ICONS[chip.value] ? `${ICONS[chip.value]} ` : ""}
                            {chip.value}
                          </span>
                          <span
                            className={`l2-chip-money font-money ${
                              on ? "" : moneyClass(s.profit)
                            }`}
                          >
                            {money(s.profit)}
                          </span>
                        </button>
                      );
                    })}
                    {hidden > 0 && (
                      <button
                        type="button"
                        className="l2-chip l2-more"
                        onClick={() => setMoreOpen({ ...moreOpen, [g]: true })}
                      >
                        More ▾
                      </button>
                    )}
                  </div>
                  )}
                </section>
              );
            })}
          </>
        )}
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}

const CSS = `
  /* SAMPLED FROM THE MOCKUPS with Pillow (1.png dark, 1-white.png
     light), 21 August 2026. Not eyeballed. Light: the page is pure
     white, cards separated by hairlines alone; the purple is an
     electric flat #430EDB. Dark: page #090B17, cards #131524, the
     chart line brightens to #8538EA while pressed purple stays the
     app's deep gradient (the mockup's own token sampled #4516AB,
     which IS the existing gradient's foot). */
  .l2 { min-height: 100svh; padding: 20px 16px 96px;
    background: #FFFFFF; color: #171717;
    --l2-line: #430EDB; --l2-press: #430EDB;
    --l2-press2: #430EDB; --l2-hair: rgba(23,23,23,0.10);
    --l2-card: #fff; --l2-ring: rgba(23,23,23,0.10);
    --l2-chipbg: #fff; --l2-muted: #737373; --l2-inner: #F6F6F8; }
  [data-theme="dark"] .l2 { background: #090B17; color: #F4F4F6;
    --l2-line: #8538EA; --l2-press: #5525C6; --l2-press2: #4915AD;
    --l2-hair: rgba(255,255,255,0.10);
    --l2-card: #131524; --l2-ring: rgba(255,255,255,0.08);
    --l2-chipbg: #131524; --l2-muted: #9CA3AF; --l2-inner: #1B1D30; }
  .l2 * { box-sizing: border-box; }
  .l2-max { max-width: 430px; margin: 0 auto; }
  .l2-pos { color: #12A150; } .l2-neg { color: #EF4444; }
  [data-theme="dark"] .l2-pos { color: #4ADE80; }
  [data-theme="dark"] .l2-neg { color: #F87171; }
  .l2-axis { font-size: 9px; fill: var(--l2-muted); }
  .l2-head { display: flex; justify-content: space-between; align-items: center; }
  .l2-head h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em;
    margin: 0; }
  .l2-gear { color: var(--l2-muted); font-size: 18px; }
  .l2-seg { display: flex; background: var(--l2-inner); border-radius: 999px;
    padding: 3px; margin: 14px 0 16px; }
  .l2-seg button { flex: 1; border: none; background: none; color: var(--l2-muted);
    font-size: 14px; font-weight: 700; padding: 9px 0; border-radius: 999px;
    cursor: pointer; font-family: inherit; }
  .l2-seg button.on { background: linear-gradient(var(--l2-press), var(--l2-press2));
    color: #fff; }
  .l2-card { display: block; width: 100%; text-align: left;
    background: var(--l2-card); border-radius: 18px;
    box-shadow: 0 0 0 1px var(--l2-ring); padding: 16px; margin-bottom: 10px;
    border: none; color: inherit; font-family: inherit; }
  .l2-card-top { display: flex; justify-content: space-between;
    align-items: baseline; }
  .l2-k { font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--l2-muted); }
  .l2-roipill { font-size: 11px; font-weight: 700; color: #15803D;
    background: rgba(34,197,94,0.12); border-radius: 999px; padding: 3px 8px; }
  [data-theme="dark"] .l2-roipill { color: #4ADE80; }
  .l2-big { font-size: 38px; font-weight: 600; margin: 6px 0 2px;
    letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
  .l2-sub { font-size: 13px; color: var(--l2-muted); margin: 0 0 8px;
    font-variant-numeric: tabular-nums; }
  .l2-tiles { display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; margin: 8px 0 12px; }
  .l2-tiles span { background: var(--l2-inner); border-radius: 12px;
    padding: 10px 8px; text-align: center; }
  .l2-tiles b { display: block; font-size: 16px; font-weight: 600;
    font-variant-numeric: tabular-nums; }
  .l2-tiles i { font-style: normal; font-size: 9px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--l2-muted); }
  .l2-boardhead { display: flex; justify-content: space-between;
    align-items: baseline; }
  .l2-why { font-size: 13px; font-weight: 600; margin: 2px 2px 8px;
    color: var(--l2-line); }
  .l2-strip { display: flex; justify-content: space-between;
    align-items: baseline; padding: 2px 2px 10px; }
  .l2-strip-money { font-size: 14px; font-weight: 600;
    font-variant-numeric: tabular-nums; }
  .l2-foldall { border: none; background: none; cursor: pointer;
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: var(--l2-muted); padding: 0; }
  .l2-fold { display: inline-block; font-weight: 700;
    color: var(--l2-muted); margin-right: 6px;
    transition: transform .15s; }
  .l2-fold.open { transform: rotate(90deg); }
  .l2-rank { display: block; margin: 16px 2px 8px; }
  .l2-answercard { display: flex; gap: 12px; align-items: center;
    cursor: pointer; }
  .l2-badge { width: 40px; height: 40px; border-radius: 999px; flex: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; }
  .l2-badge-up { background: rgba(34,197,94,0.14); }
  .l2-badge-down { background: rgba(239,68,68,0.14); }
  .l2-ac-body { min-width: 0; flex: 1; display: flex; flex-direction: column;
    gap: 1px; }
  .l2-ac-k { font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--l2-muted); }
  .l2-ac-line { font-size: 14px; }
  .l2-ac-line b { font-weight: 700; }
  .l2-ac-sub { font-size: 12px; color: var(--l2-muted);
    font-variant-numeric: tabular-nums; }
  .l2-chev { color: var(--l2-muted); font-weight: 700; }
  .l2-cta { display: block; width: 100%; border: none; cursor: pointer;
    background: linear-gradient(var(--l2-press), var(--l2-press2)); color: #fff;
    font-size: 16px; font-weight: 700; font-family: inherit;
    padding: 14px; border-radius: 14px; margin-top: 6px; }
  .l2-tokens { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;
    align-items: center; }
  .l2-token { border: none; cursor: pointer; font-family: inherit;
    background: linear-gradient(var(--l2-press), var(--l2-press2)); color: #fff;
    font-size: 13px; font-weight: 700; padding: 8px 12px;
    border-radius: 999px; }
  .l2-token span { opacity: 0.75; margin-left: 2px; }
  .l2-token-cmp { background: var(--l2-inner); color: inherit; }
  .l2-addfact { font-size: 13px; font-weight: 600; color: var(--l2-muted);
    border: 1.5px dashed var(--l2-hair); border-radius: 999px;
    padding: 7px 12px; }
  .l2-moneyrow { display: flex; justify-content: space-between;
    align-items: baseline; }
  .l2-roik { font-size: 11px; }
  .l2-roibig { font-size: 20px; font-weight: 600; color: #12A150;
    font-variant-numeric: tabular-nums; }
  [data-theme="dark"] .l2-roibig { color: #4ADE80; }
  .l2-facts { display: flex; gap: 26px; margin: 6px 0 10px; }
  .l2-facts b { display: block; font-size: 16px; font-weight: 600;
    font-variant-numeric: tabular-nums; }
  .l2-facts i { font-style: normal; font-size: 10px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--l2-muted); }
  .l2-card-foot { display: flex; justify-content: space-between;
    margin-top: 10px; }
  .l2-clear { border: none; background: none; cursor: pointer;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: var(--l2-line); padding: 0; }
  .l2-seebets { font-size: 13px; font-weight: 600; color: var(--l2-line); }
  .l2-hint { font-size: 12px; color: var(--l2-muted); margin: 2px 2px 14px; }
  .l2-hint-top { margin-top: -4px; }
  .l2-group { margin-bottom: 16px; }
  .l2-ghead { display: flex; justify-content: space-between;
    align-items: baseline; margin-bottom: 8px; }
  .l2-gtitle { font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; border: none; background: none;
    cursor: pointer; font-family: inherit; color: inherit; padding: 0; }
  .l2-gtitle i { font-style: normal; font-weight: 500; letter-spacing: 0;
    text-transform: none; color: var(--l2-muted); }
  .l2-all { border: none; background: none; cursor: pointer;
    font-family: inherit; font-size: 13px; font-weight: 600;
    color: var(--l2-muted); padding: 0; }
  .l2-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .l2-chip { border: none; cursor: pointer; font-family: inherit;
    background: var(--l2-chipbg); box-shadow: 0 0 0 1px var(--l2-ring);
    border-radius: 12px; padding: 9px 12px; color: inherit;
    display: flex; flex-direction: column; gap: 1px; align-items: flex-start;
    flex: 1 0 auto; max-width: 100%; }
  .l2-chip-name { font-size: 13px; font-weight: 600; }
  .l2-chip-money { font-size: 12px; font-weight: 600;
    font-variant-numeric: tabular-nums; color: var(--l2-muted); }
  .l2-chip.on { background: linear-gradient(var(--l2-press), var(--l2-press2)); color: #fff;
    box-shadow: none; }
  .l2-chip.on .l2-chip-money { color: rgba(255,255,255,0.85); }
  .l2-mutedchip { opacity: 0.55; }
  .l2-more { justify-content: center; color: var(--l2-muted);
    font-size: 13px; font-weight: 600; flex-direction: row; }
  .l2-vs { position: relative; display: flex; gap: 12px; margin: 10px 0; }
  .l2-vs-col { flex: 1; }
  .l2-vs-name { font-size: 13px; font-weight: 700; margin: 0 0 2px;
    display: flex; align-items: center; gap: 6px; }
  .l2-vs-purple, .l2-vs-orange { width: 8px; height: 8px;
    border-radius: 999px; display: inline-block; }
  .l2-vs-purple { background: var(--l2-line); }
  .l2-vs-orange { background: #F59E0B; }
  .l2-vs-money { font-size: 24px; font-weight: 600; margin: 0;
    font-variant-numeric: tabular-nums; }
  .l2-vs-sub { font-size: 12px; color: var(--l2-muted); margin: 0;
    font-variant-numeric: tabular-nums; }
  .l2-vsbadge { position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%); width: 34px; height: 34px;
    border-radius: 999px; background: var(--l2-inner);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: var(--l2-muted); }
  .l2-cmp { margin-top: 8px; }
  .l2-cmp-row { display: flex; align-items: center; gap: 10px;
    padding: 9px 0; border-top: 1px solid var(--l2-hair); }
  .l2-cmp-row:first-child { border-top: none; }
  .l2-cmp-name { flex: 1; font-size: 14px; font-weight: 600; min-width: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .l2-cmp-rec { font-size: 12px; color: var(--l2-muted);
    font-variant-numeric: tabular-nums; }
  .l2-cmp-money { font-size: 14px; font-weight: 700; width: 76px;
    text-align: right; font-variant-numeric: tabular-nums; }
`;
