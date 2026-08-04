// Proves the chart's two gestures on a simulated phone:
//   swipe inside the chart  -> the page scrolls
//   hold, then drag         -> the chart locks and the page stays put
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

// TEST 1: a quick swipe up that starts inside the chart.
{
  const { p, box, cdp } = await fresh();
  const before = await p.evaluate(() => window.scrollY);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: cx, y: cy }],
  });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: cx, y: cy - i * 35 }],
    });
    await p.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => window.scrollY);
  console.log(
    "TEST 1 swipe inside chart:",
    before,
    "->",
    after,
    after > before ? "SCROLLS (good)" : "STUCK (bad)"
  );
  await p.close();
}

// TEST 2: hold still, then drag sideways.
{
  const { p, box, cdp } = await fresh();
  const before = await p.evaluate(() => window.scrollY);
  const cx = box.x + box.width * 0.8;
  const cy = box.y + box.height * 0.5;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: cx, y: cy }],
  });
  await p.waitForTimeout(400);
  console.log("TEST 2 after hold, label:", JSON.stringify(await label(p)));
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: cx - i * 22, y: cy + i * 5 }],
    });
    await p.waitForTimeout(20);
  }
  await p.waitForTimeout(120);
  console.log("TEST 2 after drag, label:", JSON.stringify(await label(p)));
  const during = await p.evaluate(() => window.scrollY);
  console.log(
    "TEST 2 page moved?",
    before,
    "->",
    during,
    during === before ? "STAYS (good)" : "MOVED (bad)"
  );
  await p.screenshot({
    path: `${OUT}/gesture-locked.png`,
    clip: { x: 0, y: 55, width: 390, height: 600 },
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await p.waitForTimeout(300);
  console.log("TEST 2 after release, label:", JSON.stringify(await label(p)));
  await p.close();
}

await b.close();
