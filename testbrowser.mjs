// WHERE CHROMIUM IS. One answer, for every test script.
//
// The scripts used to each guess: some pinned
// /opt/pw-browsers/chromium-1194 by hand, and the rest fell through to
// Playwright's own lookup. On 1 September 2026 the container's browser
// build changed under us, Playwright looked for a build that was not
// there, and instanttest, jumptest and periodtest all died on launch
// while controlstest and sitecheck ran fine. A test that cannot start
// is worse than a test that fails: it looks like nothing is wrong.
//
// So nothing is pinned any more. This reads what is actually on disk
// and takes the newest build, which survives the next bump.

import { readdirSync, existsSync } from "node:fs";

const ROOT = "/opt/pw-browsers";

export function chromePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM;
  if (!existsSync(ROOT)) return undefined;

  // The full browser first, then the headless shell, newest build of
  // whichever is present. A directory with no build number sorts last
  // on purpose: it is a symlink or a leftover, not a real build.
  const build = (name) => Number(name.split("-").pop()) || 0;
  const candidates = [];
  for (const dir of readdirSync(ROOT)) {
    if (dir.startsWith("chromium-"))
      candidates.push([0, build(dir), `${ROOT}/${dir}/chrome-linux/chrome`]);
    else if (dir.startsWith("chromium_headless_shell-"))
      candidates.push([
        1,
        build(dir),
        `${ROOT}/${dir}/chrome-headless-shell-linux64/chrome-headless-shell`,
      ]);
    else if (dir === "chromium") candidates.push([2, 0, `${ROOT}/chromium`]);
  }

  const found = candidates
    .sort((a, b) => a[0] - b[0] || b[1] - a[1])
    .map((c) => c[2])
    .find((p) => existsSync(p));

  // Undefined lets Playwright try its own lookup, which is right on a
  // laptop with browsers installed the normal way.
  return found;
}

export const launchOpts = () => {
  const executablePath = chromePath();
  return executablePath ? { executablePath } : {};
};
