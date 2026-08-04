import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
p.on("console", m => console.log("PAGE:", m.text()));
await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
await p.waitForTimeout(1400);

await p.evaluate(() => {
  const el = document.querySelector('svg[aria-label="Your running profit over the chosen period"]').parentElement;
  for (const type of ["pointerdown", "pointermove", "pointerup", "touchstart", "touchmove"]) {
    el.addEventListener(type, (e) => console.log("evt", type, "pointerType" in e ? e.pointerType : ""), { capture: true });
  }
  window.__el = el;
});

const box = await p.locator('svg[aria-label="Your running profit over the chosen period"]').boundingBox();
const client = await p.context().newCDPSession(p);
const x0 = box.x + box.width * 0.75, y0 = box.y + box.height * 0.4;
await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
await p.waitForTimeout(80);
await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 - 120, y: y0 + 20 }] });
await p.waitForTimeout(200);
console.log("label:", await p.locator("main p").first().innerText());
await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await b.close();
