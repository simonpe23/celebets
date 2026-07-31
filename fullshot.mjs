// Full length phone screenshot of a local page, for design review.
import { chromium } from "playwright";

const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const URL = process.env.SHOT_URL ?? "http://localhost:3000/";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/phone-full.png`, fullPage: true });
await browser.close();
console.log("done");
