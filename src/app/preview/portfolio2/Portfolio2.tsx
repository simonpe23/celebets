"use client";

// CONCEPT 2 v2, "THE PORTFOLIO", with the six improvements from the
// review round baked in. Local preview, gitignored. One engine, two
// skins (wire=true grey wireframe, else the sampled palette).
//
// WHAT V2 ADDS OVER V1 OF THE CONCEPT:
// 1. TOKENS ON EVERY FACT PAGE. The page's facts render as removable
//    tokens with "+ Add a fact", which opens a ranked flat panel of
//    addable facts. Any page becomes any intersection: V1 Lab's full
//    freedom lives one level down, invisible until wanted.
// 2. RANKING V2. score = |profit| x sqrt(picks/(picks+10))
//    x actionability x (1 + 0.4 x recentShare). Actionability keeps
//    a risk band from outranking a bet type; recency keeps the list
//    alive.
// 3. DAILY MOVEMENT. Rows carry NEW / up / down / cooling badges
//    against the ranking as it stood a week ago, and one computed
//    line up top says what changed this week.
// 4. SPARKLINES on every row: the fact's cumulative money.
// 5. ONE URGENT CARD above the list when something deserves it (a
//    leak with recent activity), stolen from Questions First.
// 6. LEAK WHYS: every leak row names its biggest inside driver.
// The Money Map survives as a view of this same ranking (the List |
// Map toggle links to it).

import { useMemo, useState } from "react";
import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";

type GroupKey = "sport" | "what" | "where" | "when" | "how" | "risk";
type Chip = { group: GroupKey; kind: "category" | "market" | "plain"; value: string };

const GROUP_ORDER: GroupKey[] = ["sport", "what", "where", "when", "how", "risk"];
const MUTED = new Set(["No category", "Unclassified", "No competition set"]);

// Actionability: how directly a bettor can act on this kind of fact.
// A bet type or a competition is a decision you make every day; an
// odds band is a symptom. Product judgment, tunable.
const DIM_WEIGHT: Record<GroupKey, number> = {
  what: 1,
  where: 1,
  sport: 0.9,
  how: 0.85,
  when: 0.8,
  risk: 0.6,
};

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

interface Fact {
  chip: Chip;
  s: Stats;
  score: number;
  recent: number; // last-7-days profit
  spark: number[];
  badge: string | null;
  why: string | null;
}

const WEEK = 7 * 86400000;

export default function Portfolio2({
  bets,
  wire,
}: {
  bets: BetWithLegs[];
  wire: boolean;
}) {
  const [path, setPath] = useState<Chip[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const settled = useMemo(
    () => bets.filter((b) => b.status !== "pending" && b.settled_at !== null),
    [bets]
  );
  const now = useMemo(
    () =>
      Math.max(
        ...settled.map((b) => new Date(b.settled_at as string).getTime())
      ),
    [settled]
  );

  function statsFor(filters: Chip[], before?: number, after?: number): Stats {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const s: Stats = { wins: 0, losses: 0, profit: 0, staked: 0, bets: 0 };
    for (const bet of settled) {
      const t = new Date(bet.settled_at as string).getTime();
      if (before !== undefined && t >= before) continue;
      if (after !== undefined && t < after) continue;
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

  function sparkFor(filters: Chip[]): number[] {
    const byGroup = new Map<GroupKey, Chip[]>();
    for (const c of filters)
      byGroup.set(c.group, [...(byGroup.get(c.group) ?? []), c]);
    const rows: number[] = [0];
    let run = 0;
    const ordered = [...settled].sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );
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
      if (touched) rows.push(run);
    }
    return rows.slice(-14);
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

  // Ranking v2, optionally as of a past moment (for the movement
  // badges): meaningfulness = money x evidence x actionability x
  // freshness.
  function rankedFacts(
    context: Chip[],
    minPicks: number,
    before?: number
  ): Fact[] {
    const whole = statsFor(context, before);
    const facts: Fact[] = [];
    for (const chip of board) {
      if (context.some((c) => c.group === chip.group)) continue;
      if (MUTED.has(chip.value)) continue;
      const s = statsFor([...context, chip], before);
      const picks = s.wins + s.losses;
      if (picks < minPicks) continue;
      if (picks > 0.85 * (whole.wins + whole.losses)) continue;
      const recentStats = statsFor(
        [...context, chip],
        before,
        (before ?? now + 1) - WEEK
      );
      const recentPicks = recentStats.wins + recentStats.losses;
      const recentShare = picks > 0 ? recentPicks / picks : 0;
      const score =
        Math.abs(s.profit) *
        Math.sqrt(picks / (picks + 10)) *
        DIM_WEIGHT[chip.group] *
        (1 + 0.4 * recentShare);
      facts.push({
        chip,
        s,
        score,
        recent: recentStats.profit,
        spark: [],
        badge: null,
        why: null,
      });
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

  // Today's list, last week's list, and the movement between them.
  const { earners, leaks, changedLine, urgent } = useMemo(() => {
    const nowFacts = rankedFacts([], 5);
    const pastFacts = rankedFacts([], 5, now + 1 - WEEK);
    const pastOrder = new Map(
      pastFacts.map((f, i) => [`${f.chip.group}|${f.chip.value}`, i])
    );
    for (const [i, f] of nowFacts.entries()) {
      const key = `${f.chip.group}|${f.chip.value}`;
      const was = pastOrder.get(key);
      f.spark = sparkFor([f.chip]);
      if (was === undefined) f.badge = "NEW";
      else if (was - i >= 2) f.badge = `▲${was - i}`;
      else if (i - was >= 2) f.badge = `▼${i - was}`;
      else if (f.s.profit > 0 && f.recent < -50) f.badge = "cooling";
    }
    const earners = nowFacts.filter((f) => f.s.profit >= 0).slice(0, 7);
    const leaks = nowFacts.filter((f) => f.s.profit < 0).slice(0, 4);
    // Every leak names its biggest same-direction driver inside it.
    for (const f of leaks) {
      const inside = rankedFacts([f.chip], 2)
        .filter((x) => x.s.profit < 0)
        .sort((a, b) => a.s.profit - b.s.profit);
      if (inside.length > 0) f.why = `mostly ${inside[0].chip.value}`;
    }
    // The week line: the two biggest recent movers by money.
    const movers = [...nowFacts]
      .filter((f) => Math.abs(f.recent) >= 40)
      .sort((a, b) => Math.abs(b.recent) - Math.abs(a.recent))
      .slice(0, 2);
    const changedLine =
      movers.length === 0
        ? null
        : `This week: ${movers
            .map((f) => `${f.chip.value} ${money(f.recent)}`)
            .join(" · ")}`;
    // The urgent card: the biggest leak that is still active.
    const urgent =
      leaks.find(
        (f) => statsFor([f.chip], undefined, now + 1 - WEEK).wins +
          statsFor([f.chip], undefined, now + 1 - WEEK).losses >
          0
      ) ?? null;
    return { earners, leaks, changedLine, urgent };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, settled]);

  const total = statsFor([]);
  const here = statsFor(path);
  const hereName = path.map((c) => c.value).join(" · ");
  const inside = path.length > 0 ? rankedFacts(path, 2).slice(0, 5) : [];
  const addable = path.length > 0 ? rankedFacts(path, 2).slice(0, 10) : [];

  const hit = (s: Stats) =>
    s.wins + s.losses > 0
      ? `${Math.round((s.wins / (s.wins + s.losses)) * 100)}%`
      : "-";
  const roiOf = (s: Stats) =>
    s.staked > 0 ? `${((s.profit / s.staked) * 100).toFixed(1)}%` : "-";

  const cls = wire ? "p2w" : "p2k";

  function Spark({ data, up }: { data: number[]; up: boolean }) {
    if (data.length < 2) return null;
    const w = 56;
    const h = 20;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const r = max - min || 1;
    const pts = data
      .map(
        (v, i) =>
          `${((i / (data.length - 1)) * w).toFixed(1)},${(
            h - 2 - ((v - min) / r) * (h - 4)
          ).toFixed(1)}`
      )
      .join(" ");
    return (
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className={`${cls}-spark`}
        aria-hidden="true"
      >
        <polyline
          points={pts}
          fill="none"
          stroke={wire ? "#999" : up ? "#12A150" : "#EF4444"}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  function Row({ f, rank }: { f: Fact; rank: number | null }) {
    return (
      <button
        type="button"
        className={`${cls}-row`}
        onClick={() => {
          setPath([...path, f.chip]);
          setAddOpen(false);
        }}
      >
        {rank !== null && <span className={`${cls}-rank`}>{rank}</span>}
        {!wire && (
          <span className={`${cls}-ic`}>
            {ICONS[f.chip.value] ?? "\u{1F4CA}"}
          </span>
        )}
        <span className={`${cls}-name`}>
          <b>
            {f.chip.value}
            {f.badge !== null && (
              <em
                className={`${cls}-badge ${
                  f.badge.startsWith("▼") || f.badge === "cooling"
                    ? "cold"
                    : ""
                }`}
              >
                {f.badge}
              </em>
            )}
          </b>
          <i>
            {f.s.wins}-{f.s.losses} · {hit(f.s)} hit · {roiOf(f.s)} ROI
            {f.why !== null ? ` · ${f.why}` : ""}
          </i>
        </span>
        <Spark data={f.spark} up={f.s.profit >= 0} />
        <span className={`${cls}-money ${f.s.profit >= 0 ? "pos" : "neg"}`}>
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
          <p className="p2w-note">
            WIREFRAME of THE PORTFOLIO v2. New over v1: ranking =
            money x evidence x ACTIONABILITY (bet types and
            competitions above risk bands) x RECENCY; movement badges
            against last week plus the computed This week line;
            sparklines; one urgent card when a leak is active; leak
            rows name their biggest driver; and TOKENS on every fact
            page, so + Add a fact turns any page into any
            intersection. The Map survives as a view of this same
            ranking.
          </p>
        )}

        {path.length === 0 ? (
          <>
            <div className={`${cls}-head`}>
              <p className={`${cls}-k`}>Your performance</p>
              <span className={`${cls}-viewtoggle`}>
                List · <a href={wire ? "/preview/map" : "/preview/map-mock"}>Map</a>
              </span>
            </div>
            <p className={`${cls}-total`}>
              <b className={total.profit >= 0 ? "pos" : "neg"}>
                {money(total.profit)}
              </b>{" "}
              · {total.wins}-{total.losses} · {hit(total)} hit ·{" "}
              {roiOf(total)} ROI
            </p>
            {changedLine !== null && (
              <p className={`${cls}-week`}>{changedLine}</p>
            )}

            {urgent !== null && (
              <button
                type="button"
                className={`${cls}-urgent`}
                onClick={() => setPath([urgent.chip])}
              >
                <b>
                  {urgent.chip.value} is costing you $
                  {Math.abs(Math.round(urgent.s.profit)).toLocaleString(
                    "en-US"
                  )}
                  , and it is still active. Look closer ›
                </b>
                <i>
                  {urgent.s.wins}-{urgent.s.losses}
                  {urgent.why !== null ? ` · ${urgent.why}` : ""} ·{" "}
                  {money(urgent.recent)} this week
                </i>
              </button>
            )}

            <div className={`${cls}-list`}>
              {earners.map((f, i) => (
                <Row key={f.chip.value} f={f} rank={i + 1} />
              ))}
            </div>
            {leaks.length > 0 && (
              <>
                <p className={`${cls}-k ${cls}-leakhead`}>Where you leak</p>
                <div className={`${cls}-list`}>
                  {leaks.map((f) => (
                    <Row key={f.chip.value} f={f} rank={null} />
                  ))}
                </div>
              </>
            )}
            <p className={`${cls}-all`}>All facts ›</p>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`${cls}-back`}
              onClick={() => {
                setPath(path.slice(0, -1));
                setAddOpen(false);
              }}
            >
              ‹ Back
            </button>

            {/* THE TOKENS: the page's facts, removable, plus + Add a
                fact. V1 Lab's freedom living inside the page. */}
            <div className={`${cls}-tokens`}>
              {path.map((c) => (
                <button
                  key={`${c.group}|${c.value}`}
                  type="button"
                  className={`${cls}-token`}
                  onClick={() => {
                    const next = path.filter(
                      (x) => !(x.group === c.group && x.value === c.value)
                    );
                    setPath(next);
                    setAddOpen(false);
                  }}
                >
                  {c.value} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button
                type="button"
                className={`${cls}-addfact`}
                onClick={() => setAddOpen((v) => !v)}
              >
                + Add a fact
              </button>
            </div>

            {addOpen && (
              <div className={`${cls}-addpanel`}>
                {wire && (
                  <p className="p2w-hint">
                    Ranked flat, mixed dimensions, same scoring as the
                    list. Tap to intersect.
                  </p>
                )}
                {addable.map((f) => (
                  <button
                    key={`${f.chip.group}|${f.chip.value}`}
                    type="button"
                    className={`${cls}-addchip`}
                    onClick={() => {
                      setPath([...path, f.chip]);
                      setAddOpen(false);
                    }}
                  >
                    {!wire && ICONS[f.chip.value]
                      ? `${ICONS[f.chip.value]} `
                      : ""}
                    {f.chip.value}
                    <small className={f.s.profit >= 0 ? "pos" : "neg"}>
                      {money(f.s.profit)}
                    </small>
                  </button>
                ))}
              </div>
            )}

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
              {wire ? "[ trend chart for this question ]" : "[ chart ]"}
            </div>
            {inside.length > 0 && (
              <>
                <p className={`${cls}-k`}>Inside {hereName}</p>
                <div className={`${cls}-list`}>
                  {inside.map((f) => (
                    <Row key={f.chip.value} f={f} rank={null} />
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
  .p2w { min-height: 100svh; background: #fff; color: #111;
    padding: 20px 16px 40px; }
  [data-theme="dark"] .p2w { background: #111; color: #eee; }
  .p2w * { box-sizing: border-box; }
  .p2w-max { max-width: 470px; margin: 0 auto; }
  .p2w-note { border: 1px dashed #bbb; padding: 8px 10px; font-size: 11px;
    color: #888; margin-bottom: 14px; }
  .p2w-hint { font-size: 11px; color: #888; margin: 0 0 6px; }
  .p2w .pos { color: #15803d; } .p2w .neg { color: #dc2626; }
  [data-theme="dark"] .p2w .pos { color: #34d399; }
  [data-theme="dark"] .p2w .neg { color: #f87171; }
  .p2w-head { display: flex; justify-content: space-between;
    align-items: baseline; }
  .p2w-k { font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.06em; color: #888; margin: 14px 0 6px; }
  .p2w-viewtoggle { font-size: 12px; color: #888; }
  .p2w-viewtoggle a { color: inherit; }
  .p2w-total { font-size: 15px; margin: 0 0 4px; }
  .p2w-week { font-size: 12px; margin: 0 0 10px; padding: 6px 8px;
    background: #f1f1f1; border-left: 3px solid #111; }
  [data-theme="dark"] .p2w-week { background: #1c1c1c; border-color: #eee; }
  .p2w-urgent { display: block; width: 100%; text-align: left;
    border: 2px solid #dc2626; background: rgba(220,38,38,0.05);
    color: inherit; font-family: inherit; padding: 10px 12px;
    cursor: pointer; margin-bottom: 12px; }
  .p2w-urgent b { display: block; font-size: 14px; }
  .p2w-urgent i { font-style: normal; font-size: 11px; color: #888; }
  .p2w-list { border-top: 1px solid #ddd; }
  [data-theme="dark"] .p2w-list { border-top-color: #333; }
  .p2w-row { display: flex; align-items: center; gap: 8px; width: 100%;
    border: none; border-bottom: 1px solid #ddd; background: none;
    color: inherit; font-family: inherit; text-align: left;
    padding: 10px 2px; cursor: pointer; }
  [data-theme="dark"] .p2w-row { border-bottom-color: #333; }
  .p2w-rank { font-size: 12px; color: #888; width: 16px; flex: none; }
  .p2w-name { min-width: 0; flex: 1; }
  .p2w-name b { display: block; font-size: 14px; font-weight: 700; }
  .p2w-name i { font-style: normal; font-size: 11px; color: #888; }
  .p2w-badge { font-style: normal; font-size: 10px; font-weight: 700;
    margin-left: 6px; padding: 1px 5px; border: 1px solid #15803d;
    color: #15803d; }
  .p2w-badge.cold { border-color: #dc2626; color: #dc2626; }
  .p2w-spark { width: 56px; height: 20px; flex: none; }
  .p2w-money { font-size: 14px; font-weight: 700; flex: none; }
  .p2w-chev { color: #888; flex: none; }
  .p2w-all { font-size: 12px; color: #888; margin-top: 12px; }
  .p2w-back { border: 1px solid #999; background: none; color: inherit;
    font: inherit; padding: 2px 8px; cursor: pointer; margin-bottom: 8px; }
  .p2w-tokens { display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 8px; }
  .p2w-token { border: none; background: #111; color: #fff;
    font-family: inherit; font-size: 12px; font-weight: 700;
    padding: 5px 10px; cursor: pointer; }
  [data-theme="dark"] .p2w-token { background: #eee; color: #111; }
  .p2w-addfact { border: 1px dashed #999; background: none;
    color: #888; font-family: inherit; font-size: 12px;
    font-weight: 600; padding: 5px 10px; cursor: pointer; }
  .p2w-addpanel { border: 1px solid #ddd; padding: 8px;
    margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  [data-theme="dark"] .p2w-addpanel { border-color: #333; }
  .p2w-addchip { border: 1px solid #999; background: none;
    color: inherit; font-family: inherit; font-size: 12px;
    font-weight: 600; padding: 4px 8px; cursor: pointer;
    display: flex; gap: 5px; }
  .p2w-addchip small { font-size: 11px; }
  .p2w-big { font-size: 30px; font-weight: 700; margin: 2px 0 8px; }
  .p2w-tiles { display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 6px; margin-bottom: 10px; }
  .p2w-tiles span { border: 1px solid #ccc; padding: 8px 6px;
    text-align: center; }
  .p2w-tiles b { display: block; font-size: 14px; }
  .p2w-tiles i { font-style: normal; font-size: 9px; color: #888;
    text-transform: uppercase; letter-spacing: 0.06em; }
  .p2w-chart { border: 1px dashed #bbb; color: #999; font-size: 11px;
    text-align: center; padding: 26px 0; margin-bottom: 6px; }
`;

const MOCK_CSS = `
  .p2k { min-height: 100svh; background: #FFFFFF; color: #171717;
    padding: 24px 16px 48px;
    --pf-muted: #737373; --pf-inner: #F6F6F8;
    --pf-ring: rgba(23,23,23,0.10); }
  [data-theme="dark"] .p2k { background: #090B17; color: #F4F4F6;
    --pf-muted: #9CA3AF; --pf-inner: #1B1D30;
    --pf-ring: rgba(255,255,255,0.08); }
  .p2k * { box-sizing: border-box; }
  .p2k-max { max-width: 430px; margin: 0 auto; }
  .p2k .pos { color: #12A150; } .p2k .neg { color: #EF4444; }
  [data-theme="dark"] .p2k .pos { color: #4ADE80; }
  [data-theme="dark"] .p2k .neg { color: #F87171; }
  .p2k-head { display: flex; justify-content: space-between;
    align-items: baseline; }
  .p2k-k { font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--pf-muted); margin: 16px 0 8px; }
  .p2k-viewtoggle { font-size: 12px; font-weight: 600;
    color: var(--pf-muted); }
  .p2k-viewtoggle a { color: #430EDB; text-decoration: none; }
  [data-theme="dark"] .p2k-viewtoggle a { color: #8B5CF6; }
  .p2k-total { font-size: 22px; font-weight: 600; margin: 0 0 6px;
    font-variant-numeric: tabular-nums; }
  .p2k-total b { font-weight: 600; }
  .p2k-week { font-size: 12px; font-weight: 600; color: #430EDB;
    margin: 0 0 12px; }
  [data-theme="dark"] .p2k-week { color: #8B5CF6; }
  .p2k-urgent { display: block; width: 100%; text-align: left;
    border: none; border-radius: 16px;
    background: rgba(239,68,68,0.08); color: inherit;
    font-family: inherit; padding: 12px 14px; cursor: pointer;
    margin-bottom: 12px; }
  [data-theme="dark"] .p2k-urgent { background: rgba(248,113,113,0.10); }
  .p2k-urgent b { display: block; font-size: 14px; font-weight: 700; }
  .p2k-urgent i { font-style: normal; font-size: 11px;
    color: var(--pf-muted); }
  .p2k-list { background: var(--pf-inner); border-radius: 16px;
    padding: 4px 12px; }
  .p2k-row { display: flex; align-items: center; gap: 8px; width: 100%;
    border: none; border-bottom: 1px solid var(--pf-ring);
    background: none; color: inherit; font-family: inherit;
    text-align: left; padding: 11px 0; cursor: pointer; }
  .p2k-row:last-child { border-bottom: none; }
  .p2k-rank { font-size: 12px; font-weight: 700; color: var(--pf-muted);
    width: 14px; flex: none; font-variant-numeric: tabular-nums; }
  .p2k-ic { width: 32px; height: 32px; border-radius: 999px;
    background: #FFFFFF; box-shadow: 0 0 0 1px var(--pf-ring);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex: none; }
  [data-theme="dark"] .p2k-ic { background: #131524; }
  .p2k-name { min-width: 0; flex: 1; }
  .p2k-name b { display: block; font-size: 14px; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p2k-name i { font-style: normal; font-size: 10.5px;
    color: var(--pf-muted); font-variant-numeric: tabular-nums; }
  .p2k-badge { font-style: normal; font-size: 9px; font-weight: 800;
    margin-left: 6px; padding: 2px 5px; border-radius: 999px;
    background: rgba(18,161,80,0.14); color: #0E7A3D;
    vertical-align: 2px; }
  [data-theme="dark"] .p2k-badge { background: rgba(74,222,128,0.16);
    color: #4ADE80; }
  .p2k-badge.cold { background: rgba(239,68,68,0.12); color: #B42318; }
  [data-theme="dark"] .p2k-badge.cold {
    background: rgba(248,113,113,0.14); color: #F87171; }
  .p2k-spark { width: 52px; height: 20px; flex: none; }
  .p2k-money { font-size: 13.5px; font-weight: 700; flex: none;
    font-variant-numeric: tabular-nums; }
  .p2k-chev { color: var(--pf-muted); flex: none; font-weight: 700; }
  .p2k-leakhead { color: #EF4444; }
  [data-theme="dark"] .p2k-leakhead { color: #F87171; }
  .p2k-all { font-size: 13px; font-weight: 600; color: #430EDB;
    margin-top: 14px; }
  [data-theme="dark"] .p2k-all { color: #8B5CF6; }
  .p2k-back { border: none; background: var(--pf-inner); color: inherit;
    font-family: inherit; font-size: 12px; font-weight: 700;
    padding: 5px 12px; border-radius: 999px; cursor: pointer;
    margin-bottom: 10px; }
  .p2k-tokens { display: flex; flex-wrap: wrap; gap: 8px;
    margin-bottom: 10px; }
  .p2k-token { border: none; cursor: pointer; font-family: inherit;
    background: linear-gradient(#5525C6, #4915AD); color: #fff;
    font-size: 13px; font-weight: 700; padding: 8px 12px;
    border-radius: 999px; }
  .p2k-token span { opacity: 0.75; margin-left: 2px; }
  .p2k-addfact { font-size: 13px; font-weight: 600;
    color: var(--pf-muted); border: 1.5px dashed var(--pf-ring);
    border-radius: 999px; padding: 7px 12px; background: none;
    font-family: inherit; cursor: pointer; }
  .p2k-addpanel { background: var(--pf-inner); border-radius: 14px;
    padding: 10px; margin-bottom: 12px; display: flex;
    flex-wrap: wrap; gap: 6px; }
  .p2k-addchip { border: none; background: #FFFFFF;
    box-shadow: 0 0 0 1px var(--pf-ring); color: inherit;
    font-family: inherit; font-size: 12.5px; font-weight: 600;
    padding: 6px 10px; border-radius: 999px; cursor: pointer;
    display: flex; gap: 6px; align-items: baseline; }
  [data-theme="dark"] .p2k-addchip { background: #131524; }
  .p2k-addchip small { font-size: 11px;
    font-variant-numeric: tabular-nums; }
  .p2k-big { font-size: 34px; font-weight: 600; margin: 2px 0 10px;
    font-variant-numeric: tabular-nums; }
  .p2k-tiles { display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; margin-bottom: 12px; }
  .p2k-tiles span { background: var(--pf-inner); border-radius: 12px;
    padding: 10px 6px; text-align: center; }
  .p2k-tiles b { display: block; font-size: 15px; font-weight: 600;
    font-variant-numeric: tabular-nums; }
  .p2k-tiles i { font-style: normal; font-size: 9px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--pf-muted); }
  .p2k-chart { background: var(--pf-inner); border-radius: 14px;
    color: var(--pf-muted); font-size: 11px; text-align: center;
    padding: 34px 0; margin-bottom: 6px; }
`;
