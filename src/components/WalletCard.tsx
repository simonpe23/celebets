"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HeroMoney from "@/components/HeroMoney";
import { formatSignedMoney, parseMoney } from "@/lib/format";
import Recommendations from "@/components/Recommendations";
import type { BetWithLegs } from "@/lib/types";

interface Props {
  balance: number;
  netProfit: number;
  userId: string;
  settledBets: BetWithLegs[];
}

export default function WalletCard({
  balance,
  netProfit,
  userId,
  settledBets,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const profitColor =
    netProfit > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : netProfit < 0
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-500 dark:text-neutral-400";

  async function submit(type: "deposit" | "withdrawal") {
    const value = parseMoney(amount);
    if (value === null) {
      setError("Enter a valid amount above 0, for example 100 or 49.99");
      return;
    }

    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("transactions")
      .insert({ user_id: userId, type, amount: value });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setAmount("");
    setOpen(false);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-[#151A28] p-5 dark:border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">My Wallet</h2>
          <p
            className={`mt-1 break-words ${
              balance < 0 ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            <HeroMoney value={balance} signed={false} className="text-[32px]" />
          </p>
          <p className={`mt-1 text-sm font-semibold ${profitColor}`}>
            Net profit{" "}
            <span className="font-money tabular-nums">
              {formatSignedMoney(netProfit)}
            </span>
          </p>
          <Link
            href="/transactions"
            className="mt-2 inline-block text-sm font-semibold text-neutral-500 dark:text-neutral-400 underline underline-offset-2"
          >
            Transactions
          </Link>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
            className="rounded-xl bg-[#4F7A57] px-3 py-2.5 text-sm font-bold text-white active:bg-[#3F6446]"
          >
            Start here
          </button>
          <Link
            href="/stats"
            className="rounded-xl border border-neutral-300 px-3 py-2.5 text-center text-sm font-bold dark:border-white/15"
          >
            Analytics
          </Link>
          <Recommendations bets={settledBets} />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#1A2032]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Move money</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1 text-sm text-neutral-500 dark:text-neutral-400"
              >
                Cancel
              </button>
            </div>

            <label htmlFor="amount" className="mt-4 block text-sm font-semibold">
              Amount (USD)
            </label>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-[#4F7A57] focus:ring-2 focus:ring-[#4F7A57]/30 dark:border-white/15 dark:bg-[#151A28] dark:text-neutral-100"
            />

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => submit("withdrawal")}
                className="h-12 rounded-xl border border-neutral-300 text-base font-bold disabled:opacity-60 dark:border-white/15"
              >
                Withdraw
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => submit("deposit")}
                className="h-12 rounded-xl bg-[#4F7A57] text-base font-bold text-white active:bg-[#3F6446] disabled:opacity-60"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
