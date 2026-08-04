import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
await p.waitForTimeout(1000);
await p.getByLabel("Custom date range").click();
await p.waitForTimeout(300);

const d = new Date();
const iso = (n) => { const x = new Date(); x.setDate(d.getDate() - n); return x.toISOString().slice(0,10); };
await p.locator("#from").fill(iso(5));
await p.locator("#to").fill(iso(0));
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/custom-range.png`, clip: { x: 0, y: 130, width: 390, height: 480 } });
await b.close();
console.log("done");
