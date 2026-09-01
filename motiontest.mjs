// MOTION TEST for the Portfolio prototype.
//
// It exists for the same reason scrubtest.mjs does: a screenshot
// cannot see motion. Every animation here could break silently, with
// a green build and perfect screenshots, exactly the way the chart's
// press-and-hold scrubbing was dead for four days.
//
// What it proves:
//   1. Going deeper animates forward, going back animates backward.
//   2. A sheet rises on open and plays back down before it unmounts.
//   3. The chart line actually draws (dashoffset starts long, ends 0)
//      and REPLAYS when the period changes.
//   4. The hero money travels to its new value instead of snapping.
//   5. prefers-reduced-motion turns every one of them off.
//
// Run it against a dev server: node motiontest.mjs 3000
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

const PORT = process.argv[2] ?? "3000";
const URL = `http://localhost:${PORT}/preview/pf`;

const browser = await chromium.launch(launchOpts());

let failures = 0;
function check(name, ok, detail = "") {
  if (ok) console.log(`  ok    ${name}`);
  else {
    console.log(`  FAIL  ${name}${detail ? "  (" + detail + ")" : ""}`);
    failures += 1;
  }
}

async function anim(page, selector) {
  return page.$eval(selector, (el) => getComputedStyle(el).animationName);
}

async function newPage(reducedMotion) {
  const page = await browser.newPage({
    viewport: { width: 430, height: 932 },
    reducedMotion,
  });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForSelector(".pfh-row");
  return page;
}

// ---------------------------------------------------------------
console.log("direction");
{
  const page = await newPage("no-preference");

  await page.locator(".pfh-row").first().click();
  await page.waitForSelector(".pff-head");
  check("deeper animates forward", (await anim(page, "main.pf")) === "pf-in-fwd",
    await anim(page, "main.pf"));

  await page.locator(".pf-topbtn").first().click();
  await page.waitForSelector(".pfh-row");
  check("back animates backward", (await anim(page, "main.pf")) === "pf-in-back",
    await anim(page, "main.pf"));

  await page.locator(".pfh-mapbtn").click();
  await page.waitForSelector(".pfm-map");
  check("the heatmap animates forward", (await anim(page, "main.pf")) === "pf-in-fwd");

  await page.close();
}

// ---------------------------------------------------------------
console.log("sheets");
{
  const page = await newPage("no-preference");

  await page.locator(".pf-door").first().click();
  await page.waitForSelector(".pfa-overlay");
  check("the sheet rises", (await anim(page, ".pfa-overlay")) === "pf-sheet-up",
    await anim(page, ".pfa-overlay"));

  await page.locator(".pfa-cancel").click();
  // It must still be on screen, playing its exit, not gone instantly.
  await page.waitForTimeout(60);
  const still = await page.$(".pfa-overlay");
  check("cancel plays an exit before unmounting", still !== null);
  if (still !== null) {
    check("the exit is the downward one",
      (await anim(page, ".pfa-overlay")) === "pf-sheet-down",
      await anim(page, ".pfa-overlay"));
  }
  await page.waitForTimeout(400);
  check("and then it is gone", (await page.$(".pfa-overlay")) === null);

  await page.locator(".pfh-know-head").click();
  await page.waitForSelector(".pfi-sheet");
  check("the insight card rises", (await anim(page, ".pfi-sheet")) === "pf-sheet-up");
  check("its scrim fades in", (await anim(page, ".pfi-scrim")) === "pf-scrim-in");

  await page.close();
}

// ---------------------------------------------------------------
console.log("the chart draws");
{
  const page = await newPage("no-preference");

  const offsetNow = () =>
    page.$eval(".pf-draw", (el) =>
      parseFloat(getComputedStyle(el).strokeDashoffset)
    );

  // Deliberately NOT asserting the offset on first load: by the time
  // the page is ready to query, the 620ms draw has already finished,
  // so that check only ever measured the test's own latency. What is
  // provable at rest is that the mechanism is wired, and then that a
  // period change really replays it.
  const wired = await page.$eval(".pf-draw", (el) => ({
    dash: parseFloat(getComputedStyle(el).strokeDasharray),
    name: getComputedStyle(el).animationName,
  }));
  check("the line carries a draw animation", wired.name === "pf-dash", wired.name);
  check("with a real dash length", wired.dash > 40, `dasharray ${wired.dash}`);
  await page.waitForTimeout(900);
  const end = await offsetNow();
  check("and it ends fully drawn", end < 1, `dashoffset ${end}`);

  // Changing the period must REPLAY it. Without the remount key the
  // line would silently stay put.
  await page.locator(".pf-seg", { hasText: "30D" }).click();
  await page.waitForTimeout(50);
  const replay = await offsetNow();
  check("changing the period redraws it", replay > 40, `dashoffset ${replay}`);

  await page.close();
}

// ---------------------------------------------------------------
console.log("money travels");
{
  const page = await newPage("no-preference");
  await page.waitForTimeout(900);
  const before = await page.$eval(".pfh-profit", (el) => el.textContent.trim());

  // 7D, not 30D: the demo record is about four weeks long, so 30D
  // correctly shows the same total as All time and the number has no
  // reason to move. The first version of this test read that as a
  // failure.
  await page.locator(".pf-seg", { hasText: "7D" }).click();
  await page.waitForTimeout(90);
  const during = await page.$eval(".pfh-profit", (el) => el.textContent.trim());
  await page.waitForTimeout(800);
  const after = await page.$eval(".pfh-profit", (el) => el.textContent.trim());

  check("the value really changed", before !== after, `${before} -> ${after}`);
  check("it passes through a middle value, it does not snap",
    during !== after, `mid ${during}, final ${after}`);

  await page.close();
}

// ---------------------------------------------------------------
console.log("reduced motion");
{
  const page = await newPage("reduce");
  check("the page does not animate", (await anim(page, "main.pf")) === "none",
    await anim(page, "main.pf"));
  check("the line is drawn immediately",
    (await page.$eval(".pf-draw", (el) =>
      parseFloat(getComputedStyle(el).strokeDashoffset)
    )) === 0);

  await page.locator(".pf-door").first().click();
  await page.waitForSelector(".pfa-overlay");
  check("the sheet does not animate",
    (await anim(page, ".pfa-overlay")) === "none");

  await page.close();
}

await browser.close();

if (failures > 0) {
  console.log(`\n${failures} motion check(s) failed.`);
  process.exit(1);
}
console.log("\nMotion test passed.");
