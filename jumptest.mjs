// Proves the doors between the Home and Lab previews. A jump is not a
// link that exists but a selection that ARRIVES: after each tap the
// Lab answer panel must show the record of the fact that was tapped.
//
// The rows are READ OFF Home rather than listed here. They are
// computed from bets now, so a hardcoded list would go stale the
// moment the data changes, and a stale test is worse than none.
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

const HOME = `http://localhost:${port}/preview/performance-home`;

// What Home currently ranks: the name and record of every row, plus
// the Lab address each one points at.
await page.goto(HOME, { waitUntil: "networkidle" });
const rows = await page.evaluate(() =>
  [...document.querySelectorAll('a[href*="performance-lab?sel="]')].map((a) => {
    // The record sits in its own text node ahead of the hit rate, so
    // read the node rather than the paragraph: "30–16" and "65% hit
    // rate" run together with no space in textContent.
    const meta = a.querySelectorAll("p")[1];
    const record = (meta?.childNodes[0]?.textContent || "").trim();
    const name = (a.querySelectorAll("p")[0]?.textContent || "").trim();
    return { href: a.getAttribute("href"), record, name };
  })
);

if (rows.length === 0) {
  console.log("FAIL Home shows no ranked rows at all");
  await browser.close();
  process.exit(1);
}

for (const row of rows) {
  await page.goto(HOME, { waitUntil: "networkidle" });
  await page.click(`a[href="${row.href}"]`);
  await page.waitForURL("**/preview/performance-lab**");
  await page.waitForTimeout(700);
  const body = await page.textContent("body");
  // The record alone is NOT proof: every chip in Lab prints its own
  // record, so "30-16" is on screen whether or not the jump landed.
  // The proof is that Lab is scoped: the empty Lab says it is showing
  // the whole record, and a scoped one names the fact in its tray.
  const scoped = !body.includes("Showing your whole record");
  const named = body.includes(row.name);
  const ok = scoped && named && row.record !== "" && body.includes(row.record);
  const label = decodeURIComponent(row.href.split("sel=")[1] || "");
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label.padEnd(34)} arrives scoped to ${row.name}` +
      (ok ? "" : `  [scoped=${scoped} named=${named}]`)
  );
  if (!ok) fails++;
}

// The door lands on an EMPTY Lab, the ruling: "i want a view inside
// the lab that is clean from selections." Empty shows the whole
// record, which is the record Home puts under its big number.
await page.goto(HOME, { waitUntil: "networkidle" });
const wholeRecord = await page.evaluate(() => {
  const m = (document.body.textContent || "").match(/(\d+–\d+) Record/);
  return m ? m[1] : "";
});
await page.click('a:has-text("Explore Lab")');
await page.waitForURL("**/preview/performance-lab**");
await page.waitForTimeout(700);
const body = await page.textContent("body");
const okEmpty =
  !page.url().includes("sel=") &&
  wholeRecord !== "" &&
  body.includes(wholeRecord) &&
  // and it really is the unscoped Lab, not merely a page without a
  // selection in its address
  body.includes("Showing your whole record");
console.log(
  `${okEmpty ? "PASS" : "FAIL"} Explore Lab lands on the empty Lab (${wholeRecord})`
);
if (!okEmpty) fails++;

// The top menus link both ways.
await page.click('a:has-text("Home")');
await page.waitForURL("**/preview/performance-home**");
console.log("PASS Lab menu returns to Home");

await browser.close();
console.log(fails ? `${fails} jump(s) broken` : `All ${rows.length + 1} doors work.`);
process.exit(fails ? 1 : 0);
