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
const COMPACT_OK = [
  "LiveBets.tsx",
  "BetHistory.tsx",
  "TransactionsList.tsx",
  // The Remove control on a parlay leg row is the same dense pattern.
  "NewBetForm.tsx",
];

// Colors that are allowed to appear as raw hex, and what each is for.
const ALLOWED_HEX = new Set([
  "#7C3AED", // action purple, from the owner's mockups
  "#6D28D9", // action purple, pressed
  "#A78BFA", // purple on dark surfaces, and the wordmark gradient
  "#5B21B6", // wordmark gradient, deep end
  "#16A34A", // the Won settle button only, see rule 4b
  "#15803D", // Won settle button, pressed
  "#3B82F6", // capture tile icon, camera
  "#F97316", // capture tile icon, pencil
  "#22C55E", // capture tile icon, connect
  "#151022", // dark card
  "#1D1530", // dark popup
  "#0B0714", // dark page
  "#100A1E", // dark tab bar
  "#17102A", // chart panel
  "#F6F5FA", // light page
  "#34D399", // chart green
  "#FB7185", // chart red
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

    // A pill that states a fact is not a control, so it is not bound by
    // the button tiers. Both rules below share this test.
    const isBadge = line.includes("rounded-full") && line.includes("px-2.5");

    // 1. The compact tier belongs only inside bet card rows.
    if (
      line.includes("text-xs font-semibold") &&
      !COMPACT_OK.includes(short) &&
      !isBadge
    ) {
      note(file, n, "compact tier (text-xs font-semibold) outside a bet card");
    }

    // 2. Buttons and chips must not invent their own size.
    // A numeral is not a button, and it carries the numeral face, which
    // no button in the app does.
    const isNumeral = line.includes("font-money");
    if (
      line.includes("text-xs font-bold") &&
      !line.includes("uppercase") &&
      !isBadge &&
      !isNumeral
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

    // 4b. Green stopped being the action color in August 2026. Purple
    // #58287F is the button you press. The one green button left is
    // Won on a pending pick, which is an outcome, not an action.
    if (/#16A34A|#15803D/.test(line) && short !== "LiveBets.tsx") {
      note(file, n, "green #16A34A outside the Won button, actions are purple");
    }

    // 5. The card surface comes from CARD in src/lib/ui.ts. Thirteen
    // files once repeated it, and it drifted.
    if (line.includes("bg-[#F2F4F7]") || line.includes("shadow-[0_6px_20px")) {
      note(file, n, "card surface hand-rolled, import CARD from @/lib/ui");
    }

    // 6. The tile must come from the shared component.
    if (
      line.includes("text-[10px] font-bold uppercase tracking-widest") &&
      short !== "MicroLabel.tsx"
    ) {
      note(file, n, "micro label copied instead of using MicroLabel");
    }
  });
}

// 6. THE SWEEP CHECK.
//
// This exists because the owner had to ask three times whether a font
// change had been applied everywhere. Showing a preview where place A
// is updated and place B is not wastes his time and destroys trust in
// the comparison.
//
// Every money value must either carry the numeral face, or be listed
// below as prose. Nothing may be left undecided.
const PROSE = [
  // Money inside a sentence keeps the body font. Switching face mid
  // sentence reads as a bug, not a design.
  "stake counts as a win",
  "pays",
  'at{" "}',
  "New totals",
  "Cashed out for",
  "Enter a valid amount",
  // The hero sub-line reads as a sentence: "+12.4% ROI on $840 staked".
  "% ROI on",
  // The in play panel speaks in sentences too.
  "riding, across",
  "Paste a slip below",
];

for (const file of files) {
  if (SKIP.some((dir) => file.includes(`/${dir}/`))) continue;
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    if (!/formatMoney\(|formatSignedMoney\(/.test(line)) return;

    // Look at the element around this value.
    const around = lines.slice(Math.max(0, i - 10), i + 3).join(" ");
    if (
      around.includes("font-money") ||
      around.includes("HeroMoney") ||
      // StatTile takes the value as a prop and carries the face itself.
      around.includes("StatTile")
    ) {
      return;
    }
    if (PROSE.some((p) => around.includes(p))) return;

    note(
      file,
      i + 1,
      "money value with no numeral face and not marked as prose"
    );
  });
}

// 7. THE VOCABULARY CHECK.
//
// Celebet never holds money, so it never speaks like a bank. The owner
// ruled out this vocabulary: "No wallet. No deposit. No withdraw.
// That's finance language. The feature is about tracking performance,
// not banking." The words are Tracking Balance, Set Tracking Balance,
// Add and Remove, Balance history.
//
// Only text a user reads is checked. The database columns are still
// named deposit and withdrawal, and renaming those would be a migration
// with no user-visible gain.
const BANNED_WORDS = /\b(wallet|deposits?|withdrawals?|withdraw|bankroll)\b/i;

for (const file of files) {
  if (SKIP.some((dir) => file.includes(`/${dir}/`))) continue;
  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    if (/^import\s|from\s+["']/.test(trimmed)) return;
    if (/\.from\(|type:|"deposit"|"withdrawal"|const |let |interface /.test(line))
      return;

    // Copy shows up three ways: between JSX tags on one line, as a bare
    // prose line inside a JSX block, or inside a quoted sentence.
    const jsxText = line.match(/>([^<>{}]*[A-Za-z][^<>{}]*)</)?.[1] ?? "";
    const bareProse = /^[^<>{}()=[\]`$]*[A-Za-z][^<>{}()=[\]`$]*$/.test(trimmed)
      ? trimmed
      : "";
    const quoted = (line.match(/"[^"]* [^"]*"/g) ?? []).join(" ");
    const copy = `${jsxText} ${bareProse} ${quoted}`;

    if (BANNED_WORDS.test(copy)) {
      const word = copy.match(BANNED_WORDS)[0];
      note(
        file,
        i + 1,
        `"${word}" is finance language, use the balance vocabulary`
      );
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
