// PROVES NOTHING UNDER PERFORMANCE LOADS A PAGE.
//
// His words, 31 August 2026, on the live site: "heat map is loading
// slowly." Then, when the Heat Map was fixed: "Fix compare and all
// bets pages the same way as well. fix all of them, if there's anyone
// i've missed."
//
// The code was never slow. The server drew every one of these in a
// fraction of a second. They were separate PAGES, so every door
// between them left the Performance area, asked the database for his
// bets again and drew a loading screen on the way.
//
// A screenshot cannot see that. Home looks identical whether the tap
// took 40ms or two seconds, which is exactly why this file exists: it
// counts the SERVER PAGE REQUESTS each door causes. Every answer has
// to be zero.
//
// Usage: node instanttest.mjs <port>
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const port = process.argv[2];
if (!port) {
  console.error("usage: node instanttest.mjs <port of a running dev server>");
  process.exit(2);
}
const browser = await chromium.launch(launchOpts());
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let fails = 0;

const check = (name, ok, note = "") => {
  if (!ok) fails += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${note ? `  ${note}` : ""}`);
};

const P = (path) => `http://localhost:${port}/preview/${path}`;
const HOME = P("performance-home");
const TOTALS = P("performance-totals");
const TWO = encodeURIComponent("sport~plain~Football|sport~plain~Basketball");
const LAB_TWO = P(`performance-lab?sel=${TWO}`);

// Every page the browser asks the server for, from here on.
let docs = [];
page.on("request", (r) => {
  if (r.resourceType() === "document") docs.push(r.url());
});

// Tap something and report how many pages the server was asked for.
async function tap(selector) {
  docs = [];
  await page.click(selector);
  await page.waitForTimeout(700);
  return { loads: docs.length, body: await page.textContent("body") };
}
const instant = (name, r) =>
  check(name, r.loads === 0, r.loads ? `asked the server for ${r.loads}` : "");

// ---------------------------------------------------------------- //
// 1. The three menu tabs.
await page.goto(HOME, { waitUntil: "networkidle" });
let r = await tap('a:has-text("Lab")');
instant("Home to Lab, the menu tab", r);
r = await tap('a:has-text("Totals")');
instant("Lab to Totals, the menu tab", r);
r = await tap('a:has-text("Home")');
instant("Totals to Home, the menu tab", r);

// ---------------------------------------------------------------- //
// 2. Home's ranked rows into Lab. jumptest.mjs proves the selection
//    arrives; this only asks what it cost.
await page.goto(HOME, { waitUntil: "networkidle" });
r = await tap('a[href*="performance-lab?sel="]');
instant("a ranked row on Home opens Lab", r);

// ---------------------------------------------------------------- //
// 3. Home's Heat Map pill, its tiles and its back arrow.
await page.goto(HOME, { waitUntil: "networkidle" });
r = await tap('a[href*="performance-heatmap"]');
instant("Home's Heat Map pill opens the map", r);
check("the map is on screen", r.body.includes("Heat Map"));
check(
  "the address becomes the Heat Map's own",
  page.url().includes("performance-heatmap")
);
// The map is not a menu tab, so no menu is drawn over it.
check(
  "the map draws no Home / Lab / Totals menu",
  (await page.$$('a[href*="performance-totals"]')).length === 0
);
r = await tap('a[href*="performance-lab?sel="]');
instant("a Heat Map tile opens Lab", r);
check(
  "Lab arrives scoped to the tile",
  !r.body.includes("Showing your whole record")
);

await page.goto(HOME, { waitUntil: "networkidle" });
await page.click('a[href*="performance-heatmap"]');
await page.waitForTimeout(600);
r = await tap('a[aria-label="Back to Home"]');
instant("the Heat Map's back arrow returns to Home", r);
check("Home is back", r.body.includes("What drives your result"));

// ---------------------------------------------------------------- //
// 4. Lab's two doors: All Bets, and Compare at exactly two chips.
await page.goto(LAB_TWO, { waitUntil: "networkidle" });
r = await tap('a[href*="performance-bets"]');
instant("Lab's See these bets door opens All Bets", r);
check("All Bets is on screen", r.body.includes("All bets"));
check(
  "All Bets arrives scoped, not showing the whole record",
  !r.body.includes("Your whole record")
);
r = await tap('a[aria-label="Back"]');
instant("All Bets returns to Lab", r);
check(
  "and Lab still has the two chips, so Compare is offered",
  (await page.$$('a[href*="performance-compare"]')).length === 1
);

await page.goto(LAB_TWO, { waitUntil: "networkidle" });
r = await tap('a[href*="performance-compare"]');
instant("Lab's Compare door opens Compare", r);
check("Compare is on screen", r.body.includes("Compare"));
check(
  "Compare shows the two chips it was sent, not its demo pair",
  r.body.includes("Football") && r.body.includes("Basketball")
);
r = await tap('a[aria-label="Back to Lab"]');
instant("Compare returns to Lab", r);
check(
  "and Lab still has both chips",
  (await page.$$('a[href*="performance-compare"]')).length === 1
);

// ---------------------------------------------------------------- //
// 5. Totals' own All Bets door, and its own way back.
await page.goto(TOTALS, { waitUntil: "networkidle" });
r = await tap('a[href*="performance-bets"]');
instant("Totals' See all bets door opens All Bets", r);
check(
  "it shows the whole record, because Totals sent no selection",
  r.body.includes("Your whole record")
);
r = await tap('a[aria-label="Back"]');
instant("All Bets returns to Totals, not to Lab", r);
check("Totals is back", page.url().includes("performance-totals"));

// ---------------------------------------------------------------- //
// 6. The window travels into every view.
await page.goto(HOME, { waitUntil: "networkidle" });
await page.click('button[aria-label="Change the period"]');
await page.waitForTimeout(200);
await page.click('button:has-text("This week")');
await page.waitForTimeout(400);
await page.click('a[href*="performance-heatmap"]');
await page.waitForTimeout(700);
const pill = await page.textContent('button[aria-label="Change the period"]');
check(
  "the period chosen on Home travels into the Heat Map",
  (pill || "").includes("This week"),
  `pill reads "${(pill || "").trim()}"`
);

// ---------------------------------------------------------------- //
// 7. Every address still opens on its own, for a shared link.
for (const [name, path, marker] of [
  ["Home", "performance-home", "What drives your result"],
  ["Lab", "performance-lab", "Net profit"],
  ["Totals", "performance-totals", "Net profit"],
  ["the Heat Map", "performance-heatmap", "Heat Map"],
  ["Compare", "performance-compare", "Compare"],
  ["All Bets", "performance-bets", "All bets"],
]) {
  await page.goto(P(path), { waitUntil: "networkidle" });
  const body = await page.textContent("body");
  check(`${name}'s own address still opens it`, body.includes(marker));
}

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
await browser.close();
process.exit(fails === 0 ? 0 : 1);
