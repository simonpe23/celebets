// Is the tab bar still glued to the bottom of the screen?
//
// This exists because the bar changed from `fixed` to `sticky` to stop
// it shaking while Chrome slides its toolbar away. Sticky is fragile in
// a way fixed is not: it only works while the bar is the LAST CHILD of
// the scrolling element, with no ancestor clipping overflow. Move it
// inside a wrapper one day and it silently stops sticking, and every
// screenshot still looks perfect because a screenshot is taken at
// scroll position zero.
//
// It cannot prove the shake itself is gone. A headless browser has no
// collapsing toolbar to shake against, so only a real phone answers
// that. This proves the bar still behaves.
//
//   node bartest.mjs [port]
import { chromium } from "playwright";

const port = process.argv[2] ?? "3000";
const H = 664; // an iPhone in Chrome, toolbars showing
const PAGES = [
  ["Performance", "/preview/performance"],
  ["Track", "/preview"],
  ["Research", "/preview/research"],
  ["Settings", "/preview/settings"],
];

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const problems = [];
for (const [name, url] of PAGES) {
  const page = await browser.newPage({
    viewport: { width: 393, height: H },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  await page.goto(`http://localhost:${port}${url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);

  const bottomOf = async () => {
    const box = await page.locator("nav").last().boundingBox();
    return box.y + box.height;
  };

  const seen = [];
  for (const y of [0, 300, 900, 99999]) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(350);
    seen.push(await bottomOf());
  }
  // Glued means its foot sits on the bottom edge of the screen. It may
  // ride up by the page's own bottom padding once you hit the end.
  const glued = seen.every((b) => b > H - 20 && b < H + 2);
  console.log(
    `${name.padEnd(12)} bar foot at ${seen.map((b) => b.toFixed(0)).join(", ")}  ` +
      `(screen bottom is ${H})  ${glued ? "glued" : "CAME UNSTUCK"}`
  );
  if (!glued) problems.push(name);
  await page.close();
}

await browser.close();
if (problems.length) {
  console.log(`\nFAILED on: ${problems.join(", ")}`);
  process.exit(1);
}
console.log("\nTab bar test passed.");
