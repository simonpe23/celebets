// Checks the app against the design system in CLAUDE.md.
// Run it before every screenshot: node design-check.mjs
//
// This exists because font and spacing drift cost the owner six rounds
// of review. A machine should catch this, not a person.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".tsx")) files.push(path);
  }
})("src");

const problems = [];
const note = (file, line, message) =>
  problems.push(`${file}:${line}  ${message}`);

// Files allowed to use the compact tier, because they hold dense rows
// of actions inside a bet card.
const COMPACT_OK = ["LiveBets.tsx", "BetHistory.tsx", "TransactionsList.tsx"];

// Colors that are allowed to appear as raw hex, and what each is for.
const ALLOWED_HEX = new Set([
  "#4F7A57", // button green
  "#3F6446", // button green, pressed
  "#58287F", // purple, recommendations and wordmark
  "#431E63", // purple, pressed
  "#A97FD0", // purple on dark
  "#F2F4F7", // light card
  "#151A28", // dark card
  "#1A2032", // dark popup
  "#0B0D14", // dark page
  "#101322", // chart panel
  "#34D399", // chart green
  "#FB7185", // chart red
  "#7C3FAF", // wordmark gradient
  "#3A1857", // wordmark gradient
  "#FFFFFF", // svg strokes and the theme-color meta tag
  "#0A0A0A", // theme-color meta tag
  "#4285F4", // Google logo, fixed by Google's brand rules
  "#34A853", // Google logo
  "#FBBC05", // Google logo
  "#EA4335", // Google logo
]);

// The preview folder is local only and never ships.
const SKIP = ["preview"];

for (const file of files) {
  if (SKIP.some((dir) => file.includes(`/${dir}/`))) continue;
  const short = file.split("/").pop();
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    const n = i + 1;

    // 1. The compact tier belongs only inside bet card rows.
    if (line.includes("text-xs font-semibold") && !COMPACT_OK.includes(short)) {
      note(file, n, "compact tier (text-xs font-semibold) outside a bet card");
    }

    // 2. Buttons and chips must not invent their own size.
    const isBadge = line.includes("rounded-full") && line.includes("px-2.5");
    if (
      line.includes("text-xs font-bold") &&
      !line.includes("uppercase") &&
      !isBadge
    ) {
      note(file, n, "text-xs font-bold: buttons are text-sm font-bold");
    }
    if (line.includes("text-sm font-medium") && line.includes("rounded")) {
      note(file, n, "button using font-medium: buttons are font-bold");
    }

    // 3. Muted text must carry its dark counterpart.
    if (
      line.includes("text-neutral-500") &&
      !line.includes("dark:text-neutral-400")
    ) {
      note(file, n, "text-neutral-500 without dark:text-neutral-400");
    }

    // 4. No stray brand colors.
    for (const hex of line.match(/#[0-9A-Fa-f]{6}/g) ?? []) {
      if (!ALLOWED_HEX.has(hex.toUpperCase().replace("#", "#"))) {
        const known = [...ALLOWED_HEX].some(
          (h) => h.toLowerCase() === hex.toLowerCase()
        );
        if (!known) note(file, n, `unknown color ${hex}, not in the system`);
      }
    }

    // 5. The tile must come from the shared component.
    if (
      line.includes("text-[10px] font-bold uppercase tracking-widest") &&
      short !== "StatTile.tsx" &&
      short !== "StatsView.tsx" &&
      short !== "ProfitPanel.tsx"
    ) {
      note(file, n, "tile label copied instead of using StatTile");
    }
  });
}

if (problems.length === 0) {
  console.log("Design check passed.");
} else {
  console.log(`Design check found ${problems.length} problem(s):\n`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
