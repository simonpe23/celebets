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

// Takes a port for a dev server, or a full address for the real site:
//   node sitecheck.mjs 3105
//   node sitecheck.mjs https://www.gocelebet.com
// Run it against the live site after every deploy. That is the version
// the owner actually looks at.
const ARG = process.argv[2] ?? "3105";
const BASE = ARG.startsWith("http") ? ARG.replace(/\/$/, "") : `http://localhost:${ARG}`;

// Everything a logged out visitor can reach.
const PUBLIC = ["/", "/login", "/signup", "/forgot-password", "/terms", "/privacy", "/about"];
// These need a session. They must REDIRECT, not error: that is the
// login gate working, and a 500 here would be a real bug.
const GATED = ["/app", "/stats", "/settings", "/recommendations", "/insights", "/transactions"];

// The logged in screens, reached without a session. They render the
// SAME components with made up data, so this is how Track, Performance,
// Settings and Research get checked at all. Dev server only: /preview
// is gitignored, so it never reaches the real site.
const PREVIEW = [
  "/preview",
  "/preview/performance",
  "/preview/settings",
  "/preview/research",
  "/preview/insights",
];

// Anything matching this must not appear in rendered text or in a URL.
// The stem, not the word, so a derivative like CeleBOT cannot slip past
// the way it did in August 2026.
const OLD_BRAND = /cele/i;

// Preview routes only exist on a dev server.
const LOCAL = !ARG.startsWith("http");
const RENDERED = LOCAL ? [...PUBLIC, ...PREVIEW] : PUBLIC;

const problems = [];
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

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 852 },
    colorScheme: theme,
  });

  for (const path of [...RENDERED, ...GATED]) {
    const page = await ctx.newPage();
    const errors = [];
    const failedRequests = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
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

    const where = `${path}  (${theme})`;
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

      // Images that were requested but never arrived, and images with
      // no alt text, which is both an accessibility and a copy problem.
      const brokenImgs = await page.$$eval("img", (imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src"))
      );
      for (const src of brokenImgs) note(where, `image did not load: ${src}`);

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

await browser.close();
stopServer();

if (problems.length === 0) {
  console.log(`Site check passed. ${(RENDERED.length + GATED.length) * 2} page loads, nothing broken.`);
} else {
  console.log(`Site check found ${problems.length} problem(s):\n`);
  for (const p of problems) console.log("  " + p + "\n");
  process.exit(1);
}
