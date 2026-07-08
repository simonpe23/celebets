"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formatMoney,
  formatOdds,
  parseMoney,
  parseOdds,
  round2,
} from "@/lib/format";
import { SPORTS, SPORT_EMOJI, type Sport } from "@/lib/types";

interface LegDraft {
  sport: Sport | null;
  description: string;
  odds: string;
}

type LegOddsState =
  | { kind: "blank" }
  | { kind: "invalid" }
  | { kind: "valid"; value: number };

function emptyLeg(): LegDraft {
  return { sport: null, description: "", odds: "" };
}

export default function NewBetForm() {
  const router = useRouter();
  const [stake, setStake] = useState("");
  const [legs, setLegs] = useState<LegDraft[]>([emptyLeg()]);
  // On parlays the user can type over the auto-calculated total odds,
  // for example when the betting app charges a fee.
  const [totalOverride, setTotalOverride] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [saving, setSaving] = useState(false);

  const isParlay = legs.length > 1;
  const stakeValue = parseMoney(stake);

  const legOddsStates: LegOddsState[] = legs.map((leg) => {
    const text = leg.odds.trim();
    if (text === "") return { kind: "blank" };
    const value = parseOdds(text);
    return value === null ? { kind: "invalid" } : { kind: "valid", value };
  });

  const autoTotal = legOddsStates.every((s) => s.kind === "valid")
    ? round2(
        legOddsStates.reduce(
          (product, s) => product * (s.kind === "valid" ? s.value : 1),
          1
        )
      )
    : null;

  const totalOdds =
    isParlay && totalOverride !== null
      ? parseOdds(totalOverride)
      : autoTotal;

  const toWin =
    stakeValue !== null && totalOdds !== null
      ? round2(stakeValue * (totalOdds - 1))
      : null;
  const toCollect =
    stakeValue !== null && totalOdds !== null
      ? round2(stakeValue * totalOdds)
      : null;

  const allLegsComplete = legs.every((leg, i) => {
    const oddsOk = isParlay
      ? legOddsStates[i].kind !== "invalid"
      : legOddsStates[i].kind === "valid";
    return leg.sport !== null && leg.description.trim().length > 0 && oddsOk;
  });
  const canPlace =
    stakeValue !== null && allLegsComplete && totalOdds !== null && !saving;

  function updateLeg(index: number, patch: Partial<LegDraft>) {
    setLegs((prev) =>
      prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg))
    );
  }

  function addLeg() {
    setLegs((prev) => [...prev, emptyLeg()]);
  }

  function removeLeg(index: number) {
    setLegs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 1) setTotalOverride(null);
      return next;
    });
  }

  async function placeBet() {
    if (!canPlace || stakeValue === null || totalOdds === null) return;

    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("place_bet", {
      p_stake: stakeValue,
      p_total_odds: totalOdds,
      p_legs: legs.map((leg, i) => {
        const state = legOddsStates[i];
        return {
          sport: leg.sport,
          description: leg.description.trim(),
          odds: state.kind === "valid" ? state.value : null,
        };
      }),
    });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setStake("");
    setLegs([emptyLeg()]);
    setTotalOverride(null);
    setPlaced(true);
    setTimeout(() => setPlaced(false), 2500);
    router.refresh();
  }

  const inputClass =
    "mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

  return (
    <section className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <h2 className="text-lg font-bold">New Bet</h2>

      <label htmlFor="stake" className="mt-4 block text-sm font-medium">
        Stake (USD)
      </label>
      <input
        id="stake"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={stake}
        onChange={(e) => setStake(e.target.value)}
        className={inputClass}
      />

      {legs.map((leg, index) => (
        <div
          key={index}
          className={
            isParlay
              ? "mt-4 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              : ""
          }
        >
          {isParlay && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Leg {index + 1}</p>
              <button
                type="button"
                onClick={() => removeLeg(index)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          )}

          <p className="mt-3 text-sm font-medium">Sport</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateLeg(index, { sport: s })}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                  leg.sport === s
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {SPORT_EMOJI[s]} {s}
              </button>
            ))}
          </div>

          <label
            htmlFor={`description-${index}`}
            className="mt-4 block text-sm font-medium"
          >
            Pick
          </label>
          <input
            id={`description-${index}`}
            type="text"
            placeholder="Man Utd ML vs Arsenal"
            value={leg.description}
            onChange={(e) => updateLeg(index, { description: e.target.value })}
            className={inputClass}
          />

          <label
            htmlFor={`odds-${index}`}
            className="mt-4 block text-sm font-medium"
          >
            Odds (decimal)
            {isParlay && (
              <span className="font-normal text-neutral-500">
                {" "}
                , optional
              </span>
            )}
          </label>
          <input
            id={`odds-${index}`}
            type="text"
            inputMode="decimal"
            placeholder={isParlay ? "Leave empty if unknown" : "2.50"}
            value={leg.odds}
            onChange={(e) => updateLeg(index, { odds: e.target.value })}
            className={inputClass}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addLeg}
        className="mt-4 h-11 w-full rounded-xl border border-dashed border-neutral-300 text-sm font-semibold text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
      >
        + Add leg (makes it a parlay)
      </button>

      {isParlay && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="total-odds" className="block text-sm font-medium">
              Total odds
            </label>
            {totalOverride !== null && autoTotal !== null && (
              <button
                type="button"
                onClick={() => setTotalOverride(null)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                Reset to auto ({formatOdds(autoTotal)})
              </button>
            )}
          </div>
          <input
            id="total-odds"
            type="text"
            inputMode="decimal"
            placeholder={autoTotal !== null ? formatOdds(autoTotal) : "3.96"}
            value={
              totalOverride !== null
                ? totalOverride
                : autoTotal !== null
                  ? formatOdds(autoTotal)
                  : ""
            }
            onChange={(e) => setTotalOverride(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {totalOverride !== null
              ? "Using your number. To Win and To Collect follow it."
              : autoTotal !== null
                ? "Calculated from the legs. Type over it if your betting app shows different total odds."
                : "Some legs have no odds, so type the total odds from your betting app."}
          </p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-3 text-center dark:bg-neutral-900">
        <div>
          <p className="text-xs text-neutral-500">Total odds</p>
          <p className="mt-0.5 text-sm font-bold">
            {totalOdds !== null ? formatOdds(totalOdds) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">To Win</p>
          <p className="mt-0.5 text-sm font-bold">
            {toWin !== null ? formatMoney(toWin) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">To Collect</p>
          <p className="mt-0.5 text-sm font-bold">
            {toCollect !== null ? formatMoney(toCollect) : "-"}
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {placed && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Bet placed
        </p>
      )}

      <button
        type="button"
        disabled={!canPlace}
        onClick={placeBet}
        className="mt-4 h-14 w-full rounded-xl bg-emerald-600 text-lg font-bold text-white active:bg-emerald-700 disabled:opacity-40"
      >
        {saving ? "Placing..." : "Place Bet"}
      </button>
    </section>
  );
}
