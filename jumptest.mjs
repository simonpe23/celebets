// Proves the doors between the Home and Lab previews. A jump is not a
// link that exists but a selection that ARRIVES: after each tap the
// Lab answer panel must show the jumped fact's own record, and the
// Explore Lab door must land on an empty Lab showing the whole
// record. Screenshots cannot see a tap; this script is the tap.
//
// Usage: node jumptest.mjs <port>
import { chromium } from "playwright";

const port = process.argv[2];
if (!port) {
  console.error("usage: node jumptest.mjs <port of a running dev server>");
  process.exit(2);
}
const exe = process.env.PLAYWRIGHT_CHROMIUM || undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let fails = 0;

// Home's five rows and the records they carry. Lab's demo data is
// built to reproduce exactly these, so the assertion is honest.
const CASES = [
  ["Moneyline", "30–16"],
  ["Premier League", "14–8"],
  ["Low odds", "18–11"],
  ["Singles", "24–18"],
  ["Player Props", "7–11"],
];

for (const [name, record] of CASES) {
  await page.goto(`http://localhost:${port}/preview/performance-home`, {
    waitUntil: "networkidle",
  });
  await page.click(`a:has-text("${name}")`);
  await page.waitForURL("**/preview/performance-lab**");
  await page.waitForTimeout(700);
  const body = await page.textContent("body");
  const ok =
    body.includes(record) || body.includes(record.replace("–", "-"));
  console.log(`${ok ? "PASS" : "FAIL"} row ${name} arrives showing ${record}`);
  if (!ok) fails++;
}

// The door lands on an EMPTY Lab, the ruling: "i want a view inside
// the lab that is clean from selections." Empty shows the whole
// record.
await page.goto(`http://localhost:${port}/preview/performance-home`, {
  waitUntil: "networkidle",
});
await page.click('a:has-text("Explore Lab")');
await page.waitForURL("**/preview/performance-lab**");
await page.waitForTimeout(700);
const hasSel = page.url().includes("sel=");
const body = await page.textContent("body");
const okEmpty =
  !hasSel && (body.includes("49–38") || body.includes("49-38"));
console.log(`${okEmpty ? "PASS" : "FAIL"} Explore Lab lands on the empty Lab`);
if (!okEmpty) fails++;

// The top menus link both ways.
await page.click('a:has-text("Home")');
await page.waitForURL("**/preview/performance-home**");
console.log("PASS Lab menu returns to Home");

// TOTALS joined the menu on 29 August 2026, so all three tabs must
// reach each other. A menu that looks right and does nothing is
// exactly what a screenshot cannot catch.
for (const [from, label, to] of [
  ["performance-home", "Totals", "performance-totals"],
  ["performance-lab", "Totals", "performance-totals"],
  ["performance-totals", "Home", "performance-home"],
  ["performance-totals", "Lab", "performance-lab"],
]) {
  await page.goto(`http://localhost:${port}/preview/${from}`, {
    waitUntil: "networkidle",
  });
  await page.click(`a:has-text("${label}")`);
  let ok = true;
  try {
    await page.waitForURL(`**/preview/${to}**`, { timeout: 8000 });
  } catch {
    ok = false;
  }
  console.log(`${ok ? "PASS" : "FAIL"} ${from} menu reaches ${label}`);
  if (!ok) fails++;
}

// COMPARE, its own page since 29 August 2026. The door appears at
// exactly two selections, carries both to Compare, and the back
// arrow returns to Lab with both still selected. Three things a
// screenshot cannot show.
await page.goto(
  `http://localhost:${port}/preview/performance-lab?sel=${encodeURIComponent(
    "sport~plain~Football|sport~plain~Basketball"
  )}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(600);
const doorAtTwo = await page.locator('a:has-text("Compare")').count();
console.log(
  `${doorAtTwo === 1 ? "PASS" : "FAIL"} the Compare door is there at two selections`
);
if (doorAtTwo !== 1) fails++;

await page.click('a:has-text("Compare")');
await page.waitForURL("**/preview/performance-compare**");
await page.waitForTimeout(700);
const cmp = await page.innerText("body");
const carried =
  cmp.includes("Football") && cmp.includes("Basketball") && cmp.includes("24–16");
console.log(`${carried ? "PASS" : "FAIL"} Compare opens on the two chosen facts`);
if (!carried) fails++;

await page.click('a[aria-label="Back to Lab"]');
await page.waitForURL("**/preview/performance-lab**");
await page.waitForTimeout(600);
const backSel = page.url().includes("Football") && page.url().includes("Basketball");
console.log(`${backSel ? "PASS" : "FAIL"} back from Compare keeps both selections`);
if (!backSel) fails++;

// At three selections the door is gone, his standing rule.
await page.goto(
  `http://localhost:${port}/preview/performance-lab?sel=${encodeURIComponent(
    "sport~plain~Football|sport~plain~Basketball|risk~plain~Low odds"
  )}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(600);
const doorAtThree = await page.locator('a:has-text("Compare")').count();
console.log(
  `${doorAtThree === 0 ? "PASS" : "FAIL"} the Compare door is gone at three selections`
);
if (doorAtThree !== 0) fails++;

// THE HEAT MAP, its own page since 29 August 2026. Home's pill opens
// it, every tile carries its fact into Lab (his ruling of 26 August
// 2026), and the back arrow returns to Home.
await page.goto(`http://localhost:${port}/preview/performance-home`, {
  waitUntil: "networkidle",
});
await page.click('a:has-text("Heat Map")');
let heatOk = true;
try {
  await page.waitForURL("**/preview/performance-heatmap**", { timeout: 8000 });
} catch {
  heatOk = false;
}
console.log(`${heatOk ? "PASS" : "FAIL"} Home's Heat Map pill opens the map`);
if (!heatOk) fails++;

await page.waitForTimeout(700);
const heatText = await page.innerText("body");
// The map must name a leak. Ranking tiles purely by size once buried
// the biggest one inside a remainder tile.
const showsLeak = heatText.includes("Basketball") && heatText.includes("-$926");
console.log(`${showsLeak ? "PASS" : "FAIL"} the map shows the biggest leak by name`);
if (!showsLeak) fails++;

// The map splits by one group at a time, which is what makes the
// tiles add up. The control that changes the group is a dropdown: a
// screenshot cannot prove it opens, or that the map redraws.
await page.click('button[aria-label="Change what the map splits by"]');
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Category", exact: true }).click();
await page.waitForTimeout(500);
const byCat = await page.innerText("body");
const switched = byCat.includes("Moneyline") && byCat.includes("BY CATEGORY");
console.log(`${switched ? "PASS" : "FAIL"} the map redraws when the group changes`);
if (!switched) fails++;

// The tiles must PARTITION the record: every figure on the map,
// added up, is the record's own net profit. Eight overlapping tiles
// once summed to $11,637 on a $2,637 record under a caption saying
// size means impact.
const partition = await page.evaluate(() => {
  const head = [...document.querySelectorAll("p")].find((p) =>
    p.textContent.startsWith("Performance map")
  );
  const map = head.parentElement.nextElementSibling;
  let sum = 0;
  for (const cell of map.children) {
    const m = cell.innerText.match(/([-+])\$([\d,]+)/);
    if (m) sum += (m[1] === "-" ? -1 : 1) * Number(m[2].replace(/,/g, ""));
  }
  return sum;
});
// The figures are rounded to whole dollars on the tiles, so six or
// seven of them can drift a dollar from the record. Anything wider
// than that is overlap, not rounding.
const adds = Math.abs(partition - 2637) <= 2;
console.log(
  `${adds ? "PASS" : "FAIL"} the map adds up to the record (${partition})`
);
if (!adds) fails++;

// Back to Sport, then prove a tile carries its fact into Lab. The
// Biggest Leak card names Basketball too, so the tile is the last
// match, not the first.
await page.goto(`http://localhost:${port}/preview/performance-heatmap`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(400);
await page.locator('a[href*="sport~plain~Basketball"]').last().click();
let tileOk = true;
try {
  await page.waitForURL("**/preview/performance-lab**", { timeout: 8000 });
} catch {
  tileOk = false;
}
await page.waitForTimeout(700);
const labText = await page.innerText("body");
const carriedTile = tileOk && labText.includes("5–9");
console.log(`${carriedTile ? "PASS" : "FAIL"} a tile opens Lab on that fact`);
if (!carriedTile) fails++;

await page.goto(`http://localhost:${port}/preview/performance-heatmap`, {
  waitUntil: "networkidle",
});
await page.click('a[aria-label="Back to Home"]');
let backOk = true;
try {
  await page.waitForURL("**/preview/performance-home**", { timeout: 8000 });
} catch {
  backOk = false;
}
console.log(`${backOk ? "PASS" : "FAIL"} back from the map returns to Home`);
if (!backOk) fails++;

await browser.close();
console.log(fails ? `${fails} jump(s) broken` : "All doors work.");
process.exit(fails ? 1 : 0);
