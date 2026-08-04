import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
await p.waitForTimeout(1400);

const plot = p.locator('svg[aria-label="Your running profit over the chosen period"]');
const box = await plot.boundingBox();
const scrollBefore = await p.evaluate(() => window.scrollY);

// A sloppy thumb: mostly sideways but drifting 40 pixels downward.
const startX = box.x + box.width * 0.75;
const y0 = box.y + box.height * 0.35;
await p.touchscreen.tap(1, 1);
const client = await p.context().newCDPSession(p);
await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: startX, y: y0 }] });
for (let i = 1; i <= 10; i++) {
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: startX - i * 22, y: y0 + i * 4 }],
  });
  await p.waitForTimeout(25);
}
await p.waitForTimeout(150);
const headline = await p.locator("main p").nth(1).innerText();
const label = await p.locator("main p").first().innerText();
const scrollDuring = await p.evaluate(() => window.scrollY);
await p.screenshot({ path: `${OUT}/touch-drag.png`, clip: { x: 0, y: 55, width: 390, height: 620 } });
await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

console.log("label while dragging:", JSON.stringify(label));
console.log("number while dragging:", JSON.stringify(headline));
console.log("page scrolled?", scrollBefore, "->", scrollDuring);
await b.close();
