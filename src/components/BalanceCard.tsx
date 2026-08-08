"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HeroMoney from "@/components/HeroMoney";
import Sparkline from "@/components/Sparkline";
import MicroLabel from "@/components/MicroLabel";
import { formatMoney, formatSignedMoney, parseMoney } from "@/lib/format";
import { BTN, CARD } from "@/lib/ui";

interface Props {
  balance: number;
  netProfit: number;
  // What the user put in: everything added, minus everything removed.
  startedWith: number;
  // False until a tracking balance has ever been set. Some people never
  // set one and only track bets and profit, which the product supports
  // on purpose, so this card has two shapes instead of one.
  hasBalance: boolean;
  betCount: number;
  userId: string;
  // The balance over time, oldest first, drawn as the purple line in
  // the corner of the card. Comes from the page so the card stays dumb.
  series?: number[];
  // How the once-ever setup control is drawn. Setting a tracking
  // balance happens once and then almost never, so a full width
  // primary button spends the home page's best real estate on it.
  // The owner's ruling: a small squared button, under Net profit.
  //   under   the ruled shape, and the default
  //   corner  the same button, up beside the label
  //   link    a quiet text link, no button
  //   button  the old full width one, kept for comparison
  control?: "under" | "corner" | "link" | "button";
}

type Mode = "adjust" | "set";

export default function BalanceCard({
  balance,
  netProfit,
  startedWith,
  hasBalance,
  betCount,
  userId,
  series,
  control = "under",
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

  // Celebet never holds money. The balance is a number the user tracks
  // against, so nothing here is a deposit or a withdrawal. Under the
  // hood a change is still stored as a transaction, which keeps net
  // profit and the whole history untouched.
  async function save(direction: "up" | "down") {
    const value = parseMoney(amount);
    if (value === null) {
      setError("Enter an amount above 0, for example 100 or 49.99");
      return;
    }

    // "Set new" means the user typed the total they want, so Celebet
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

  return (
    <section className={`${CARD} p-5`}>
      {hasBalance ? (
        <>
          {control === "corner" && (
            <div className="mb-1 flex items-start justify-between gap-3">
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
              {smallButton}
            </div>
          )}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className={`flex items-center gap-1.5 ${
                  control === "corner" ? "hidden" : ""
                }`}
              >
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
              <p
                className={`mt-1 ${
                  balance < 0 ? "text-red-600 dark:text-red-400" : ""
                }`}
              >
                <HeroMoney
                  value={balance}
                  signed={false}
                  className="text-[34px]"
                />
              </p>
              <p className={`mt-1 text-[15px] font-bold ${profitColor}`}>
                Net profit{" "}
                <span className="font-money tabular-nums">
                  {formatSignedMoney(netProfit)}
                </span>
              </p>
            </div>
            {series && series.length > 1 && (
              <div className="-mr-1 w-[44%] shrink-0 self-center">
                {/* The balance line is money, so it is green when the
                    balance is above where it started and red when it is
                    below. It used to be purple, which said nothing. */}
                <Sparkline
                  points={series}
                  positive={netProfit >= 0}
                  dots
                  className="h-[104px]"
                />
              </div>
            )}
          </div>
        </>
      ) : (
        /* Nobody has to set a balance. Until someone does, profit is the
           only honest headline: a balance of zero minus stakes would
           read as a loss the user never took. */
        <>
          <MicroLabel>Net profit</MicroLabel>
          <p className="mt-1 break-words">
            <HeroMoney value={netProfit} className="text-[32px]" />
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            From {betCount} tracked {betCount === 1 ? "bet" : "bets"}.
          </p>
        </>
      )}

      {control === "under" && <div className="mt-3">{smallButton}</div>}

      {control === "button" && (
        <button type="button" onClick={openSheet} className={`${BTN} mt-4 h-11 w-full`}>
          Set tracking balance
        </button>
      )}

      {control === "link" && (
        <button
          type="button"
          onClick={openSheet}
          className="mt-3 text-[13px] font-semibold text-brand-mark"
        >
          Set tracking balance
        </button>
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
