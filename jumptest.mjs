// Proves the doors between the Home and Lab previews. A jump is not a
// link that exists but a selection that ARRIVES: after each tap the
// Lab answer panel must show the jumped fact's own record, and the
// Explore Lab door must land on an empty Lab showing the whole
// record. Screenshots cannot see a tap; this script is the tap.
//
// Usage: node jumptest.mjs <port>
import { chromium } from "playwright";

const port = process.argv[2];
if (!port) {
  console.error("usage: node jumptest.mjs <port of a running dev server>");
  process.exit(2);
}
const exe = process.env.PLAYWRIGHT_CHROMIUM || undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
let fails = 0;

// Home's five rows and the records they carry. Lab's demo data is
// built to reproduce exactly these, so the assertion is honest.
const CASES = [
  ["Moneyline", "30–16"],
  ["Premier League", "14–8"],
  ["Low odds", "18–11"],
  ["Singles", "24–18"],
  ["Player Props", "7–11"],
];

for (const [name, record] of CASES) {
  await page.goto(`http://localhost:${port}/preview/performance-home`, {
    waitUntil: "networkidle",
  });
  await page.click(`a:has-text("${name}")`);
  await page.waitForURL("**/preview/performance-lab**");
  await page.waitForTimeout(700);
  const body = await page.textContent("body");
  const ok =
    body.includes(record) || body.includes(record.replace("–", "-"));
  console.log(`${ok ? "PASS" : "FAIL"} row ${name} arrives showing ${record}`);
  if (!ok) fails++;
}

// The door lands on an EMPTY Lab, the ruling: "i want a view inside
// the lab that is clean from selections." Empty shows the whole
// record.
await page.goto(`http://localhost:${port}/preview/performance-home`, {
  waitUntil: "networkidle",
});
await page.click('a:has-text("Explore Lab")');
await page.waitForURL("**/preview/performance-lab**");
await page.waitForTimeout(700);
const hasSel = page.url().includes("sel=");
const body = await page.textContent("body");
const okEmpty =
  !hasSel && (body.includes("49–38") || body.includes("49-38"));
console.log(`${okEmpty ? "PASS" : "FAIL"} Explore Lab lands on the empty Lab`);
if (!okEmpty) fails++;

// The top menus link both ways.
await page.click('a:has-text("Home")');
await page.waitForURL("**/preview/performance-home**");
console.log("PASS Lab menu returns to Home");

// TOTALS joined the menu on 29 August 2026, so all three tabs must
// reach each other. A menu that looks right and does nothing is
// exactly what a screenshot cannot catch.
for (const [from, label, to] of [
  ["performance-home", "Totals", "performance-totals"],
  ["performance-lab", "Totals", "performance-totals"],
  ["performance-totals", "Home", "performance-home"],
  ["performance-totals", "Lab", "performance-lab"],
]) {
  await page.goto(`http://localhost:${port}/preview/${from}`, {
    waitUntil: "networkidle",
  });
  await page.click(`a:has-text("${label}")`);
  let ok = true;
  try {
    await page.waitForURL(`**/preview/${to}**`, { timeout: 8000 });
  } catch {
    ok = false;
  }
  console.log(`${ok ? "PASS" : "FAIL"} ${from} menu reaches ${label}`);
  if (!ok) fails++;
}

// COMPARE, its own page since 29 August 2026. The door appears at
// exactly two selections, carries both to Compare, and the back
// arrow returns to Lab with both still selected. Three things a
// screenshot cannot show.
await page.goto(
  `http://localhost:${port}/preview/performance-lab?sel=${encodeURIComponent(
    "sport~plain~Football|sport~plain~Basketball"
  )}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(600);
const doorAtTwo = await page.locator('a:has-text("Compare")').count();
console.log(
  `${doorAtTwo === 1 ? "PASS" : "FAIL"} the Compare door is there at two selections`
);
if (doorAtTwo !== 1) fails++;

await page.click('a:has-text("Compare")');
await page.waitForURL("**/preview/performance-compare**");
await page.waitForTimeout(700);
const cmp = await page.innerText("body");
const carried =
  cmp.includes("Football") && cmp.includes("Basketball") && cmp.includes("24–16");
console.log(`${carried ? "PASS" : "FAIL"} Compare opens on the two chosen facts`);
if (!carried) fails++;

await page.click('a[aria-label="Back to Lab"]');
await page.waitForURL("**/preview/performance-lab**");
await page.waitForTimeout(600);
const backSel = page.url().includes("Football") && page.url().includes("Basketball");
console.log(`${backSel ? "PASS" : "FAIL"} back from Compare keeps both selections`);
if (!backSel) fails++;

// At three selections the door is gone, his standing rule.
await page.goto(
  `http://localhost:${port}/preview/performance-lab?sel=${encodeURIComponent(
    "sport~plain~Football|sport~plain~Basketball|risk~plain~Low odds"
  )}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(600);
const doorAtThree = await page.locator('a:has-text("Compare")').count();
console.log(
  `${doorAtThree === 0 ? "PASS" : "FAIL"} the Compare door is gone at three selections`
);
if (doorAtThree !== 0) fails++;

// THE HEAT MAP, its own page since 29 August 2026. Home's pill opens
// it, every tile carries its fact into Lab (his ruling of 26 August
// 2026), and the back arrow returns to Home.
await page.goto(`http://localhost:${port}/preview/performance-home`, {
  waitUntil: "networkidle",
});
await page.click('a:has-text("Heat Map")');
let heatOk = true;
try {
  await page.waitForURL("**/preview/performance-heatmap**", { timeout: 8000 });
} catch {
  heatOk = false;
}
console.log(`${heatOk ? "PASS" : "FAIL"} Home's Heat Map pill opens the map`);
if (!heatOk) fails++;

await page.waitForTimeout(700);
const heatText = await page.innerText("body");
// The map must name a leak. Ranking tiles purely by size once buried
// the biggest one inside a remainder tile.
const showsLeak = heatText.includes("Basketball") && heatText.includes("-$926");
console.log(`${showsLeak ? "PASS" : "FAIL"} the map shows the biggest leak by name`);
if (!showsLeak) fails++;

// The map shows the best and worst facts across EVERY group at once,
// his ruling of 29 August 2026: "regardless of sport, league,
// category, market". A screenshot cannot prove the mix, or that a
// red tile is there at all.
const mix = await page.evaluate(() => {
  const head = [...document.querySelectorAll("p")].find((p) =>
    p.textContent.startsWith("Performance map")
  );
  const map = head.nextElementSibling;
  return [...map.children].map((c) => c.getAttribute("href") ?? "");
});
const groups = new Set(
  mix.map((h) => (h.match(/sel=([a-z]+)(?:~|%7E)/) || [, ""])[1])
);
const mixed = groups.size >= 3;
console.log(
  `${mixed ? "PASS" : "FAIL"} the map mixes groups (${[...groups].join(", ")})`
);
if (!mixed) fails++;

// EIGHT TILES, AT LEAST THREE OF EACH COLOUR. His ruling, 29 August
// 2026: "i would like to have at least eight performance map cards,
// and i want at least three red and at least three green... even if
// all of them are red or all of them are green." Ranked purely by
// size the record's biggest leak once came ninth and every tile was
// green, which a screenshot of a winning record hides rather well.
const shape = await page.evaluate(() => {
  const head = [...document.querySelectorAll("p")].find((p) =>
    p.textContent.startsWith("Performance map")
  );
  const tiles = [...head.nextElementSibling.children];
  return {
    total: tiles.length,
    red: tiles.filter((c) => c.innerText.includes("-$")).length,
    green: tiles.filter((c) => c.innerText.includes("+$")).length,
  };
});
const shaped = shape.total >= 8 && shape.red >= 3 && shape.green >= 3;
console.log(
  `${shaped ? "PASS" : "FAIL"} the map shows 8 tiles, 3+ of each colour ` +
    `(${shape.total} tiles, ${shape.green} green, ${shape.red} red)`
);
if (!shaped) fails++;

// Every figure must be whole. A treemap will hand you a 41px tile, so
// the money shrinks to fit; this proves it never gets cropped instead.
const cropped = await page.evaluate(() => {
  const head = [...document.querySelectorAll("p")].find((p) =>
    p.textContent.startsWith("Performance map")
  );
  return [...head.nextElementSibling.children].filter((c) => {
    const spans = [...c.querySelectorAll("span")];
    const money = spans[spans.length - 1];
    return money.scrollWidth > money.clientWidth + 1;
  }).length;
});
console.log(
  `${cropped === 0 ? "PASS" : "FAIL"} no tile crops its figure (${cropped} cropped)`
);
if (cropped !== 0) fails++;

// Prove a tile carries its fact into Lab.
// The Biggest Leak card names Basketball too, so the tile is the
// last match, not the first.
await page.locator('a[href*="sport~plain~Basketball"]').last().click();
let tileOk = true;
try {
  await page.waitForURL("**/preview/performance-lab**", { timeout: 8000 });
} catch {
  tileOk = false;
}
await page.waitForTimeout(700);
const labText = await page.innerText("body");
const carriedTile = tileOk && labText.includes("5–9");
console.log(`${carriedTile ? "PASS" : "FAIL"} a tile opens Lab on that fact`);
if (!carriedTile) fails++;

await page.goto(`http://localhost:${port}/preview/performance-heatmap`, {
  waitUntil: "networkidle",
});
await page.click('a[aria-label="Back to Home"]');
let backOk = true;
try {
  await page.waitForURL("**/preview/performance-home**", { timeout: 8000 });
} catch {
  backOk = false;
}
console.log(`${backOk ? "PASS" : "FAIL"} back from the map returns to Home`);
if (!backOk) fails++;

// JOB 3, 29 August 2026. Totals' "View all" opens Lab at that group.
// The six groups all fit on one screen at the bottom of Lab, so
// scrolling alone cannot say which one you were sent to: the arrival
// is marked, and that mark is what this checks. Landing on the right
// page at the wrong group is exactly what a screenshot cannot show.
for (const [label, group, head] of [
  ["Profit by Sport", "sport", "SPORT"],
  ["Per Category", "what", "CATEGORY"],
]) {
  await page.goto(`http://localhost:${port}/preview/performance-totals`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(400);
  await page.click(`h2:has-text("${label}") + a`);
  let ok = true;
  try {
    await page.waitForURL(`**group=${group}**`, { timeout: 8000 });
  } catch {
    ok = false;
  }
  await page.waitForTimeout(900);
  const marked = await page.evaluate(() =>
    [...document.querySelectorAll("div")]
      .filter((d) => d.style.background && d.style.background.includes("240"))
      .map((d) => (d.innerText || "").split("\n")[0])
  );
  const right = ok && marked.includes(head);
  console.log(
    `${right ? "PASS" : "FAIL"} Totals "${label}" lands on Lab's ${head} group`
  );
  if (!right) fails++;
}

// JOB 4, 29 August 2026. One period control on three pages. A pill
// that changes its own label and nothing else is the failure mode.
for (const [route, marker] of [
  ["performance-totals", "Total bets"],
  ["performance-lab", "Net profit"],
  ["performance-heatmap", "Performance map"],
]) {
  await page.goto(`http://localhost:${port}/preview/${route}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  const before = await page.innerText("body");
  await page.click('button[aria-label="Change the period"]');
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "This month", exact: true }).click();
  await page.waitForTimeout(800);
  const after = await page.innerText("body");
  const redrew =
    before !== after && after.includes("This month") && after.includes(marker);
  console.log(`${redrew ? "PASS" : "FAIL"} ${route}: the period redraws the page`);
  if (!redrew) fails++;
}

// The period has to survive a tab switch and a chip, or it is a toy.
await page.goto(
  `http://localhost:${port}/preview/performance-totals?period=month`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(500);
await page.click('a:has-text("Lab")');
await page.waitForURL("**/performance-lab**");
await page.waitForTimeout(800);
const heldPeriod = page.url().includes("period=month");
console.log(`${heldPeriod ? "PASS" : "FAIL"} the period carries from Totals to Lab`);
if (!heldPeriod) fails++;

await page.locator('button:has-text("Football")').first().click();
await page.waitForTimeout(700);
const kept = page.url().includes("period=month");
console.log(`${kept ? "PASS" : "FAIL"} picking a chip in Lab keeps the period`);
if (!kept) fails++;

// A period with nothing in it must say so, not print NaN at him.
for (const route of [
  "performance-totals",
  "performance-lab",
  "performance-heatmap",
]) {
  await page.goto(
    `http://localhost:${port}/preview/${route}?period=today`,
    { waitUntil: "networkidle" }
  );
  await page.waitForTimeout(600);
  const t = await page.innerText("body");
  const clean = !/NaN|Infinity|undefined|\+-/.test(t);
  console.log(`${clean ? "PASS" : "FAIL"} ${route} survives an empty period`);
  if (!clean) fails++;
}

// JOB 5, 29 August 2026. ALL BETS, one page closing two dead doors.
// The trap here is a list that disagrees with the record printed
// above it, so that agreement is what these check.
await page.goto(`http://localhost:${port}/preview/performance-totals`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(500);
await page.click('a:has-text("See all bets")');
await page.waitForURL("**/performance-bets**");
await page.waitForTimeout(700);
let bets = await page.innerText("body");
const wholeCount = Number((bets.match(/(\d+) bets/) || [])[1]);
const listed = await page.evaluate(
  () => document.querySelectorAll('div[class*="rounded-[16px]"] > div').length
);
const whole = bets.includes("Your whole record") && wholeCount === listed;
console.log(
  `${whole ? "PASS" : "FAIL"} Totals opens All Bets and lists every one (${listed} rows, header says ${wholeCount})`
);
if (!whole) fails++;

await page.click('a[aria-label="Back"]');
await page.waitForURL("**/performance-totals**");
console.log("PASS back from All Bets returns to Totals");

// Lab's door must agree with the page it opens, to the bet.
await page.goto(
  `http://localhost:${port}/preview/performance-lab?sel=${encodeURIComponent(
    "sport~plain~Football"
  )}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(700);
const doorSays = (
  (await page.innerText("body")).match(/See these (\d+) bets/) || []
)[1];
await page.click('a:has-text("See these")');
await page.waitForURL("**/performance-bets**");
await page.waitForTimeout(700);
bets = await page.innerText("body");
const listSays = (bets.match(/(\d+) bets/) || [])[1];
const agree =
  bets.includes("Football, all time") && doorSays === listSays && bets.includes("24–16");
console.log(
  `${agree ? "PASS" : "FAIL"} Lab's door and All Bets agree (${doorSays} vs ${listSays})`
);
if (!agree) fails++;

await page.click('a[aria-label="Back"]');
await page.waitForURL("**/performance-lab**");
const keptSel = page.url().includes("Football");
console.log(`${keptSel ? "PASS" : "FAIL"} back from All Bets keeps the selection`);
if (!keptSel) fails++;

// A three pick parlay with one Moneyline leg is a Moneyline bet, but
// saying so without "1 of 3 picks" overstates it.
await page.goto(
  `http://localhost:${port}/preview/performance-bets?sel=${encodeURIComponent(
    "what~category~Moneyline"
  )}`,
  { waitUntil: "networkidle" }
);
await page.waitForTimeout(700);
bets = await page.innerText("body");
const partial = /\d+ of \d+ picks/.test(bets);
console.log(`${partial ? "PASS" : "FAIL"} a partly matching parlay says so`);
if (!partial) fails++;

// And it carries the period, and survives having nothing to show.
await page.goto(`http://localhost:${port}/preview/performance-bets?period=month`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(600);
const monthly = (await page.innerText("body")).includes("this month");
console.log(`${monthly ? "PASS" : "FAIL"} All Bets carries the period`);
if (!monthly) fails++;

await page.goto(`http://localhost:${port}/preview/performance-bets?period=today`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(600);
bets = await page.innerText("body");
const emptyOk =
  bets.includes("No settled bets match") && !/NaN|undefined/.test(bets);
console.log(`${emptyOk ? "PASS" : "FAIL"} All Bets survives an empty result`);
if (!emptyOk) fails++;

await browser.close();
console.log(fails ? `${fails} jump(s) broken` : "All doors work.");
process.exit(fails ? 1 : 0);
