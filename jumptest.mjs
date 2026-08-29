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

await browser.close();
console.log(fails ? `${fails} jump(s) broken` : "All doors work.");
process.exit(fails ? 1 : 0);
