"use client";

// VIEW 5 AND VIEW 4, NOW ONE THING: the Add a fact sheet, built to
// 05_add_a_fact.png, carrying the All Facts directory (04) inside
// it. Local preview, gitignored.
//
// WHY THEY MERGED, ruled by the owner: "fold all facts into the
// builder." Sheet 04 and sheet 05 were near twins. Both listed every
// fact, ranked, with its money. The only things 04 had that 05 did
// not were a search field and a set of filter chips, and the only
// thing 05 had that 04 did not was the grouping into tabs. Two pages
// that list the same rows is a place for the two lists to disagree,
// and a user who taps "All facts" and then "Add a fact" cannot tell
// why they landed somewhere different.
//
// So the search field and the filter live here now, and there is one
// list of facts in the whole product.
//
// Every row is priced AT the intersection it would create, so the
// sheet previews its own result before you tap.
//
// THE TABS AND THE SEARCH DO NOT COMPETE. Typing hides the tabs and
// searches everything, because a search scoped to "Leagues" that
// silently misses Tennis is worse than no search. Clearing the field
// brings the tabs back. Neither control is ever left on screen doing
// nothing.
//
// "Create custom fact" is drawn because the sheet draws it. It is
// inert: the owner ruled that saving a named intersection as a
// reusable fact gets built late.

import { useMemo, useState } from "react";
import {
  hitOf,
  iconFor,
  money,
  type Chip,
  type Engine,
  type Fact,
  type GroupKey,
} from "./engine";
import { PF_CSS } from "./theme";
import { useDismiss } from "./motion";

const TABS = ["Popular", "Markets", "Leagues", "Other"] as const;
type Tab = (typeof TABS)[number];

const TAB_GROUPS: Record<Exclude<Tab, "Popular">, GroupKey[]> = {
  Markets: ["what"],
  Leagues: ["where"],
  Other: ["sport", "when", "how", "risk"],
};

// Sheet 04's chips, minus "New": a fact's first appearance needs a
// date the engine does not carry, and a badge that guesses is worse
// than no badge.
// "All" and not "All facts": the sheet's own title is All facts, and
// a chip repeating it reads as a second thing rather than a filter.
const FILTERS = ["All", "Winning", "Losing", "Hot"] as const;
type Filter = (typeof FILTERS)[number];

function passesFilter(f: Fact, filter: Filter): boolean {
  if (filter === "Winning") return f.s.profit > 0;
  if (filter === "Losing") return f.s.profit < 0;
  // Hot means it moved money in the last week, which is what the
  // engine's `recent` already measures.
  if (filter === "Hot") return Math.abs(f.recent) >= 1;
  return true;
}

export default function AddFact({
  engine,
  path,
  onAdd,
  onClose,
  // Compare mode reuses this sheet as the opponent picker: it ranks
  // facts against the WHOLE record (a comparison is not a filter)
  // and lets a same-group rival through, because Football vs
  // Baseball is the most natural comparison there is.
  compare = false,
}: {
  engine: Engine;
  path: Chip[];
  onAdd: (chip: Chip) => void;
  onClose: () => void;
  compare?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("Popular");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const searching = query.trim() !== "";
  // Cancel plays the sheet back down before it unmounts, which is
  // the whole point: a sheet that leaves the way it arrived tells
  // you it was temporary. Picking a row skips it, because the page
  // underneath is navigating anyway.
  const { leaving, close } = useDismiss(onClose);

  // The whole vocabulary, ranked once. Every view of it below is a
  // filter over this one list, never a second computation.
  const all = useMemo(() => {
    const base = compare
      ? engine
          .rankedFacts([], 2)
          .filter(
            (f) =>
              !path.some(
                (c) => c.group === f.chip.group && c.value === f.chip.value
              )
          )
      : engine.rankedFacts(path, 2);
    return base;
  }, [engine, path, compare]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = all.filter((f) => passesFilter(f, filter));
    if (q !== "") {
      out = out.filter((f) => f.chip.value.toLowerCase().includes(q));
    } else if (tab === "Popular") {
      // Popular means the shortlist. Every other tab is the full
      // list of its kind.
      out = out.slice(0, 12);
    } else {
      const groups = TAB_GROUPS[tab];
      out = out.filter((f) => groups.includes(f.chip.group));
    }
    return out;
  }, [all, filter, query, tab]);

  const title = compare
    ? "Compare with"
    : path.length === 0
      ? "All facts"
      : "Add a fact";

  return (
    <div className={`pf pfa-overlay pf-rise${leaving ? " leaving" : ""}`}>
      <style>{PF_CSS}</style>
      <style>{CSS}</style>
      <div className="pf-max pfa-inner">
        <div className="pfa-bar">
          <button type="button" className="pfa-cancel" onClick={close}>
            Cancel
          </button>
          <span className="pfa-title">{title}</span>
          <span className="pfa-spacer" />
        </div>

        <div className="pfa-tools">
          <span className="pfa-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              placeholder="Search facts"
              aria-label="Search facts"
              onChange={(e) => setQuery(e.target.value)}
            />
            {/* Our own clear button. The browser's native one is a
                blue system glyph that belongs to no palette here. */}
            {searching && (
              <button
                type="button"
                className="pfa-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </span>
          <button
            type="button"
            className="pfa-filter"
            onClick={() =>
              setFilter(FILTERS[(FILTERS.indexOf(filter) + 1) % FILTERS.length])
            }
          >
            {filter} ▾
          </button>
        </div>

        {searching ? (
          <p className="pfa-count">
            {rows.length === 1 ? "1 fact matches" : `${rows.length} facts match`}{" "}
            &ldquo;{query.trim()}&rdquo;
          </p>
        ) : (
          <div className="pfa-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={`pfa-tab ${tab === t ? "on" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="pfa-list">
          {rows.length === 0 ? (
            <p className="pfa-empty">
              {searching
                ? `No fact matches "${query.trim()}".`
                : filter === "All"
                  ? "Nothing here has enough bets behind it yet."
                  : `No ${filter.toLowerCase()} facts here yet.`}
            </p>
          ) : (
            rows.map((f) => (
              <button
                key={`${f.chip.group}|${f.chip.value}`}
                type="button"
                className="pfa-row"
                onClick={() => onAdd(f.chip)}
              >
                <span className="pfa-ic">{iconFor(f.chip.value)}</span>
                <span className="pfa-text">
                  <b>{f.chip.value}</b>
                  <i>
                    {f.s.wins}-{f.s.losses} · {hitOf(f.s)} hit rate
                  </i>
                </span>
                <span
                  className={`pfa-money font-money ${
                    f.s.profit >= 0 ? "pos" : "neg"
                  }`}
                >
                  {money(f.s.profit)}
                </span>
              </button>
            ))
          )}
        </div>

        {!compare && (
        <div className="pfa-custom">
          <span className="pfa-customic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.6" />
              <rect x="14" y="3" width="7" height="7" rx="1.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.6" />
              <path d="M17.5 14.5v6M14.5 17.5h6" />
            </svg>
          </span>
          <span className="pfa-customtext">
            <b>Create custom fact</b>
            <i>Build your own combination</i>
          </span>
        </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
  .pfa-overlay { position: fixed; inset: 0; z-index: 40;
    overflow-y: auto; padding: 22px 16px 40px; }
  .pfa-inner { padding-bottom: 20px; }
  .pfa-bar { display: flex; align-items: center; margin-bottom: 16px; }
  .pfa-cancel { border: none; background: none; color: var(--pf-sub);
    font-family: inherit; font-size: 15px; font-weight: 500;
    padding: 8px 8px 8px 0; cursor: pointer; flex: 1;
    text-align: left; margin: -8px 0; }
  .pfa-title { font-size: 17px; font-weight: 700; }
  .pfa-spacer { flex: 1; }
  .pfa-tools { display: flex; gap: 8px; margin-bottom: 12px; }
  .pfa-search { flex: 1; min-width: 0; display: flex;
    align-items: center; gap: 8px; background: var(--pf-inner);
    border-radius: var(--pf-r-small); padding: 0 12px; height: 42px;
    color: var(--pf-muted); }
  .pfa-search svg { width: 17px; height: 17px; flex: none; }
  .pfa-search input { flex: 1; min-width: 0; border: none;
    background: none; color: inherit; font-family: inherit;
    font-size: 14.5px; font-weight: 500; outline: none;
    -webkit-appearance: none; }
  .pf .pfa-search input { color: var(--pf-sub); }
  .pfa-search input::placeholder { color: var(--pf-muted);
    font-weight: 500; }
  .pfa-search input::-webkit-search-cancel-button {
    -webkit-appearance: none; appearance: none; }
  .pfa-clear { flex: none; border: none; background: none;
    color: var(--pf-muted); padding: 6px; margin: -6px -4px -6px 0;
    cursor: pointer; display: flex; }
  .pfa-clear svg { width: 15px; height: 15px; }
  .pfa-filter { flex: none; height: 42px; border: 1px solid
    var(--pf-ring); background: var(--pf-card); color: inherit;
    font-family: inherit; font-size: 12.5px; font-weight: 600;
    padding: 0 13px; border-radius: 999px; cursor: pointer;
    white-space: nowrap; }
  .pfa-tabs { display: flex; gap: 8px; margin-bottom: 6px; }
  .pfa-tab { flex: 1; border: 1px solid var(--pf-ring);
    background: var(--pf-card); color: var(--pf-sub);
    font-family: inherit; font-size: 13px; font-weight: 600;
    padding: 10px 4px; border-radius: 999px; cursor: pointer; }
  .pfa-tab.on { background: var(--pf-purple); border-color:
    var(--pf-purple); color: #fff; font-weight: 700; }
  .pfa-count { font-size: 13px; font-weight: 500; color: var(--pf-sub);
    margin: 0 2px 2px; }
  .pfa-list { margin-bottom: var(--pf-gap-block); }
  .pfa-row { display: flex; align-items: center; gap: 12px;
    width: 100%; border: none; border-bottom: 1px solid var(--pf-ring);
    background: none; color: inherit; font-family: inherit;
    text-align: left; padding: 15px 2px; cursor: pointer; }
  .pfa-row:last-child { border-bottom: none; }
  .pfa-ic { width: 34px; display: flex; align-items: center;
    justify-content: center; font-size: 26px; line-height: 1;
    flex: none; }
  .pfa-text { min-width: 0; flex: 1; }
  .pfa-text b { display: block; font-size: 14.5px; font-weight: 700;
    line-height: 1.15; margin-bottom: 3px; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; }
  .pfa-text i { font-style: normal; font-size: 12.5px;
    font-weight: 500; color: var(--pf-sub);
    font-variant-numeric: tabular-nums; }
  .pfa-money { font-size: 14.5px; font-weight: 700; flex: none;
    font-variant-numeric: tabular-nums; }
  .pfa-empty { font-size: 13.5px; font-weight: 500;
    color: var(--pf-sub); padding: 28px 2px; margin: 0; }
  .pfa-custom { display: flex; align-items: center; gap: 14px;
    background: var(--pf-inner); border-radius: var(--pf-r-inner);
    padding: 16px; }
  .pfa-customic { color: var(--pf-sub); flex: none; }
  .pfa-customic svg { width: 24px; height: 24px; }
  .pfa-customtext b { display: block; font-size: 14.5px;
    font-weight: 700; margin-bottom: 2px; }
  .pfa-customtext i { font-style: normal; font-size: 13px;
    font-weight: 500; color: var(--pf-sub); }
`;
