"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatOdds, formatMoney, formatSignedMoney } from "@/lib/format";

function BuysList({ bet }: { bet: BetWithLegs }) {
  const [expanded, setExpanded] = useState(false);
  if ((bet.bet_buys?.length ?? 0) < 2) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-700"
      >
        {expanded ? "Hide buys" : `${bet.bet_buys.length} buys`}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
          {[...bet.bet_buys]
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            )
            .map((buy, i) => (
              <p key={buy.id} className="text-xs">
                Buy {i + 1}: {formatMoney(Number(buy.amount))} pays{" "}
                {formatMoney(Number(buy.payout))} (odds{" "}
                {formatOdds(Number(buy.payout) / Number(buy.amount))})
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
import { SPORT_EMOJI, type BetWithLegs } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
}

// Payout minus stake covers every case: won bets, plain lost bets
// (no payout), and cashed out bets which carry a payout even on loss.
function profitOf(bet: BetWithLegs): number {
  return Number(bet.payout ?? 0) - Number(bet.stake);
}

// Formats a timestamp as yyyy-mm-dd in local time, for the date input.
function toDateInputValue(timestamp: string): string {
  const d = new Date(timestamp);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function BetHistory({ bets }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [dateValue, setDateValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dates render after mount so they use the phone's timezone.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function deleteBet(betId: string) {
    setError(null);
    setBusy(true);

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("bets")
      .delete()
      .eq("id", betId);

    setBusy(false);
    setConfirming(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  async function saveDate(betId: string) {
    if (!dateValue) return;
    setError(null);
    setBusy(true);

    // Saved at noon local time so the day stays right in every view.
    const settledAt = new Date(dateValue + "T12:00:00").toISOString();
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("bets")
      .update({ settled_at: settledAt })
      .eq("id", betId);

    setBusy(false);
    setEditing(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  return (
    <section>
      <h2 className="text-lg font-bold">Betting history</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {bets.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
          Settled bets will show up here.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {bets.map((bet) => {
            const profit = profitOf(bet);
            return (
              <div
                key={bet.id}
                className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-neutral-950 p-4 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {bet.legs.map((leg) => (
                      <p key={leg.id} className="truncate text-sm font-medium">
                        {SPORT_EMOJI[leg.sport]}{" "}
                        {leg.description ?? leg.subcategory ?? leg.sport}
                        {leg.description !== null &&
                          leg.subcategory !== null && (
                            <span className="ml-1.5 text-xs font-normal text-neutral-500">
                              {leg.subcategory}
                            </span>
                          )}
                      </p>
                    ))}
                    <p className="mt-1 text-xs text-neutral-500">
                      {mounted && bet.settled_at
                        ? new Date(bet.settled_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : ""}
                      {" · "}
                      {formatMoney(Number(bet.stake))} at{" "}
                      {formatOdds(Number(bet.total_odds))}
                      {bet.cashed_out && " · Cashed out"}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-bold ${
                      profit > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatSignedMoney(profit)}
                  </p>
                </div>

                <BuysList bet={bet} />

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setConfirming(null);
                      setEditing(bet.id);
                      setDateValue(
                        bet.settled_at ? toDateInputValue(bet.settled_at) : ""
                      );
                    }}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
                  >
                    Edit date
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setEditing(null);
                      setConfirming(bet.id);
                    }}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
                  >
                    Delete
                  </button>
                </div>

                {editing === bet.id && (
                  <div className="mt-3 flex items-end gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                    <div className="grow">
                      <label
                        htmlFor={`date-${bet.id}`}
                        className="block text-xs text-neutral-500"
                      >
                        Settled on
                      </label>
                      <input
                        id={`date-${bet.id}`}
                        type="date"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="mt-1 block h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setEditing(null)}
                      className="h-10 rounded-lg border border-neutral-300 px-3 text-xs font-medium dark:border-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busy || !dateValue}
                      onClick={() => saveDate(bet.id)}
                      className="h-10 rounded-lg bg-[#4F7A57] px-3 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                )}

                {confirming === bet.id && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Delete this bet? The stake returns to your wallet and
                      all stats forget it.
                    </p>
                    <div className="flex shrink-0 gap-2">
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
                        onClick={() => deleteBet(bet.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Yes, delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
