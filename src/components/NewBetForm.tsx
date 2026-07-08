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

export default function NewBetForm() {
  const router = useRouter();
  const [stake, setStake] = useState("");
  const [sport, setSport] = useState<Sport | null>(null);
  const [description, setDescription] = useState("");
  const [odds, setOdds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [saving, setSaving] = useState(false);

  const stakeValue = parseMoney(stake);
  const oddsValue = parseOdds(odds);
  const previewReady = stakeValue !== null && oddsValue !== null;
  const toWin = previewReady ? round2(stakeValue * (oddsValue - 1)) : null;
  const toCollect = previewReady ? round2(stakeValue * oddsValue) : null;

  const canPlace =
    previewReady && sport !== null && description.trim().length > 0 && !saving;

  async function placeBet() {
    if (!canPlace || stakeValue === null || oddsValue === null) return;

    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("place_bet", {
      p_stake: stakeValue,
      p_total_odds: oddsValue,
      p_legs: [
        { sport, description: description.trim(), odds: oddsValue },
      ],
    });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    setStake("");
    setSport(null);
    setDescription("");
    setOdds("");
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

      <p className="mt-4 text-sm font-medium">Sport</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SPORTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSport(s)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
              sport === s
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {SPORT_EMOJI[s]} {s}
          </button>
        ))}
      </div>

      <label htmlFor="description" className="mt-4 block text-sm font-medium">
        Pick
      </label>
      <input
        id="description"
        type="text"
        placeholder="Man Utd ML vs Arsenal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={inputClass}
      />

      <label htmlFor="odds" className="mt-4 block text-sm font-medium">
        Odds (decimal)
      </label>
      <input
        id="odds"
        type="text"
        inputMode="decimal"
        placeholder="2.50"
        value={odds}
        onChange={(e) => setOdds(e.target.value)}
        className={inputClass}
      />

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-3 text-center dark:bg-neutral-900">
        <div>
          <p className="text-xs text-neutral-500">Total odds</p>
          <p className="mt-0.5 text-sm font-bold">
            {oddsValue !== null ? formatOdds(oddsValue) : "-"}
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
