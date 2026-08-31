// The Performance area exists at two addresses and the pages are the
// same code at both.
//
//   /preview/performance-*  public, demo bets, by his ruling of 28
//                           August 2026: "open the preview without
//                           login, nothing needs to be locked."
//   /stats/*                behind login, the signed in user's own
//                           bets. The address was kept from the old
//                           name on purpose.
//
// A page therefore cannot hardcode where its own links point. It takes
// a route set. Previews get PREVIEW_ROUTES, the live pages get
// LIVE_ROUTES, and neither page knows which it is.

export interface PerfRoutes {
  home: string;
  lab: string;
  totals: string;
  compare: string;
  bets: string;
  heatmap: string;
}

export const PREVIEW_ROUTES: PerfRoutes = {
  home: "/preview/performance-home",
  lab: "/preview/performance-lab",
  totals: "/preview/performance-totals",
  compare: "/preview/performance-compare",
  bets: "/preview/performance-bets",
  heatmap: "/preview/performance-heatmap",
};

export const LIVE_ROUTES: PerfRoutes = {
  home: "/stats",
  lab: "/stats/lab",
  totals: "/stats/totals",
  compare: "/stats/compare",
  bets: "/stats/bets",
  heatmap: "/stats/heatmap",
};
