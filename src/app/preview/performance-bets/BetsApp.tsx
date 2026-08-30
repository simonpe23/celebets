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

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { betProfit } from "@/lib/stats";
import { makeEngine, money, type Chip, type GroupKey } from "../pf/engine";
import { labBets } from "../performance-lab/lab-data";
import { chipIcon } from "../performance-lab/LabApp";
import { betsIn, isPeriod, labelOf, type PeriodKey } from "../performance-lab/period";
import { Chev } from "../performance-home/icons";
import {
  CARD,
  CHEV,
  GREEN,
  GREY_TEXT,
  HAIRLINE,
  INK,
  NET_LABEL,
  RED,
  SUBGREEN,
} from "../performance-lab/ui";

const cash = (v: number) =>
  `${v < 0 ? "-" : "+"}$${Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

export default function BetsApp() {
  const params = useSearchParams();
  const sel = useMemo(() => parseSel(params.get("sel")), [params]);
  const rawPeriod = params.get("period");
  const period: PeriodKey = isPeriod(rawPeriod) ? rawPeriod : "all";
  // Where the door was: back returns you where you came from, with
  // your selection and period intact.
  const from = params.get("from") === "totals" ? "totals" : "lab";

  const engine = useMemo(() => makeEngine(betsIn(labBets, period)), [period]);
  const rows = useMemo(() => engine.betsFor(sel), [engine, sel]);
  const stats = useMemo(() => engine.statsFor(sel), [engine, sel]);

  const backHref =
    from === "totals"
      ? `/preview/performance-totals${period === "all" ? "" : `?period=${period}`}`
      : `/preview/performance-lab${params.get("sel") || period !== "all" ? "?" : ""}` +
        [
          params.get("sel") ? `sel=${encodeURIComponent(params.get("sel") as string)}` : "",
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
  const when = period === "all" ? "all time" : labelOf(period).toLowerCase();

  return (
    <>
      <div className="relative mt-[10px] flex h-[40px] items-center px-[15px]">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full"
          style={{ background: CARD, boxShadow: "0 1px 4px rgba(24,20,50,0.08)" }}
        >
          <span className="rotate-180">
            <Chev size={12} color={INK} />
          </span>
        </Link>
        <p className="pointer-events-none absolute inset-x-0 text-center text-[15px] font-bold">
          All bets
        </p>
        <span className="ml-auto w-[34px]" />
      </div>

      <p
        className="relative mt-[6px] px-[24px] text-center text-[10px] font-semibold"
        style={{ color: GREY_TEXT }}
      >
        {what}, {when}
      </p>

      {/* The selection's own record, so the list and the number above
          it can never say different things. */}
      <div className="relative mx-[15px] mt-[12px] flex items-center justify-between rounded-[14px] px-[13px] py-[11px]"
        style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
      >
        <span className="text-[10.5px] font-semibold" style={{ color: NET_LABEL }}>
          {/* Bets are slips, the record is picks. A parlay is one bet
              and three picks, so the two numbers must say which they
              are or 30 bets and a 30-16 record reads like a
              contradiction. */}
          {stats.bets} {stats.bets === 1 ? "bet" : "bets"}
          {"  ·  "}
          {stats.wins}–{stats.losses} record
        </span>
        <span
          className="text-[13px] font-bold"
          style={{ color: stats.profit < 0 ? RED : stats.profit > 0 ? SUBGREEN : NET_LABEL }}
        >
          {stats.profit === 0 ? "$0.00" : cash(stats.profit)}
        </span>
      </div>

      {rows.length === 0 ? (
        <p
          className="relative mx-[15px] mt-[10px] rounded-[16px] px-[20px] py-[34px] text-center text-[10.5px] font-semibold"
          style={{ background: CARD, color: GREY_TEXT, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
        >
          No settled bets match this yet.
        </p>
      ) : (
        <div
          className="relative mx-[15px] mb-[6px] mt-[10px] rounded-[16px] pb-[8px] pt-[4px]"
          style={{ background: CARD, boxShadow: "0 1px 5px rgba(24,20,50,0.07)" }}
        >
          {rows.map(({ bet, matched, legs }, i) => {
            const profit = betProfit(bet);
            const odds = bet.total_odds === null ? null : Number(bet.total_odds);
            const pick =
              legs > 1 ? `${legs} pick parlay` : (bet.legs[0]?.description ?? "Pick");
            const sport = bet.legs[0]?.sport ?? "Other";
            const league = bet.legs[0]?.competition ?? null;
            const part = sel.length > 0 && matched < legs;
            return (
              <div
                key={bet.id}
                className="flex items-center px-[13px] py-[8px]"
                style={{ borderTop: i === 0 ? undefined : `1px solid ${HAIRLINE}` }}
              >
                <span className="mr-[8px] flex h-[20px] w-[20px] shrink-0 items-center justify-center">
                  {chipIcon(sportChip(sport), false, undefined, 17)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9.5px] font-bold">{pick}</p>
                  <p
                    className="mt-[2px] truncate text-[7.6px] font-semibold"
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
                  </p>
                </div>
                <span
                  className="ml-[6px] text-[8.5px] font-semibold"
                  style={{ color: NET_LABEL }}
                >
                  {odds === null ? "-" : odds.toFixed(2)}
                </span>
                <span
                  className="ml-[9px] whitespace-nowrap text-[9.5px] font-bold"
                  style={{ color: profit < 0 ? RED : profit > 0 ? GREEN : NET_LABEL }}
                >
                  {profit === 0 ? "$0.00" : cash(profit)}
                </span>
                <Chev size={8} color={CHEV} />
              </div>
            );
          })}
        </div>
      )}

      <div className="min-h-[8px]" />
    </>
  );
}
