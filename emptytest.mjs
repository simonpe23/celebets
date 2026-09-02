// WHAT THE APP SAYS WHEN IT HAS ALMOST NOTHING TO SAY.
//
// Built 2 September 2026, phase 1 of the silence job. His problem, his
// words: "Actuals says nothing to a new user for a long time, and I
// only found out by asking." Nobody decided that. It emerged, and no
// screenshot round caught it, because a screenshot of an empty section
// looks like a screenshot of a section that has not loaded yet.
//
// It loads every page of the app against six records, from an empty
// account to ten settled bets (src/app/preview/firstbets/data.ts), and
// asks one question of each block on each page:
//
//     does it have something to say, is it saying it is waiting, or is
//     it silent?
//
// SILENT is the failure: the heading is drawn, and underneath it there
// is nothing at all.
//
// IT IS A RATCHET, NOT A PASS/FAIL. Today the app is silent in many
// places, so failing on all of them would just be a red build nobody
// can fix in one go. Instead the known silences are listed in KNOWN
// below, and the script fails on two things:
//
//   1. a NEW silence, which is a regression
//   2. a silence in KNOWN that is no longer silent, which means the
//      list is stale and the entry must be deleted
//
// So the list can only shrink, and it cannot be quietly ignored.
//
// Run: node emptytest.mjs <port of a running dev server>

import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

// Defaults to 3105, the port `npm run check` uses, and starts its own
// dev server if nothing is listening. sitecheck.mjs stops the server
// it started, so chaining after it would otherwise find nothing.
const port = process.argv[2] ?? "3105";
const BASE = `http://localhost:${port}`;

let spawned = null;
const reachable = async () => {
  try {
    const r = await fetch(BASE, { method: "HEAD" });
    return r.status < 500;
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
  for (let i = 0; i < 40 && !(await reachable()); i++) {
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

const SETS = ["none", "pending", "one", "three", "six", "ten"];

// Every block that can come back empty, and how to tell. Each probe is
// a snippet of JavaScript run in the page, returning one of:
//   "speaks"  it has real content
//   "waiting" it says what it is waiting for
//   "silent"  a heading with nothing under it
//   "absent"  the block is not drawn at all, which is allowed and is a
//             different thing from being silent
//   "invents" it shows content the user's record does not contain
//
// THE PROBES READ TEXT, NOT MARKUP, on purpose. A probe written
// against class names breaks the first time a card is restyled, and a
// check that breaks gets deleted. Each one slices the page's visible
// text between two headings and looks for a signature in the slice.
const HELPERS = `
  const T = () => document.body.innerText;
  const between = (from, to) => {
    const t = T();
    const a = t.indexOf(from);
    if (a < 0) return null;
    const b = to ? t.indexOf(to, a + from.length) : -1;
    return t.slice(a + from.length, b < 0 ? undefined : b);
  };
  const hasRecord = (s) => /[0-9]+[–-][0-9]+/.test(s);
  const hasMoney = (s) => s.includes("$");
  const waiting = (s) => /settle|waiting|not enough|yet|once you|first bet/i.test(s);
`;

const probe = (page, block, body) => ({ page, block, js: `(() => {${HELPERS}${body}})()` });

const PROBES = [
  probe("home", "the ranked list", `
    const slice = between("Ranked by contribution to net profit", "Build your performance view");
    if (slice === null) return "absent";
    if (slice.includes("% hit rate")) return "speaks";
    return waiting(slice) ? "waiting" : "silent";
  `),
  probe("home", "the Actuals noticed banner", `
    return T().includes("Actuals noticed") ? "speaks" : "absent";
  `),
  // A DRAWN LINE, not just an axis. The chart emits a flat line even
  // with nothing to plot, so this asks for a path that actually
  // changes height rather than for any path at all.
  probe("home", "the hero chart", `
    const ds = [...document.querySelectorAll("svg path")].map((p) => p.getAttribute("d") || "");
    if (!ds.length) return "absent";
    const heights = new Set();
    for (const d of ds)
      for (const m of d.matchAll(/[ ,]([0-9]+(?:[.][0-9]+)?)(?=[ ,LlZz]|$)/g)) heights.add(m[1]);
    return heights.size > 3 ? "speaks" : "silent";
  `),
  probe("lab", "the fact chips", `
    if (/No picks match this view yet/i.test(T())) return "waiting";
    const slice = between("Tap any fact and the numbers above become its record", null);
    if (slice === null) return "absent";
    return hasRecord(slice) ? "speaks" : "silent";
  `),
  probe("totals", "Profit by Sport", `
    const slice = between("Profit by Sport", "Per Category");
    if (slice === null) return "absent";
    return hasRecord(slice) ? "speaks" : (waiting(slice) ? "waiting" : "silent");
  `),
  probe("totals", "Recent Bets", `
    const slice = between("Recent Bets", null);
    if (slice === null) return "absent";
    return slice.includes("·") ? "speaks" : (waiting(slice) ? "waiting" : "silent");
  `),
  probe("heatmap", "the map", `
    if (/Settle a few bets and the map fills in/i.test(T())) return "waiting";
    const slice = between("Performance map", "Size shows impact");
    if (slice === null) return "absent";
    return hasMoney(slice) ? "speaks" : "silent";
  `),
  // The failure here is not silence, it is invention: two sports the
  // user may never have bet, both reading 0-0.
  probe("compare", "the two sides", `
    const zeros = (T().match(/0[ ]*[–-][ ]*0/g) || []).length;
    return zeros >= 2 ? "invents" : "speaks";
  `),
  probe("bets", "the list", `
    if (/No settled bets match this yet/i.test(T())) return "waiting";
    return T().includes("·") ? "speaks" : "silent";
  `),
  probe("track", "Betting history", `
    if (/Settled bets will show up here/i.test(T())) return "waiting";
    return T().includes("Betting history") ? "speaks" : "absent";
  `),
  probe("track", "the insight card", `
    return /Insight of the day|Actuals noticed/i.test(T()) ? "speaks" : "absent";
  `),
  probe("track", "Performance Snapshot", `
    return /Performance Snapshot/i.test(T()) ? "speaks" : "absent";
  `),
];

// THE KNOWN SILENCES, 2 September 2026. Each line is a promise to fix
// or to justify. Delete a line when the fix lands; the script fails if
// a listed entry starts speaking, so the list cannot go stale.
const KNOWN = new Set([
  // HOME'S RANKED LIST. The heading "What drives your result" is drawn
  // and nothing is under it. A fact needs 5 settled picks AND must
  // cover no more than 85% of the record, and on a small record
  // everything you have done covers 100% of it. Phase 2 fixes this.
  "none/home/the ranked list",
  "pending/home/the ranked list",
  "one/home/the ranked list",
  "three/home/the ranked list",

  // TOTALS on an account with nothing settled. Two cards draw their
  // headings over nothing. Phase 3.
  "none/totals/Profit by Sport",
  "none/totals/Recent Bets",
  "pending/totals/Profit by Sport",
  "pending/totals/Recent Bets",

  // COMPARE INVENTS. It opens on a hardcoded Football versus
  // Basketball, so someone who has never bet Basketball is shown a
  // comparison against a sport they have never touched, both sides
  // reading 0-0, with a winner's crown on one of them. His ruling of 2
  // September 2026: use their real top two. Phase 3.
  "none/compare/the two sides",
  "pending/compare/the two sides",
  "one/compare/the two sides",
  "three/compare/the two sides",
  "six/compare/the two sides",
]);

const BAD = new Set(["silent", "invents"]);

const browser = await chromium.launch(launchOpts());
const rows = [];
for (const set of SETS) {
  for (const probe of PROBES) {
    const url =
      probe.page === "track"
        ? `http://localhost:${port}/preview/firstbets/${set}/track`
        : `http://localhost:${port}/preview/firstbets/${set}?view=${probe.page}`;
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const res = await page.goto(url, { waitUntil: "networkidle" });
    if (res.status() !== 200) {
      console.error(`${url} returned ${res.status()}`);
      await browser.close();
      stopServer();
      process.exit(1);
    }
    await page.waitForTimeout(150);
    const state = await page.evaluate(probe.js);
    rows.push({ key: `${set}/${probe.page}/${probe.block}`, set, probe, state });
    await page.close();
  }
}
await browser.close();

const MARK = { speaks: "  ok  ", waiting: " says ", silent: "SILENT", invents: "INVENT", absent: " gone " };
let set = "";
for (const r of rows) {
  if (r.set !== set) {
    set = r.set;
    console.log(`\n--- ${set} ---`);
  }
  const known = KNOWN.has(r.key) ? "  (known)" : "";
  console.log(`  ${MARK[r.state]}  ${r.probe.page.padEnd(8)} ${r.probe.block}${known}`);
}

const regressions = rows.filter((r) => BAD.has(r.state) && !KNOWN.has(r.key));
const fixed = rows.filter((r) => !BAD.has(r.state) && KNOWN.has(r.key));

console.log("");
if (regressions.length) {
  console.log(`NEW SILENCE (${regressions.length}):`);
  for (const r of regressions) console.log(`  ${r.key}  is ${r.state}`);
}
if (fixed.length) {
  console.log(`FIXED, so delete these lines from KNOWN in emptytest.mjs (${fixed.length}):`);
  for (const r of fixed) console.log(`  "${r.key}",`);
}
if (regressions.length || fixed.length) {
  stopServer();
  process.exit(1);
}

const speaking = rows.filter((r) => r.state === "speaks" || r.state === "waiting").length;
console.log(
  `Empty test passed. ${rows.length} blocks across ${SETS.length} records: ` +
    `${speaking} say something, ${KNOWN.size} are known silent and listed.`
);
stopServer();
