// Proves the Performance period filter, on the preview pages.
//
// It exists because a filter that looks right and filters nothing is
// exactly the bug this page already had: the corner used to read
// "This month" above an all time number, with no control behind it. A
// screenshot cannot tell the difference between a working control and
// a picture of one.
//
// Usage: node periodtest.mjs <port>
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const port = process.argv[2];
if (!port) {
  console.error("usage: node periodtest.mjs <port of a running dev server>");
  process.exit(2);
}
const browser = await chromium.launch(launchOpts());
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let fails = 0;
const say = (ok, msg) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${msg}`);
  if (!ok) fails++;
};

const netProfit = () =>
  page.evaluate(() => (document.body.innerText.match(/[+-]\$[\d,]+/) || [""])[0]);
const pillText = async () =>
  (await page.textContent('button[aria-label="Change the period"]')).trim();

await page.goto(`http://localhost:${port}/preview/performance-home`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(600);

const all = await netProfit();
say(all !== "", `Home opens on All time showing ${all}`);

const seen = new Set([all]);
for (const label of ["This year", "This month", "This week", "Today"]) {
  await page.click('button[aria-label="Change the period"]');
  await page.waitForTimeout(250);
  await page.click(`button:has-text("${label}")`);
  await page.waitForTimeout(450);
  const value = await netProfit();
  seen.add(value);
  say((await pillText()).includes(label), `${label} selects, showing ${value}`);
}
// A control that never changes the answer is not filtering anything.
say(seen.size > 1, "the periods actually change the numbers");

await page.click('button[aria-label="Change the period"]');
await page.waitForTimeout(250);
await page.click('button:has-text("Custom")');
await page.waitForTimeout(300);
const inputs = await page.$$('input[type="date"]');
say(inputs.length === 2, "Custom offers a from and a to date");
if (inputs.length === 2) {
  await inputs[0].fill("2026-08-01");
  await page.waitForTimeout(450);
  say(
    (await pillText()).includes("Aug"),
    `a custom range names itself: "${await pillText()}"`
  );
  await page.click('button:has-text("Done")');
  await page.waitForTimeout(300);
}

// One window for the whole area: Home, Lab and Totals share it.
await page.click('a:has-text("Lab")');
await page.waitForTimeout(700);
say((await pillText()).includes("Aug"), "the period travels to Lab");
await page.click('a:has-text("Totals")');
await page.waitForTimeout(700);
say((await pillText()).includes("Aug"), "and to Totals");

// SINCE RESTART, his ruling of 4 September 2026. It is one more entry
// in this same pill rather than a second control, so it is tested
// here. `restarttest.mjs` pins the counting rule; this proves what a
// person can see and reach.
//
// The counting rule matters more than it looks: every other period
// here drops a bet that is still running, and this one carries it
// over, because money still riding belongs to the new record.

// 1. NOBODY WHO HAS NOT RESTARTED IS OFFERED IT. It would name a line
//    that does not exist and read exactly like All time.
await page.goto(`http://localhost:${port}/preview/firstbets/ten`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(600);
say((await pillText()) === "All time", "a record with no restart opens on All time");
await page.click('button[aria-label="Change the period"]');
await page.waitForTimeout(250);
const offeredPlain = await page.evaluate(() =>
  document.body.innerText.includes("Since restart")
);
say(!offeredPlain, "and is never offered Since restart");
await page.keyboard.press("Escape").catch(() => {});

// 2. A RESTARTED RECORD OPENS ON ITS OWN RECORD, which is what a
//    restart asked for and what Track has always shown.
// COUNTED BACK FROM TODAY, never a fixed date. The firstbets records
// are themselves counted back from today, so a hardcoded line would
// drift out of the record and this test would start passing on a
// coincidence. Ten days splits the ten-bet record, which spans twenty.
const line = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
await page.goto(
  `http://localhost:${port}/preview/firstbets/ten?since=${line}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(600);
say((await pillText()) === "Since restart", "a restarted record opens on Since restart");
const sinceProfit = await netProfit();

// 3. THE WHOLE HISTORY IS STILL ONE TAP AWAY, and it says something
//    different, or the entry would be decoration.
await page.click('button[aria-label="Change the period"]');
await page.waitForTimeout(250);
await page.click('button:has-text("All time")');
await page.waitForTimeout(500);
const allTimeProfit = await netProfit();
say((await pillText()) === "All time", "All time is one tap away");
say(
  sinceProfit !== allTimeProfit,
  `and counts differently: since restart ${sinceProfit}, all time ${allTimeProfit}`
);

await browser.close();
console.log(fails ? `${fails} problem(s)` : "The period filter works.");
process.exit(fails ? 1 : 0);
