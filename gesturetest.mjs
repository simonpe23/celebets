// Proves the chart's gestures on a simulated phone:
//   1 vertical swipe inside the chart  -> the page scrolls
//   2 sideways drag, no hold           -> the chart locks straight away
//   3 hold still, then drag            -> the chart locks, page stays put
//   4 thumb wobble then vertical swipe -> still scrolls
import { chromium } from "playwright";

const OUT =
  "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

async function fresh() {
  const p = await b.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  await p.goto("http://localhost:3000/preview/stats", {
    waitUntil: "networkidle",
  });
  await p.waitForTimeout(1400);
  const box = await p
    .locator('svg[aria-label="Your running profit over the chosen period"]')
    .boundingBox();
  const cdp = await p.context().newCDPSession(p);
  return { p, box, cdp };
}

const label = (p) => p.locator("main p").first().innerText();
const touch = (cdp, type, x, y) =>
  cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y }],
  });

// 1. Vertical swipe inside the chart.
{
  const { p, box, cdp } = await fresh();
  const before = await p.evaluate(() => window.scrollY);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await touch(cdp, "touchStart", cx, cy);
  for (let i = 1; i <= 8; i++) {
    await touch(cdp, "touchMove", cx, cy - i * 35);
    await p.waitForTimeout(16);
  }
  await touch(cdp, "touchEnd");
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => window.scrollY);
  console.log(
    "1 vertical swipe:",
    after > before ? "SCROLLS (good)" : "STUCK (bad)",
    `${before} -> ${after}`
  );
  await p.close();
}

// 2. Sideways drag with no hold at all.
{
  const { p, box, cdp } = await fresh();
  const before = await p.evaluate(() => window.scrollY);
  const cx = box.x + box.width * 0.85;
  const cy = box.y + box.height * 0.5;
  await touch(cdp, "touchStart", cx, cy);
  for (let i = 1; i <= 12; i++) {
    await touch(cdp, "touchMove", cx - i * 20, cy + i * 3);
    await p.waitForTimeout(16);
  }
  await p.waitForTimeout(120);
  const during = await p.evaluate(() => window.scrollY);
  const l = await label(p);
  console.log(
    "2 sideways drag, no hold:",
    /\d/.test(l) ? "SCRUBS (good)" : "IGNORED (bad)",
    JSON.stringify(l),
    during === before ? "page stays (good)" : "page moved (bad)"
  );
  await p.screenshot({
    path: `${OUT}/gesture-swipe.png`,
    clip: { x: 0, y: 55, width: 390, height: 600 },
  });
  await touch(cdp, "touchEnd");
  await p.close();
}

// 3. Hold still, then drag.
{
  const { p, box, cdp } = await fresh();
  const cx = box.x + box.width * 0.8;
  const cy = box.y + box.height * 0.5;
  await touch(cdp, "touchStart", cx, cy);
  await p.waitForTimeout(260);
  const held = await label(p);
  for (let i = 1; i <= 10; i++) {
    await touch(cdp, "touchMove", cx - i * 22, cy + i * 5);
    await p.waitForTimeout(18);
  }
  await p.waitForTimeout(120);
  console.log(
    "3 hold then drag:",
    JSON.stringify(held),
    "->",
    JSON.stringify(await label(p))
  );
  await touch(cdp, "touchEnd");
  await p.waitForTimeout(300);
  console.log("3 after release:", JSON.stringify(await label(p)));
  await p.close();
}

// 4. Thumb wobble, then a real vertical swipe. Must still scroll.
{
  const { p, box, cdp } = await fresh();
  const before = await p.evaluate(() => window.scrollY);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await touch(cdp, "touchStart", cx, cy);
  await touch(cdp, "touchMove", cx + 5, cy + 3);
  await touch(cdp, "touchMove", cx - 4, cy + 6);
  for (let i = 1; i <= 8; i++) {
    await touch(cdp, "touchMove", cx, cy - i * 35);
    await p.waitForTimeout(16);
  }
  await touch(cdp, "touchEnd");
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => window.scrollY);
  console.log(
    "4 wobble then swipe:",
    after > before ? "SCROLLS (good)" : "STUCK (bad)",
    `${before} -> ${after}`
  );
  await p.close();
}

await b.close();
