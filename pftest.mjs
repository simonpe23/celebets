// BEHAVIOUR TEST for the Portfolio prototype.
//
// It exists because of one bug the owner found on 23 August 2026 by
// tapping around: "i can not filter on sport... i can compare
// leagues but not sports."
//
// He was right, and nothing in the build was red. The engine hid any
// fact whose record exactly matched a higher-ranked one, to stop the
// list showing two rows for the same bets. In a real record that
// rule deletes SPORTS: every American Football bet is an NFL bet, so
// the two are identical, and the league outranks the sport. American
// Football, Baseball, Basketball and Ice Hockey were all silently
// gone from search, from the compare picker and from the builder.
//
// His own founding question for this whole design was "where am I
// leaking, baseball, hockey or football", and the tool had quietly
// removed two of those three words. A screenshot cannot see an
// absence. This can.
//
// Run it against a dev server: node pftest.mjs 3000
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

const page = await browser.newPage({ viewport: { width: 430, height: 1600 } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector(".pfh-row");

const rowNames = () => page.$$eval(".pfa-row b", (e) => e.map((x) => x.textContent));

// ---------------------------------------------------------------
console.log("every sport in the record is reachable");
{
  await page.locator(".pf-door").first().click();
  await page.waitForSelector(".pfa-overlay");
  await page.locator(".pfa-tab", { hasText: "Other" }).click();
  await page.waitForTimeout(150);
  const other = await rowNames();

  // Only sports the demo record actually contains. A sport with no
  // settled bets is correctly absent and is not listed here.
  for (const sport of [
    "Football",
    "American Football",
    "Baseball",
    "Basketball",
    "Ice Hockey",
    "Tennis",
    "Crypto",
    "esports",
  ]) {
    check(`${sport} is in the builder`, other.includes(sport),
      other.join(", "));
  }

  // And findable by typing, which is how the owner hit it.
  for (const [q, want] of [
    ["american", "American Football"],
    ["baseball", "Baseball"],
    ["hockey", "Ice Hockey"],
  ]) {
    await page.locator(".pfa-search input").fill(q);
    await page.waitForTimeout(120);
    const found = await rowNames();
    check(`searching "${q}" finds ${want}`, found.includes(want),
      found.length ? found.join(", ") : "nothing");
  }
  await page.locator(".pfa-search input").fill("");
  await page.locator(".pfa-cancel").click();
  await page.waitForTimeout(400);
}

// ---------------------------------------------------------------
console.log("sports can be compared, not just leagues");
{
  await page.locator(".pfh-row").first().click();
  await page.waitForSelector(".pff-head");
  await page.locator(".pff-btn.outline").click();
  await page.waitForSelector(".pfa-overlay");
  await page.locator(".pfa-search input").fill("ball");
  await page.waitForTimeout(150);
  const rivals = await rowNames();
  check("the compare picker offers sports",
    rivals.includes("Baseball") && rivals.includes("Basketball"),
    rivals.join(", "));

  await page.locator(".pfa-cancel").click();
  await page.waitForTimeout(400);
  await page.locator(".pf-topbtn").first().click();
  await page.waitForSelector(".pfh-row");
}

// ---------------------------------------------------------------
console.log("but a ranked view never shows the same bets twice");
{
  // The other half of the rule. Hiding twins everywhere broke the
  // builder; hiding them nowhere would put Baseball and MLB side by
  // side on the home list, and paint their money twice on the map.
  const rows = await page.$$eval(".pfh-row", (els) =>
    els.map((e) => e.querySelector(".pfh-right b").textContent.trim())
  );
  check("home has five rows", rows.length === 5, `${rows.length}`);
  check("no two home rows carry the same money",
    new Set(rows).size === rows.length, rows.join(", "));

  await page.locator(".pfh-mapbtn").click();
  await page.waitForSelector(".pfm-map");
  const tiles = await page.$$eval(".pfm-tile .pfm-money", (els) =>
    els.map((e) => e.textContent.trim())
  );
  check("no two heatmap tiles paint the same money",
    new Set(tiles).size === tiles.length, tiles.join(", "));
}

await browser.close();

if (failures > 0) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nPortfolio behaviour test passed.");
