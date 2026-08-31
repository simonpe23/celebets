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

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PerfPage from "./performance-shell";
import PerfMenu, { type PerfTab } from "./performance-menu";
import HomeContent from "./performance-home/HomeContent";
import LabApp from "./performance-lab/LabApp";
import TotalsApp from "./performance-totals/TotalsApp";
import HeatmapApp from "./performance-heatmap/HeatmapApp";
import { TAIL_SHORT, TAIL_TALL } from "./performance-ui";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import type { BetWithLegs } from "@/lib/types";
import {
  EMPTY_RANGE,
  isPeriod,
  type CustomRange,
  type PeriodKey,
} from "./performance-lab/period";

// What the area can show. The menu draws three of these; the Heat Map
// is a fourth view reached from Home's pill, with no menu of its own.
export type PerfView = PerfTab | "heatmap";

export default function PerfArea({
  bets,
  initial,
  routes = PREVIEW_ROUTES,
  live = false,
}: {
  bets: BetWithLegs[];
  initial: PerfView;
  routes?: PerfRoutes;
  live?: boolean;
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

  const go = useCallback(
    (next: PerfView, sel?: string, group?: string, domain?: string) => {
      const url =
        next === "lab" && sel
          ? `${routes.lab}?sel=${encodeURIComponent(sel)}` +
            (domain ? `&domain=${encodeURIComponent(domain)}` : "")
          : routes[next];
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", url);
      }
      if (next === "lab") {
        setLabSel(sel ?? "");
        setLabGroup(group);
        setLabDomain(domain);
        setLabKey((k) => k + 1);
      }
      setTab(next);
      window.scrollTo({ top: 0 });
    },
    [routes]
  );

  // The back button moves between tabs without asking the server.
  useEffect(() => {
    function onPop() {
      const path = window.location.pathname;
      const match = (["lab", "totals", "heatmap", "home"] as const).find((k) =>
        k === "home" ? path === routes.home : path.startsWith(routes[k])
      );
      if (match) {
        if (match === "lab") setLabKey((k) => k + 1);
        setTab(match);
      }
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
      tail={tab === "totals" || tab === "heatmap" ? TAIL_SHORT : TAIL_TALL}
    >
      {/* The Heat Map is not one of the three, so it draws no menu.
          Nothing about how it looks changed in the move. */}
      {tab !== "heatmap" && (
        <PerfMenu active={tab} routes={routes} onSelect={go} />
      )}

      {tab === "home" && (
        <HomeContent
          bets={bets}
          routes={routes}
          live={live}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onJump={(sel) => go("lab", sel)}
          onHeatmap={() => go("heatmap")}
        />
      )}
      {tab === "lab" && (
        <LabApp
          key={labKey}
          bets={bets}
          routes={routes}
          live={live}
          initialSel={labSel}
          initialGroup={labGroup}
          initialDomain={labDomain}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
        />
      )}
      {tab === "totals" && (
        <TotalsApp
          bets={bets}
          routes={routes}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onJumpGroup={(g) => go("lab", undefined, g)}
        />
      )}
      {tab === "heatmap" && (
        <HeatmapApp
          bets={bets}
          routes={routes}
          period={period}
          range={range}
          onPeriod={setPeriod}
          onRange={setRange}
          onBack={() => go("home")}
          onJump={(sel, domain) => go("lab", sel, undefined, domain)}
        />
      )}
    </PerfPage>
  );
}
