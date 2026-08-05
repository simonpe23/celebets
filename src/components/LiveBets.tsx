"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formatMoney,
  formatOdds,
  formatSignedMoney,
  parseMoney,
  round2,
} from "@/lib/format";
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
  const [addingMoney, setAddingMoney] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");
  const [addPayout, setAddPayout] = useState("");
  const [expandedBuys, setExpandedBuys] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addMoney(betId: string, stake: number, totalOdds: number) {
    const amount = parseMoney(addAmount);
    const payout = parseMoney(addPayout);
    if (amount === null || payout === null) {
      setError("Enter a valid amount and payout, both above 0.");
      return;
    }
    const newCollect = round2(stake * totalOdds) + payout;
    if (newCollect <= stake + amount) {
      setError("The total payout must stay above the total stake.");
      return;
    }

    setError(null);
    setBusyLeg("adding-money");

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("add_money", {
      p_bet_id: betId,
      p_amount: amount,
      p_payout: payout,
    });

    setBusyLeg(null);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setAddingMoney(null);
    setAddAmount("");
    setAddPayout("");
    router.refresh();
  }

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
        <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-white/15">
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
                className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] dark:bg-[#151A28] p-4 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[bet.status]}`}
                  >
                    {bet.status}
                  </span>
                  <div className="flex items-center gap-2">
                    {bet.legs.length > 1 && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Parlay, {bet.legs.length} legs
                      </span>
                    )}
                    {bet.status === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busyLeg !== null}
                          onClick={() => {
                            setCashingOut(null);
                            setConfirmingDelete(null);
                            setAddAmount("");
                            setAddPayout("");
                            setAddingMoney(
                              addingMoney === bet.id ? null : bet.id
                            );
                          }}
                          className="rounded-lg border border-[#4F7A57] px-3 py-1.5 text-xs font-semibold text-[#4F7A57] disabled:opacity-50 dark:text-[#4F7A57]"
                        >
                          Add money
                        </button>
                        <button
                          type="button"
                          disabled={busyLeg !== null}
                          onClick={() => {
                            setAddingMoney(null);
                            setConfirmingDelete(null);
                            setCashOutAmount("");
                            setCashingOut(
                              cashingOut === bet.id ? null : bet.id
                            );
                          }}
                          className="rounded-lg border border-[#4F7A57] px-3 py-1.5 text-xs font-semibold text-[#4F7A57] disabled:opacity-50 dark:text-[#4F7A57]"
                        >
                          Cash out
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      disabled={busyLeg !== null}
                      onClick={() => {
                        setCashingOut(null);
                        setAddingMoney(null);
                        setConfirmingDelete(bet.id);
                      }}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-50 dark:border-white/15"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {addingMoney === bet.id && (
                  <div className="mt-3 rounded-xl bg-neutral-100 p-3 dark:bg-[#1A2032]">
                    <label
                      htmlFor={`add-amount-${bet.id}`}
                      className="block text-sm font-semibold"
                    >
                      Amount added (USD)
                    </label>
                    <input
                      id={`add-amount-${bet.id}`}
                      type="text"
                      inputMode="decimal"
                      autoFocus
                      placeholder="0.00"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-white/15 dark:bg-[#151A28] dark:text-neutral-100"
                    />
                    <label
                      htmlFor={`add-payout-${bet.id}`}
                      className="mt-3 block text-sm font-semibold"
                    >
                      That buy&apos;s own payout (USD)
                    </label>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      The payout if right for this buy alone, from your
                      betting app&apos;s order history.
                    </p>
                    <input
                      id={`add-payout-${bet.id}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={addPayout}
                      onChange={(e) => setAddPayout(e.target.value)}
                      className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-white/15 dark:bg-[#151A28] dark:text-neutral-100"
                    />
                    {parseMoney(addAmount) !== null &&
                      parseMoney(addPayout) !== null && (
                        <p className="mt-2 text-xs">
                          New totals: stake{" "}
                          {formatMoney(
                            round2(stake + (parseMoney(addAmount) as number))
                          )}
                          , To Collect{" "}
                          {formatMoney(
                            round2(
                              round2(stake * totalOdds) +
                                (parseMoney(addPayout) as number)
                            )
                          )}
                        </p>
                      )}
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyLeg !== null}
                        onClick={() => {
                          setAddingMoney(null);
                          setAddAmount("");
                          setAddPayout("");
                        }}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold dark:border-white/15"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={
                          busyLeg !== null ||
                          parseMoney(addAmount) === null ||
                          parseMoney(addPayout) === null
                        }
                        onClick={() => addMoney(bet.id, stake, totalOdds)}
                        className="rounded-lg bg-[#4F7A57] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Confirm add
                      </button>
                    </div>
                  </div>
                )}

                {bet.cashed_out && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-[#1A2032]">
                    <p className="text-sm">
                      Cashed out for{" "}
                      <span className="font-bold">
                        {formatMoney(Number(bet.payout ?? 0))}
                      </span>
                      . Done, moves to history in a few minutes.
                    </p>
                    <button
                      type="button"
                      disabled={busyLeg !== null}
                      onClick={() => undoCashOut(bet.id)}
                      className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-50 dark:border-white/15"
                    >
                      Undo
                    </button>
                  </div>
                )}

                {cashingOut === bet.id && (
                  <div className="mt-3 rounded-xl bg-neutral-100 p-3 dark:bg-[#1A2032]">
                    <label
                      htmlFor={`cashout-${bet.id}`}
                      className="block text-sm font-semibold"
                    >
                      Cash out amount (USD)
                    </label>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      The amount your betting app paid you. Above your{" "}
                      {formatMoney(Number(bet.stake))} stake counts as a win,
                      below counts as a loss.
                    </p>
                    <input
                      id={`cashout-${bet.id}`}
                      type="text"
                      inputMode="decimal"
                      autoFocus
                      placeholder="0.00"
                      value={cashOutAmount}
                      onChange={(e) => setCashOutAmount(e.target.value)}
                      className="mt-2 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-white/15 dark:bg-[#151A28] dark:text-neutral-100"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyLeg !== null}
                        onClick={() => {
                          setCashingOut(null);
                          setCashOutAmount("");
                        }}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold dark:border-white/15"
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
                        className="rounded-lg bg-[#4F7A57] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
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
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold dark:border-white/15"
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
                        <p className="text-sm font-semibold">
                          {SPORT_EMOJI[leg.sport]}{" "}
                          {leg.description ?? leg.subcategory ?? leg.sport}
                          {leg.description !== null &&
                            leg.subcategory !== null && (
                              <span className="ml-1.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                                {leg.subcategory}
                              </span>
                            )}
                        </p>
                        {leg.odds !== null && (
                          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                            {formatOdds(Number(leg.odds))}
                          </p>
                        )}
                      </div>

                      {!bet.cashed_out && (
                      <div className="mt-1.5 flex items-center gap-2">
                        {leg.result === "pending" ? (
                          <>
                            <button
                              type="button"
                              disabled={busyLeg !== null}
                              onClick={() => setResult(leg.id, "won")}
                              className="h-9 flex-1 rounded-lg bg-[#4F7A57] text-sm font-semibold text-white active:bg-[#3F6446] disabled:opacity-50"
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
                              className="rounded-lg border border-neutral-300 px-3.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 disabled:opacity-50 dark:border-white/15"
                            >
                              Undo
                            </button>
                          </>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                </div>

                {(bet.bet_buys?.length ?? 0) > 1 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBuys(
                          expandedBuys === bet.id ? null : bet.id
                        )
                      }
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 dark:border-white/15"
                    >
                      {expandedBuys === bet.id
                        ? "Hide buys"
                        : `${bet.bet_buys.length} buys`}
                    </button>
                    {expandedBuys === bet.id && (
                      <div className="mt-2 space-y-1 rounded-xl bg-neutral-100 p-3 dark:bg-[#1A2032]">
                        {[...bet.bet_buys]
                          .sort(
                            (a, b) =>
                              new Date(a.created_at).getTime() -
                              new Date(b.created_at).getTime()
                          )
                          .map((buy, i) => (
                            <p key={buy.id} className="text-xs">
                              Buy {i + 1}: {formatMoney(Number(buy.amount))}{" "}
                              pays {formatMoney(Number(buy.payout))} (odds{" "}
                              {formatOdds(
                                Number(buy.payout) / Number(buy.amount)
                              )}
                              )
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {bet.cashed_out ? (
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center dark:border-white/10">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Ticket cost</p>
                      <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
                        {formatMoney(stake)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Cashed out</p>
                      <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
                        {formatMoney(Number(bet.payout ?? 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Result</p>
                      <p
                        className={`mt-0.5 font-money text-sm font-bold tabular-nums ${
                          Number(bet.payout ?? 0) - stake >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatSignedMoney(
                          round2(Number(bet.payout ?? 0) - stake)
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center dark:border-white/10">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Ticket cost</p>
                      <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
                        {formatMoney(stake)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">To Win</p>
                      <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
                        {formatMoney(round2(stake * (totalOdds - 1)))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">To Collect</p>
                      <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
                        {formatMoney(round2(stake * totalOdds))}
                      </p>
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
