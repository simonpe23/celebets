import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const B = "http://localhost:3461";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const scheme of ["light","dark"]) {
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: scheme });
  const errs = []; page.on("pageerror", e => errs.push(e.message));
  await page.goto(B + "/preview", { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.locator("section").first().screenshot({ path: `${OUT}/N-card-${scheme}.png` });
  await page.screenshot({ path: `${OUT}/N-track-${scheme}.png` });
  await page.goto(B + "/preview/tabbar", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/N-tabbar-${scheme}.png`, fullPage: true });
  if (errs.length) console.log(scheme, errs.slice(0,2));
  await page.close();
}
await b.close(); console.log("done");
