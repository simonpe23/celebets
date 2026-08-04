import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.screenshot({ path: `${OUT}/${process.env.NAME}.png`, clip: { x: 0, y: 40, width: 390, height: 150 } });
await b.close();
console.log("done");
