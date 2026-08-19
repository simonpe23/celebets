"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formatMoney,
  formatOdds,
  parseMoney,
  round2,
} from "@/lib/format";
import { SPORT_EMOJI, type BetWithLegs, type LegResult } from "@/lib/types";
import { CARD, CARD_LINK, INNER, OUTCOME, OUTCOME_LOST, OUTCOME_WON } from "@/lib/ui";

interface Props {
  bets: BetWithLegs[];
}

const STATUS_BADGE: Record<string, string> = {
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
  // Dates render after mount so they use the phone's timezone.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
    <section className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[17px] font-bold">
          Pending Bets
          {bets.length > 0 && (
            <span className="rounded-full bg-neutral-200/70 px-2.5 py-0.5 font-money text-xs font-semibold tabular-nums text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              {bets.length}
            </span>
          )}
        </h2>
        <Link
          href="/stats"
          className={CARD_LINK}
        >
          View all ›
        </Link>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {bets.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400">
          No pending bets. Track one above.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {bets.map((bet) => {
            const stake = Number(bet.stake);
            const totalOdds = Number(bet.total_odds);
            // What lands in the account if this wins, stake included.
            const toCollect = round2(stake * totalOdds);
            const isParlay = bet.legs.length > 1;

            return (
              <div
                key={bet.id}
                className={`${INNER} p-3.5`}
              >
                {/* NOT A BUTTON, NOT COLLAPSIBLE. Pending cards used
                    to fold up, hiding the picks and the settle
                    buttons behind a tap (and a stray tap while
                    scrolling folded them without asking). The owner:
                    "i want pending bets to always be visible."
                    Pending money is the page's whole point. */}
                <div className="flex w-full items-center justify-between gap-3 text-left">
                  <span className="flex min-w-0 items-center gap-2.5">
                    {isParlay ? (
                      <span className="shrink-0 rounded-md bg-neutral-200/70 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                        Parlay
                      </span>
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200/70 text-lg dark:bg-white/10">
                        {SPORT_EMOJI[bet.legs[0]?.sport ?? "Football"]}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold">
                        {isParlay
                          ? `${bet.legs.length} Leg Parlay`
                          : (bet.legs[0]?.description ??
                            bet.legs[0]?.subcategory ??
                            bet.legs[0]?.sport)}
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {mounted
                          ? new Date(bet.placed_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : ""}
                        {bet.status !== "pending" && (
                          <span
                            className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_BADGE[bet.status]}`}
                          >
                            {bet.status}
                          </span>
                        )}
                      </span>
                    </span>
                  </span>

                  {/* THE MONEY, NOT THE ODDS. The owner, August 2026,
                      looking at an imported bet: "biggest digit is
                      2.81, that shouldn't be the main info... it has
                      to say total payout, if won." A pending bet's
                      one interesting number is what it pays, and the
                      odds are the arithmetic behind it, so they swap
                      places. */}
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-right">
                      <span className="block font-money text-[15px] font-bold tabular-nums">
                        {formatMoney(toCollect)}
                      </span>
                      <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                        {bet.status === "pending" ? "to collect" : "collected"}
                      </span>
                    </span>
                  </span>
                </div>


                  <>
                    {/* The legs, with the rail threading the icons on a
                        parlay so the picks read as one ticket. */}
                    <div className="relative mt-3 space-y-2.5">
                      {isParlay && bet.legs.length > 1 && (
                        <span
                          className="absolute left-[15px] top-4 bottom-4 w-px bg-neutral-300 dark:bg-white/15"
                          aria-hidden="true"
                        />
                      )}
                      {bet.legs.map((leg) => (
                        <div
                          key={leg.id}
                          className="relative flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200/70 text-base dark:bg-white/10">
                              {SPORT_EMOJI[leg.sport]}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {leg.description ?? leg.subcategory ?? leg.sport}
                              </p>
                              {/* A leg without odds shows its sport,
                                  not "0.00". Kalshi parlays price the
                                  combo rather than the picks, and a
                                  pick claiming odds of zero reads as
                                  broken. */}
                              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                {leg.subcategory ??
                                  (leg.odds !== null
                                    ? formatOdds(Number(leg.odds))
                                    : leg.sport)}
                              </p>
                            </div>
                          </div>

                          {!bet.cashed_out && (
                            <div className="flex shrink-0 items-center gap-1.5">
                              {leg.result === "pending" ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={busyLeg !== null}
                                    onClick={() => setResult(leg.id, "won")}
                                    className={`${OUTCOME} ${OUTCOME_WON}`}
                                  >
                                    Won
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyLeg !== null}
                                    onClick={() => setResult(leg.id, "lost")}
                                    className={`${OUTCOME} ${OUTCOME_LOST}`}
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
                                    className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 disabled:opacity-50 dark:border-white/15 dark:text-neutral-400"
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

                    {addingMoney === bet.id && (
                      <div className="mt-3 rounded-xl bg-neutral-100 p-3 dark:bg-[#161D38]">
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
                          className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
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
                          className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
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
                            className="rounded-lg bg-brand-top px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Confirm add
                          </button>
                        </div>
                      </div>
                    )}
                    {bet.cashed_out && (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-neutral-100 p-3 dark:bg-[#161D38]">
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
                      <div className="mt-3 rounded-xl bg-neutral-100 p-3 dark:bg-[#161D38]">
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
                          className="mt-2 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
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
                            className="rounded-lg bg-brand-top px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Confirm cash out
                          </button>
                        </div>
                      </div>
                    )}
                    {confirmingDelete === bet.id && (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Delete this bet? The stake returns to your balance.
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
                          <div className="mt-2 space-y-1 rounded-xl bg-neutral-100 p-3 dark:bg-[#161D38]">
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

                    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                      {bet.cashed_out ? (
                        <>
                          <span className="font-money tabular-nums">
                            {formatMoney(stake)}
                          </span>{" "}
                          cashed out for{" "}
                          <span className="font-money tabular-nums">
                            {formatMoney(Number(bet.payout ?? 0))}
                          </span>
                        </>
                      ) : (
                        <>
                          {/* "to win" was ambiguous and the owner
                              said so: is it the profit or the money
                              back? Both numbers now say which they
                              are, and the leg count only appears on
                              a parlay, where it means something. */}
                          {isParlay && (
                            <>
                              {bet.legs.length} legs
                              {"  ·  "}
                            </>
                          )}
                          <span className="font-money tabular-nums">
                            {formatMoney(stake)}
                          </span>{" "}
                          staked{"  ·  "}
                          <span className="font-money tabular-nums">
                            {formatMoney(round2(stake * (totalOdds - 1)))}
                          </span>{" "}
                          profit if it wins
                        </>
                      )}
                    </p>

                    <div className="mt-3 flex gap-2">
                      {bet.status === "pending" && !bet.cashed_out && (
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
                            className="rounded-lg border border-brand-mark/40 px-3 py-1.5 text-xs font-semibold text-brand-mark disabled:opacity-50 dark:text-brand-mark"
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
                            className="rounded-lg border border-brand-mark/40 px-3 py-1.5 text-xs font-semibold text-brand-mark disabled:opacity-50 dark:text-brand-mark"
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
                          setConfirmingDelete(
                            confirmingDelete === bet.id ? null : bet.id
                          );
                        }}
                        className="ml-auto rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-500 disabled:opacity-50 dark:border-white/15 dark:text-neutral-400"
                      >
                        Delete
                      </button>
                    </div>
                  </>

              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
