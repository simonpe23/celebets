"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, formatOdds, parseMoney, round2 } from "@/lib/format";
import { SPORT_EMOJI, type BetWithLegs, type LegResult } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
}

const STATUS_BADGE: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export default function LiveBets({ bets }: Props) {
  const router = useRouter();
  const [busyLeg, setBusyLeg] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(
    null
  );
  const [cashingOut, setCashingOut] = useState<string | null>(null);
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function cashOut(betId: string) {
    const amount = parseMoney(cashOutAmount);
    if (amount === null) {
      setError("Enter a valid cash out amount above 0.");
      return;
    }

    setError(null);
    setBusyLeg("cashing-out");

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("cash_out_bet", {
      p_bet_id: betId,
      p_amount: amount,
    });

    setBusyLeg(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setCashingOut(null);
    setCashOutAmount("");
    router.refresh();
  }

  async function undoCashOut(betId: string) {
    setError(null);
    setBusyLeg("undo-cash-out");

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("undo_cash_out", {
      p_bet_id: betId,
    });

    setBusyLeg(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  async function deleteBet(betId: string) {
    setError(null);
    setBusyLeg("deleting");

    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("bets")
      .delete()
      .eq("id", betId);

    setBusyLeg(null);
    setConfirmingDelete(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  async function setResult(legId: string, result: LegResult) {
    setError(null);
    setBusyLeg(legId);

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("set_leg_result", {
      p_leg_id: legId,
      p_result: result,
    });

    setBusyLeg(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.refresh();
  }

  return (
    <section>
      <h2 className="text-lg font-bold">Live now</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {bets.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No pending bets. Place one above.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {bets.map((bet) => {
            const stake = Number(bet.stake);
            const totalOdds = Number(bet.total_odds);
            return (
              <div
                key={bet.id}
                className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[bet.status]}`}
                  >
                    {bet.status}
                  </span>
                  <div className="flex items-center gap-3">
                    {bet.legs.length > 1 && (
                      <span className="text-xs font-medium text-neutral-500">
                        Parlay, {bet.legs.length} legs
                      </span>
                    )}
                    {bet.status === "pending" && (
                      <button
                        type="button"
                        disabled={busyLeg !== null}
                        onClick={() => {
                          setConfirmingDelete(null);
                          setCashOutAmount("");
                          setCashingOut(bet.id);
                        }}
                        className="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-600 disabled:opacity-50 dark:text-emerald-400"
                      >
                        Cash out
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyLeg !== null}
                      onClick={() => {
                        setCashingOut(null);
                        setConfirmingDelete(bet.id);
                      }}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {bet.cashed_out && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                    <p className="text-sm">
                      Cashed out for{" "}
                      <span className="font-bold">
                        {formatMoney(Number(bet.payout ?? 0))}
                      </span>
                      . Picks below only count for your records.
                    </p>
                    <button
                      type="button"
                      disabled={busyLeg !== null}
                      onClick={() => undoCashOut(bet.id)}
                      className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
                    >
                      Undo
                    </button>
                  </div>
                )}

                {cashingOut === bet.id && (
                  <div className="mt-3 rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
                    <label
                      htmlFor={`cashout-${bet.id}`}
                      className="block text-sm font-medium"
                    >
                      Cash out amount (USD)
                    </label>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      The amount your betting app paid you. Above your{" "}
                      {formatMoney(Number(bet.stake))} stake counts as a win,
                      below counts as a loss.
                    </p>
                    <input
                      id={`cashout-${bet.id}`}
                      type="text"
                      inputMode="decimal"
                      autoFocus
                      placeholder="142.03"
                      value={cashOutAmount}
                      onChange={(e) => setCashOutAmount(e.target.value)}
                      className="mt-2 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyLeg !== null}
                        onClick={() => {
                          setCashingOut(null);
                          setCashOutAmount("");
                        }}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={
                          busyLeg !== null ||
                          parseMoney(cashOutAmount) === null
                        }
                        onClick={() => cashOut(bet.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Confirm cash out
                      </button>
                    </div>
                  </div>
                )}

                {confirmingDelete === bet.id && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Delete this bet? The stake returns to your wallet.
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={busyLeg !== null}
                        onClick={() => setConfirmingDelete(null)}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busyLeg !== null}
                        onClick={() => deleteBet(bet.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Yes, delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  {bet.legs.map((leg) => (
                    <div key={leg.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {SPORT_EMOJI[leg.sport]}{" "}
                          {leg.description ?? leg.subcategory ?? leg.sport}
                          {leg.description !== null &&
                            leg.subcategory !== null && (
                              <span className="ml-1.5 text-xs font-normal text-neutral-500">
                                {leg.subcategory}
                              </span>
                            )}
                        </p>
                        {leg.odds !== null && (
                          <p className="text-sm font-semibold text-neutral-500">
                            {formatOdds(Number(leg.odds))}
                          </p>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-2">
                        {leg.result === "pending" ? (
                          <>
                            <button
                              type="button"
                              disabled={busyLeg !== null}
                              onClick={() => setResult(leg.id, "won")}
                              className="h-9 flex-1 rounded-lg bg-emerald-600 text-sm font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
                            >
                              Won
                            </button>
                            <button
                              type="button"
                              disabled={busyLeg !== null}
                              onClick={() => setResult(leg.id, "lost")}
                              className="h-9 flex-1 rounded-lg border border-red-300 text-sm font-semibold text-red-600 active:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400"
                            >
                              Lost
                            </button>
                          </>
                        ) : (
                          <>
                            <span
                              className={`text-sm font-bold capitalize ${
                                leg.result === "won"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {leg.result}
                            </span>
                            <button
                              type="button"
                              disabled={busyLeg !== null}
                              onClick={() => setResult(leg.id, "pending")}
                              className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-500 disabled:opacity-50 dark:border-neutral-700"
                            >
                              Undo
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center dark:border-neutral-800">
                  <div>
                    <p className="text-xs text-neutral-500">Ticket cost</p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatMoney(stake)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">To Win</p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatMoney(round2(stake * (totalOdds - 1)))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">To Collect</p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatMoney(round2(stake * totalOdds))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
