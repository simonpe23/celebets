"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HeroMoney from "@/components/HeroMoney";
import Sparkline from "@/components/Sparkline";
import MicroLabel from "@/components/MicroLabel";
import { formatMoney, formatSignedMoney, parseMoney, round2, shortSignedMoney } from "@/lib/format";
import { betProfit, periodStart } from "@/lib/stats";
import type { BetWithLegs } from "@/lib/types";
import { BTN } from "@/lib/ui";

interface Props {
  balance: number;
  netProfit: number;
  // What the user put in: everything added, minus everything removed.
  startedWith: number;
  // False until a tracking balance has ever been set. Some people never
  // set one and only track bets and profit, which the product supports
  // on purpose, so this card has two shapes instead of one.
  hasBalance: boolean;
  // The fresh start line, or null. Only used to caption Net profit, so
  // the user can see their record began again and did not vanish.
  trackingSince?: string | null;
  betCount: number;
  userId: string;
  // The balance over time, oldest first, drawn as the wide line across
  // the band. Comes from the page so the card stays dumb.
  series?: number[];
  // The settled bets the current record counts, for the period strip
  // at the band's foot: Today, Week, Month, Year.
  settledBets?: BetWithLegs[];
  // How the once-ever setup control is drawn. Setting a tracking
  // balance happens once and then almost never, so a full width
  // primary button spends the home page's best real estate on it.
  // v9.3 put the small squared button beside the label, top right,
  // which is now the default. The other shapes survive for
  // /preview/buttons comparisons.
  //   corner  the ruled shape, and the default
  //   under   the same button, under the profit line
  //   link    a quiet text link, no button
  //   button  the old full width one, kept for comparison
  control?: "under" | "corner" | "link" | "button";
}

type Mode = "adjust" | "set";

// Rendered on the server too, so it must not depend on the phone's
// locale drifting from the server's. Fixed month names, no surprises.
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default function BalanceCard({
  balance,
  netProfit,
  startedWith,
  hasBalance,
  trackingSince,
  betCount,
  userId,
  series,
  settledBets,
  control = "corner",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("set");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const profitColor =
    netProfit > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : netProfit < 0
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-500 dark:text-neutral-400";

  // Actuals never holds money. The balance is a number the user tracks
  // against, so nothing here is a deposit or a withdrawal. Under the
  // hood a change is still stored as a transaction, which keeps net
  // profit and the whole history untouched.
  async function save(direction: "up" | "down") {
    const value = parseMoney(amount);
    if (value === null) {
      setError("Enter an amount above 0, for example 100 or 49.99");
      return;
    }

    // "Set new" means the user typed the total they want, so Actuals
    // works out the difference itself.
    let delta = direction === "up" ? value : -value;
    if (mode === "set") delta = value - balance;

    if (delta === 0) {
      setOpen(false);
      setAmount("");
      return;
    }

    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("transactions").insert({
      user_id: userId,
      type: delta > 0 ? "deposit" : "withdrawal",
      amount: Math.abs(delta),
    });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setAmount("");
    setOpen(false);
    router.refresh();
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
      active
        ? "bg-white text-neutral-900 shadow-sm dark:bg-[#0E1228] dark:text-white"
        : "text-neutral-500 dark:text-neutral-400"
    }`;

  function openSheet() {
    setError(null);
    setMode("set");
    setOpen(true);
  }

  // One button, one size, wherever it is placed.
  const smallButton = (
    <button type="button" onClick={openSheet} className={`${BTN} h-8 shrink-0 px-3`}>
      {hasBalance ? "Set balance" : "Set tracking balance"}
    </button>
  );

  // Today, Week, Month, Year: the record's profit inside each period,
  // by the settle date, the same boundaries Performance's chips use.
  const strip = settledBets
    ? (["today", "week", "month", "year"] as const).map((period) => {
        const from = periodStart(period);
        const profit = settledBets
          .filter((b) => b.settled_at && new Date(b.settled_at) >= from)
          .reduce((sum, b) => sum + betProfit(b), 0);
        return {
          label: period.charAt(0).toUpperCase() + period.slice(1),
          profit: round2(profit),
        };
      })
    : null;

  const stripTone = (value: number) =>
    value > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : value < 0
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-500 dark:text-neutral-400";

  const label = (
    <span className="flex items-center gap-1.5">
      <MicroLabel>Tracking Balance</MicroLabel>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-3.5 w-3.5 text-neutral-400"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M12 11v5" strokeLinecap="round" />
      </svg>
    </span>
  );

  // THE BAND (v9.3, August 2026). On a phone this is not a card: it
  // runs to both screen edges with a hairline above and below, and the
  // chart touches both sides. The -mx-4 undoes the page's px-4. From
  // sm up a full-bleed strip of a centred column looks unfinished, so
  // it becomes the ordinary card again.
  return (
    <section className="-mx-4 overflow-hidden border-y border-neutral-900/[0.06] bg-white dark:border-white/[0.07] dark:bg-[#0E1228] sm:mx-0 sm:rounded-2xl sm:border-x">
      {hasBalance ? (
        <>
          <div className="px-4 pt-3.5 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              {label}
              {control === "corner" && smallButton}
            </div>
            <p
              className={`mt-1.5 ${
                balance < 0 ? "text-red-600 dark:text-red-400" : ""
              }`}
            >
              <HeroMoney value={balance} signed={false} className="text-[40px]" />
            </p>
            <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={`text-sm font-semibold ${profitColor}`}>
                {netProfit > 0 ? "▲ " : netProfit < 0 ? "▼ " : ""}
                <span className="font-money tabular-nums">
                  {formatSignedMoney(netProfit)}
                </span>
              </span>
              <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                {trackingSince
                  ? `net profit since ${shortDate(trackingSince)}`
                  : "net profit, all time"}
              </span>
            </p>
            {control === "under" && <div className="mt-3">{smallButton}</div>}
          </div>

          {/* The wide chart: the balance after every settled bet,
              edge to edge, green above where it started and red
              below, with the start level as a dashed line. */}
          {series && series.length > 1 ? (
            <div className="mt-2">
              <Sparkline
                points={series}
                positive={netProfit >= 0}
                baseline
                className="h-20"
              />
            </div>
          ) : (
            <div className="h-3" />
          )}

          {strip && (
            <div className="grid grid-cols-4 border-t border-neutral-900/[0.06] dark:border-white/[0.07]">
              {strip.map((cell, i) => (
                <div
                  key={cell.label}
                  className={`flex flex-col gap-1 pb-3 pt-2.5 ${
                    i === 0 ? "pl-4 sm:pl-5" : "border-l border-neutral-900/[0.06] pl-3 dark:border-white/[0.07]"
                  }`}
                >
                  <MicroLabel>{cell.label}</MicroLabel>
                  <span
                    className={`font-money text-sm font-semibold tabular-nums ${stripTone(cell.profit)}`}
                  >
                    {shortSignedMoney(cell.profit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Nobody has to set a balance. Until someone does, profit is the
           only honest headline: a balance of zero minus stakes would
           read as a loss the user never took. */
        <div className="px-4 py-4 sm:px-5">
          <MicroLabel>Net profit</MicroLabel>
          <p className="mt-1 break-words">
            <HeroMoney value={netProfit} className="text-[32px]" />
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            From {betCount} tracked {betCount === 1 ? "bet" : "bets"}.
          </p>
          <div className="mt-3">{smallButton}</div>
        </div>
      )}

      {control === "button" && (
        <div className="px-4 pb-4 sm:px-5">
          <button type="button" onClick={openSheet} className={`${BTN} h-11 w-full`}>
            Set tracking balance
          </button>
        </div>
      )}

      {control === "link" && (
        <div className="px-4 pb-4 sm:px-5">
          <button
            type="button"
            onClick={openSheet}
            className="text-[13px] font-semibold text-brand-mark"
          >
            Set tracking balance
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#161D38]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Set tracking balance</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400"
              >
                Cancel
              </button>
            </div>

            {/* Shown because months later nobody remembers what they set. */}
            {hasBalance && (
              <div className="mt-4 rounded-xl bg-neutral-100 p-3 dark:bg-[#0E1228]">
                <MicroLabel>Tracking Balance</MicroLabel>
                <p className="mt-0.5 font-money text-lg font-bold tabular-nums">
                  {formatMoney(balance)}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Started with{" "}
                  <span className="font-money tabular-nums">
                    {formatMoney(startedWith)}
                  </span>
                  {" · "}
                  <Link
                    href="/transactions"
                    className="underline underline-offset-2"
                  >
                    Balance history
                  </Link>
                </p>
              </div>
            )}

            {hasBalance && (
              <div className="mt-4 flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-[#0E1228]">
                <button
                  type="button"
                  onClick={() => setMode("adjust")}
                  className={tabClass(mode === "adjust")}
                >
                  Adjust
                </button>
                <button
                  type="button"
                  onClick={() => setMode("set")}
                  className={tabClass(mode === "set")}
                >
                  Set new
                </button>
              </div>
            )}

            <label htmlFor="amount" className="mt-4 block text-sm font-semibold">
              {mode === "set" ? "Tracking balance" : "Amount"}
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
            />

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            {mode === "set" ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => save("up")}
                className={`${BTN} mt-4 h-11 w-full`}
              >
                Save
              </button>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save("down")}
                  className="h-12 rounded-xl border border-neutral-300 text-base font-bold disabled:opacity-60 dark:border-white/15"
                >
                  Remove
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save("up")}
                  className={`${BTN} h-11`}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
