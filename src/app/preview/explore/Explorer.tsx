"use client";

// LOCAL PREVIEW of the Performance explorer, the "path you walk"
// direction the owner asked to see before any real build. Gitignored,
// never deployed. It reuses the real components (ProfitPanel,
// HeadlineProfit, BetHistory, the insight cards) and the real money
// rules (legShares, legStakeShares, effectiveResult), so what the
// screenshots show is what the real page would compute.
//
// THE MODEL. The screen always shows ONE analytical context, built
// as a list of constraints (Football, then Moneyline, then Premier
// League...). Every constraint narrows the same set of picks. The
// dimensions are independent: the trail records the order the USER
// walked, it never claims Competition lives under Category.

import { useState } from "react";
import MicroLabel from "@/components/MicroLabel";
import BetHistory from "@/components/BetHistory";
import HeadlineProfit from "@/components/HeadlineProfit";
import InsightCard from "@/components/InsightCard";
import KeyInsights from "@/components/KeyInsights";
import ProfitPanel, { type Period } from "@/components/ProfitPanel";
import TabBar from "@/components/TabBar";
import { formatMoney, formatSignedMoney, round2 } from "@/lib/format";
import {
  effectiveResult,
  legShares,
  legStakeShares,
  periodStart,
} from "@/lib/stats";
import { domainOf, type Domain } from "@/lib/taxonomy";
import {
  SPORT_EMOJI,
  type BetWithLegs,
  type Leg,
  type Sport,
} from "@/lib/types";
import { CARD, NO_SCROLLBAR } from "@/lib/ui";

type DimKey =
  | "sport"
  | "category"
  | "market"
  | "competition"
  | "period"
  | "betType";

type Constraint = { dim: DimKey; value: string };

type DomainChoice = Domain | "Everything";

// The honest fallback buckets. They render muted and sit last: real
// names first, the unassigned pile visible but never dressed up.
const FALLBACK_LABELS = new Set([
  "No category",
  "Unspecified",
  "No competition set",
  "Unclassified",
]);

function dimLabel(dim: DimKey, domain: DomainChoice): string {
  if (dim === "sport") return domain === "Sports" ? "Sport" : "Subject";
  if (dim === "category") return "Category";
  if (dim === "market") return "Market";
  if (dim === "competition") return "Competition";
  if (dim === "period") return "Period";
  return "Bet type";
}

function valueOf(bet: BetWithLegs, leg: Leg, dim: DimKey): string {
  if (dim === "sport") return leg.sport;
  if (dim === "category") return leg.subcategory ?? "No category";
  if (dim === "market") return leg.market ?? "Unspecified";
  if (dim === "period") return leg.period ?? "Full time";
  if (dim === "competition") return leg.competition ?? "No competition set";
  return bet.legs.length > 1 ? "Parlays" : "Single bets";
}

function pickCount(bet: BetWithLegs): number {
  return Math.max(1, (bet.bet_buys ?? []).length);
}

function profitColor(value: number): string {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-red-600 dark:text-red-400";
  return "text-neutral-500 dark:text-neutral-400";
}

function pctLabel(wins: number, total: number): string {
  if (total === 0) return "-";
  return `${Math.round((wins / total) * 100)}%`;
}

interface Row {
  label: string;
  wins: number;
  losses: number;
  profit: number;
}

function Fact({
  label,
  value,
  tone,
  border = false,
}: {
  label: string;
  value: string;
  tone?: string;
  border?: boolean;
}) {
  return (
    <div
      className={`text-center ${
        border ? "border-l border-neutral-900/10 dark:border-white/10" : ""
      }`}
    >
      <MicroLabel>{label}</MicroLabel>
      <p
        className={`mt-0.5 font-money text-[17px] font-bold tabular-nums ${
          tone ?? "text-neutral-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function Explorer({
  bets,
  netProfit,
}: {
  bets: BetWithLegs[];
  netProfit: number;
}) {
  const [domain, setDomain] = useState<DomainChoice>("Sports");
  const [domainsOpen, setDomainsOpen] = useState(false);
  const [path, setPath] = useState<Constraint[]>([]);
  // null means the default dimension for wherever the user stands.
  const [dim, setDim] = useState<DimKey | null>(null);
  const [showBets, setShowBets] = useState(false);
  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [scrub, setScrub] = useState<{ value: number; date: Date } | null>(
    null
  );

  const settled = bets.filter(
    (b) => b.status !== "pending" && b.settled_at !== null
  );

  let from: Date | null = null;
  let to: Date | null = null;
  if (period === "custom") {
    from = customFrom ? new Date(customFrom + "T00:00:00") : null;
    to = customTo ? new Date(customTo + "T23:59:59.999") : null;
  } else if (period !== "all") {
    from = periodStart(period);
  }
  const inPeriod = settled.filter((b) => {
    const d = new Date(b.settled_at as string);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });

  const ctx = new Map<DimKey, string>(path.map((c) => [c.dim, c.value]));

  function legMatches(bet: BetWithLegs, leg: Leg): boolean {
    if (domain !== "Everything" && domainOf(leg.sport) !== domain)
      return false;
    for (const [d, v] of ctx) {
      if (valueOf(bet, leg, d) !== v) return false;
    }
    return true;
  }

  // Everything below runs off ONE pass over the matching picks, with
  // the app's money rules: profit split by legShares, stakes split by
  // legStakeShares, singles counting every buy as a pick.
  let wins = 0;
  let losses = 0;
  let profit = 0;
  let staked = 0;
  let returned = 0;
  const distinct = new Map<DimKey, Map<string, Row>>();
  const allDims: DimKey[] = [
    "sport",
    "category",
    "market",
    "competition",
    "period",
    "betType",
  ];
  for (const d of allDims) distinct.set(d, new Map());
  const behind: BetWithLegs[] = [];

  for (const bet of inPeriod) {
    const shares = legShares(bet);
    const stakes = legStakeShares(bet);
    const isSingle = bet.legs.length === 1;
    let any = false;
    bet.legs.forEach((leg, i) => {
      if (!legMatches(bet, leg)) return;
      any = true;
      const result = effectiveResult(bet, leg);
      const picks = isSingle ? pickCount(bet) : 1;
      if (result === "won") wins += picks;
      if (result === "lost") losses += picks;
      profit += shares[i] ?? 0;
      staked += stakes[i] ?? 0;
      returned += (stakes[i] ?? 0) + (shares[i] ?? 0);
      for (const d of allDims) {
        const label = valueOf(bet, leg, d);
        const map = distinct.get(d)!;
        const row = map.get(label) ?? { label, wins: 0, losses: 0, profit: 0 };
        if (result === "won") row.wins += picks;
        if (result === "lost") row.losses += picks;
        row.profit += shares[i] ?? 0;
        map.set(label, row);
      }
    });
    if (any) behind.push(bet);
  }
  behind.sort(
    (a, b) =>
      new Date(b.settled_at ?? 0).getTime() -
      new Date(a.settled_at ?? 0).getTime()
  );

  // A dimension is offered when the current picks actually vary on
  // it. One value would be a row repeating the headline; a sport with
  // no period data never shows Period at all. Market waits for a
  // category, so its list never mixes BTTS into Match Winner.
  function available(d: DimKey): boolean {
    if (ctx.has(d)) return false;
    if (d === "market" && !ctx.has("category")) return false;
    const values = distinct.get(d)!;
    if (d === "period" || d === "competition") {
      const real = [...values.keys()].filter((v) => !FALLBACK_LABELS.has(v));
      return real.length >= 1 && values.size >= 2;
    }
    return values.size >= 2;
  }
  const dims = allDims.filter(available);
  const activeDim = dim !== null && dims.includes(dim) ? dim : dims[0] ?? null;

  const rows =
    activeDim === null
      ? []
      : [...distinct.get(activeDim)!.values()].sort((a, b) => {
          const af = FALLBACK_LABELS.has(a.label) ? 1 : 0;
          const bf = FALLBACK_LABELS.has(b.label) ? 1 : 0;
          if (af !== bf) return af - bf;
          return b.profit - a.profit;
        });

  const roi = staked > 0 ? (profit / staked) * 100 : null;
  const atRoot = path.length === 0;
  const contextLabel =
    path.length > 0 ? path[path.length - 1].value : domain;
  const chartSport =
    domain === "Sports" && ctx.has("sport")
      ? (ctx.get("sport") as Sport)
      : null;

  // Domain rows for the switcher, from the whole record.
  const domainRows = new Map<string, Row>();
  for (const bet of settled) {
    const shares = legShares(bet);
    const isSingle = bet.legs.length === 1;
    bet.legs.forEach((leg, i) => {
      const label = domainOf(leg.sport);
      const row =
        domainRows.get(label) ?? { label, wins: 0, losses: 0, profit: 0 };
      const result = effectiveResult(bet, leg);
      const picks = isSingle ? pickCount(bet) : 1;
      if (result === "won") row.wins += picks;
      if (result === "lost") row.losses += picks;
      row.profit += shares[i] ?? 0;
      domainRows.set(label, row);
    });
  }

  const pillClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
      active
        ? "border-brand-mark bg-brand-top text-white"
        : "border-neutral-300 bg-white text-neutral-600 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-300"
    }`;

  function drill(value: string) {
    if (activeDim === null) return;
    setPath([...path, { dim: activeDim, value }]);
    setDim(null);
    setShowBets(false);
    setDomainsOpen(false);
  }

  function backTo(index: number) {
    setPath(path.slice(0, index));
    setDim(null);
    setShowBets(false);
  }

  const periodLabel =
    period === "all"
      ? "All time"
      : period === "today"
        ? "Today"
        : period === "week"
          ? "This week"
          : period === "month"
            ? "This month"
            : period === "year"
              ? "This year"
              : "Custom";

  return (
    <main className="flex min-h-svh flex-col px-4 pt-6 pb-2 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-bold tracking-tight">Performance</h1>
        </header>

        {/* THE TRAIL. Where you stand analytically: the order YOU
            walked, not a hierarchy. Tap any earlier step to return to
            it. The first step is the domain; at the root it opens the
            quiet domain switcher instead of a giant chip row. */}
        <div
          className={`-mx-4 -mt-1 flex items-center gap-1 overflow-x-auto px-4 text-sm font-semibold ${NO_SCROLLBAR}`}
        >
          <button
            type="button"
            onClick={() =>
              atRoot ? setDomainsOpen((v) => !v) : backTo(0)
            }
            className={
              atRoot
                ? "shrink-0 text-neutral-900 dark:text-white"
                : "shrink-0 text-neutral-500 underline-offset-2 dark:text-neutral-400"
            }
          >
            {domain}
            {atRoot && (
              <span aria-hidden="true" className="ml-1 text-xs text-neutral-400">
                ▾
              </span>
            )}
          </button>
          {path.map((c, i) => {
            const last = i === path.length - 1;
            return (
              <span key={`${c.dim}-${c.value}`} className="flex shrink-0 items-center gap-1">
                <span aria-hidden="true" className="text-neutral-400">
                  ›
                </span>
                {last ? (
                  <span className="text-neutral-900 dark:text-white">
                    {c.value}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => backTo(i + 1)}
                    className="text-neutral-500 dark:text-neutral-400"
                  >
                    {c.value}
                  </button>
                )}
              </span>
            );
          })}
        </div>

        {/* THE DOMAIN SWITCHER. Sports first, the others one quiet
            tap away, never a permanent chip row on the page. */}
        {domainsOpen && atRoot && (
          <section className={`${CARD} p-4`}>
            <MicroLabel>Where to look</MicroLabel>
            <div className="mt-2 divide-y divide-neutral-300/60 dark:divide-neutral-800">
              {[
                ...[...domainRows.values()].sort((a, b) => b.profit - a.profit),
                { label: "Everything", wins: 0, losses: 0, profit: 0 },
              ].map((row) => (
                <button
                  key={row.label}
                  type="button"
                  onClick={() => {
                    setDomain(row.label as DomainChoice);
                    setDomainsOpen(false);
                    setDim(null);
                    setShowBets(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 py-2.5"
                >
                  <p
                    className={`text-sm font-semibold ${
                      row.label === domain ? "" : ""
                    }`}
                  >
                    {row.label}
                    {row.label === domain && (
                      <span className="ml-1.5 text-xs text-brand-mark">✓</span>
                    )}
                  </p>
                  {row.label !== "Everything" && (
                    <span className="flex shrink-0 items-center gap-4">
                      <span className="text-xs tabular-nums text-neutral-400">
                        {row.wins}-{row.losses}
                      </span>
                      <span
                        className={`w-20 font-money text-right text-sm font-bold tabular-nums ${profitColor(
                          row.profit
                        )}`}
                      >
                        {formatSignedMoney(round2(row.profit))}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* THE REVIEW lives at the root only: insight first, numbers
            second, exactly the insight -> performance -> explanation
            -> bets order. Deeper levels are pure analysis. */}
        {atRoot && (
          <>
            <InsightCard bets={bets} linked={false} />
            <KeyInsights bets={settled} />
          </>
        )}

        <section>
          <ProfitPanel
            bets={behind}
            sport={chartSport}
            from={from}
            to={to}
            period={period}
            onPeriodChange={setPeriod}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFrom={setCustomFrom}
            onCustomTo={setCustomTo}
            onScrub={setScrub}
            header={
              <div className="mt-2">
                <HeadlineProfit
                  label={`${periodLabel} / ${contextLabel}`}
                  profit={profit}
                  roi={null}
                  scrub={scrub}
                />
              </div>
            }
            footer={
              <div className="mt-1 grid grid-cols-3 gap-y-3 border-t border-neutral-900/10 pt-3 dark:border-white/10">
                <Fact label="Picks" value={`${wins + losses}`} />
                <Fact label="Record" value={`${wins}-${losses}`} border />
                <Fact
                  label="Hit rate"
                  value={pctLabel(wins, wins + losses)}
                  border
                />
                <Fact label="Staked" value={formatMoney(round2(staked))} />
                <Fact
                  label="Returned"
                  value={formatMoney(round2(returned))}
                  border
                />
                <Fact
                  label="ROI"
                  value={roi === null ? "-" : `${roi.toFixed(1)}%`}
                  tone={profitColor(roi ?? 0)}
                  border
                />
              </div>
            }
          />
        </section>

        {wins + losses === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-white/15">
            No settled picks here yet.
          </p>
        ) : (
          <>
            {/* BREAK DOWN BY. The independent dimensions, offered only
                where the current picks actually vary on them. */}
            {dims.length > 0 && (
              <div>
                <MicroLabel>Break down by</MicroLabel>
                <div
                  className={`-mx-4 mt-1.5 flex gap-2 overflow-x-auto px-4 pb-1 ${NO_SCROLLBAR}`}
                >
                  {dims.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDim(d)}
                      className={pillClass(d === activeDim)}
                    >
                      {dimLabel(d, domain)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeDim !== null && rows.length > 0 && (
              <section className={`${CARD} p-4`}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-bold">
                    {dimLabel(activeDim, domain)}
                  </h2>
                  <MicroLabel>Record / P&L</MicroLabel>
                </div>
                <div className="mt-2 divide-y divide-neutral-300/60 dark:divide-neutral-800">
                  {rows.map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => drill(row.label)}
                      className="flex w-full items-center justify-between gap-3 py-2.5"
                    >
                      <p
                        className={`min-w-0 truncate text-left text-sm font-semibold ${
                          FALLBACK_LABELS.has(row.label)
                            ? "text-neutral-500 dark:text-neutral-400"
                            : ""
                        }`}
                      >
                        {activeDim === "sport" && SPORT_EMOJI[row.label as Sport]
                          ? `${SPORT_EMOJI[row.label as Sport]} `
                          : ""}
                        {row.label}
                      </p>
                      <span className="flex shrink-0 items-center gap-4">
                        <span className="text-xs tabular-nums text-neutral-400">
                          {row.wins}-{row.losses}
                        </span>
                        <span
                          className={`w-20 font-money text-right text-sm font-bold tabular-nums ${profitColor(
                            row.profit
                          )}`}
                        >
                          {formatSignedMoney(round2(row.profit))}
                        </span>
                        <span aria-hidden="true" className="text-neutral-400">
                          ›
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* THE BETS BEHIND THE NUMBER. Every level ends here, so
                no figure is ever more than one tap from the tickets
                that made it. */}
            <button
              type="button"
              onClick={() => setShowBets((v) => !v)}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-[#0E1228]"
            >
              {showBets
                ? "Hide the bets"
                : `See the ${behind.length} bets behind this ›`}
            </button>
            {showBets && <BetHistory bets={behind} />}
          </>
        )}

        {atRoot && (
          <p className="pb-2 text-center text-xs text-neutral-400">
            Net profit{" "}
            <span className="font-money tabular-nums">
              {formatSignedMoney(round2(netProfit))}
            </span>{" "}
            · preview data
          </p>
        )}
      </div>
      <TabBar activeHref="/stats" />
    </main>
  );
}
