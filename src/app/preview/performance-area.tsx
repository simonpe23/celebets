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

import { useCallback, useEffect, useState } from "react";
import PerfPage from "./performance-shell";
import PerfMenu, { type PerfTab } from "./performance-menu";
import HomeContent from "./performance-home/HomeContent";
import LabApp from "./performance-lab/LabApp";
import TotalsApp from "./performance-totals/TotalsApp";
import { TAIL_SHORT, TAIL_TALL } from "./performance-ui";
import { PREVIEW_ROUTES, type PerfRoutes } from "@/lib/performance-routes";
import type { BetWithLegs } from "@/lib/types";

export default function PerfArea({
  bets,
  initial,
  routes = PREVIEW_ROUTES,
  live = false,
}: {
  bets: BetWithLegs[];
  initial: PerfTab;
  routes?: PerfRoutes;
  live?: boolean;
}) {
  const [tab, setTab] = useState<PerfTab>(initial);
  // Lab is remounted whenever a jump hands it a new selection, because
  // it seeds its chips once and then owns them.
  const [labKey, setLabKey] = useState(0);
  // The selection travels as a prop, not in the address: switching
  // uses pushState, and useSearchParams does not see that.
  const [labSel, setLabSel] = useState<string | undefined>(undefined);

  const go = useCallback(
    (next: PerfTab, sel?: string) => {
      const url =
        next === "lab" && sel
          ? `${routes.lab}?sel=${encodeURIComponent(sel)}`
          : routes[next];
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", url);
      }
      if (next === "lab") {
        setLabSel(sel ?? "");
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
      const match = (["lab", "totals", "home"] as const).find((k) =>
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
    <PerfPage live={live} tail={tab === "totals" ? TAIL_SHORT : TAIL_TALL}>
      <PerfMenu active={tab} routes={routes} onSelect={go} />

      {tab === "home" && (
        <HomeContent
          bets={bets}
          routes={routes}
          onJump={(sel) => go("lab", sel)}
        />
      )}
      {tab === "lab" && (
        <LabApp
          key={labKey}
          bets={bets}
          routes={routes}
          initialSel={labSel}
        />
      )}
      {tab === "totals" && <TotalsApp bets={bets} routes={routes} />}
    </PerfPage>
  );
}
