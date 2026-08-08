// Does press and hold scrubbing still work on the Performance chart?
//
// Run against a dev server:  node scrubtest.mjs [port]
//
// This exists because the scrub broke silently. Fixing a hydration
// mismatch made the chart skip its first render, so the touch listeners
// attached to an element that did not exist yet and never attached
// again. Nothing failed: no error, no warning, no build failure. The
// owner found it on his phone, four days after he and I spent an
// evening getting the gesture right.
//
// A design check cannot catch a dead event listener. Only a finger can,
// so this script is the finger.

import { chromium } from "playwright";

const port = process.argv[2] ?? "3000";
const url = `http://localhost:${port}/preview/performance`;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  colorScheme: "dark",
  hasTouch: true,
  isMobile: true,
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);

// The headline above the chart, which is what a scrub changes.
const headline = () =>
  page
    .locator("main")
    .innerText()
    .then((t) => t.split("\n").slice(0, 4).join(" | "));

const panel = page.locator("section").filter({ hasText: "PROFIT" }).first();
const box = await panel.boundingBox();
if (!box) {
  console.log("FAIL: no chart panel on the page");
  process.exit(1);
}

// Playwright's touchscreen only taps, so the drag goes through CDP.
const client = await ctx.newCDPSession(page);
const y = box.y + box.height * 0.6;
const touch = (type, x) =>
  client.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y }],
  });

const before = await headline();

await touch("touchStart", box.x + box.width * 0.85);
await page.waitForTimeout(250);
const held = await headline();

for (const f of [0.7, 0.55, 0.4, 0.28]) {
  await touch("touchMove", box.x + box.width * f);
  await page.waitForTimeout(120);
}
const dragged = await headline();

await touch("touchEnd", 0);
await page.waitForTimeout(300);
const released = await headline();

await browser.close();

const problems = [];
if (held === before) problems.push("holding the chart changed nothing");
if (dragged === held) problems.push("dragging left changed nothing");
if (released !== before) problems.push("releasing did not restore the total");

if (problems.length === 0) {
  console.log("Scrub test passed.");
  console.log(`  rest    ${before}`);
  console.log(`  hold    ${held}`);
  console.log(`  drag    ${dragged}`);
} else {
  console.log("Scrub test FAILED:\n");
  for (const p of problems) console.log("  " + p);
  console.log(`\n  rest    ${before}`);
  console.log(`  hold    ${held}`);
  console.log(`  drag    ${dragged}`);
  console.log(`  release ${released}`);
  process.exit(1);
}
