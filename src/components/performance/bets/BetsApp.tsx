"use client";

// ALL BETS, job 5, 29 August 2026. One page closes two dead doors:
// Lab's "See these N bets" and Totals' "See all bets".
//
// NO MOCKUP EXISTS FOR THIS PAGE, so nothing here is invented: the row
// is the one he already approved on Totals, from his own sheet
// "2. Totals.png", at full length instead of the last three. The
// header is the Heat Map's header. That is the whole design.
//
// It reads the same address Lab writes: ?sel= for the selection and
// ?period= for the period, so arriving from either page shows exactly
// what that page was showing. The matching is the ENGINE's, through
// `betsFor`, so this list can never disagree with the record printed
// above it.
//
// A parlay with one Football leg IS a Football bet, but calling it one
// without saying "1 of 3 picks" overstates it. So a partly matching
// slip says so, and its money stays the slip's own: a row here is a
// real bet, not a share of one.
//
// TAPPING A ROW UNFOLDS THE BET. His ruling, 30 August 2026: "i want
// to be able to click the arrow and then the card unfolds that shows
// the actual bet... clicking the arrow should list all the matches and
// outcomes in that bet, as well as staked amount, total payout and
// profit." Every pick is listed, won or lost, with its odds and what
// it was classified as. Singles unfold too, his call: an arrow that
// works on some rows and not others reads as broken.
//
// IT IS ALSO A DIAGNOSTIC, which is why each pick shows its category.
// He suspects picks are going unclassified and so never reachable by a
// filter: "this can be a big bug, because many picks are not filtered
// it seems like." A pick with no category is called out in amber here,
// because that is the one thing on this screen he can act on.

import { useMemo, useState } from "react";
import PerfHeader from "@/components/performance/header";
import { useSearchParams } from "next/navigation";
import { betProfit, effectiveResult } from "@/lib/stats";
import { makeEngine, money, type Chip, type GroupKey } from "@/lib/performance-engine";
import type { BetWithLegs } from "@/lib/types";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import { chipIcon } from "@/components/performance/lab/LabApp";
import {
  betsIn,
  isPeriod,
  labelOf,
  type CustomRange,
  type PeriodKey,
} from "@/components/performance/lab/period";
import { Chev } from "@/components/performance/icons";
import {
  AMBER_BG,
  AMBER_EDGE,
  CARD,
  CHEV,
  DOT_MUTED,
  GREEN,
  GREY_TEXT,
  HAIRLINE,
  HEAD_BTN_W,
  INDIGO,
  NET_LABEL,
  ORANGE,
  PILL_GREY,
  RED,
  R_CARD,
  R_TILE,
  SEL_BG,
  SEL_EDGE,
  SUBGREEN,
  T_BODY,
  T_LABEL,
  T_MICRO,
  T_NANO,
  T_SMALL,
  W_BOLD,
  W_SEMI,
} from "@/components/performance/ui";

const cash = (v: number) =>
  `${v < 0 ? "-" : "+"}$${Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function Mark({ won, lost }: { won: boolean; lost: boolean }) {
  if (!won && !lost)
    return <span className="block h-[4px] w-[4px] rounded-full" style={{ background: CARD }} />;
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d={won ? "M2.5 6.4l2.4 2.4L9.6 3.8" : "M3.2 3.2l5.6 5.6M8.8 3.2l-5.6 5.6"}
        stroke={CARD}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sportChip = (value: string): Chip =>
  ({ group: "sport", kind: "plain", value }) as Chip;

function parseSel(raw: string | null): Chip[] {
  if (!raw) return [];
  const out: Chip[] = [];
  for (const part of raw.split("|")) {
    const [group, kind, ...rest] = part.split("~");
    const value = rest.join("~");
    if (!group || !kind || !value) continue;
    out.push({ group: group as GroupKey, kind, value } as Chip);
  }
  return out;
}

export default function BetsApp({
  bets,
  routes = PREVIEW_ROUTES,
  sel: selRaw,
  from: fromProp,
  period: periodProp,
  range,
  trackingSince = null,
  restarted = false,
  onRestarted,
  onBack,
}: {
  /** Demo bets on the public preview, the signed in user's own
      bets on the live page. The component never knows which. */
  bets: BetWithLegs[];
  routes?: PerfRoutes;
  /** The selection this list is showing. A prop since 31 August 2026,
      because All Bets is a view inside the tab area now and pushState
      does not refresh useSearchParams. */
  sel?: string;
  /** Which door opened it, so the back arrow returns there. */
  from?: "lab" | "totals";
  /** The window, owned by the tab area and shared with every view. */
  period?: PeriodKey;
  range?: CustomRange;
  /** The restart line, or null. Only the live page passes one. */
  trackingSince?: string | null;
  /** True while the page counts from that restart rather than all of it. */
  restarted?: boolean;
  onRestarted?: (v: boolean) => void;
  /** Back in place, no page load. */
  onBack?: () => void;
}) {
  const params = useSearchParams();
  const [openBet, setOpenBet] = useState<string | null>(null);
  const selStr = selRaw !== undefined ? selRaw : params.get("sel");
  const sel = useMemo(() => parseSel(selStr), [selStr]);
  const rawPeriod = params.get("period");
  const period: PeriodKey =
    periodProp ?? (isPeriod(rawPeriod) ? rawPeriod : "all");
  // Where the door was: back returns you where you came from, with
  // your selection and period intact.
  const from =
    fromProp ?? (params.get("from") === "totals" ? "totals" : "lab");

  const engine = useMemo(
    () => makeEngine(betsIn(bets, period, range, trackingSince, restarted)),
    [bets, period, range]
  );
  const rows = useMemo(() => engine.betsFor(sel), [engine, sel]);
  const stats = useMemo(() => engine.statsFor(sel), [engine, sel]);

  const backHref =
    from === "totals"
      ? `${routes.totals}${period === "all" ? "" : `?period=${period}`}`
      : `${routes.lab}${selStr || period !== "all" ? "?" : ""}` +
        [
          selStr ? `sel=${encodeURIComponent(selStr)}` : "",
          period === "all" ? "" : `period=${period}`,
        ]
          .filter(Boolean)
          .join("&");

  // What this list is showing, in his own words rather than a filter
  // chip: "Football and Moneyline, this month".
  const what =
    sel.length === 0
      ? "Your whole record"
      : sel.map((c) => c.value).join(" and ");
  const when =
    period === "all" ? "all time" : labelOf(period, range).toLowerCase();

  return (
    <>
      <PerfHeader
        href={backHref}
        onBack={onBack}
        label="Back"
        title="All bets"
        right={<span className={`ml-auto ${HEAD_BTN_W}`} />}
      />

      <p
        className={`relative mt-[6px] px-[9px] text-center ${T_BODY} ${W_SEMI}`}
        style={{ color: GREY_TEXT }}
      >
        {what}, {when}
      </p>

      {/* The selection's own record, so the list and the number above
          it can never say different things. */}
      <div className={`relative mt-[12px] flex items-center justify-between ${R_TILE} px-[13px] py-[11px]`}
        style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
      >
        <span className={`${T_LABEL} ${W_SEMI}`} style={{ color: NET_LABEL }}>
          {/* Bets are slips, the record is picks. A parlay is one bet
              and three picks, so the two numbers must say which they
              are or 30 bets and a 30-16 record reads like a
              contradiction. */}
          {stats.bets} {stats.bets === 1 ? "bet" : "bets"}
          {"  ·  "}
          {stats.wins}–{stats.losses} record
        </span>
        <span
          className={`text-base ${W_BOLD}`}
          style={{ color: stats.profit < 0 ? RED : stats.profit > 0 ? SUBGREEN : NET_LABEL }}
        >
          {stats.profit === 0 ? "$0.00" : cash(stats.profit)}
        </span>
      </div>

      {rows.length === 0 ? (
        <p
          className={`relative mt-[10px] ${R_CARD} px-[20px] py-[34px] text-center ${T_LABEL} ${W_SEMI}`}
          style={{ background: CARD, color: GREY_TEXT, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
        >
          No settled bets match this yet.
        </p>
      ) : (
        <div
          className={`relative mb-[6px] mt-[10px] ${R_CARD} pb-[8px] pt-[4px]`}
          style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
        >
          {rows.map(({ bet, matched, legs, hits }, i) => {
            const profit = betProfit(bet);
            const odds = bet.total_odds === null ? null : Number(bet.total_odds);
            const pick =
              legs > 1 ? `${legs} pick parlay` : (bet.legs[0]?.description ?? "Pick");
            const sport = bet.legs[0]?.sport ?? "Other";
            const league = bet.legs[0]?.competition ?? null;
            const part = sel.length > 0 && matched < legs;
            const open = openBet === bet.id;
            const staked = Number(bet.stake);
            const payout = Number(bet.payout ?? 0);
            return (
              <div
                key={bet.id}
                style={{ borderTop: i === 0 ? undefined : `1px solid ${HAIRLINE}` }}
              >
                <button
                  onClick={() => setOpenBet(open ? null : bet.id)}
                  aria-label={open ? `Hide this bet` : `Show this bet`}
                  className="flex w-full items-center px-[13px] py-[8px] text-left"
                >
                  <span className="mr-[8px] flex h-[20px] w-[20px] shrink-0 items-center justify-center">
                    {chipIcon(sportChip(sport), false, undefined, 17)}
                  </span>
                  <span className="block min-w-0 flex-1">
                    <span className={`block truncate ${T_SMALL} ${W_BOLD}`}>{pick}</span>
                    <span
                      className={`mt-[2px] block truncate ${T_NANO} ${W_SEMI}`}
                      style={{ color: GREY_TEXT }}
                    >
                      {new Date(bet.settled_at as string).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {"  ·  "}
                      {sport}
                      {league ? `  ·  ${league}` : ""}
                      {part ? `  ·  ${matched} of ${legs} picks` : ""}
                    </span>
                  </span>
                  <span
                    className={`ml-[6px] ${T_MICRO} ${W_SEMI}`}
                    style={{ color: NET_LABEL }}
                  >
                    {odds === null ? "-" : odds.toFixed(2)}
                  </span>
                  <span
                    className={`ml-[9px] whitespace-nowrap ${T_SMALL} ${W_BOLD}`}
                    style={{ color: profit < 0 ? RED : profit > 0 ? GREEN : NET_LABEL }}
                  >
                    {profit === 0 ? "$0.00" : cash(profit)}
                  </span>
                  <span className={open ? "-rotate-90" : undefined}>
                    <Chev size={8} color={CHEV} />
                  </span>
                </button>

                {open ? (
                  <div className="px-[11px] pb-[10px]">
                    <div
                      className={`${R_TILE} px-[10px] pb-[9px] pt-[3px]`}
                      style={{ background: PILL_GREY }}
                    >
                      {bet.legs.map((leg, j) => {
                        const won = effectiveResult(bet, leg) === "won";
                        const lost = effectiveResult(bet, leg) === "lost";
                        // A pick nobody classified can never be reached
                        // by a filter. That is the thing on this page he
                        // can act on, so it is the loudest thing on it.
                        const noCat = !leg.subcategory;
                        return (
                          <div
                            key={leg.id}
                            className="flex items-start gap-[7px] py-[6px]"
                            style={{
                              borderTop: j === 0 ? undefined : `1px solid ${HAIRLINE}`,
                            }}
                          >
                            <span
                              className="mt-[1px] flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full"
                              style={{
                                background: won ? GREEN : lost ? RED : DOT_MUTED,
                              }}
                            >
                              <Mark won={won} lost={lost} />
                            </span>
                            <span className="block min-w-0 flex-1">
                              <span
                                className={`block ${T_MICRO} ${W_SEMI}`}
                                style={{ color: NET_LABEL }}
                              >
                                {leg.description ?? "Pick"}
                              </span>
                              <span
                                className={`mt-[1px] flex flex-wrap items-center gap-x-[5px] ${T_NANO} ${W_SEMI}`}
                                style={{ color: GREY_TEXT }}
                              >
                                <span>{leg.sport}</span>
                                {leg.competition ? <span>· {leg.competition}</span> : null}
                                <span
                                  className={noCat ? `${R_TILE} px-[5px] py-[1px]` : undefined}
                                  style={
                                    noCat
                                      ? {
                                          background: AMBER_BG,
                                          color: ORANGE,
                                          boxShadow: `inset 0 0 0 1px ${AMBER_EDGE}`,
                                        }
                                      : undefined
                                  }
                                >
                                  · {leg.subcategory ?? "No category"}
                                </span>
                                {sel.length > 0 && hits[j] ? (
                                  <span
                                    className={`${R_TILE} px-[5px] py-[1px]`}
                                    style={{
                                      background: SEL_BG,
                                      color: INDIGO,
                                      boxShadow: `inset 0 0 0 1px ${SEL_EDGE}`,
                                    }}
                                  >
                                    matched
                                  </span>
                                ) : null}
                              </span>
                            </span>
                            <span
                              className={`ml-[4px] shrink-0 ${T_NANO} ${W_SEMI}`}
                              style={{ color: NET_LABEL }}
                            >
                              {leg.odds === null ? "-" : Number(leg.odds).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}

                      <div
                        className="mt-[2px] flex items-center justify-between pt-[7px]"
                        style={{ borderTop: `1px solid ${HAIRLINE}` }}
                      >
                        {[
                          ["Staked", `$${staked.toFixed(2)}`, NET_LABEL],
                          ["Payout", `$${payout.toFixed(2)}`, NET_LABEL],
                          [
                            "Profit",
                            profit === 0 ? "$0.00" : cash(profit),
                            profit < 0 ? RED : profit > 0 ? SUBGREEN : NET_LABEL,
                          ],
                        ].map(([label, value, colour]) => (
                          <span key={label} className="block">
                            <span
                              className={`block ${T_NANO} ${W_SEMI}`}
                              style={{ color: GREY_TEXT }}
                            >
                              {label}
                            </span>
                            <span
                              className={`mt-[1px] block ${T_MICRO} ${W_BOLD}`}
                              style={{ color: colour }}
                            >
                              {value}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="min-h-[8px]" />
    </>
  );
}
