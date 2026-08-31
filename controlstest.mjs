// EVERY CONTROL ON THE PERFORMANCE PAGES, CLICKED.
//
// This file exists because a control that is drawn and does nothing is
// invisible to a screenshot, and because on 30 August 2026 a rewrite of
// jumptest.mjs dropped about forty five assertions covering jobs 3 to
// 7 without anyone noticing. Two chats editing one test file is how
// coverage disappears. This one is separate on purpose.
//
// jumptest.mjs owns the Home to Lab doors. This owns the controls:
// the period, the View all links, the info dots, the group expand,
// the All Bets door and the bet unfold.
//
// IT IS NOT IN `npm run check`, ON PURPOSE. The owner's ruling, 30
// August 2026: it runs when he or a chat asks for it, never on its
// own. He was losing track of what was being decided for him, and a
// check that adds itself to the build is one more of those.
//
//   node controlstest.mjs <port>
import { chromium } from "playwright";

const port = process.argv[2] ?? "3105";
const B = `http://localhost:${port}/preview/`;

// Start a dev server if nothing is listening, and stop it at the end,
// the same way sitecheck.mjs does. A check that needs three steps is a
// check that gets skipped, and this one is in `npm run check`.
let spawned = null;
const reachable = async () => {
  try {
    return (await fetch(`http://localhost:${port}`, { method: "HEAD" })).status < 500;
  } catch {
    return false;
  }
};
if (!(await reachable())) {
  const { spawn } = await import("node:child_process");
  console.log(`no server on ${port}, starting one...`);
  spawned = spawn("npm", ["run", "dev", "--", "--port", port], {
    stdio: "ignore",
    detached: true,
  });
  for (let i = 0; i < 40 && !(await reachable()); i += 1) {
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!(await reachable())) {
    console.log("could not start a dev server");
    process.exit(1);
  }
}
const stopServer = () => {
  if (spawned) {
    try {
      process.kill(-spawned.pid, "SIGKILL");
    } catch {}
  }
};

const exe = process.env.PLAYWRIGHT_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
let fails = 0;
const say = (ok, m) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${m}`);
  if (!ok) fails += 1;
};

// JOB 3. Totals' "View all" opens Lab AT that group. The six groups
// all fit on one screen at the bottom of Lab, so scrolling alone
// cannot say which one you were sent to: the arrival is marked.
for (const [label, group, head] of [
  ["Profit by Sport", "sport", "SPORT"],
  ["Per Category", "what", "CATEGORY"],
]) {
  await page.goto(`${B}performance-totals`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.click(`h2:has-text("${label}") + a`);
  // Checked by the MARK, not by the address. The tab area switches in
  // place now and hands the group over as a prop, so the URL no longer
  // carries it: a test that watched the address went red on 31 August
  // 2026 while the feature itself was working perfectly.
  await page.waitForTimeout(1500);
  const landed = (await page.innerText("body")).includes("Build your view");
  const marked = await page.evaluate(() =>
    [...document.querySelectorAll("div")]
      .filter((d) => d.style.background && d.style.background.includes("240"))
      .map((d) => (d.innerText || "").split("\n")[0])
  );
  say(landed && marked.includes(head), `Totals "${label}" lands on Lab's ${head}`);
  void group;
}

// JOB 4. One period control, three pages. A pill that changes its own
// label and nothing else is the failure mode.
for (const [route, marker] of [
  ["performance-totals", "Total bets"],
  ["performance-lab", "Net profit"],
  ["performance-heatmap", "Performance map"],
]) {
  await page.goto(`${B}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const before = await page.innerText("body");
  await page.click('button[aria-label="Change the period"]');
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "This month", exact: true }).click();
  await page.waitForTimeout(800);
  const after = await page.innerText("body");
  say(
    before !== after && after.includes("This month") && after.includes(marker),
    `${route}: the period redraws the page`
  );
}

await page.goto(`${B}performance-totals?period=month`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.click('a:has-text("Lab")');
await page.waitForURL("**/performance-lab**");
await page.waitForTimeout(800);
say(page.url().includes("period=month"), "the period carries from Totals to Lab");
await page.locator("button").filter({ hasText: /^\S/ }).first().waitFor();

// A period with nothing settled in it must say so, not print NaN.
for (const route of ["performance-totals", "performance-lab", "performance-heatmap", "performance-bets"]) {
  await page.goto(`${B}${route}?period=today`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const t = await page.innerText("body");
  say(!/NaN|Infinity|undefined|\+-/.test(t), `${route} survives an empty period`);
}

// JOB 5. All Bets, and the door that opens it must agree with it.
await page.goto(`${B}performance-totals`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.click('a:has-text("See all bets")');
await page.waitForURL("**/performance-bets**");
await page.waitForTimeout(700);
let body = await page.innerText("body");
const headerCount = Number((body.match(/(\d+) bets/) || [])[1]);
const listed = await page.evaluate(
  () => document.querySelectorAll('button[aria-label="Show this bet"]').length
);
say(
  body.includes("Your whole record") && headerCount === listed,
  `Totals opens All Bets and lists every one (${listed} rows, header says ${headerCount})`
);

await page.goto(
  `${B}performance-lab?sel=${encodeURIComponent("sport~plain~Football")}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(700);
const doorSays = ((await page.innerText("body")).match(/See these (\d+) bets/) || [])[1];
await page.click('a:has-text("See these")');
await page.waitForURL("**/performance-bets**");
await page.waitForTimeout(700);
body = await page.innerText("body");
const listSays = (body.match(/(\d+) bets/) || [])[1];
say(doorSays === listSays, `Lab's door and All Bets agree (${doorSays} vs ${listSays})`);

// THE UNFOLD, 30 August 2026. Every pick, both marks, all three
// figures. A row that opens showing two of a parlay's three picks is
// the failure a closed screenshot cannot see.
await page.goto(
  `${B}performance-bets?sel=${encodeURIComponent("what~category~Moneyline")}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(800);
const partIdx = await page.evaluate(() =>
  [...document.querySelectorAll('button[aria-label="Show this bet"]')].findIndex((r) =>
    /\d+ of \d+ picks/.test(r.innerText)
  )
);
say(partIdx >= 0, "the list contains a partly matching parlay to open");
await page.locator('button[aria-label="Show this bet"]').nth(partIdx).click();
await page.waitForTimeout(500);
const open = await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label="Hide this bet"]');
  const box = btn.nextElementSibling;
  const label = btn.innerText.match(/(\d+) pick parlay/);
  return {
    want: label ? Number(label[1]) : 1,
    listed: box.querySelectorAll("div > span svg").length,
    text: box.innerText,
  };
});
say(open.listed === open.want, `the unfold lists every pick (${open.listed} of ${open.want})`);
say(
  /Staked/.test(open.text) && /Payout/.test(open.text) && /Profit/.test(open.text),
  "the unfold shows Staked, Payout and Profit"
);
const marks = (open.text.match(/matched/g) || []).length;
say(
  marks >= 1 && marks < open.want,
  `only the picks that matched are marked (${marks} of ${open.want})`
);

await page.locator('button[aria-label="Hide this bet"]').click();
await page.waitForTimeout(300);
const singleIdx = await page.evaluate(() =>
  [...document.querySelectorAll('button[aria-label="Show this bet"]')].findIndex(
    (r) => !/pick parlay/.test(r.innerText)
  )
);
await page.locator('button[aria-label="Show this bet"]').nth(singleIdx).click();
await page.waitForTimeout(400);
say(
  (await page.locator('button[aria-label="Hide this bet"]').count()) === 1,
  "a single bet unfolds too"
);

// JOB 6. Every (i) dot explains its number, and never in the banned
// finance words.
for (const [route, expect] of [
  ["performance-lab", "minus everything you staked"],
  ["performance-totals", "minus everything you staked"],
  ["performance-heatmap", "every tile is one fact"],
]) {
  await page.goto(`${B}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const dots = await page.locator('button[aria-label^="What "]').count();
  let opened = 0;
  for (let i = 0; i < dots; i += 1) {
    await page.locator('button[aria-label^="What "]').nth(i).click();
    await page.waitForTimeout(220);
    if ((await page.locator('button[aria-label="Close explanation"]').count()) > 0) {
      opened += 1;
      await page.locator('button[aria-label="Close explanation"]').click();
      await page.waitForTimeout(120);
    }
  }
  await page.locator('button[aria-label^="What "]').first().click();
  await page.waitForTimeout(300);
  const text = (await page.innerText("body")).toLowerCase();
  say(
    dots > 0 && opened === dots && text.includes(expect),
    `${route}: all ${dots} info dots explain their number`
  );
  say(
    !/wallet|deposit|withdraw|bankroll/i.test(text),
    `${route}: explained without the banned words`
  );
}

// JOB 7. A group row scrolls sideways and hides what ran off the edge.
// Its label wraps the row instead.
await page.goto(`${B}performance-lab`, { waitUntil: "networkidle" });
await page.waitForTimeout(700);
const shut = await page.evaluate(() => {
  const row = [...document.querySelectorAll("div")].find((d) =>
    d.className.includes("overflow-x-auto")
  );
  return { hides: row.scrollWidth > row.clientWidth + 1, h: row.getBoundingClientRect().height };
});
await page.locator('button[aria-label^="Show every"]').first().click();
await page.waitForTimeout(500);
const wide = await page.evaluate(() => {
  const row = [...document.querySelectorAll("div")].find(
    (d) => d.className.includes("flex-wrap") && d.className.includes("gap-[7px]")
  );
  return {
    wrapped: !!row,
    hides: row ? row.scrollWidth > row.clientWidth + 1 : true,
    h: row ? row.getBoundingClientRect().height : 0,
  };
});
say(
  shut.hides && wide.wrapped && !wide.hides && wide.h > shut.h,
  "a group label wraps its row and hides nothing"
);
say(
  (await page.locator('button[aria-label="Collapse sport"]').count()) === 1,
  "and the label offers Show less"
);

// THE INSIGHTS SHEET, 31 August 2026. His ruling: "the insight button
// does not work. make a pop up window, similar to what we have on
// Track." A sheet that opens but never rerolls is the failure a
// screenshot cannot see.
for (const route of ["performance-home", "performance-lab"]) {
  await page.goto(`${B}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.locator('button[aria-label="Open your insights"]').click();
  await page.waitForTimeout(500);
  const first = await page.evaluate(() =>
    [...document.querySelectorAll("ul li")].map((l) => l.innerText)
  );
  say(
    (await page.innerText("body")).includes("Your insights") &&
      first.length > 0 &&
      first.length <= 4,
    `${route}: the strip opens the sheet (${first.length} insights)`
  );
  await page.locator('button:has-text("New mix")').click();
  await page.waitForTimeout(500);
  const second = await page.evaluate(() =>
    [...document.querySelectorAll("ul li")].map((l) => l.innerText)
  );
  say(
    JSON.stringify(first) !== JSON.stringify(second) || first.length < 2,
    `${route}: New mix rerolls them`
  );
  // /insights is behind login, so the public preview must not offer a
  // door to a login screen.
  say(
    (await page.locator('a:has-text("Show all")').count()) === 0,
    `${route}: no Show all on the public preview`
  );
  await page.locator('button:has-text("Close")').click();
  await page.waitForTimeout(400);
  say(
    !(await page.innerText("body")).includes("Your insights"),
    `${route}: Close shuts it`
  );
}

await browser.close();
stopServer();
console.log(fails ? `${fails} control(s) broken` : "Every control works.");
process.exit(fails ? 1 : 0);
