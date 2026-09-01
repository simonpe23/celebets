// Screenshots the landing page at phone and desktop sizes so the
// design can be reviewed without guessing.
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const URL = process.env.SHOT_URL ?? "http://localhost:3000/";

const browser = await chromium.launch(launchOpts());

const sizes = [
  { name: "phone", width: 390, height: 844, scale: 2 },
  { name: "desktop", width: 1440, height: 900, scale: 1 },
];

for (const { name, width, height, scale } of sizes) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: scale,
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  // The stats row fills in after mount, so give hydration a moment.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  await page.close();
}

await browser.close();
console.log("done");
