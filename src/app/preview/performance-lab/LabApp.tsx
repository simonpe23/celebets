"use client";

// The Lab body: the current view tray, the live answer panel, and
// the six chip groups. Every number on this page flows through the
// pf engine, which speaks src/lib/stats.ts, so Lab agrees with every
// other surface to the cent.
//
// The behaviours ruled in docs/performance-rebuild.md, all live here:
// - Tap a chip and the whole page re-scopes in place. No submit.
// - Every chip is priced at the intersection it would create.
// - Chips read as a record (12-4), never a percent, never an amount.
// - Selecting combines. Compare appears at exactly two selections,
//   flips the answer to side by side, and disappears at three.
// - The Sport header carries the domain arrow. Picking a domain
//   rescopes Sport, League, Category and When and clears the
//   selection, because domains never combine.
// - Removing the last chip lands on the clean, calm, complete Lab.
// - Groups with nothing behind them hide, as a data state.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Domain } from "@/lib/taxonomy";
import {
  hitOf,
  makeEngine,
  money,
  roiOf,
  type Chip,
  type Stats,
} from "../pf/engine";
import {
  BallIcon,
  Chev,
  ChevDown,
  DollarIcon,
  FactNote,
  FactTarget,
  FactTrend,
  FactWave,
  GoldSparkle,
  InfoDot,
  LayersIcon,
  TrendTileIcon,
  WashTexture,
} from "../performance-home/icons";
import {
  AmFootballIcon,
  BaseballIcon,
  BasketballIcon,
  ChainIcon,
  ClockIcon,
  CloseIcon,
  CoinIcon,
  CompareIcon,
  FlagIcon,
  GaugeIcon,
  GoalIcon,
  HockeyIcon,
  PlusIcon,
  SpreadIcon,
  TargetIcon,
  TennisIcon,
  TotalsIcon,
  TrophyIcon,
  WhistleIcon,
} from "./lab-icons";
import { labBets } from "./lab-data";
import {
  buildGroups,
  DOMAINS,
  leagueSports,
  marketsUnder,
  recordOf,
} from "./lab-model";
import {
  GREEN,
  GREY_TEXT,
  HAIR,
  INDIGO,
  INDIGO_FILL,
  INK,
  MENU_IDLE,
  NET_LABEL,
  ORANGE,
  PILL_LAV,
  RED,
} from "./ui";
import { LabChart } from "./chart";

// ---------------------------------------------------------------
// Icons per chip value. One fact keeps one icon: values Home's list
// already draws reuse Home's exact icon.
// ---------------------------------------------------------------

function sportIcon(v: string): ReactNode {
  if (v === "Football") return <BallIcon size={20} />;
  if (v === "Basketball") return <BasketballIcon />;
  if (v === "Baseball") return <BaseballIcon />;
  if (v === "Tennis") return <TennisIcon />;
  if (v === "Ice Hockey") return <HockeyIcon />;
  if (v === "American Football") return <AmFootballIcon />;
  if (v === "Crypto") return <CoinIcon />;
  return <TargetIcon />;
}

function chipIcon(c: Chip, leagueSport?: string): ReactNode {
  const v = c.value;
  if (c.group === "sport") return sportIcon(v);
  if (c.group === "what") {
    if (v === "Moneyline") return <DollarIcon size={20} />;
    if (v === "Spread / Handicap") return <SpreadIcon />;
    if (v === "Totals (Over/Under)") return <TotalsIcon />;
    if (v === "Player Props") return <TargetIcon />;
    if (v === "Match Props") return <WhistleIcon />;
    if (v === "Price Direction") return <TrendTileIcon size={20} />;
    if (v === "BTTS") return <GoalIcon />;
    if (v === "Corners") return <FlagIcon />;
    return <DollarIcon size={20} />;
  }
  // A league wears its sport's mark; the trophy is the fallback for
  // a competition whose sport the record does not name.
  if (c.group === "where")
    return leagueSport ? sportIcon(leagueSport) : <TrophyIcon />;
  if (c.group === "when") return <ClockIcon half={v.includes("Half")} />;
  if (c.group === "how")
    return v === "Singles" ? <LayersIcon size={20} /> : <ChainIcon />;
  const level = v === "Low odds" ? 0 : v === "Medium odds" ? 1 : 2;
  return <GaugeIcon level={level} />;
}

const sameChip = (a: Chip, b: Chip) =>
  a.group === b.group && a.kind === b.kind && a.value === b.value;

// ---------------------------------------------------------------
// URL transport: the selection lives in the address, so a Home tap
// can hand one over and a refresh keeps the view.
// ?sel=sport~plain~Football|what~category~Moneyline&domain=Sports
// ---------------------------------------------------------------

function parseSel(raw: string | null): Chip[] {
  if (!raw) return [];
  const out: Chip[] = [];
  for (const part of raw.split("|")) {
    const [group, kind, ...rest] = part.split("~");
    const value = rest.join("~");
    if (!group || !kind || !value) continue;
    if (!["sport", "what", "where", "when", "how", "risk"].includes(group)) continue;
    if (!["plain", "category", "market"].includes(kind)) continue;
    out.push({ group, kind, value } as Chip);
  }
  return out;
}

function selToUrl(sel: Chip[], domain: Domain): string {
  const p = new URLSearchParams();
  if (sel.length > 0)
    p.set("sel", sel.map((c) => `${c.group}~${c.kind}~${c.value}`).join("|"));
  if (domain !== "Sports") p.set("domain", domain);
  const q = p.toString();
  return q ? `?${q}` : window.location.pathname;
}

export default function LabApp() {
  const engine = useMemo(() => makeEngine(labBets), []);
  const params = useSearchParams();
  const [domain, setDomain] = useState<Domain>(() => {
    const d = params.get("domain");
    return (DOMAINS as string[]).includes(d ?? "") ? (d as Domain) : "Sports";
  });
  const [sel, setSel] = useState<Chip[]>(() => parseSel(params.get("sel")));
  const [view, setView] = useState<"combined" | "side">("combined");
  const [domainOpen, setDomainOpen] = useState(false);
  const groupsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sel.length !== 2 && view === "side") setView("combined");
  }, [sel.length, view]);

  useEffect(() => {
    window.history.replaceState(null, "", selToUrl(sel, domain));
  }, [sel, domain]);

  const groups = useMemo(
    () => buildGroups(engine, domain, sel),
    [engine, domain, sel]
  );
  const leagueSportMap = useMemo(() => leagueSports(engine.settled), [engine]);
  const whole = useMemo(() => engine.statsFor(sel), [engine, sel]);
  const chartPoints = useMemo(
    () => engine.runningFor(sel).map((r) => ({ t: r.t, v: r.profit })),
    [engine, sel]
  );
  const picks = whole.wins + whole.losses;

  const isSelected = (c: Chip) => sel.some((s) => sameChip(s, c));

  // Every chip is priced at the intersection it would create with
  // the OTHER groups: with Moneyline selected, the Football chip
  // reads Football-Moneyline, and Basketball reads its own
  // Basketball-Moneyline line beside it, so siblings stay
  // comparable. Tapping a sibling still combines; only the price on
  // the chip is the fact's own line in context.
  function priceOf(c: Chip): Stats {
    const others = sel.filter((s) => s.group !== c.group);
    return engine.statsFor([...others, c]);
  }

  function toggle(c: Chip) {
    setSel((s) => {
      if (s.some((x) => sameChip(x, c))) return s.filter((x) => !sameChip(x, c));
      // A market drills into its category: it replaces the category
      // chip rather than sitting beside it as a second selection.
      if (c.kind === "market") {
        const cats = marketCategoryOf(c.value);
        return [...s.filter((x) => !(x.kind === "category" && cats.has(x.value))), c];
      }
      return [...s, c];
    });
  }

  // Which categories a market belongs to, from the record itself.
  const marketParents = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const bet of engine.settled)
      for (const leg of bet.legs) {
        if (!leg.market || !leg.subcategory) continue;
        if (!m.has(leg.market)) m.set(leg.market, new Set());
        m.get(leg.market)!.add(leg.subcategory);
      }
    return m;
  }, [engine]);
  const marketCategoryOf = (market: string) =>
    marketParents.get(market) ?? new Set<string>();

  const compareReady = sel.length === 2;
  const sideA = compareReady ? engine.statsFor([sel[0]]) : null;
  const sideB = compareReady ? engine.statsFor([sel[1]]) : null;

  return (
    <>
      {/* The colour wash behind the answer panel, the accepted Home's
          own asset, shifted down past the tray. */}
      <div className="pointer-events-none absolute inset-x-0 top-[92px] h-[245px]">
        <Image
          src="/preview-assets/home-wash.png"
          alt=""
          fill
          priority
          sizes="390px"
          style={{ objectFit: "fill" }}
        />
        <WashTexture />
      </div>

      {/* The current view tray. */}
      <div className="relative mt-[12px] flex items-center justify-between pl-[22px] pr-[14px]">
        <p className="text-[10.5px] font-semibold" style={{ color: NET_LABEL }}>
          Your current view
        </p>
        <span
          className="flex h-[24px] items-center rounded-full bg-white px-[12px] text-[9.5px] font-semibold"
          style={{ color: "#252F3E", boxShadow: "0 1px 3px rgba(30,25,60,0.07)" }}
        >
          All time
        </span>
      </div>
      <div className="relative mt-[7px] flex flex-wrap items-center gap-[6px] pl-[20px] pr-[14px]">
        {sel.map((c) => (
          <button
            key={`${c.group}~${c.kind}~${c.value}`}
            onClick={() => toggle(c)}
            className="flex h-[28px] items-center gap-[6px] rounded-full pl-[12px] pr-[9px] text-[10.5px] font-bold text-white"
            style={{ background: INDIGO_FILL }}
          >
            {c.value}
            <CloseIcon size={11} color="#DDD6FA" />
          </button>
        ))}
        <button
          onClick={() =>
            groupsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="flex h-[28px] items-center gap-[5px] rounded-full bg-white pl-[10px] pr-[13px] text-[10.5px] font-semibold"
          style={{ color: MENU_IDLE, boxShadow: `inset 0 0 0 1px ${HAIR}` }}
        >
          <PlusIcon size={13} />
          Add a fact
        </button>
        {sel.length === 0 ? (
          <span className="text-[8.9px]" style={{ color: GREY_TEXT }}>
            Showing your whole record
          </span>
        ) : null}
      </div>

      {view === "side" && sideA && sideB ? (
        /* SIDE BY SIDE: the same two selections, read as rivals.
           What it must answer, in order: which is better, by how
           much in profit and record, and on how many picks. */
        <div className="relative mt-[14px] px-[15px]">
          <p className="pl-[7px] text-[10.5px] font-semibold" style={{ color: NET_LABEL }}>
            Side by side
          </p>
          <p className="mt-[3px] pl-[7px] text-[13.5px] font-bold leading-snug">
            {verdict(sel[0].value, sideA, sel[1].value, sideB)}
          </p>
          <div className="mt-[10px] flex gap-[8px]">
            {[
              { name: sel[0].value, s: sideA },
              { name: sel[1].value, s: sideB },
            ].map(({ name, s }) => (
              <div
                key={name}
                className="flex-1 rounded-[13px] bg-white p-[12px]"
                style={{ boxShadow: "0 6px 16px rgba(28,24,58,0.08)" }}
              >
                <p className="truncate text-[10.2px] font-bold">{name}</p>
                <p className="mt-[6px] text-[21px] font-bold leading-none" style={{ color: INDIGO }}>
                  {recordOf(s)}
                </p>
                <p className="mt-[3px] text-[8.2px] font-semibold" style={{ color: GREY_TEXT }}>
                  {hitOf(s)} hit rate
                </p>
                <p
                  className="mt-[8px] text-[13px] font-bold leading-none"
                  style={{ color: s.profit < 0 ? RED : GREEN }}
                >
                  {money(s.profit)}
                </p>
                <p className="mt-[3px] text-[8.2px] font-semibold" style={{ color: GREY_TEXT }}>
                  {s.wins + s.losses} picks · ROI {roiOf(s)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* THE ANSWER: net profit for the current view, the line that
           drew it, and the four ruled KPIs. */
        <>
          <div className="relative mt-[10px] flex items-center gap-[1px] pl-[22px]">
            <p className="text-[10.5px] font-semibold" style={{ color: NET_LABEL }}>
              Net profit
            </p>
            <InfoDot size={13} />
          </div>
          <p
            className="relative mt-[4px] pl-[18px] text-[45px] font-bold leading-none"
            style={{ color: whole.profit < 0 ? RED : INDIGO }}
          >
            {money(whole.profit)}
          </p>
          {picks === 0 ? (
            <p className="relative mt-[16px] pl-[22px] text-[10.5px]" style={{ color: GREY_TEXT }}>
              No picks match this view yet.
            </p>
          ) : (
            <div className="relative mt-[6px]">
              <LabChart points={chartPoints} />
            </div>
          )}

          <div className="relative mt-[14px] flex items-center pl-[24px]">
            {[
              { icon: <FactNote size={19} />, value: `${picks}`, label: "Bets" },
              { icon: <FactWave size={19} />, value: recordOf(whole), label: "Record" },
              { icon: <FactTarget size={19} />, value: hitOf(whole), label: "Hit rate" },
              { icon: <FactTrend size={19} />, value: picks > 0 ? `${roiOf(whole)}` : "-", label: "ROI" },
            ].map((f, i) => (
              <div key={f.label} className="flex items-center gap-[6px]" style={{ width: ["82px", "94px", "92px", "auto"][i] }}>
                <span className="relative top-[-3px]">{f.icon}</span>
                <div>
                  <p className="text-[12.5px] font-bold leading-none tracking-[-0.01em]">{f.value}</p>
                  <p className="mt-[3px] text-[7.6px]" style={{ color: GREY_TEXT }}>
                    {f.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Actuals noticed. */}
      <div
        className="relative mx-[15px] mt-[16px] flex h-[45px] items-center rounded-[13px] pl-[7px] pr-[12px]"
        style={{ background: "#FFF6E9", boxShadow: "inset 0 0 0 1px #F6E9CC" }}
      >
        <span
          className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full"
          style={{ background: "#FEEFD4" }}
        >
          <GoldSparkle size={16} />
        </span>
        <div className="ml-[11px] min-w-0 flex-1 leading-[1.4]">
          <p className="text-[7.8px] font-semibold" style={{ color: ORANGE }}>
            Actuals noticed
          </p>
          <p className="mt-[2px] whitespace-nowrap text-[8.7px]" style={{ color: "#2E3138" }}>
            Player Props are driving most of your losses.
          </p>
        </div>
        <Chev size={11} color={ORANGE} />
      </div>

      {/* The doors: the bets behind the answer, and Compare when
          exactly two things are selected. */}
      {sel.length > 0 ? (
        <div className="relative mx-[15px] mt-[10px] flex gap-[8px]">
          <button
            className="flex h-[45px] min-w-0 flex-1 items-center rounded-[13px] bg-white pl-[8px] pr-[10px] text-left"
            style={{ boxShadow: `inset 0 0 0 1px ${HAIR}` }}
          >
            <span
              className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: PILL_LAV }}
            >
              <FactNote size={17} />
            </span>
            <span className="ml-[9px] min-w-0 flex-1 leading-[1.35]">
              <span className="block truncate text-[9.6px] font-bold">
                See these {picks} bets
              </span>
              <span className="block text-[7.8px]" style={{ color: GREY_TEXT }}>
                View in betting history
              </span>
            </span>
            <Chev size={9} color="#C3C4C9" />
          </button>
          {compareReady ? (
            <button
              onClick={() => setView(view === "side" ? "combined" : "side")}
              className="flex h-[45px] min-w-0 flex-1 items-center rounded-[13px] pl-[8px] pr-[10px] text-left"
              style={
                view === "side"
                  ? { background: INDIGO_FILL }
                  : { background: PILL_LAV, boxShadow: "inset 0 0 0 1px #DDD6FA" }
              }
            >
              <span
                className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: view === "side" ? "rgba(255,255,255,0.16)" : "#FFFFFF" }}
              >
                <CompareIcon size={17} color={view === "side" ? "#FFFFFF" : undefined} />
              </span>
              <span className="ml-[9px] min-w-0 flex-1 leading-[1.35]">
                <span
                  className="block truncate text-[9.6px] font-bold"
                  style={{ color: view === "side" ? "#FFFFFF" : INDIGO }}
                >
                  {view === "side" ? "Combine" : "Compare"}
                </span>
                <span
                  className="block truncate text-[7.8px]"
                  style={{ color: view === "side" ? "#DDD6FA" : GREY_TEXT }}
                >
                  {view === "side" ? "Add them together" : "These two, side by side"}
                </span>
              </span>
              <Chev size={9} color={view === "side" ? "#DDD6FA" : "#C3C4C9"} />
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Add another fact. */}
      <div ref={groupsRef} className="relative mt-[22px] scroll-mt-[10px] pl-[20px] pr-[19px]">
        <h2 className="text-[11.2px] font-bold">
          {sel.length === 0 ? "Build your view" : "Add another fact"}
        </h2>
        <p className="mt-[1px] text-[8.9px]" style={{ color: GREY_TEXT }}>
          {sel.length === 0
            ? "Tap any fact and the numbers above become its record"
            : "See how one more fact changes your result"}
        </p>
      </div>

      {groups.map((g) => (
        <div key={g.key} className="relative mt-[14px]">
          <div className="flex items-baseline justify-between pl-[20px] pr-[19px]">
            {g.key === "sport" ? (
              <div className="relative">
                <button
                  onClick={() => setDomainOpen((o) => !o)}
                  className="flex items-center gap-[4px] text-[11.2px] font-bold"
                  style={{ color: INK }}
                >
                  {g.title}
                  <ChevDown size={12} />
                </button>
                {domainOpen ? (
                  <>
                    <button
                      aria-label="Close domains"
                      onClick={() => setDomainOpen(false)}
                      className="fixed inset-0 z-10"
                    />
                    <div
                      className="absolute left-0 top-[22px] z-20 w-[150px] rounded-[12px] bg-white py-[5px]"
                      style={{ boxShadow: "0 10px 24px rgba(28,24,58,0.14), inset 0 0 0 1px #EFEFF2" }}
                    >
                      {DOMAINS.map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setDomainOpen(false);
                            if (d !== domain) {
                              setDomain(d);
                              setSel([]);
                            }
                          }}
                          className="flex w-full items-center justify-between px-[13px] py-[7px] text-left text-[10.5px] font-semibold"
                          style={{ color: d === domain ? INDIGO : NET_LABEL }}
                        >
                          {d}
                          {d === domain ? <Chev size={9} color={INDIGO} /> : null}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <p className="text-[11.2px] font-bold" style={{ color: INK }}>
                {g.title}
              </p>
            )}
          </div>
          <div
            className="mt-[7px] flex gap-[7px] overflow-x-auto pb-[2px] pl-[15px] pr-[15px] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {g.chips.map((c) => {
              const s = priceOf(c);
              const on = isSelected(c);
              const empty = s.wins + s.losses === 0;
              return (
                <button
                  key={c.value}
                  onClick={() => toggle(c)}
                  className="flex h-[49px] shrink-0 items-center gap-[8px] rounded-[12px] pl-[8px] pr-[13px] transition-colors"
                  style={{
                    background: on ? PILL_LAV : "#FFFFFF",
                    boxShadow: on
                      ? "inset 0 0 0 1px #C9BFF7"
                      : `inset 0 0 0 1px ${HAIR}`,
                    opacity: empty && !on ? 0.45 : 1,
                  }}
                >
                  <span
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: on ? "#FFFFFF" : PILL_LAV }}
                  >
                    {chipIcon(c, c.group === "where" ? leagueSportMap.get(c.value) : undefined)}
                  </span>
                  <span className="text-left leading-none">
                    <span
                      className="block whitespace-nowrap text-[11px] font-bold"
                      style={{ color: on ? INDIGO : INK }}
                    >
                      {c.value}
                    </span>
                    <span
                      className="mt-[4px] block text-[8.6px] font-semibold"
                      style={{ color: GREY_TEXT }}
                    >
                      {recordOf(s)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {g.key === "what" ? renderMarketRows() : null}
        </div>
      ))}

      <div className="min-h-[18px]" />
    </>
  );

  // Markets under any open category: shown while the category or one
  // of its markets is selected, where the record holds real markets.
  // A quieter second level, because a market is a drill, not a peer.
  function renderMarketRows(): ReactNode {
    const openCats = new Set<string>();
    for (const c of sel) {
      if (c.group !== "what") continue;
      if (c.kind === "category") openCats.add(c.value);
      if (c.kind === "market")
        for (const parent of marketCategoryOf(c.value)) openCats.add(parent);
    }
    const markets = [...openCats].flatMap((cat) => marketsUnder(engine, domain, cat));
    if (markets.length === 0) return null;
    return (
      <div className="mt-[7px] flex flex-wrap items-center gap-[6px] pl-[15px] pr-[15px]">
        {markets.map((m) => {
          const on = isSelected(m);
          const st = priceOf(m);
          return (
            <button
              key={m.value}
              onClick={() => toggle(m)}
              className="flex h-[26px] items-center gap-[6px] rounded-full pl-[11px] pr-[11px] text-[9.5px] font-semibold transition-colors"
              style={
                on
                  ? { background: INDIGO_FILL, color: "#FFFFFF" }
                  : { background: "#FFFFFF", color: NET_LABEL, boxShadow: `inset 0 0 0 1px ${HAIR}` }
              }
            >
              {m.value}
              <span style={{ color: on ? "#DDD6FA" : GREY_TEXT }}>{recordOf(st)}</span>
            </button>
          );
        })}
      </div>
    );
  }
}

// Which one is better for me, by how much in both profit and record,
// and the samples are on the cards below it.
function verdict(nameA: string, a: Stats, nameB: string, b: Stats): string {
  if (a.profit === b.profit) return `${nameA} and ${nameB} are level on profit.`;
  const [lead, tail, ls, ts] =
    a.profit > b.profit ? [nameA, nameB, a, b] : [nameB, nameA, b, a];
  const gap = money(ls.profit - ts.profit).slice(1);
  const leadHit = ls.wins + ls.losses > 0 ? ls.wins / (ls.wins + ls.losses) : 0;
  const tailHit = ts.wins + ts.losses > 0 ? ts.wins / (ts.wins + ts.losses) : 0;
  const hitGap = Math.round((leadHit - tailHit) * 100);
  const hitPart =
    hitGap > 0
      ? `and hits ${hitGap} points more often`
      : hitGap < 0
        ? `though ${tail} hits ${-hitGap} points more often`
        : "on level hit rates";
  return `${lead} is ${gap} ahead of ${tail}, ${hitPart}.`;
}
