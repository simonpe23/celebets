import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
await p.waitForTimeout(1400);

const plot = p.locator('svg[aria-label="Your running profit over the chosen period"]');
const box = await plot.boundingBox();
console.log("plot box", box);

// Press near the middle of the chart and drag left, like a thumb would.
await p.mouse.move(box.x + box.width * 0.62, box.y + box.height / 2);
await p.mouse.down();
await p.waitForTimeout(200);
await p.screenshot({ path: `${OUT}/scrub-mid.png`, clip: { x: 0, y: 55, width: 390, height: 560 } });

await p.mouse.move(box.x + box.width * 0.28, box.y + box.height / 2, { steps: 12 });
await p.waitForTimeout(200);
await p.screenshot({ path: `${OUT}/scrub-left.png`, clip: { x: 0, y: 55, width: 390, height: 560 } });

await p.mouse.up();
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/scrub-released.png`, clip: { x: 0, y: 55, width: 390, height: 560 } });

await b.close();
console.log("done");
