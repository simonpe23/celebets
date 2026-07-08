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

function emptyLeg(): LegDraft {
  return { sport: null, description: "", odds: "" };
}

export default function NewBetForm() {
  const router = useRouter();
  const [stake, setStake] = useState("");
  const [legs, setLegs] = useState<LegDraft[]>([emptyLeg()]);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [saving, setSaving] = useState(false);

  const stakeValue = parseMoney(stake);
  const legOdds = legs.map((leg) => parseOdds(leg.odds));
  const allOddsValid = legOdds.every((o) => o !== null);
  const totalOdds = allOddsValid
    ? round2(legOdds.reduce((product, o) => product * (o as number), 1))
    : null;
  const toWin =
    stakeValue !== null && totalOdds !== null
      ? round2(stakeValue * (totalOdds - 1))
      : null;
  const toCollect =
    stakeValue !== null && totalOdds !== null
      ? round2(stakeValue * totalOdds)
      : null;

  const allLegsComplete = legs.every(
    (leg, i) =>
      leg.sport !== null && leg.description.trim().length > 0 && legOdds[i] !== null
  );
  const canPlace = stakeValue !== null && allLegsComplete && !saving;

  function updateLeg(index: number, patch: Partial<LegDraft>) {
    setLegs((prev) =>
      prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg))
    );
  }

  function addLeg() {
    setLegs((prev) => [...prev, emptyLeg()]);
  }

  function removeLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  async function placeBet() {
    if (!canPlace || stakeValue === null || totalOdds === null) return;

    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("place_bet", {
      p_stake: stakeValue,
      p_total_odds: totalOdds,
      p_legs: legs.map((leg, i) => ({
        sport: leg.sport,
        description: leg.description.trim(),
        odds: legOdds[i],
      })),
    });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setStake("");
    setLegs([emptyLeg()]);
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
            legs.length > 1
              ? "mt-4 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              : ""
          }
        >
          {legs.length > 1 && (
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
          </label>
          <input
            id={`odds-${index}`}
            type="text"
            inputMode="decimal"
            placeholder="2.50"
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
