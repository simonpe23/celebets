import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const scheme of ["light", "dark"]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: scheme });
  await p.goto("http://localhost:3000/preview", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/slip-${scheme}.png`, clip: { x: 0, y: 255, width: 390, height: 300 } });
  await p.close();
}
await b.close();
console.log("done");
