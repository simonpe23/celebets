"use client";

// THE PERFORMANCE TAB AREA. Home, Lab and Totals are one page, not
// three.
//
// They used to be three routes. Switching tabs meant a server round
// trip and a fresh database query, and Next showed `/stats/loading`
// in between, which is the OLD design's skeleton. His words, 31
// August 2026, after the first look at the live site: "it's very slow
// when jumping tabs... it's loading this page in between, not at all
// a smooth experience. i dont want that. i want the transition to be
// a clean smooth swap. i want to see the tab bar slide over."
//
// So the bets are loaded once, the frame and the menu stay mounted,
// and the tab is React state. Nothing is fetched when you switch and
// there is no page in between.
//
// The addresses still work. Each tab has its own route for deep links
// and for the jump from Home into Lab; those routes render this same
// component with a different starting tab. Switching updates the
// address with pushState so the back button and a shared link both
// behave, without asking the server for anything.
//
// THE HEAT MAP JOINED THIS ON 31 AUGUST 2026, for the same reason.
// His words: "heat map is loading slowly." It was not slow code: the
// server rendered it in 0.11s. It was a separate page, so tapping the
// Heat Map pill on Home left the area, asked the database for his
// bets a second time and drew a loading screen on the way. It is a
// view in here now, on the bets already in memory. It is NOT a menu
// tab: the menu is still Home, Lab and Totals, and the Heat Map keeps
// its back arrow to Home.
//
// COMPARE AND ALL BETS JOINED THE SAME DAY, on his order: "Fix
// compare and all bets pages the same way as well. fix all of them,
// if there's anyone i've missed." Nothing under Performance loads a
// page any more. All six views read one list of bets, fetched once.
//
// The three that are not menu tabs each keep their own back arrow:
// the Heat Map to Home, Compare to Lab with both chips still chosen,
// All Bets to whichever door sent it, Lab or Totals.

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PerfPage from "./shell";
import PerfMenu, { type PerfTab } from "./menu";
import HomeContent from "@/components/performance/home/HomeContent";
import LabApp from "@/components/performance/lab/LabApp";
import TotalsApp from "@/components/performance/totals/TotalsApp";
import HeatmapApp from "@/components/performance/heatmap/HeatmapApp";
import CompareApp from "@/components/performance/compare/CompareApp";
import BetsApp from "@/components/performance/bets/BetsApp";
import { TAIL_SHORT, TAIL_TALL } from "./ui";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import type { BetWithLegs } from "@/lib/types";
import {
  EMPTY_RANGE,
  isPeriod,
  type CustomRange,
  type PeriodKey,
} from "@/components/performance/lab/period";

// What the area can show. The menu draws three of these. The other
// three are reached from inside and wear a back arrow instead.
export type PerfView = PerfTab | "heatmap" | "compare" | "bets";

// Where a view is opened from. Everything a view needs that is not
// the bets or the period travels in here, because pushState does not
// refresh useSearchParams.
interface GoOpts {
  /** A Lab selection, or the pair Compare shows, as `a|b`. */
  sel?: string;
  /** A Totals group for Lab to scroll to. */
  group?: string;
  /** The domain a Heat Map tile belongs to. */
  domain?: string;
  /** Which door opened All Bets, so its back arrow returns there. */
  from?: "lab" | "totals";
}

export default function PerfArea({
  bets,
  initial,
  routes = PREVIEW_ROUTES,
  live = false,
  trackingSince = null,
}: {
  bets: BetWithLegs[];
  initial: PerfView;
  routes?: PerfRoutes;
  live?: boolean;
  /**
   * The restart line, or null for somebody who has never restarted.
   * Only the live page passes one; the previews are demo records and
   * pass nothing, so their pill never offers "Since restart".
   */
  trackingSince?: string | null;
}) {
  const params = useSearchParams();
  const [tab, setTab] = useState<PerfView>(initial);
  // THE PERIOD IS SHARED BY ALL THREE TABS. It used to live inside Lab
  // and inside Totals, travelling between them in the address. They
  // are one page now, so it lives here: change the window on Home and
  // Lab is already looking at the same one.
  const [period, setPeriod] = useState<PeriodKey>(() => {
    const raw = params.get("period");
    return isPeriod(raw) ? raw : "all";
  });
  // WHICH RECORD, which is a different question from which window.
  //
  // Somebody who has restarted opens on their own record, 4 September
  // 2026. That is what a restart asked for and what Track has always
  // shown them. Everybody else has no button and no line, so nothing
  // moves for a user who has never restarted.
  const [restarted, setRestarted] = useState<boolean>(!!trackingSince);
  const [range, setRange] = useState<CustomRange>(EMPTY_RANGE);
  // Lab is remounted whenever a jump hands it a new selection, because
  // it seeds its chips once and then owns them.
  const [labKey, setLabKey] = useState(0);
  // The selection travels as a prop, not in the address: switching
  // uses pushState, and useSearchParams does not see that.
  const [labSel, setLabSel] = useState<string | undefined>(undefined);
  const [labGroup, setLabGroup] = useState<string | undefined>(undefined);
  // The Heat Map's tiles carry a domain as well as a selection: a
  // Crypto fact landing on a Sports mode Lab shows nothing. Same
  // reason as above, it travels as a prop.
  const [labDomain, setLabDomain] = useState<string | undefined>(undefined);
  // What Compare and All Bets are looking at. Seeded from the address
  // so a shared link still works, then owned here.
  const [subSel, setSubSel] = useState<string>(() => params.get("sel") ?? "");
  const [betsFrom, setBetsFrom] = useState<"lab" | "totals">(() =>
    params.get("from") === "totals" ? "totals" : "lab"
  );

  // The address a view is shown at. It is written with pushState, so
  // the back button and a shared link both work, and the server is
  // never asked for it.
  const urlFor = useCallback(
    (next: PerfView, o: GoOpts) => {
      const q = new URLSearchParams();
      if (o.sel) q.set("sel", o.sel);
      if (next === "lab" && o.domain) q.set("domain", o.domain);
      if (next === "bets" && o.from === "totals") q.set("from", "totals");
      const s = q.toString();
      return routes[next] + (s ? `?${s}` : "");
    },
    [routes]
  );

  const go = useCallback(
    (next: PerfView, o: GoOpts = {}) => {
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", urlFor(next, o));
      }
      if (next === "lab") {
        setLabSel(o.sel ?? "");
        setLabGroup(o.group);
        setLabDomain(o.domain);
        setLabKey((k) => k + 1);
      }
      if (next === "compare" || next === "bets") {
        setSubSel(o.sel ?? "");
        setBetsFrom(o.from ?? "lab");
      }
      setTab(next);
      window.scrollTo({ top: 0 });
    },
    [urlFor]
  );

  // The back button moves between views without asking the server. It
  // reads the address it landed on, so a step back into Compare or
  // All Bets arrives with the same selection it left with.
  useEffect(() => {
    function onPop() {
      const path = window.location.pathname;
      const q = new URLSearchParams(window.location.search);
      const match = (
        ["lab", "totals", "heatmap", "compare", "bets", "home"] as const
      ).find((k) =>
        k === "home" ? path === routes.home : path.startsWith(routes[k])
      );
      if (!match) return;
      if (match === "lab") {
        setLabSel(q.get("sel") ?? "");
        setLabDomain(q.get("domain") ?? undefined);
        setLabKey((k) => k + 1);
      }
      if (match === "compare" || match === "bets") {
        setSubSel(q.get("sel") ?? "");
        setBetsFrom(q.get("from") === "totals" ? "totals" : "lab");
      }
      setTab(match);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [routes]);

  return (
    // Home and Lab have their own growing gaps higher up, so their
    // foot spacer has to lose; Totals does not, and keeps the short
    // one it has always had.
    <PerfPage
      live={live}
      tail={tab === "home" || tab === "lab" ? TAIL_TALL : TAIL_SHORT}
    >
      {/* Only the three menu tabs draw the menu. The Heat Map, Compare
          and All Bets wear a back arrow instead, exactly as they did
          when they were pages. Nothing about how any of them looks
          changed in the move. */}
      {(tab === "home" || tab === "lab" || tab === "totals") && (
        <PerfMenu active={tab} routes={routes} onSelect={(t) => go(t)} />
      )}

      {tab === "home" && (
        <HomeContent
          bets={bets}
          trackingSince={trackingSince}
          restarted={restarted}
          onRestarted={setRestarted}
          routes={routes}
          live={live}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onJump={(sel) => go("lab", { sel })}
          onHeatmap={() => go("heatmap")}
        />
      )}
      {tab === "lab" && (
        <LabApp
          key={labKey}
          bets={bets}
          trackingSince={trackingSince}
          restarted={restarted}
          onRestarted={setRestarted}
          routes={routes}
          live={live}
          initialSel={labSel}
          initialGroup={labGroup}
          initialDomain={labDomain}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onBets={(sel) => go("bets", { sel, from: "lab" })}
          onCompare={(sel) => go("compare", { sel })}
        />
      )}
      {tab === "totals" && (
        <TotalsApp
          bets={bets}
          trackingSince={trackingSince}
          restarted={restarted}
          onRestarted={setRestarted}
          routes={routes}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onJumpGroup={(g) => go("lab", { group: g })}
          onBets={() => go("bets", { from: "totals" })}
        />
      )}
      {tab === "heatmap" && (
        <HeatmapApp
          bets={bets}
          trackingSince={trackingSince}
          restarted={restarted}
          onRestarted={setRestarted}
          routes={routes}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onBack={() => go("home")}
          onJump={(sel, domain) => go("lab", { sel, domain })}
        />
      )}
      {tab === "compare" && (
        <CompareApp
          bets={bets}
          routes={routes}
          sel={subSel}
          onBack={(sel) => go("lab", { sel })}
        />
      )}
      {tab === "bets" && (
        <BetsApp
          bets={bets}
          trackingSince={trackingSince}
          restarted={restarted}
          onRestarted={setRestarted}
          routes={routes}
          sel={subSel}
          from={betsFrom}
          period={period}
          range={range}
          onBack={() =>
            betsFrom === "totals" ? go("totals") : go("lab", { sel: subSel })
          }
        />
      )}
    </PerfPage>
  );
}
