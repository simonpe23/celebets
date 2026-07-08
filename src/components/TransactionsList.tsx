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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dates render after mount so they use the phone's timezone.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
            href="/"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
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
          <p className="rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No deposits or withdrawals yet.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {tx.type}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
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
                      className={`text-sm font-bold ${
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
                      onClick={() => setConfirming(tx.id)}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {confirming === tx.id && (
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <p className="text-sm">Delete this {tx.type}?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirming(null)}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
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
