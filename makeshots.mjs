// The screenshots the landing page puts inside its phones.
//
// They are generated from the REAL app, so a redesign can never leave
// a stale product photo on the front page. That is exactly what went
// wrong before: the landing page was still showing a black balance
// card and Today/Week/Month/Year tiles months after both were deleted.
//
// Run this after any visual change to Track, Performance or Research:
//   node makeshots.mjs [port]
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const port = process.argv[2] ?? "3000";
const OUT = "public/shots";

// 2x is enough. These are drawn about 300px wide on the landing page,
// so 2x already has pixels to spare, and 3x doubles the file size for
// nothing.
const browser = await chromium.launch(launchOpts());

const SHOTS = [
  ["track", "/preview"],
  ["performance", "/preview/performance"],
  ["research", "/preview/research"],
];

for (const scheme of ["dark", "light"]) {
  for (const [name, url] of SHOTS) {
    const page = await browser.newPage({
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 2,
      colorScheme: scheme,
      hasTouch: true,
      isMobile: true,
    });
    await page.goto(`http://localhost:${port}${url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    // No scrollbar, and no tab bar shadow cut off at the edge.
    await page.addStyleTag({ content: "::-webkit-scrollbar{display:none}" });
    await page.screenshot({ path: `${OUT}/${name}-${scheme}.png` });
    await page.close();
    console.log(`${OUT}/${name}-${scheme}.png`);
  }
}
await browser.close();
