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
  round4,
} from "@/lib/format";
import { SPORTS, SPORT_EMOJI, SUBCATEGORIES, type Sport } from "@/lib/types";

interface LegDraft {
  sport: Sport | null;
  description: string;
  odds: string;
  // How the odds field is read: decimal odds or a chance percentage
  // like Kalshi shows (44% converts to decimal odds 100 / 44 = 2.27).
  oddsMode: "decimal" | "percent";
  subcategory: string | null;
  // Which chip group (like Player Props) currently shows its third row.
  openGroup: string | null;
  // Tapping the selected sport again hides or shows the category row.
  categoriesOpen: boolean;
}

type LegOddsState =
  | { kind: "blank" }
  | { kind: "invalid" }
  | { kind: "valid"; value: number };

function emptyLeg(): LegDraft {
  return {
    sport: null,
    description: "",
    odds: "",
    oddsMode: "decimal",
    subcategory: null,
    openGroup: null,
    categoriesOpen: true,
  };
}

// Parses a chance percentage like "44" or "55.5" (must be above 0 and
// below 100) into decimal odds: 100 / 44 = 2.27.
function parsePercent(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = parseFloat(normalized);
  if (value <= 0 || value >= 100) return null;
  return round2(100 / value);
}

interface Props {
  // Pre-fills for a fresh form: last stake and most used sport.
  defaultStake: string;
  defaultSport: Sport | null;
}

const QUICK_STAKES = ["20", "50", "100"];

export default function NewBetForm({ defaultStake, defaultSport }: Props) {
  const router = useRouter();
  const [stake, setStake] = useState(defaultStake);
  const [legs, setLegs] = useState<LegDraft[]>(() => [
    { ...emptyLeg(), sport: defaultSport },
  ]);
  // On parlays the user can type over the auto-calculated total odds,
  // for example when the betting app charges a fee.
  const [totalOverride, setTotalOverride] = useState<string | null>(null);
  // The exact payout from the betting app. When filled, it beats
  // every odds calculation: To Win and the stored odds follow it.
  const [collectOverride, setCollectOverride] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [saving, setSaving] = useState(false);

  const isParlay = legs.length > 1;
  const stakeValue = parseMoney(stake);

  const legOddsStates: LegOddsState[] = legs.map((leg) => {
    const text = leg.odds.trim();
    if (text === "") return { kind: "blank" };
    const value =
      leg.oddsMode === "percent" ? parsePercent(text) : parseOdds(text);
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

  const oddsBasedTotal =
    isParlay && totalOverride !== null
      ? parseOdds(totalOverride)
      : autoTotal;

  // The exact To Collect amount, when filled, wins over the odds.
  const collectActive = collectOverride.trim() !== "";
  const collectValue = collectActive ? parseMoney(collectOverride) : null;
  const collectValid =
    collectValue !== null && stakeValue !== null && collectValue > stakeValue;

  const totalOdds = collectValid
    ? round4(collectValue / stakeValue)
    : oddsBasedTotal;

  const toCollect = collectValid
    ? collectValue
    : stakeValue !== null && totalOdds !== null
      ? round2(stakeValue * totalOdds)
      : null;
  const toWin =
    stakeValue !== null && toCollect !== null
      ? round2(toCollect - stakeValue)
      : null;

  // The pick text is optional everywhere: only sport and valid odds
  // (odds required on singles only) gate the Place Bet button.
  const allLegsComplete = legs.every((leg, i) => {
    const oddsOk = isParlay
      ? legOddsStates[i].kind !== "invalid"
      : legOddsStates[i].kind === "valid";
    return leg.sport !== null && oddsOk;
  });
  const canPlace =
    stakeValue !== null &&
    allLegsComplete &&
    totalOdds !== null &&
    (!collectActive || collectValid) &&
    !saving;

  function updateLeg(index: number, patch: Partial<LegDraft>) {
    setLegs((prev) =>
      prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg))
    );
  }

  function addLeg() {
    // New legs keep the odds-or-percent mode of the leg above.
    setLegs((prev) => [
      ...prev,
      { ...emptyLeg(), oddsMode: prev[prev.length - 1]?.oddsMode ?? "decimal" },
    ]);
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
        const description = leg.description.trim();
        return {
          sport: leg.sport,
          description: description === "" ? null : description,
          odds: state.kind === "valid" ? state.value : null,
          subcategory: leg.subcategory,
        };
      }),
    });

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    // Keep the just-used stake, sport, and odds mode as the new start.
    setStake(String(stakeValue));
    setLegs([
      {
        ...emptyLeg(),
        sport: legs[0]?.sport ?? defaultSport,
        oddsMode: legs[0]?.oddsMode ?? "decimal",
      },
    ]);
    setTotalOverride(null);
    setCollectOverride("");
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
      <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {(defaultStake !== "" && !QUICK_STAKES.includes(defaultStake)
          ? [defaultStake, ...QUICK_STAKES]
          : QUICK_STAKES
        ).map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setStake(amount)}
            className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              stake === amount
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-neutral-300 text-neutral-500 dark:border-neutral-700"
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

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
          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  updateLeg(
                    index,
                    leg.sport === s
                      ? { categoriesOpen: !leg.categoriesOpen }
                      : {
                          sport: s,
                          subcategory: null,
                          openGroup: null,
                          categoriesOpen: true,
                        }
                  )
                }
                className={`shrink-0 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                  leg.sport === s
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {SPORT_EMOJI[s]} {s}
              </button>
            ))}
          </div>

          {leg.sport !== null &&
            SUBCATEGORIES[leg.sport] !== undefined &&
            !leg.categoriesOpen &&
            leg.subcategory !== null && (
              <p className="mt-2 text-xs text-neutral-500">
                Category: {leg.subcategory} (tap {leg.sport} to change)
              </p>
            )}

          {leg.sport !== null &&
            SUBCATEGORIES[leg.sport] !== undefined &&
            leg.categoriesOpen && (
            <>
              <p className="mt-4 text-sm font-medium">
                Category
                <span className="font-normal text-neutral-500">
                  , optional. Scroll for more, tap {leg.sport} to hide.
                </span>
              </p>
              <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                {SUBCATEGORIES[leg.sport]!.map((item) => {
                  if (typeof item === "string") {
                    const selected = leg.subcategory === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          updateLeg(index, {
                            subcategory: selected ? null : item,
                            openGroup: null,
                          })
                        }
                        className={`shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                          selected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  }
                  const groupSelected =
                    leg.subcategory?.startsWith(item.label + ": ") ?? false;
                  const groupOpen =
                    leg.openGroup === item.label || groupSelected;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() =>
                        updateLeg(index, {
                          openGroup:
                            leg.openGroup === item.label && !groupSelected
                              ? null
                              : item.label,
                        })
                      }
                      className={`shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                        groupSelected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : groupOpen
                            ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                            : "border-neutral-300 dark:border-neutral-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {SUBCATEGORIES[leg.sport]!.map((item) => {
                if (typeof item === "string") return null;
                const groupSelected =
                  leg.subcategory?.startsWith(item.label + ": ") ?? false;
                if (leg.openGroup !== item.label && !groupSelected) {
                  return null;
                }
                return (
                  <div
                    key={item.label}
                    className="mt-2 flex gap-2 overflow-x-auto rounded-xl bg-neutral-100 p-2 dark:bg-neutral-900"
                  >
                    {item.children.map((child) => {
                      const value = `${item.label}: ${child}`;
                      const selected = leg.subcategory === value;
                      return (
                        <button
                          key={child}
                          type="button"
                          onClick={() =>
                            updateLeg(index, {
                              subcategory: selected ? null : value,
                            })
                          }
                          className={`shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-semibold ${
                            selected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-950"
                          }`}
                        >
                          {child}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}

          <label
            htmlFor={`description-${index}`}
            className="mt-4 block text-sm font-medium"
          >
            Pick{" "}
            <span className="font-normal text-neutral-500">(optional)</span>
          </label>
          <input
            id={`description-${index}`}
            type="text"
            placeholder="Man Utd vs Arsenal"
            value={leg.description}
            onChange={(e) => updateLeg(index, { description: e.target.value })}
            className={inputClass}
          />

          <div className="mt-4 flex items-end justify-between">
            <label
              htmlFor={`odds-${index}`}
              className="block text-sm font-medium"
            >
              {leg.oddsMode === "percent" ? "Chance (%)" : "Odds (decimal)"}
              {isParlay && (
                <span className="font-normal text-neutral-500">
                  {" "}
                  (optional)
                </span>
              )}
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => updateLeg(index, { oddsMode: "decimal" })}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  leg.oddsMode === "decimal"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-neutral-300 text-neutral-500 dark:border-neutral-700"
                }`}
              >
                Odds
              </button>
              <button
                type="button"
                onClick={() => updateLeg(index, { oddsMode: "percent" })}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  leg.oddsMode === "percent"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-neutral-300 text-neutral-500 dark:border-neutral-700"
                }`}
              >
                %
              </button>
            </div>
          </div>
          <input
            id={`odds-${index}`}
            type="text"
            inputMode="decimal"
            placeholder={
              leg.oddsMode === "percent"
                ? "44"
                : isParlay
                  ? "Leave empty if unknown"
                  : "2.50"
            }
            value={leg.odds}
            onChange={(e) => updateLeg(index, { odds: e.target.value })}
            className={inputClass}
          />
          {leg.oddsMode === "percent" &&
            legOddsStates[index].kind === "valid" && (
              <p className="mt-1 text-xs text-neutral-500">
                = decimal odds{" "}
                {formatOdds(
                  (legOddsStates[index] as { value: number }).value
                )}
              </p>
            )}
          {leg.oddsMode === "percent" &&
            legOddsStates[index].kind === "invalid" && (
              <p className="mt-1 text-xs text-neutral-500">
                Enter a percentage above 0 and below 100.
              </p>
            )}
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
            {collectValid
              ? "Ignored right now: the exact To Collect amount below wins."
              : totalOverride !== null
                ? "Using your number. To Win and To Collect follow it."
                : autoTotal !== null
                  ? "Calculated from the legs. Type over it if your betting app shows different total odds."
                  : "Some legs have no odds, so type the total odds from your betting app."}
          </p>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="collect" className="block text-sm font-medium">
          Exact To Collect (optional)
        </label>
        <input
          id="collect"
          type="text"
          inputMode="decimal"
          placeholder="Payout shown by your betting app"
          value={collectOverride}
          onChange={(e) => setCollectOverride(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-neutral-500">
          {!collectActive
            ? "Type the exact payout from your betting app and To Win follows it."
            : collectValid
              ? "Using this exact amount. To Win updates from it."
              : stakeValue === null
                ? "Enter the stake first."
                : "Must be a valid amount larger than the stake."}
        </p>
      </div>

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
