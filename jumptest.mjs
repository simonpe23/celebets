// Does the chart change height when the browser toolbars collapse?
//
// Chrome on a phone hides its URL bar and toolbar as you scroll, which
// makes the viewport taller. A height written in dvh grows with it and
// the whole page shifts under your finger. This measures the chart
// before and after that happens.
import { chromium } from "playwright";

const port = process.argv[2] ?? "3000";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const SHORT = 664;   // Chrome with its toolbars showing
const TALL = 745;    // the same phone once they collapse

const page = await browser.newPage({
  viewport: { width: 393, height: SHORT }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
});
await page.goto(`http://localhost:${port}/preview/performance`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const chartH = () =>
  page.evaluate(() => {
    const el = document.querySelector("[data-chart-panel] .relative");
    return el ? Math.round(el.getBoundingClientRect().height) : null;
  });

const before = await chartH();
// The toolbars collapsing IS the viewport growing.
await page.setViewportSize({ width: 393, height: TALL });
await page.waitForTimeout(600);
const after = await chartH();

await browser.close();
console.log(`chart height with toolbars showing: ${before}px`);
console.log(`chart height with toolbars hidden:  ${after}px`);
if (before === after) {
  console.log(`PASS: height is fixed, the page cannot jump.`);
} else {
  console.log(`FAIL: grew by ${after - before}px, the page will jump.`);
  process.exit(1);
}
