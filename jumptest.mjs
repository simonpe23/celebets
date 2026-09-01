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
const P_LAB = `http://localhost:${port}/preview/performance-lab`;

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
// record, so its big number has to be the number Home was showing.
//
// It used to compare the "NN-NN Record" line under Home's number.
// That line was REMOVED on 31 August 2026, his words: "Remove Roi and
// record inside the charts on home, lab." The hero figure is the
// better check anyway: it is the one number both pages promise is the
// same, and it is the one money rule in the app.
// The hero is the BIGGEST piece of text on the page, not a hardcoded
// size. It was written as 45px and went stale the moment phase 2 of
// the size and layout job put the app on one scale and the hero
// became 34. A test that names a pixel breaks every time a design
// decision lands, which teaches people to ignore it.
const hero = () =>
  page.evaluate(() => {
    const all = [...document.querySelectorAll("p")].filter((e) =>
      (e.textContent || "").trim().startsWith("$") ||
      /^[+-]\$/.test((e.textContent || "").trim())
    );
    if (all.length === 0) return "";
    const biggest = all.sort(
      (a, b) =>
        parseFloat(getComputedStyle(b).fontSize) -
        parseFloat(getComputedStyle(a).fontSize)
    )[0];
    return (biggest.textContent || "").trim();
  });

await page.goto(HOME, { waitUntil: "networkidle" });
const homeNet = await hero();
await page.click('a:has-text("Explore Lab")');
await page.waitForURL("**/preview/performance-lab**");
await page.waitForTimeout(700);
const body = await page.textContent("body");
const labNet = await hero();
const okEmpty =
  !page.url().includes("sel=") &&
  homeNet !== "" &&
  labNet === homeNet &&
  // and it really is the unscoped Lab, not merely a page without a
  // selection in its address
  body.includes("Showing your whole record");
console.log(
  `${okEmpty ? "PASS" : "FAIL"} Explore Lab lands on the empty Lab ` +
    `(Home ${homeNet || "?"}, Lab ${labNet || "?"})`
);
if (!okEmpty) fails++;

// HOME'S KPI ROW IS LAB'S. His instruction, 31 August 2026: "i want
// to change the kpi row on home and mirror labs." Two rows that are
// meant to be the same row drift the moment one is edited alone, and
// a screenshot of one page cannot see the other, so read both and
// compare them cell by cell.
const kpiRow = () =>
  page.evaluate(() => {
    const label = [...document.querySelectorAll("p")].find(
      (e) => (e.textContent || "").trim() === "Bets"
    );
    const row = label?.closest("div")?.parentElement?.parentElement;
    if (!row) return null;
    return [...row.querySelectorAll(":scope > div")].map((d) => {
      const ps = d.querySelectorAll("p");
      const b = d.getBoundingClientRect();
      return `${ps[1]?.textContent}=${ps[0]?.textContent}@${Math.round(b.left)}`;
    });
  });

// Lab is already open and unscoped from the check above, so both
// pages are describing the same whole record.
const labKpis = await kpiRow();
await page.goto(HOME, { waitUntil: "networkidle" });
const homeKpis = await kpiRow();
const okKpi =
  homeKpis !== null &&
  labKpis !== null &&
  homeKpis.length === 4 &&
  homeKpis.join(" | ") === labKpis.join(" | ");
console.log(
  `${okKpi ? "PASS" : "FAIL"} Home's KPI row mirrors Lab's ` +
    `(${(homeKpis || []).join(", ") || "nothing"})`
);
if (!okKpi) {
  fails++;
  console.log(`     Lab reads: ${(labKpis || []).join(", ") || "nothing"}`);
}

// The top menus link both ways.
await page.goto(P_LAB, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.click('a:has-text("Home")');
await page.waitForURL("**/preview/performance-home**");
console.log("PASS Lab menu returns to Home");

await browser.close();
console.log(fails ? `${fails} check(s) broken` : `All ${rows.length + 1} doors work, and the two KPI rows agree.`);
process.exit(fails ? 1 : 0);
