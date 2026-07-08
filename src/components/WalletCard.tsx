"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, formatSignedMoney, parseMoney } from "@/lib/format";

interface Props {
  balance: number;
  netProfit: number;
  userId: string;
}

export default function WalletCard({ balance, netProfit, userId }: Props) {
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
        : "text-neutral-500";

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
    <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium text-neutral-500">My Wallet</h2>
          <p
            className={`mt-1 text-4xl font-bold tracking-tight ${
              balance < 0 ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            {formatMoney(balance)}
          </p>
          <p className={`mt-1 text-sm font-semibold ${profitColor}`}>
            Net profit {formatSignedMoney(netProfit)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-emerald-700"
        >
          Deposit
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 sm:rounded-2xl dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Move money</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1 text-sm text-neutral-500"
              >
                Cancel
              </button>
            </div>

            <label htmlFor="amount" className="mt-4 block text-sm font-medium">
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
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
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
                className="h-12 rounded-xl border border-neutral-300 text-base font-semibold disabled:opacity-60 dark:border-neutral-700"
              >
                Withdraw
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => submit("deposit")}
                className="h-12 rounded-xl bg-emerald-600 text-base font-semibold text-white active:bg-emerald-700 disabled:opacity-60"
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
