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
import { CARD } from "@/lib/ui";

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
  // The home screen shows this card among several others, so it drops
  // the heading and the explaining line and leads with the buttons.
  compact?: boolean;
}

const QUICK_STAKES = ["20", "50", "100"];

// Small line icons for the capture tiles. They take their color from
// the tile's own text color.
function PencilIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
    </svg>
  );
}

function LinkIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

function ClipboardIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function CameraIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export default function NewBetForm({ lastStake, compact = false }: Props) {
  const router = useRouter();
  const [stake, setStake] = useState("");
  const [legs, setLegs] = useState<LegDraft[]>([emptyLeg()]);
  const [collect, setCollect] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  // The manual form is long, so it stays folded until asked for.
  const [manualOpen, setManualOpen] = useState(false);
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
  // Nothing is saved: the user reviews and taps Track Bet as always.
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
    setManualOpen(true);
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

  // The three capture tiles on the Track card. ONE string, used by all
  // three, so they can never drift apart the way they did when each
  // button carried its own copy.
  const TILE =
    "flex flex-col items-center justify-start gap-1.5 rounded-xl px-1 py-3 " +
    "text-center text-[12px] font-semibold leading-tight disabled:opacity-50 " +
    "border border-neutral-300 active:bg-neutral-100 " +
    "dark:border-white/20 dark:active:bg-white/5";

  const inputClass =
    "mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100";

  return (
    <section className={`${CARD} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold">Track a bet</h2>
        {compact && (
          /* Inert until there is a walkthrough behind it. It is in the
             owner's mockup, so it is drawn; it just does not pretend to
             play anything yet. */
          <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M10 9l5 3-5 3V9Z" fill="currentColor" stroke="none" />
            </svg>
            How it works
          </span>
        )}
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Paste a screenshot of your bet slip and Celebet fills the rest in.
        </p>
      )}

      {compact ? (
        /* The four ways in. Connect your accounts leads on one full
           width row, the three that work today sit under it as equal
           thirds. Ruled by the owner, August 2026: connecting an
           account is the door he wants front and centre, and it ships
           soon.
           The old shape was two big tiles over two small ones, which
           put Paste and Upload at the top and buried Connect in a
           corner beside Manual entry. */
        <>
          {/* Biggest by size, quietest by colour. The owner chose this
              over a filled button: the feature does not work yet, and
              a big violet control that does nothing when tapped reads
              as broken rather than as coming. Grey text plus the badge
              says "not yet" before a finger ever lands on it, so it is
              a div, not a disabled button. */}
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-4 text-[14px] font-semibold text-neutral-400 dark:border-white/10 dark:text-neutral-600">
            <span className="text-[#22C55E]">
              <LinkIcon className="h-5 w-5" />
            </span>
            Connect your accounts
            <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
              Coming Soon
            </span>
          </div>

          {/* The three that work, equal thirds, and IDENTICAL. Paste
              used to carry the brand border. The owner cut it: a
              coloured edge around one of three doors means "this one
              is special" and nothing here is. The three are equally
              real, whichever one suits you is the right one, so they
              share one class string rather than three near copies. */}
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={importing}
              onClick={pasteSlip}
              className={TILE}
            >
              <span className="text-brand-mark">
                <ClipboardIcon className="h-5 w-5" />
              </span>
              Paste bet slip
            </button>
            <button
              type="button"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              className={TILE}
            >
              <span className="text-[#3B82F6]">
                <CameraIcon className="h-5 w-5" />
              </span>
              Upload image
            </button>
            <button
              type="button"
              onClick={() => setManualOpen(true)}
              className={TILE}
            >
              <span className="text-[#F97316]">
                <PencilIcon className="h-5 w-5" />
              </span>
              Manually enter
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={importing}
            onClick={pasteSlip}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-brand-mark bg-white text-sm font-bold text-brand-mark active:bg-brand-mark/10 disabled:opacity-50 dark:dark:bg-transparent dark:text-brand-mark"
          >
            <ClipboardIcon />
            Paste bet slip
          </button>
          <button
            type="button"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white text-sm font-bold text-neutral-600 active:bg-neutral-100 disabled:opacity-50 dark:border-white/15 dark:bg-transparent dark:text-neutral-400"
          >
            <CameraIcon />
            Upload image
          </button>
        </div>
      )}
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
        <p className="mt-2 rounded-lg bg-neutral-100 px-4 py-3 text-sm dark:bg-[#161D38]">
          Reading the slip...
        </p>
      )}
      {importError && (
        <p className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {importError}
        </p>
      )}

      {!manualOpen && !compact && (
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="mt-3 h-11 w-full rounded-xl border border-dashed border-neutral-300 text-sm font-bold text-neutral-600 dark:border-white/15 dark:text-neutral-300"
        >
          Add manually
        </button>
      )}

      <div className={manualOpen ? "" : "hidden"}>
      <label htmlFor="stake" className="mt-4 block text-sm font-semibold">
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
            className={`shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
              stake === amount
                ? "border-brand-mark text-brand-mark"
                : "border-neutral-300 text-neutral-500 dark:text-neutral-400 dark:border-white/15"
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
              ? "mt-4 rounded-xl border border-neutral-200 p-3 dark:border-white/10"
              : ""
          }
        >
          {isParlay && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Leg {index + 1}</p>
              <button
                type="button"
                onClick={() => removeLeg(index)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          )}

          <p className="mt-3 text-sm font-semibold">Sport</p>
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
                className={`shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
                  leg.sport === s
                    ? "border-brand-mark bg-brand-top text-white"
                    : "border-neutral-300 dark:border-white/15"
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
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Category: {leg.subcategory} (tap {leg.sport} to change)
              </p>
            )}

          {(leg.sport === null || SUBCATEGORIES[leg.sport] === undefined) &&
            leg.subcategory !== null && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Category: {leg.subcategory}{" "}
                <button
                  type="button"
                  onClick={() => updateLeg(index, { subcategory: null })}
                  className="font-semibold underline underline-offset-2"
                >
                  clear
                </button>
              </p>
            )}

          {leg.sport !== null &&
            SUBCATEGORIES[leg.sport] !== undefined &&
            leg.categoriesOpen && (
              <>
                <p className="mt-4 text-sm font-semibold">
                  Category
                  <span className="font-normal text-neutral-500 dark:text-neutral-400">
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
                          className={`shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
                            selected
                              ? "border-brand-mark bg-brand-top text-white"
                              : "border-neutral-300 dark:border-white/15"
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
                        className={`shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
                          groupSelected
                            ? "border-brand-mark bg-brand-top text-white"
                            : groupOpen
                              ? "border-brand-mark text-brand-mark"
                              : "border-neutral-300 dark:border-white/15"
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
                      className="mt-2 flex gap-2 overflow-x-auto rounded-xl bg-neutral-100 p-2 dark:bg-[#161D38]"
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
                            className={`shrink-0 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold ${
                              selected
                                ? "border-brand-mark bg-brand-top text-white"
                                : "border-neutral-300 bg-white dark:border-white/15 dark:bg-[#0E1228]"
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
            className="mt-4 block text-sm font-semibold"
          >
            Pick{" "}
            <span className="font-normal text-neutral-500 dark:text-neutral-400">(optional)</span>
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
                className="mt-4 block text-sm font-semibold"
              >
                Chance (%){" "}
                <span className="font-normal text-neutral-500 dark:text-neutral-400">
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
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
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
        className="mt-4 h-11 w-full rounded-xl border border-dashed border-neutral-300 text-sm font-bold text-neutral-600 dark:border-white/15 dark:text-neutral-300"
      >
        + Add leg (makes it a parlay)
      </button>

      <div className="mt-4">
        <label htmlFor="collect" className="block text-sm font-semibold">
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
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {collectValid
            ? "The odds are calculated from this and the stake."
            : collectValue !== null && stakeValue !== null
              ? "Must be larger than the stake."
              : "The exact payout your betting app shows for this bet."}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-neutral-100 p-3 text-center dark:bg-[#161D38]">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total odds</p>
          <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
            {totalOdds !== null ? formatOdds(totalOdds) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">To Win</p>
          <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
            {toWin !== null ? formatMoney(toWin) : "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">To Collect</p>
          <p className="mt-0.5 font-money text-sm font-bold tabular-nums">
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
          Bet tracked
        </p>
      )}

      <button
        type="button"
        disabled={!canPlace}
        onClick={placeBet}
        className="mt-4 h-14 w-full rounded-xl bg-brand-top text-lg font-bold text-white active:bg-brand-bottom disabled:opacity-40"
      >
        {saving ? "Tracking..." : "Track Bet"}
      </button>
      </div>
    </section>
  );
}
