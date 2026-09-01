import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const V = process.argv[2] ?? "a";
const browser = await chromium.launch(launchOpts());
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000/preview/connect", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
for (let i = 0; i < 8; i++) {
  const wiz =
    i < 7
      ? page.locator("section", { has: page.getByRole("button", { name: "Next ›" }) }).last()
      : page.locator("section", { hasText: "Paste them here." }).last();
  if ([0, 4, 7].includes(i)) {
    await page.waitForTimeout(500);
    await wiz.screenshot({ path: `${OUT}/v${V}-card${i + 1}.png` });
  }
  if (i < 7) {
    await wiz.getByRole("button", { name: "Next ›" }).click();
    await page.waitForTimeout(250);
  }
}
await browser.close();
console.log("done");
