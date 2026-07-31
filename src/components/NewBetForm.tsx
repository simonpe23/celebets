"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formatMoney,
  formatOdds,
  parseMoney,
  round2,
  round4,
} from "@/lib/format";
import { SPORTS, SPORT_EMOJI, SUBCATEGORIES, type Sport } from "@/lib/types";

interface LegDraft {
  sport: Sport | null;
  description: string;
  // Kalshi style chance percentage, used on parlays only.
  percent: string;
  subcategory: string | null;
  // Which chip group (like Player Props) currently shows its third row.
  openGroup: string | null;
  // Tapping the selected sport again hides or shows the category row.
  categoriesOpen: boolean;
}

type PercentState =
  | { kind: "blank" }
  | { kind: "invalid" }
  | { kind: "valid"; value: number };

function emptyLeg(): LegDraft {
  return {
    sport: null,
    description: "",
    percent: "",
    subcategory: null,
    openGroup: null,
    categoriesOpen: true,
  };
}

// Parses a chance percentage like "44" or "55.5". Must be above 0
// and below 100.
function parsePercent(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = parseFloat(normalized);
  if (value <= 0 || value >= 100) return null;
  return value;
}

interface Props {
  // The most recent stake, offered as a quick chip only.
  lastStake: string;
}

const QUICK_STAKES = ["20", "50", "100"];

export default function NewBetForm({ lastStake }: Props) {
  const router = useRouter();
  const [stake, setStake] = useState("");
  const [legs, setLegs] = useState<LegDraft[]>([emptyLeg()]);
  const [collect, setCollect] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isParlay = legs.length > 1;
  const stakeValue = parseMoney(stake);
  const collectValue = parseMoney(collect);
  const collectValid =
    collectValue !== null && stakeValue !== null && collectValue > stakeValue;

  // All odds come from the money: To Collect divided by stake.
  const totalOdds = collectValid
    ? round4((collectValue as number) / (stakeValue as number))
    : null;
  const toWin = collectValid
    ? round2((collectValue as number) - (stakeValue as number))
    : null;

  const percentStates: PercentState[] = legs.map((leg) => {
    const text = leg.percent.trim();
    if (text === "") return { kind: "blank" };
    const value = parsePercent(text);
    return value === null ? { kind: "invalid" } : { kind: "valid", value };
  });

  const allLegsOk = legs.every(
    (leg, i) => leg.sport !== null && percentStates[i].kind !== "invalid"
  );
  const canPlace = stakeValue !== null && collectValid && allLegsOk && !saving;

  // Per pick odds for the stats. Singles: the bet's own odds. Parlays:
  // odds from each percentage, scaled by one shared factor so together
  // they multiply to the real total odds (the fee gap gets spread
  // across the picks). Scaling needs every pick's percentage.
  function computeLegOdds(): (number | null)[] {
    if (!isParlay) {
      return [totalOdds !== null ? round2(totalOdds) : null];
    }

    const raw = percentStates.map((s) =>
      s.kind === "valid" ? 100 / s.value : null
    );

    if (raw.every((r) => r !== null) && totalOdds !== null) {
      const product = raw.reduce((p, r) => p * (r as number), 1);
      if (product > 0) {
        const factor = Math.pow(totalOdds / product, 1 / raw.length);
        const scaled = raw.map((r) => round2((r as number) * factor));
        if (scaled.every((o) => o > 1)) return scaled;
      }
    }

    return raw.map((r) => (r === null ? null : round2(r)));
  }

  async function placeBet() {
    if (!canPlace || stakeValue === null || totalOdds === null) return;

    setError(null);
    setSaving(true);

    const legOdds = computeLegOdds();
    const supabase = createClient();
    const { error: dbError } = await supabase.rpc("place_bet", {
      p_stake: stakeValue,
      p_total_odds: totalOdds,
      p_legs: legs.map((leg, i) => {
        const description = leg.description.trim();
        return {
          sport: leg.sport,
          description: description === "" ? null : description,
          odds: legOdds[i],
          subcategory: leg.subcategory,
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
    setCollect("");
    setPlaced(true);
    setTimeout(() => setPlaced(false), 2500);
    router.refresh();
  }

  // Turns an AI reading of a bet slip into pre-filled form fields.
  // Nothing is saved: the user reviews and taps Place Bet as always.
  function applyParsedSlip(data: {
    stake?: unknown;
    to_collect?: unknown;
    legs?: unknown;
  }) {
    if (typeof data.stake === "number" && data.stake > 0) {
      setStake(String(round2(data.stake)));
    }
    if (typeof data.to_collect === "number" && data.to_collect > 0) {
      setCollect(String(round2(data.to_collect)));
    }
    if (Array.isArray(data.legs) && data.legs.length > 0) {
      setLegs(
        data.legs.map(
          (raw: {
            sport?: unknown;
            category?: unknown;
            pick?: unknown;
            percent?: unknown;
          }) => ({
            sport: (SPORTS as readonly string[]).includes(
              typeof raw.sport === "string" ? raw.sport : ""
            )
              ? (raw.sport as Sport)
              : null,
            description: typeof raw.pick === "string" ? raw.pick : "",
            percent:
              typeof raw.percent === "number" &&
              raw.percent > 0 &&
              raw.percent < 100
                ? String(raw.percent)
                : "",
            subcategory:
              typeof raw.category === "string" && raw.category.trim() !== ""
                ? raw.category.trim()
                : null,
            openGroup: null,
            categoriesOpen: false,
          })
        )
      );
    }
  }

  async function importFromImage(file: Blob) {
    setImportError(null);
    setImporting(true);

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    let response: Response;
    try {
      response = await fetch("/api/parse-slip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
    } catch {
      setImporting(false);
      setImportError("No connection. Try again.");
      return;
    }

    const data = await response.json().catch(() => ({}));
    setImporting(false);

    if (!response.ok) {
      setImportError(
        typeof data.error === "string"
          ? data.error
          : "Could not read the image."
      );
      return;
    }

    applyParsedSlip(data);
  }

  async function pasteSlip() {
    setImportError(null);
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          await importFromImage(blob);
          return;
        }
      }
      setImportError(
        "No image on the clipboard. Copy the bet slip image first, or use Upload."
      );
    } catch {
      setImportError(
        "Could not read the clipboard. Use the Upload button instead."
      );
    }
  }

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

  const inputClass =
    "mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-[#72AFCC] focus:ring-2 focus:ring-[#72AFCC]/40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

  return (
    <section className="rounded-2xl border-2 border-neutral-900/15 dark:border-neutral-100/15 p-5 dark:border-neutral-800">
      <h2 className="text-lg font-bold">New Bet</h2>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={importing}
          onClick={pasteSlip}
          className="h-11 rounded-xl border border-[#72AFCC] text-sm font-semibold text-[#72AFCC] disabled:opacity-50 dark:text-[#72AFCC]"
        >
          Paste bet slip
        </button>
        <button
          type="button"
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
          className="h-11 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-600 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
        >
          Upload image
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importFromImage(file);
          e.target.value = "";
        }}
      />
      {importing && (
        <p className="mt-2 rounded-lg bg-neutral-100 px-4 py-3 text-sm dark:bg-neutral-900">
          Reading the slip...
        </p>
      )}
      {importError && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {importError}
        </p>
      )}

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
        {(lastStake !== "" && !QUICK_STAKES.includes(lastStake)
          ? [lastStake, ...QUICK_STAKES]
          : QUICK_STAKES
        ).map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => setStake(amount)}
            className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              stake === amount
                ? "border-[#72AFCC] text-emerald-600 dark:text-emerald-400"
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
                    ? "border-[#72AFCC] bg-[#72AFCC] text-[#F5EDCE]"
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

          {(leg.sport === null || SUBCATEGORIES[leg.sport] === undefined) &&
            leg.subcategory !== null && (
              <p className="mt-2 text-xs text-neutral-500">
                Category: {leg.subcategory}{" "}
                <button
                  type="button"
                  onClick={() => updateLeg(index, { subcategory: null })}
                  className="font-medium underline underline-offset-2"
                >
                  clear
                </button>
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
                              ? "border-[#72AFCC] bg-[#72AFCC] text-[#F5EDCE]"
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
                            ? "border-[#72AFCC] bg-[#72AFCC] text-[#F5EDCE]"
                            : groupOpen
                              ? "border-[#72AFCC] text-emerald-600 dark:text-emerald-400"
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
                                ? "border-[#72AFCC] bg-[#72AFCC] text-[#F5EDCE]"
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

          {isParlay && (
            <>
              <label
                htmlFor={`percent-${index}`}
                className="mt-4 block text-sm font-medium"
              >
                Chance (%){" "}
                <span className="font-normal text-neutral-500">
                  (optional)
                </span>
              </label>
              <input
                id={`percent-${index}`}
                type="text"
                inputMode="decimal"
                placeholder="Leave empty if unknown"
                value={leg.percent}
                onChange={(e) => updateLeg(index, { percent: e.target.value })}
                className={inputClass}
              />
              {percentStates[index].kind === "invalid" && (
                <p className="mt-1 text-xs text-neutral-500">
                  Enter a percentage above 0 and below 100.
                </p>
              )}
            </>
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

      <div className="mt-4">
        <label htmlFor="collect" className="block text-sm font-medium">
          To Collect (USD)
        </label>
        <input
          id="collect"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={collect}
          onChange={(e) => setCollect(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-neutral-500">
          {collectValid
            ? "The odds are calculated from this and the stake."
            : collectValue !== null && stakeValue !== null
              ? "Must be larger than the stake."
              : "The exact payout your betting app shows for this bet."}
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
            {collectValid ? formatMoney(collectValue as number) : "-"}
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
        className="mt-4 h-14 w-full rounded-xl bg-[#72AFCC] text-lg font-bold text-[#F5EDCE] active:bg-[#5B96B3] disabled:opacity-40"
      >
        {saving ? "Placing..." : "Place Bet"}
      </button>
    </section>
  );
}
