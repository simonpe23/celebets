import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto("http://localhost:3000/preview/fonts", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const spans = [...document.querySelectorAll("span.tabular-nums")];
  return spans.map((el) => getComputedStyle(el).fontFamily);
});
console.log("found", out.length);
out.forEach((f, i) => console.log(i + 1, f.slice(0, 80)));
await b.close();
