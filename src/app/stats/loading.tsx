// NO SKELETON BETWEEN PERFORMANCE TABS.
//
// This used to render the OLD design's page skeleton: the word
// Performance, three grey cards and the three tab bottom bar. Home,
// Lab and Totals were three routes then, so every tab switch flashed
// a page from a different design. His words, 31 August 2026: "it's
// loading this page in between, not at all a smooth experience."
//
// The three tabs are one page now and switching between them fetches
// nothing, so this only ever shows on a cold arrival at Performance.
// A blank frame in the page's own colours is quieter than a skeleton
// of a layout that is about to be replaced.

import { PAGE_BG } from "@/components/performance/ui";

export default function Loading() {
  return <div className="min-h-svh" style={{ background: PAGE_BG }} />;
}
