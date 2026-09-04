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

// THE SINCE RESTART BUTTON, his order of 4 September 2026. It sits
// beside the pill and answers a different question: the button picks
// WHICH RECORD, the pill picks WHICH WINDOW inside it.
//
// `restarttest.mjs` pins the counting rule, which no screenshot can
// see: a bet still running crosses the line where every ordinary
// period would drop it. This proves what a person can see and reach.
const BTN = 'button[aria-label="Count from your restart"]';

// 1. NOBODY WHO HAS NOT RESTARTED SEES THE BUTTON. It would name a
//    line that does not exist and behave exactly like All time.
await page.goto(`http://localhost:${port}/preview/firstbets/ten`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(600);
say((await page.$$(BTN)).length === 0, "a record with no restart has no button");
say((await pillText()) === "All time", "and opens on All time");
const offeredPlain = await page.evaluate(() =>
  document.body.innerText.includes("Since restart")
);
say(!offeredPlain, "and never reads the words Since restart");

// 2. A RESTARTED RECORD OPENS ON ITS OWN RECORD, with the button on.
//    COUNTED BACK FROM TODAY, never a fixed date: the firstbets
//    records are themselves counted back from today, so a hardcoded
//    line would drift out of the record and this test would start
//    passing on a coincidence. Ten days splits the ten-bet record,
//    which spans twenty.
const line = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
await page.goto(
  `http://localhost:${port}/preview/firstbets/ten?since=${line}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(600);
say((await page.$$(BTN)).length === 1, "a restarted record shows the button");
say(
  (await page.getAttribute(BTN, "aria-pressed")) === "true",
  "it is on when the page opens"
);

// 3. THE TWO CONTROLS SAY DIFFERENT THINGS, which is the whole reason
//    the button is not one of the periods. They printed the same words
//    twice when it was.
say(
  (await pillText()) === "All time",
  `the pill beside it reads its own answer: "${await pillText()}"`
);
const restrictedProfit = await netProfit();

// 4. ONE TAP RETURNS THE WHOLE RECORD, and it says something
//    different, or the button would be decoration.
await page.click(BTN);
await page.waitForTimeout(500);
say(
  (await page.getAttribute(BTN, "aria-pressed")) === "false",
  "one tap turns it off"
);
const wholeProfit = await netProfit();
say(
  restrictedProfit !== wholeProfit,
  `and counts differently: since restart ${restrictedProfit}, whole record ${wholeProfit}`
);

// 5. THE TWO COMPOSE. Turning the button back on and narrowing the
//    window is one sentence, not a contradiction.
await page.click(BTN);
await page.waitForTimeout(400);
await page.click('button[aria-label="Change the period"]');
await page.waitForTimeout(250);
await page.click('button:has-text("This year")');
await page.waitForTimeout(500);
say(
  (await page.getAttribute(BTN, "aria-pressed")) === "true" &&
    (await pillText()) === "This year",
  "the button stays on while the window changes"
);

await browser.close();
console.log(fails ? `${fails} problem(s)` : "The period filter works.");
process.exit(fails ? 1 : 0);
