// SITE CHECK. Crawls every page the public can reach and reports
// everything that is broken, in both themes.
//
// Why this exists: after the rename the owner spent one minute looking
// at four pages and found five mistakes. Finding them by eye does not
// scale and it makes him do the checking. `npm run check` proves the
// code compiles and obeys the design system; it cannot tell you a page
// 500s, an image is missing, a link is dead, or the old brand is still
// on screen in text that was assembled at runtime.
//
// It reads the RENDERED page, so it catches what grep cannot: copy
// built from variables, text inside components, alt attributes, page
// titles, and link targets.
//
// Run it against a dev server: node sitecheck.mjs 3105
import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";

// Takes a port for a dev server, or a full address for the real site:
//   node sitecheck.mjs 3105
//   node sitecheck.mjs https://actuals.cc
// Run it against the live site after every deploy. That is the version
// the owner actually looks at.
const ARG = process.argv[2] ?? "3105";
const BASE = ARG.startsWith("http") ? ARG.replace(/\/$/, "") : `http://localhost:${ARG}`;

// Everything a logged out visitor can reach. /demo/check is the demo
// link page knocked with a wrong code on purpose: it must RENDER its
// "not active" state, never redirect to /login and never 500. The
// real code is only in Vercel, so the working link cannot be tested
// from here, but the door's failure mode can.
const PUBLIC = ["/", "/login", "/terms", "/privacy", "/about", "/demo/check"];
// The password era's addresses. They must land on /login (redirects in
// next.config.ts), because old bookmarks and old emailed links still
// point at them.
const OLD_AUTH = ["/signup", "/forgot-password", "/reset-password"];
// These need a session. They must REDIRECT, not error: that is the
// login gate working, and a 500 here would be a real bug.
const GATED = ["/app", "/stats", "/settings", "/recommendations", "/insights", "/transactions", "/connect"];

// The logged in screens, reached without a session. They render the
// SAME components with made up data, so this is how Track, Performance,
// Settings and Research get checked at all. Dev server only: /preview
// is gitignored, so it never reaches the real site.
const PREVIEW = [
  "/preview",
  "/preview/performance",
  "/preview/performance-home",
  "/preview/performance-lab",
  "/preview/performance-totals",
  "/preview/performance-compare",
  "/preview/performance-heatmap",
  "/preview/performance-bets",
  // The size decision page, phase 2. Temporary: delete both this line
  // and the page once he has chosen a scale.
  "/preview/scale",
  "/preview/settings",
  "/preview/research",
  "/preview/insights",
  "/preview/auth",
  "/preview/connect",
  // THE FIRST DAYS, added 2 September 2026 for the silence job. The
  // index plus the two extremes: an account that has done nothing, and
  // one with ten settled bets. `emptytest.mjs` walks all six records
  // and every view; these three are here so the ordinary checks
  // (sideways scroll, the edge rule, broken images) cover them too.
  "/preview/firstbets",
  "/preview/firstbets/none",
  "/preview/firstbets/none/track",
  "/preview/firstbets/ten",
];

// Anything matching this must not appear in rendered text or in a URL.
// The stem, not the word, so a derivative like CeleBOT cannot slip past
// the way it did in August 2026.
const OLD_BRAND = /cele/i;

// Preview routes only exist on a dev server.
const LOCAL = !ARG.startsWith("http");
const RENDERED = LOCAL ? [...PUBLIC, ...PREVIEW] : PUBLIC;

const problems = [];
// Counted rather than calculated. The old line multiplied a guess by
// two and went wrong the moment phase 3 added a third width, which is
// exactly the sort of number that quietly lies for months.
let loads = 0;
const note = (where, what) => problems.push(`${where}\n      ${what}`);

// Start a dev server if nothing is already listening, and stop it at
// the end. One command, no sequence to remember, because a check that
// needs three steps is a check that gets skipped.
let spawned = null;
async function reachable() {
  try {
    const r = await fetch(BASE, { method: "HEAD" });
    return r.status < 500;
  } catch {
    return false;
  }
}
if (LOCAL && !(await reachable())) {
  const { spawn } = await import("node:child_process");
  const port = BASE.split(":").pop();
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

const browser = await chromium.launch(launchOpts());

// Phone first, because the app is for phones: every page, both
// themes. Then the public pages again at laptop width, where the
// landing layout is completely different. The squashed-logo bug
// lived exactly in that gap: correct at one width, warped at the
// other.
// PHASE 3 OF THE SIZE AND LAYOUT JOB, 31 August 2026. His words:
// "Nothing above phone width has ever been checked. Not by a script,
// not by me." He was right, and this list was the reason: the laptop
// pass ran the six PUBLIC pages only, so Track, Performance, Settings
// and Research had never been loaded above phone width by anything.
//
// 320 is the narrowest phone still in use, an iPhone SE. Every page
// overflowed it before phase 3, by 22 to 52px, and no screenshot
// round ever caught it because a screenshot is taken at the page's
// own width, not the phone's.
//
// THE TALL PASS exists for the centring. Since 31 August 2026 a page
// shorter than its window is centred rather than pinned to the top
// with the bar stranded at the bottom, and that layout only happens
// at a height no page fills. Without this pass every check below
// would run on pages that scroll, where centring does nothing.
const PASSES = [
  { width: 320, height: 800, label: "small phone", paths: null },
  { width: 393, height: 852, label: "phone", paths: null },
  { width: 1512, height: 800, label: "laptop", paths: null },
  { width: 1512, height: 1600, label: "tall window", paths: null },
];

for (const theme of ["light", "dark"]) {
  for (const pass of PASSES) {
  const ctx = await browser.newContext({
    viewport: { width: pass.width, height: pass.height },
    colorScheme: theme,
  });

  for (const path of pass.paths ?? [...RENDERED, ...GATED, ...OLD_AUTH]) {
    loads += 1;
    const page = await ctx.newPage();
    const errors = [];
    const failedRequests = [];
    // /demo/check knocks on /api/demo-login with a wrong code ON
    // PURPOSE, and the browser logs every non-2xx response as a
    // console error. That one rejection is the door working, so it is
    // not a finding. Everything else on the page still is.
    const expectedKnock =
      path === "/demo/check" && /the server responded with a status of (401|404|500)/;
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      if (expectedKnock && expectedKnock.test(m.text())) return;
      errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(String(e)));
    // Next.js prefetches the next page's data in the background and
    // cancels it the moment you navigate. Those cancellations are normal
    // and say nothing about the page, so they are not failures.
    const isPrefetch = (url) => url.includes("_rsc=");

    page.on("requestfailed", (r) => {
      if (!isPrefetch(r.url())) failedRequests.push(r.url());
    });
    page.on("response", (r) => {
      // An asset the page asked for and did not get.
      if (r.status() >= 400 && !r.url().includes("/api/") && !isPrefetch(r.url())) {
        failedRequests.push(`${r.status()} ${r.url()}`);
      }
    });

    const where = `${path}  (${theme}, ${pass.label})`;
    let res;
    try {
      res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e) {
      note(where, `page did not load: ${e.message.split("\n")[0]}`);
      await page.close();
      continue;
    }

    const landed = new URL(page.url()).pathname;
    const status = res?.status() ?? 0;

    if (status >= 500) note(where, `server error ${status}`);
    if (RENDERED.includes(path)) {
      if (status === 404) note(where, "404, this page should render");
      if (landed !== path) note(where, `redirected to ${landed}, should have stayed`);
    } else if (OLD_AUTH.includes(path)) {
      if (landed !== "/login")
        note(where, `an old auth address landed on ${landed}, should be /login`);
    } else if (landed === path) {
      note(where, "a logged out visitor was NOT redirected, the login gate is open");
    }

    // Only inspect the content of pages that are meant to render.
    if (RENDERED.includes(path)) {
      const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
      const title = await page.title();

      if (OLD_BRAND.test(text)) {
        const hit = text.match(/\S*cele\S*/i)?.[0];
        note(where, `old brand on screen: "${hit}"`);
      }
      if (OLD_BRAND.test(title)) note(where, `old brand in the tab title: "${title}"`);
      if (!title.trim()) note(where, "the browser tab has no title");

      // Links: dead internal targets, and any href still on the old brand.
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
      for (const href of new Set(hrefs)) {
        if (!href) continue;
        if (OLD_BRAND.test(href)) note(where, `link still points at the old brand: ${href}`);
        if (href.startsWith("/") && !href.startsWith("//")) {
          const r = await ctx.request.get(BASE + href).catch(() => null);
          if (!r) note(where, `internal link could not be reached: ${href}`);
          else if (r.status() >= 400) note(where, `internal link is broken (${r.status()}): ${href}`);
        }
      }

      // SIDEWAYS SCROLL. A page wider than the phone it is on drags
      // left and right under the thumb, and a screenshot of it looks
      // perfectly fine because the shot is taken at the page's own
      // width, not the phone's. Only a script sees this. Added 29
      // August 2026 after the Performance menu was found overflowing
      // a 320px phone by 52px, having passed every screenshot round.
      const sideways = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      if (sideways > 1)
        note(where, `page scrolls sideways by ${sideways}px`);

      // THE EDGE RULE. Content and the tab bar must start and end on
      // the same line, on every page and at every width.
      //
      // Added 31 August 2026, phase 3 of the size and layout job. The
      // three ordinary pages had always agreed with the bar. The six
      // Performance pages never did: each carried its own inset off
      // the mockup it was measured from, 11px on Totals, 14 on Home
      // and Lab, 15 on the Heat Map and All Bets, 20 on Compare. On a
      // phone Totals' cards stuck out 5px PAST the bar, on a laptop
      // they sat 11px inside it, and the sign flipped between the
      // two. Nine screenshot rounds never showed it, because a few
      // pixels at the edge of a card is exactly what an eye forgives
      // and a ruler does not.
      const edges = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        if (!nav) return null;
        const bar = nav.querySelector("div");
        if (!bar) return null;
        const b = bar.getBoundingClientRect();
        let L = Infinity;
        let R = -Infinity;
        for (const e of document.querySelectorAll("*")) {
          if (e === nav || nav.contains(e)) continue;
          const r = e.getBoundingClientRect();
          if (r.width < 40 || r.height < 8) continue;
          const st = getComputedStyle(e);
          // Only boxes that actually paint an edge. Invisible wrappers
          // are allowed to be any width.
          if (
            st.backgroundColor === "rgba(0, 0, 0, 0)" &&
            st.boxShadow === "none" &&
            st.borderTopWidth === "0px"
          )
            continue;
          // The page's own full width backdrop is not content.
          if (r.width > window.innerWidth - 4) continue;
          // A sideways scroller is allowed to run past the edge: that
          // is what makes it scroll. Its own box still has to fit.
          let p = e;
          let inScroller = false;
          while (p && p !== document.body) {
            const ps = getComputedStyle(p);
            if (ps.overflowX === "auto" || ps.overflowX === "scroll" || ps.overflowX === "hidden") {
              inScroller = true;
              break;
            }
            p = p.parentElement;
          }
          if (inScroller) continue;
          L = Math.min(L, r.left);
          R = Math.max(R, r.right);
        }
        if (!Number.isFinite(L)) return null;
        return { l: Math.round(L - b.left), r: Math.round(b.right - R) };
      });
      if (edges && (edges.l !== 0 || edges.r !== 0))
        note(
          where,
          `content does not line up with the tab bar: ${edges.l}px on the left, ${edges.r}px on the right`
        );

      // NOTHING MAY SIT ABOVE THE TOP OF THE PAGE. A page centred in
      // a FIXED height container overflows equally at both ends, and
      // the part above y=0 is unreachable: no amount of scrolling
      // brings it back.
      //
      // It cannot happen today, because PAGE_FRAME is `min-h-svh` and
      // so always grows to its content. This guards the day someone
      // makes that a fixed height, which is a one character change
      // with no other visible effect.
      const clipped = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        if (!nav) return null;
        const frame = nav.parentElement;
        let top = Infinity;
        let what = "";
        for (const e of frame.querySelectorAll("*")) {
          if (nav.contains(e)) continue;
          if (!(e.textContent || "").trim()) continue;
          const r = e.getBoundingClientRect();
          if (r.height < 6) continue;
          if (r.top < top) {
            top = r.top;
            what = (e.textContent || "").trim().slice(0, 30);
          }
        }
        return Number.isFinite(top) ? { top: Math.round(top), what } : null;
      });
      if (clipped && clipped.top < -1)
        note(
          where,
          `content is cut off above the top of the window by ${-clipped.top}px and cannot be scrolled to: "${clipped.what}"`
        );

      // Images that were requested but never arrived, and images with
      // no alt text, which is both an accessibility and a copy problem.
      const brokenImgs = await page.$$eval("img", (imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"))
      );
      for (const src of brokenImgs) note(where, `image did not load: ${src}`);

      // An image squeezed out of shape by its layout. A flex row
      // compresses a fixed-height image sideways rather than
      // overflowing, so the distortion is silent: this exact failure
      // shipped the squashed logo to the owner's phone.
      const warped = await page.$$eval("img", (imgs) =>
        imgs
          .filter((i) => i.complete && i.naturalWidth > 0)
          .map((i) => {
            // object-cover and friends CROP to the box, they never
            // warp, and the phone mockups use exactly that. Only the
            // default fill mode stretches.
            if (getComputedStyle(i).objectFit !== "fill") return null;
            const r = i.getBoundingClientRect();
            if (r.width < 8 || r.height < 8) return null;
            const want = i.naturalWidth / i.naturalHeight;
            const got = r.width / r.height;
            return Math.abs(got - want) / want > 0.04
              ? `${i.getAttribute("src")} drawn ${got.toFixed(2)}:1, file is ${want.toFixed(2)}:1`
              : null;
          })
          .filter(Boolean)
      );
      for (const m of warped) note(where, `image squeezed out of shape: ${m}`);

      const altBrand = await page.$$eval("img[alt]", (imgs) =>
        imgs.map((i) => i.getAttribute("alt")).filter((a) => /cele/i.test(a ?? ""))
      );
      for (const a of altBrand) note(where, `old brand in image alt text: "${a}"`);
    }

    for (const e of [...new Set(errors)]) note(where, `console error: ${e.slice(0, 160)}`);
    for (const f of [...new Set(failedRequests)]) note(where, `failed request: ${f.slice(0, 160)}`);

    await page.close();
  }
  await ctx.close();
  }
}

await browser.close();
stopServer();

if (problems.length === 0) {
  console.log(
    `Site check passed. ${loads} page loads across ${PASSES.length} widths and both themes, nothing broken.`
  );
} else {
  console.log(`Site check found ${problems.length} problem(s):\n`);
  for (const p of problems) console.log("  " + p + "\n");
  process.exit(1);
}
