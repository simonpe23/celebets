// Proves the Heat Map is INSIDE the Performance area, not a page.
//
// His words, 31 August 2026, on the live site: "heat map is loading
// slowly." The code was never slow: the server drew it in 0.11s. It
// was a separate page, so every tap on Home's Heat Map pill left the
// area, asked the database for his bets a second time and drew a
// loading screen on the way.
//
// A screenshot cannot see that. The map looks identical either way,
// which is exactly why this file exists: it counts the SERVER PAGE
// REQUESTS a tap causes. The answer has to be zero.
//
// Usage: node heattest.mjs <port>
import { chromium } from "playwright";

const port = process.argv[2];
if (!port) {
  console.error("usage: node heattest.mjs <port of a running dev server>");
  process.exit(2);
}
const exe = process.env.PLAYWRIGHT_CHROMIUM || undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let fails = 0;

const check = (name, ok, note = "") => {
  if (!ok) fails += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${note ? `  ${note}` : ""}`);
};

const HOME = `http://localhost:${port}/preview/performance-home`;

// Every page the browser asks the server for, from here on.
let docs = [];
page.on("request", (r) => {
  if (r.resourceType() === "document") docs.push(r.url());
});

await page.goto(HOME, { waitUntil: "networkidle" });

// 1. The pill opens the map with no page load.
docs = [];
await page.click('a[href*="performance-heatmap"]');
await page.waitForTimeout(600);
let body = await page.textContent("body");
check("the Heat Map pill opens the map", body.includes("Heat Map"));
check(
  "opening the Heat Map asks the server for no page",
  docs.length === 0,
  docs.length ? `asked for ${docs.length}` : ""
);
check(
  "the address becomes the Heat Map's own",
  page.url().includes("performance-heatmap")
);
// The map is not one of the three, so the Home / Lab / Totals menu is
// not drawn over it. Counting the menu's own Totals link is the proof:
// the word Totals could appear anywhere, a link to it could not.
const menuLinks = await page.$$('a[href*="performance-totals"]');
check("the map draws no Home / Lab / Totals menu", menuLinks.length === 0);

// 2. A tile opens Lab, scoped, with no page load.
const tile = await page.$('a[href*="performance-lab?sel="]');
check("the map's tiles are doors into Lab", tile !== null);
if (tile) {
  docs = [];
  await tile.click();
  await page.waitForTimeout(800);
  body = await page.textContent("body");
  check(
    "a tile opens Lab with no page load",
    docs.length === 0,
    docs.length ? `asked for ${docs.length}` : ""
  );
  check(
    "Lab arrives scoped to the tile, not showing the whole record",
    !body.includes("Showing your whole record")
  );
  await page.goBack();
  await page.waitForTimeout(600);
}

// 3. Back to Home with no page load.
await page.goto(HOME, { waitUntil: "networkidle" });
await page.click('a[href*="performance-heatmap"]');
await page.waitForTimeout(600);
docs = [];
await page.click('a[aria-label="Back to Home"]');
await page.waitForTimeout(600);
body = await page.textContent("body");
check(
  "the back arrow returns to Home with no page load",
  docs.length === 0,
  docs.length ? `asked for ${docs.length}` : ""
);
check("Home is back", body.includes("What drives your result"));

// 4. The window travels. Pick This week on Home, open the map, and the
//    map has to be looking at the same window rather than All time.
await page.goto(HOME, { waitUntil: "networkidle" });
await page.click('button[aria-label="Change the period"]');
await page.waitForTimeout(200);
await page.click('button:has-text("This week")');
await page.waitForTimeout(400);
await page.click('a[href*="performance-heatmap"]');
await page.waitForTimeout(600);
const pill = await page.textContent('button[aria-label="Change the period"]');
check(
  "the period chosen on Home travels into the Heat Map",
  (pill || "").includes("This week"),
  `pill reads "${(pill || "").trim()}"`
);

// 5. The address still works on its own, for a shared link.
docs = [];
await page.goto(`http://localhost:${port}/preview/performance-heatmap`, {
  waitUntil: "networkidle",
});
body = await page.textContent("body");
check("the Heat Map address still opens the map", body.includes("Heat Map"));

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
