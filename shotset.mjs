// Clean product screenshots of the real app, for mockup renders.
// No browser chrome, no scrollbars, 3x so they hold up when a render
// scales them. This is the raw material; the angled phone frame is a
// 3D render and has to happen outside code.
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad/shots";
const B = "http://localhost:3631";

const browser = await chromium.launch(launchOpts());

const SHOTS = [
  ["track", "/preview"],
  ["performance", "/preview/performance"],
  ["research", "/preview/research"],
];

for (const scheme of ["light", "dark"]) {
  for (const [name, url] of SHOTS) {
    const page = await browser.newPage({
      // iPhone 15 Pro logical size, 3x for a crisp render.
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 3,
      colorScheme: scheme,
    });
    await page.goto(B + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    // Hide the scrollbar so the glass edge is clean.
    await page.addStyleTag({ content: "::-webkit-scrollbar{display:none}" });
    await page.screenshot({ path: `${OUT}/${name}-${scheme}.png` });
    await page.close();
  }
}
await browser.close();
console.log("done");
