"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export default function TransactionsList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dates render after mount so they use the phone's timezone.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Formats a timestamp as yyyy-mm-dd in local time, for the date input.
  function toDateInputValue(timestamp: string): string {
    const d = new Date(timestamp);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  }

  async function saveDate(id: string) {
    if (!dateValue) return;
    setError(null);
    setBusy(true);

    // Saved at noon local time so the day stays right in every view.
    const createdAt = new Date(dateValue + "T12:00:00").toISOString();
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("transactions")
      .update({ created_at: createdAt })
      .eq("id", id);

    setBusy(false);
    setEditing(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  async function deleteTransaction(id: string) {
    setError(null);
    setBusy(true);

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    setBusy(false);
    setConfirming(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  return (
    <main className="min-h-dvh px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <Link
            href="/app"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold dark:border-white/15"
          >
            Home
          </Link>
        </header>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-white/15">
            No deposits or withdrawals yet.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-[#151A28] p-4 dark:border-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {tx.type}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {mounted
                        ? new Date(tx.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      className={`font-money text-sm font-bold tabular-nums ${
                        tx.type === "deposit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.type === "deposit" ? "+" : "-"}
                      {formatMoney(Number(tx.amount))}
                    </p>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setConfirming(null);
                        setEditing(tx.id);
                        setDateValue(toDateInputValue(tx.created_at));
                      }}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-50 dark:border-white/15"
                    >
                      Edit date
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setEditing(null);
                        setConfirming(tx.id);
                      }}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-50 dark:border-white/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editing === tx.id && (
                  <div className="mt-3 flex items-end gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-[#1A2032]">
                    <div className="grow">
                      <label
                        htmlFor={`date-${tx.id}`}
                        className="block text-xs text-neutral-500 dark:text-neutral-400"
                      >
                        Date
                      </label>
                      <input
                        id={`date-${tx.id}`}
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="mt-1 block h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-white/15 dark:bg-[#151A28] dark:text-neutral-100"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setEditing(null)}
                      className="h-10 rounded-lg border border-neutral-300 px-3 text-xs font-semibold dark:border-white/15"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy || !dateValue}
                      onClick={() => saveDate(tx.id)}
                      className="h-10 rounded-lg bg-[#4F7A57] px-3 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                )}

                {confirming === tx.id && (
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-white/10">
                    <p className="text-sm">Delete this {tx.type}?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirming(null)}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold dark:border-white/15"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteTransaction(tx.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Yes, delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
