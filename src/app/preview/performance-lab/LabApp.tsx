"use client";

// The Lab body: the current view tray, the live answer panel, and
// the six chip groups. Every number on this page flows through the
// pf engine, which speaks src/lib/stats.ts, so Lab agrees with every
// other surface to the cent.
//
// Round 2, 29 August 2026. Round 1's chip area was rejected ("i
// particularly hate your icons. they all look the same... i prefer
// how it looks in the mockup instead"), so the groups now wear the
// mockup's anatomy: colour identity icons for sports and leagues
// (the platform's emoji, which is what his designer used), quiet
// outline glyphs for the abstract groups, compact bare chips with no
// icon tiles, and small uppercase group headers with an All link on
// the right. Chip records stay, never amounts, by his standing rule.
//
// Compare was parked, then reopened on 29 August 2026 and built as
// its own page. The ruled trigger is unchanged: the door appears at
// exactly two selections and is gone at three. It now opens
// /preview/performance-compare, carrying the same two chips in the
// address, and Compare's back arrow returns here with both still
// selected.
//
// The behaviours ruled in docs/performance-rebuild.md, all live:
// - Tap a chip and the whole page re-scopes in place. No submit.
// - Every chip is priced at the intersection it would create.
// - Chips read as a record (12-4), never a percent, never an amount.
// - The Sport header carries the domain arrow. Picking a domain
//   rescopes Sport, League, Category and When and clears the
//   selection, because domains never combine.
// - Removing the last chip lands on the clean, calm, complete Lab.
// - Groups with nothing behind them hide, as a data state.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Domain } from "@/lib/taxonomy";
import { SPORT_EMOJI, type Sport } from "@/lib/types";
import {
  hitOf,
  iconFor,
  makeEngine,
  money,
  roiOf,
  type Chip,
  type Stats,
} from "../pf/engine";
import {
  Chev,
  ChevDown,
  FactNote,
  FactTarget,
  FactTrend,
  FactWave,
  GoldSparkle,
  InfoDot,
  MiniTrend,
  WashTexture,
} from "../performance-icons";
import {
  ChainIcon,
  ClockIcon,
  CloseIcon,
  CompareIcon,
  Emoji,
  GaugeIcon,
  MoneyIcon,
  PlusIcon,
  SpreadIcon,
  StackIcon,
  TargetIcon,
  TotalsIcon,
  TrendLineIcon,
  WhistleIcon,
} from "./lab-icons";
import type { BetWithLegs } from "@/lib/types";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import Explain from "./Explain";
import PeriodPill from "./PeriodPill";
import { betsIn, isPeriod, type PeriodKey } from "./period";
import {
  buildGroups,
  DOMAINS,
  leagueSports,
  marketsUnder,
  recordOf,
} from "./lab-model";
import {
  AMBER_BG,
  AMBER_EDGE,
  AMBER_INK,
  AMBER_TILE,
  CARD,
  CHEV,
  DIVIDER,
  DOT_MUTED,
  EDGE_SOFT,
  GLYPH,
  GREY_TEXT,
  HAIR,
  HEAD_INK,
  INDIGO,
  INDIGO_FILL,
  INK,
  LINK_INK,
  MENU_IDLE,
  NET_LABEL,
  ON_BRAND,
  ON_BRAND_CLOSE,
  ON_BRAND_SOFT,
  ORANGE,
  PILL_LAV,
  RED,
  R_CHIP,
  R_INNER,
  R_SMALL,
  R_TILE,
  SELECTOR_INK,
  SEL_BG,
  SEL_EDGE,
  SUBGREEN,
  TAB_EDGE,
  TRAY_EDGE,
  T_LABEL,
  T_META,
  T_NANO,
  T_SMALL,
  T_TINY,
  W_BOLD,
  W_SEMI,
} from "../performance-ui";
import { LabChart } from "./chart";

// ---------------------------------------------------------------
// Icons per chip. Concrete facts (sports, leagues) get colour
// identity; abstract facts get a quiet outline that turns indigo
// when selected.
// ---------------------------------------------------------------

// Exported so Compare dresses the same fact with the same icon. One
// fact must never wear two icons across two pages.
export function chipIcon(
  c: Chip,
  on: boolean,
  leagueSport?: string,
  size?: number
): ReactNode {
  const color = on ? INDIGO : GLYPH;
  const glyph = size ?? 16;
  const emoji = size ? size + 1 : 18;
  const v = c.value;
  if (c.group === "sport")
    return <Emoji e={SPORT_EMOJI[v as Sport] ?? "\u{1F4CA}"} size={emoji} />;
  if (c.group === "where") {
    const own = iconFor(v);
    const fromSport = leagueSport
      ? SPORT_EMOJI[leagueSport as Sport]
      : undefined;
    return (
      <Emoji e={own !== "\u{1F4CA}" ? own : (fromSport ?? "\u{1F3C6}")} size={emoji} />
    );
  }
  if (c.group === "what") {
    if (c.kind === "market") return null;
    if (v === "Moneyline") return <MoneyIcon color={color} size={glyph} />;
    if (v === "Spread / Handicap") return <SpreadIcon color={color} size={glyph} />;
    if (v === "Totals (Over/Under)") return <TotalsIcon color={color} size={glyph} />;
    if (v === "Player Props") return <TargetIcon color={color} size={glyph} />;
    if (v === "Match Props") return <WhistleIcon color={color} size={glyph} />;
    if (v === "Price Direction") return <TrendLineIcon color={color} size={glyph} />;
    return <MoneyIcon color={color} size={glyph} />;
  }
  if (c.group === "when")
    return <ClockIcon color={color} half={v.includes("Half")} size={glyph} />;
  if (c.group === "how")
    return v === "Singles" ? (
      <StackIcon color={color} size={glyph} />
    ) : (
      <ChainIcon color={color} size={glyph} />
    );
  const level = v === "Low odds" ? 0 : v === "Medium odds" ? 1 : 2;
  return <GaugeIcon color={color} level={level} size={glyph} />;
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

function selToUrl(sel: Chip[], domain: Domain, period: PeriodKey): string {
  const p = new URLSearchParams();
  if (sel.length > 0)
    p.set("sel", sel.map((c) => `${c.group}~${c.kind}~${c.value}`).join("|"));
  if (domain !== "Sports") p.set("domain", domain);
  // Job 4. Without this, picking a chip silently threw the period
  // away and the numbers jumped back to the whole record.
  if (period !== "all") p.set("period", period);
  const q = p.toString();
  return q ? `?${q}` : window.location.pathname;
}

export default function LabApp({
  bets,
  routes = PREVIEW_ROUTES,
}: {
  /** Demo bets on the public preview, the signed in user's own
      bets on the live page. The component never knows which. */
  bets: BetWithLegs[];
  routes?: PerfRoutes;
}) {
  const params = useSearchParams();
  // Job 4. The period is applied by building the engine from a
  // filtered record, so every chip price, the chart and the KPI row
  // all follow with no call site knowing about dates.
  const rawPeriod = params.get("period");
  const [period, setPeriod] = useState<PeriodKey>(
    isPeriod(rawPeriod) ? rawPeriod : "all"
  );
  const [periodOpen, setPeriodOpen] = useState(false);
  // Job 7. A row that scrolls sideways hides whatever ran off the
  // edge, and "All sports" promised a way to see it. Tapping it wraps
  // the row instead, so every fact in that group is on screen at once.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const engine = useMemo(() => makeEngine(betsIn(bets, period)), [bets, period]);
  const [domain, setDomain] = useState<Domain>(() => {
    const d = params.get("domain");
    return (DOMAINS as string[]).includes(d ?? "") ? (d as Domain) : "Sports";
  });
  const [sel, setSel] = useState<Chip[]>(() => parseSel(params.get("sel")));
  const [domainOpen, setDomainOpen] = useState(false);
  const groupsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.history.replaceState(null, "", selToUrl(sel, domain, period));
  }, [sel, domain, period]);

  // Job 3. Totals' "View all" links name a group; Lab is the full
  // list, so it just scrolls there.
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const jumpTo = params.get("group");
  // The six groups all fit on one screen at the bottom of the page, so
  // scrolling alone cannot say which one you were sent to. The arrival
  // is marked instead, and fades.
  const [landed, setLanded] = useState<string | null>(null);
  useEffect(() => {
    if (!jumpTo) return;
    const el = groupRefs.current[jumpTo];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setLanded(jumpTo);
    const t = setTimeout(() => setLanded(null), 2200);
    return () => clearTimeout(t);
  }, [jumpTo, domain]);

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

  const trayIcon = (c: Chip) =>
    chipIcon(c, true, c.group === "where" ? leagueSportMap.get(c.value) : undefined, 13);

  return (
    <>
      {/* The colour wash behind the answer panel, the accepted Home's
          own asset, placed exactly as Home places it: starting at the
          Net profit row and fading out through the KPI row. */}
      <div className="pointer-events-none absolute inset-x-0 top-[112px] h-[245px]">
        {/* Saturation is pulled down so the asset reads beige, not
            purple: his 29 August order ("i hate the purple fade...
            it's supposed to be beige-ish"). Lab's line dips lower
            than Home's, which exposed the asset's lavender cloud. */}
        <Image
          src="/preview-assets/home-wash.png"
          alt=""
          fill
          priority
          sizes="390px"
          style={{ objectFit: "fill", filter: "saturate(0.6)" }}
        />
        <WashTexture />
      </div>

      {/* The current view tray: clean white pills, the mockup's own
          treatment, never filled purple. */}
      <div className="relative mt-[12px] pl-[22px]">
        <p className={`${T_LABEL} ${W_SEMI}`} style={{ color: NET_LABEL }}>
          Your current view
        </p>
      </div>
      <div className="relative mt-[7px] flex flex-wrap items-center gap-[6px] pl-[20px] pr-[14px]">
        {sel.map((c) => (
          <button
            key={`${c.group}~${c.kind}~${c.value}`}
            onClick={() => toggle(c)}
            className={`flex h-[31px] items-center gap-[6px] rounded-full pl-[10px] pr-[10px] ${T_LABEL} ${W_SEMI}`}
            style={{
              background: CARD,
              color: INDIGO,
              boxShadow: `inset 0 0 0 1px ${TRAY_EDGE}, 0 1px 3px rgba(24,20,50,0.05)`,
            }}
          >
            {trayIcon(c)}
            {c.value}
            <CloseIcon size={10} color={ON_BRAND_CLOSE} />
          </button>
        ))}
        <button
          onClick={() =>
            groupsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className={`flex h-[31px] items-center gap-[5px] rounded-full pl-[10px] pr-[13px] ${T_LABEL} ${W_SEMI}`}
          style={{
            background: CARD,
            color: MENU_IDLE,
            boxShadow: `inset 0 0 0 1px ${EDGE_SOFT}, 0 1px 3px rgba(24,20,50,0.04)`,
          }}
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

      {/* THE ANSWER: the accepted Home's hero block, verbatim, with
          Lab's live numbers. Net profit row, the number, the green
          ROI and record line, the chart riding up beside the number,
          then the four ruled KPIs with Home's dividers. */}
      <div className="relative mt-[12px] flex items-center justify-between pl-[22px] pr-[10px]">
        <p
          className={`flex items-center gap-[1px] ${T_LABEL} ${W_SEMI}`}
          style={{ color: NET_LABEL }}
        >
          Net profit
          <Explain term="Net profit" />
        </p>
        <span className="relative top-[2px] z-30">
          <PeriodPill
            period={period}
            onPick={setPeriod}
            open={periodOpen}
            setOpen={setPeriodOpen}
          />
        </span>
      </div>
      <p
        className={`relative mt-[4px] pl-[18px] text-[45px] ${W_BOLD} leading-none`}
        style={{ color: whole.profit < 0 ? RED : INDIGO }}
      >
        {money(whole.profit)}
      </p>
      {picks === 0 ? (
        <p className={`relative mt-[16px] pl-[22px] ${T_LABEL}`} style={{ color: GREY_TEXT }}>
          No picks match this view yet.
        </p>
      ) : (
        <>
          <p className={`relative mt-[7px] flex items-center gap-[4px] pl-[22px] ${T_LABEL} ${W_SEMI}`}>
            <MiniTrend size={12} />
            <span style={{ color: whole.profit < 0 ? RED : SUBGREEN }}>
              {whole.profit < 0 ? "" : "+"}
              {roiOf(whole)} ROI
            </span>
            <span
              className="mx-[1px] inline-block h-[3px] w-[3px] rounded-full"
              style={{ background: DOT_MUTED }}
            />
            <span style={{ color: NET_LABEL }}>{recordOf(whole)} Record</span>
          </p>
          <div className="relative mt-[-30px]">
            <LabChart points={chartPoints} />
          </div>
        </>
      )}

      <div className="relative mt-[16px] flex items-center pl-[33px]">
        {["96px", "188px", "284px"].map((left) => (
          <span
            key={left}
            className="absolute top-1/2 h-[28px] w-px -translate-y-1/2"
            style={{ left, background: DIVIDER }}
          />
        ))}
        {[
          { icon: <FactNote size={19} />, value: `${picks}`, label: "Bets" },
          { icon: <FactWave size={19} />, value: recordOf(whole), label: "Record" },
          { icon: <FactTarget size={19} />, value: hitOf(whole), label: "Hit rate" },
          { icon: <FactTrend size={19} />, value: picks > 0 ? `${roiOf(whole)}` : "-", label: "ROI" },
        ].map((f, i) => (
          <div key={f.label} className="flex items-center gap-[6px]" style={{ width: ["78px", "92px", "96px", "auto"][i] }}>
            <span className="relative top-[-3px]">{f.icon}</span>
            <div>
              <p className={`text-[12.5px] ${W_BOLD} leading-none tracking-[-0.01em]`}>{f.value}</p>
              <p className={`mt-[3px] ${T_NANO}`} style={{ color: GREY_TEXT }}>
                {f.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Actuals noticed. */}
      <div
        className={`relative mx-[15px] mt-[16px] flex h-[45px] items-center ${R_CHIP} pl-[7px] pr-[12px]`}
        style={{ background: AMBER_BG, boxShadow: `inset 0 0 0 1px ${AMBER_EDGE}` }}
      >
        <span
          className="flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full"
          style={{ background: AMBER_TILE }}
        >
          <GoldSparkle size={16} />
        </span>
        <div className="ml-[11px] min-w-0 flex-1 leading-[1.4]">
          <p className={`text-[7.8px] ${W_SEMI}`} style={{ color: ORANGE }}>
            Actuals noticed
          </p>
          <p className="mt-[2px] whitespace-nowrap text-[8.7px]" style={{ color: AMBER_INK }}>
            Player Props are driving most of your losses.
          </p>
        </div>
        <Chev size={11} color={ORANGE} />
      </div>

      {/* The doors: the bets behind the answer, and the parked
          Compare door at exactly two selections, wearing Soon. */}
      {sel.length > 0 ? (
        <div className="relative mx-[15px] mt-[10px] flex gap-[8px]">
          {/* Job 5. It was a button that did nothing; it opens All
              Bets now, carrying the selection and the period. */}
          <Link
            href={`${routes.bets}?sel=${encodeURIComponent(
              sel.map((c) => `${c.group}~${c.kind}~${c.value}`).join("|")
            )}${period === "all" ? "" : `&period=${period}`}`}
            className={`flex h-[50px] min-w-0 flex-1 items-center ${R_TILE} bg-white pl-[9px] pr-[10px] text-left`}
            style={{ boxShadow: "0 1px 4px rgba(24,20,50,0.06), 0 0 0 1px rgba(24,20,50,0.02)" }}
          >
            <span
              className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center ${R_SMALL}`}
              style={{ background: PILL_LAV }}
            >
              <FactNote size={17} />
            </span>
            <span className="ml-[10px] min-w-0 flex-1 leading-[1.4]">
              <span className={`block truncate text-[9.8px] ${W_BOLD}`}>
                See these {whole.bets} {whole.bets === 1 ? "bet" : "bets"}
              </span>
              <span className={`block ${T_TINY}`} style={{ color: GREY_TEXT }}>
                View in betting history
              </span>
            </span>
            <Chev size={9} color={CHEV} />
          </Link>
          {compareReady ? (
            <Link
              href={`${routes.compare}?sel=${encodeURIComponent(
                sel.map((c) => `${c.group}~${c.kind}~${c.value}`).join("|")
              )}`}
              className={`flex h-[50px] min-w-0 flex-1 items-center ${R_TILE} bg-white pl-[9px] pr-[10px]`}
              style={{ boxShadow: "0 1px 4px rgba(24,20,50,0.06), 0 0 0 1px rgba(24,20,50,0.02)" }}
            >
              <span
                className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center ${R_SMALL}`}
                style={{ background: PILL_LAV }}
              >
                <CompareIcon size={17} />
              </span>
              <span className="ml-[10px] min-w-0 flex-1 leading-[1.4]">
                <span className={`block truncate text-[9.8px] ${W_BOLD}`} style={{ color: INDIGO }}>
                  Compare
                </span>
                <span className={`block truncate ${T_TINY}`} style={{ color: GREY_TEXT }}>
                  Compare two views
                </span>
              </span>
              <Chev size={9} color={CHEV} />
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* Add another fact. */}
      <div ref={groupsRef} className="relative mt-[22px] scroll-mt-[10px] pl-[20px] pr-[19px]">
        <h2 className={`text-[11.2px] ${W_BOLD}`}>
          {sel.length === 0 ? "Build your view" : "Add another fact"}
        </h2>
        <p className="mt-[1px] text-[8.9px]" style={{ color: GREY_TEXT }}>
          {sel.length === 0
            ? "Tap any fact and the numbers above become its record"
            : "See how one more fact changes your result"}
        </p>
      </div>

      {groups.map((g) => (
        <div
          key={g.key}
          ref={(el) => {
            groupRefs.current[g.key] = el;
          }}
          className="relative mt-[15px] scroll-mt-[10px] transition-colors duration-500"
          style={
            landed === g.key
              ? { background: SEL_BG, borderRadius: 14 }
              : { background: "transparent", borderRadius: 14 }
          }
        >
          <div className="flex items-center justify-between pl-[20px] pr-[19px]">
            {g.key === "sport" ? (
              <div className="relative">
                <button
                  onClick={() => setDomainOpen((o) => !o)}
                  className={`flex items-center gap-[4px] ${T_META} ${W_SEMI} uppercase tracking-[0.08em]`}
                  style={{ color: HEAD_INK }}
                >
                  {g.title}
                  <ChevDown size={11} />
                </button>
                {domainOpen ? (
                  <>
                    <button
                      aria-label="Close domains"
                      onClick={() => setDomainOpen(false)}
                      className="fixed inset-0 z-10"
                    />
                    <div
                      className={`absolute left-0 top-[20px] z-20 w-[150px] ${R_INNER} bg-white py-[5px]`}
                      style={{ boxShadow: `0 10px 24px rgba(28,24,58,0.14), inset 0 0 0 1px ${TAB_EDGE}` }}
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
                          className={`flex w-full items-center justify-between px-[13px] py-[7px] text-left ${T_LABEL} ${W_SEMI}`}
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
              <p
                className={`${T_META} ${W_SEMI} uppercase tracking-[0.08em]`}
                style={{ color: HEAD_INK }}
              >
                {g.title}
              </p>
            )}
            <button
              onClick={() =>
                setOpenGroups((o) => ({ ...o, [g.key]: !o[g.key] }))
              }
              aria-label={
                openGroups[g.key]
                  ? `Collapse ${g.title.toLowerCase()}`
                  : `Show every ${g.title.toLowerCase()}`
              }
              className={`flex items-center gap-[4px] ${T_SMALL} ${W_SEMI}`}
              style={{ color: openGroups[g.key] ? INDIGO : LINK_INK }}
            >
              {openGroups[g.key] ? "Show less" : g.allLabel}
              <span className={openGroups[g.key] ? "rotate-90" : undefined}>
                <Chev
                  size={8}
                  color={openGroups[g.key] ? INDIGO : DOT_MUTED}
                />
              </span>
            </button>
          </div>
          <div
            className={
              openGroups[g.key]
                ? "mt-[7px] flex flex-wrap gap-[7px] pb-[3px] pl-[15px] pr-[15px]"
                : "mt-[7px] flex gap-[7px] overflow-x-auto pb-[3px] pl-[15px] pr-[15px] [&::-webkit-scrollbar]:hidden"
            }
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
                  className={`flex h-[44px] items-center gap-[9px] ${R_INNER} bg-white pl-[11px] pr-[14px] transition-colors ${
                    openGroups[g.key] ? "max-w-full" : "shrink-0"
                  }`}
                  style={{
                    background: on ? SEL_BG : CARD,
                    boxShadow: on
                      ? `inset 0 0 0 1.2px ${SEL_EDGE}, 0 1px 4px rgba(24,20,50,0.05)`
                      : "0 1px 4px rgba(24,20,50,0.06), 0 0 0 1px rgba(24,20,50,0.02)",
                    opacity: empty && !on ? 0.45 : 1,
                  }}
                >
                  {chipIcon(c, on, c.group === "where" ? leagueSportMap.get(c.value) : undefined)}
                  <span className="text-left leading-none">
                    <span
                      className={`block whitespace-nowrap ${T_LABEL} ${W_SEMI}`}
                      style={{ color: on ? INDIGO : INK }}
                    >
                      {c.value}
                    </span>
                    <span
                      className={`mt-[3px] block text-[8.4px] ${W_SEMI}`}
                      style={{ color: on ? INDIGO : GREY_TEXT }}
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
              className={`flex h-[26px] items-center gap-[6px] rounded-full pl-[11px] pr-[11px] ${T_SMALL} ${W_SEMI} transition-colors`}
              style={
                on
                  ? { background: INDIGO_FILL, color: ON_BRAND }
                  : {
                      background: CARD,
                      color: NET_LABEL,
                      boxShadow: "0 1px 3px rgba(24,20,50,0.05), 0 0 0 1px rgba(24,20,50,0.03)",
                    }
              }
            >
              {m.value}
              <span style={{ color: on ? ON_BRAND_SOFT : GREY_TEXT }}>{recordOf(st)}</span>
            </button>
          );
        })}
      </div>
    );
  }
}
