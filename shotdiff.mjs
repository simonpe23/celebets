// PROVES A CHANGE IS INVISIBLE.
//
// Some jobs are supposed to change nothing on screen: moving a value
// into a shared file, pulling a repeated block into one component.
// "It looks the same to me" is not a check, and neither is a pair of
// screenshots a person compares by eye. This script shoots every
// page, then compares the two sets pixel by pixel and says which
// pixels moved.
//
// Written 30 August 2026 for the design system job, which moved the
// Performance previews onto one shared file. It found two real things
// a screenshot review would have missed: the Next dev overlay sitting
// on top of four pages, and a hydration error that only appears when
// a dev server is left running across midnight.
//
// HOW TO USE IT. Two dev servers, one on the old code and one on the
// new, then:
//   node shotdiff.mjs shoot 3001 /tmp/before
//   node shotdiff.mjs shoot 3002 /tmp/after
//   node shotdiff.mjs diff /tmp/before /tmp/after /tmp/marks
// A run against the old code needs a worktree of it:
//   git worktree add /tmp/base HEAD
//
// The old code goes in a git worktree, so the working tree is never
// stashed and nothing can be lost.
//
// WHAT IT CANNOT SEE: anything behind a gesture, and any state it is
// not told to open. The transient states below are opened by hand for
// that reason. Add to them rather than trusting the page shots alone.
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Motion off, cursor off, scrollbar off, and the Next dev overlay
// hidden. Without the last one every page on a dev server that has
// any warning carries a red badge, and every shot differs.
const FREEZE = `*,*::before,*::after{animation:none!important;
  transition:none!important;caret-color:transparent!important}
  ::-webkit-scrollbar{display:none}
  nextjs-portal{display:none!important}`;

// THE LIVE APP, reached through /preview because the real addresses
// need a session. The preview renders the SAME components with made up
// numbers, so this is how Track, Performance, Settings and Research
// get looked at at all. The public pages are here too, because a
// change to globals.css reaches them as well.
//
// Live pages have dark mode, so shoot them in BOTH themes.
const LIVE = [
  ["landing", "/"],
  ["login", "/login"],
  ["about", "/about"],
  ["terms", "/terms"],
  ["privacy", "/privacy"],
  ["demo-check", "/demo/check"],
  ["track", "/preview"],
  ["stats-today", "/preview/performance"],
  ["settings", "/preview/settings"],
  ["research", "/preview/research"],
  ["insights", "/preview/insights"],
  ["connect", "/preview/connect"],
  ["auth", "/preview/auth"],
];

// The six Performance previews, at both widths.
const PAGES = [
  ["home", "/preview/performance-home"],
  ["lab", "/preview/performance-lab"],
  ["lab-sel", "/preview/performance-lab?sel=" + encodeURIComponent("what~category~Moneyline")],
  ["totals", "/preview/performance-totals"],
  ["compare", "/preview/performance-compare"],
  ["bets", "/preview/performance-bets"],
  ["heatmap", "/preview/performance-heatmap"],
];

const SIZES = [
  ["phone", 390, 844],
  ["laptop", 1440, 900],
];

// What a page shot cannot reach: a popup, an open picker, a page in a
// state you have to ask for. Phone width only, since these are the
// same components in the same column.
const STATES = [
  ["explain-lab", "/preview/performance-lab", ['button[aria-label^="What "]']],
  ["explain-totals", "/preview/performance-totals", ['button[aria-label^="What "]']],
  ["explain-heatmap", "/preview/performance-heatmap", ['button[aria-label^="What "]']],
  [
    "explain-compare",
    "/preview/performance-compare?sel=" +
      encodeURIComponent("sport~plain~Football|sport~plain~Basketball"),
    ['button[aria-label^="What "]'],
  ],
  ["period-lab", "/preview/performance-lab", ['text="All time"']],
  ["period-totals", "/preview/performance-totals", ['text="All time"']],
  [
    "lab-two",
    "/preview/performance-lab?sel=" +
      encodeURIComponent("sport~plain~Football|sport~plain~Basketball"),
    [],
  ],
  [
    "bets-sel",
    "/preview/performance-bets?sel=" + encodeURIComponent("what~category~Moneyline"),
    [],
  ],
  ["bets-empty", "/preview/performance-bets?period=today", []],
  ["totals-month", "/preview/performance-totals?period=month", []],
];

async function shoot(port, out, theme, set) {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(launchOpts());
  const base = `http://localhost:${port}`;
  const open = async (width, height) => {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
      colorScheme: theme,
    });
    // THE CLOCK IS PINNED, and it has to be.
    //
    // The Performance chart reads `new Date()` after it mounts and
    // plots up to that moment, so two runs a minute apart draw two
    // slightly different charts. Without this, today's /stats reported
    // about 1,800 changed pixels against ITSELF and no comparison
    // meant anything.
    await page.clock.setFixedTime(new Date("2026-08-31T12:00:00Z"));
    return page;
  };

  if (set === "live") {
    for (const [size, width, height] of SIZES) {
      for (const [name, url] of LIVE) {
        const page = await open(width, height);
        await page.goto(base + url, { waitUntil: "networkidle" });
        await page.addStyleTag({ content: FREEZE });
        await page.waitForTimeout(1600);
        await page.screenshot({
          path: `${out}/${name}-${size}-${theme}.png`,
          fullPage: true,
        });
        await page.close();
        console.log(`shot ${name}-${size}-${theme}`);
      }
    }
    await browser.close();
    return;
  }

  for (const [size, width, height] of SIZES) {
    for (const [name, url] of PAGES) {
      const page = await open(width, height);
      await page.goto(base + url, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: FREEZE });
      await page.waitForTimeout(1400);
      await page.screenshot({ path: `${out}/${name}-${size}.png`, fullPage: true });
      await page.close();
      console.log(`shot ${name}-${size}`);
    }
  }

  for (const [name, url, clicks] of STATES) {
    const page = await open(390, 844);
    await page.goto(base + url, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: FREEZE });
    await page.waitForTimeout(900);
    for (const sel of clicks) {
      if ((await page.locator(sel).count()) > 0) await page.locator(sel).first().click();
      await page.waitForTimeout(500);
    }
    await page.addStyleTag({ content: FREEZE });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/state-${name}.png`, fullPage: true });
    await page.close();
    console.log(`shot state-${name}`);
  }
  await browser.close();
}

async function diff(a, b, marks) {
  if (marks) mkdirSync(marks, { recursive: true });

  // AN EMPTY SET IS NOT A MATCH. Caught 2 September 2026: a shoot
  // failed because its dev server had died, leaving nothing in the
  // "before" folder, and this reported "IDENTICAL. Nothing on screen
  // moved." A check that says all-clear when it compared nothing is
  // the most dangerous kind, because it is the one you quote back to
  // the owner.
  const list = (dir) => readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
  const inA = list(a);
  const inB = list(b);
  if (inA.length === 0 || inB.length === 0) {
    console.log(
      `Nothing to compare: ${inA.length} shots in ${a}, ${inB.length} in ${b}.\n` +
        "A shoot failed, most likely because its dev server was not up."
    );
    process.exit(1);
  }
  if (inA.length !== inB.length) {
    console.log(
      `The two sets are different sizes: ${inA.length} against ${inB.length}. ` +
        "One of the shoots did not finish."
    );
    process.exit(1);
  }
  const browser = await chromium.launch(launchOpts());
  const page = await browser.newPage();
  let bad = 0;
  for (const name of inA) {
    const load = (dir) =>
      "data:image/png;base64," + readFileSync(`${dir}/${name}`).toString("base64");
    const r = await page.evaluate(async ([sa, sb]) => {
      const img = (src) =>
        new Promise((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = src;
        });
      const [ia, ib] = await Promise.all([img(sa), img(sb)]);
      if (ia.width !== ib.width || ia.height !== ib.height)
        return { size: `${ia.width}x${ia.height} vs ${ib.width}x${ib.height}` };
      const pixels = (im) => {
        const cv = document.createElement("canvas");
        cv.width = im.width;
        cv.height = im.height;
        const cx = cv.getContext("2d");
        cx.drawImage(im, 0, 0);
        return cx.getImageData(0, 0, im.width, im.height);
      };
      const da = pixels(ia).data;
      const db = pixels(ib).data;
      const mark = document.createElement("canvas");
      mark.width = ia.width;
      mark.height = ia.height;
      const mc = mark.getContext("2d");
      mc.drawImage(ia, 0, 0);
      const md = mc.getImageData(0, 0, ia.width, ia.height);
      let diff = 0;
      let worst = 0;
      let firstY = -1;
      for (let i = 0; i < da.length; i += 4) {
        const d = Math.max(
          Math.abs(da[i] - db[i]),
          Math.abs(da[i + 1] - db[i + 1]),
          Math.abs(da[i + 2] - db[i + 2])
        );
        // A tolerance of 2 out of 255, so a font renderer rounding a
        // subpixel differently is not reported as a design change.
        if (d > 2) {
          diff++;
          if (d > worst) worst = d;
          const y = Math.floor(i / 4 / ia.width);
          if (firstY < 0 || y < firstY) firstY = y;
          md.data[i] = 255;
          md.data[i + 1] = 0;
          md.data[i + 2] = 255;
        }
      }
      mc.putImageData(md, 0, 0);
      return {
        total: (da.length / 4) | 0,
        diff,
        worst,
        firstY,
        png: diff ? mark.toDataURL("image/png") : null,
      };
    }, [load(a), load(b)]);

    if (r.size) {
      console.log(`SIZE  ${name}  ${r.size}`);
      bad++;
    } else if (r.diff === 0) {
      console.log(`SAME  ${name}`);
    } else {
      const pct = ((r.diff / r.total) * 100).toFixed(4);
      console.log(
        `DIFF  ${name}  ${r.diff} px (${pct}%)  worst channel ${r.worst}  from row ${r.firstY}`
      );
      bad++;
      if (marks && r.png)
        writeFileSync(`${marks}/diff-${name}`, Buffer.from(r.png.split(",")[1], "base64"));
    }
  }
  await browser.close();
  if (bad) {
    console.log(`\n${bad} file(s) differ. The magenta pixels in ${marks ?? "(no out dir)"} are the change.`);
    process.exit(1);
  }
  console.log("\nIDENTICAL. Nothing on screen moved.");
}

const [mode, ...rest] = process.argv.slice(2);
if (mode === "shoot") {
  const [port, out, theme, set] = rest;
  if (!port || !out) {
    console.error(
      "usage: node shotdiff.mjs shoot <port> <out dir> [light|dark] [perf|live]"
    );
    process.exit(2);
  }
  await shoot(port, out, theme === "dark" ? "dark" : "light", set === "live" ? "live" : "perf");
} else if (mode === "diff") {
  const [a, b, marks] = rest;
  if (!a || !b) {
    console.error("usage: node shotdiff.mjs diff <dir a> <dir b> [marks dir]");
    process.exit(2);
  }
  await diff(a, b, marks);
} else {
  console.error("usage: node shotdiff.mjs shoot <port> <dir> | diff <dir a> <dir b> [marks]");
  process.exit(2);
}
