import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
await p.waitForTimeout(1400);
const client = await p.context().newCDPSession(p);

// Swipe up starting BELOW the chart, over the sport chips.
const before = await p.evaluate(() => window.scrollY);
await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 700 }] });
for (let i = 1; i <= 8; i++) {
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: 700 - i * 40 }] });
  await p.waitForTimeout(20);
}
await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await p.waitForTimeout(600);
const after = await p.evaluate(() => window.scrollY);
console.log("swipe outside chart:", before, "->", after, after > before ? "SCROLLS (good)" : "STUCK (bad)");

// Check nothing is selectable inside the chart.
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(400);
const selectable = await p.evaluate(() => {
  const el = document.querySelector('svg[aria-label="Your running profit over the chosen period"]').parentElement;
  return getComputedStyle(el).userSelect + " / touch-action: " + getComputedStyle(el).touchAction;
});
console.log("chart styles:", selectable);
await p.screenshot({ path: `${OUT}/chart-taller.png`, clip: { x: 0, y: 55, width: 390, height: 660 } });
await b.close();
