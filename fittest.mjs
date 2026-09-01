// DOES THE TEXT STILL FIT ITS BOX? Old code against new.
//
// Added 31 August 2026, phase 3 of the size and layout job, after the
// app's one edge rule narrowed Performance's phone column by 32px and
// three strings quietly stopped fitting: "American Football" on
// Totals, "Build your performance view" on Home, and "Moneyline" on
// Home at 320.
//
// A ONE PIXEL OVERFLOW IS NOT A ONE PIXEL DEFECT. `truncate` reserves
// room for the ellipsis, so a string that is 1px too long loses about
// five characters: "American Football" became "American Footb...".
// That is why this is worth a script.
//
// It also cannot be done with a screenshot. Clipped text keeps its
// full textContent, so nothing in the DOM says it was cut, and a
// person comparing two screenshots is comparing the very thing they
// are least likely to notice.
//
// Same shape as shotdiff.mjs: run one dev server on a worktree of the
// old code and one on the new, and diff.
//
//   git worktree add /tmp/base HEAD
//   (cd /tmp/base && cp ../../.env.local . && npx next dev -p 3321)
//   npx next dev -p 3320
//   node fittest.mjs 3321 3320
//
// It reports only what CHANGED, because the app has a standing set of
// deliberately truncated strings (long category names in dense rows)
// and failing on those would be wrong.

import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const OLD = process.argv[2];
const NEW = process.argv[3];
if (!OLD || !NEW) {
  console.error("usage: node fittest.mjs <port of old code> <port of new code>");
  process.exit(2);
}

const PATHS = [
  ["/preview", "Track"],
  ["/preview/research", "Research"],
  ["/preview/settings", "Settings"],
  ["/preview/performance-home", "Home"],
  ["/preview/performance-lab", "Lab"],
  ["/preview/performance-totals", "Totals"],
  ["/preview/performance-compare", "Compare"],
  ["/preview/performance-heatmap", "HeatMap"],
  ["/preview/performance-bets", "AllBets"],
];

// 320 is the floor sitecheck holds the app to, 390 and 430 are the
// phones he actually uses, 1512 is his laptop.
const WIDTHS = [320, 390, 430, 1512];

const browser = await chromium.launch(launchOpts());

const scan = async (port) => {
  const found = new Set();
  for (const [path, name] of PATHS) {
    for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      const r = await page.goto(`http://localhost:${port}${path}`, {
        waitUntil: "networkidle",
      });
      if (r.status() !== 200) {
        console.error(`${path} on ${port} returned ${r.status()}`);
        process.exit(1);
      }
      const cut = await page.evaluate(() => {
        const out = [];
        for (const e of document.querySelectorAll(
          "span,p,div,a,h1,h2,h3,button,li,td,th"
        )) {
          // Only leaves, so a string is measured once and not again
          // through each of its ancestors.
          if (e.children.length) continue;
          const t = (e.textContent || "").trim();
          if (!t || t.length > 60) continue;
          const s = getComputedStyle(e);
          if (s.display === "none" || s.visibility === "hidden") continue;
          // Text allowed to wrap is never clipped, it just gets taller.
          if (s.whiteSpace === "normal" || s.whiteSpace === "pre-wrap") continue;
          const box = e.getBoundingClientRect();
          if (box.width < 4) continue;
          // The text's OWN width, measured with a Range. Reading the
          // CSS instead misses an ellipsis set on a parent, which is
          // how "American Football" got through the first check.
          const rg = document.createRange();
          rg.selectNodeContents(e);
          if (rg.getBoundingClientRect().width > box.width + 1)
            out.push(t.slice(0, 40));
        }
        return out;
      });
      for (const t of cut) found.add(`${name} @${w}px: "${t}"`);
      await page.close();
    }
  }
  return found;
};

const before = await scan(OLD);
const after = await scan(NEW);
await browser.close();

const broke = [...after].filter((k) => !before.has(k)).sort();
const fixed = [...before].filter((k) => !after.has(k)).sort();

console.log(
  `${before.size} strings were clipped before, ${after.size} after.\n`
);
if (fixed.length) {
  console.log(`FITS NOW (${fixed.length}):`);
  for (const k of fixed) console.log("  " + k);
  console.log("");
}
if (broke.length) {
  console.log(`NO LONGER FITS (${broke.length}):`);
  for (const k of broke) console.log("  " + k);
  console.log("\nFAILED: the change cut text that used to fit.");
  process.exit(1);
}
console.log("Nothing that used to fit is cut. Passed.");
