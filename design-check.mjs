// Checks the app against the design system in CLAUDE.md.
//
// This exists because font and spacing drift cost the owner six rounds
// of review. A machine should catch this, not a person.
//
// DO NOT run this alone. Run `npm run check`, which is this plus tsc
// plus a real production build. Vercel emailed the owner about failed
// deployments for a whole session because this file and tsc both
// passed while `next build` did not: ESLint's rules-of-hooks only runs
// during the build. Green here is not green.

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
  // The brand purple is NOT here. It lives in globals.css as four
  // custom properties and is reached through bg-brand-top and friends.
  // Rule 8b fails on any brand hex written by hand.
  "#EF4444", // outcome pill, Lost
  "#16A34A", // the Won settle button only, see rule 4b
  "#15803D", // Won settle button, pressed
  // The insight accent, the app's one secondary color. Warm amber
  // against the navy, and it marks insights only: the sparkle, the AI
  // badge, the trophy. Never a button, never a link.
  "#B45309", // insight accent on light, and the trophy's deep end
  "#FBBF24", // insight accent on dark, and the trophy's lit edge
  "#F59E0B", // the trophy gradient's middle
  "#94A3B8", // a sparkline that is not money, like a win rate
  "#3B82F6", // capture tile icon, camera
  "#F97316", // capture tile icon, pencil
  "#22C55E", // outcome pill Won, and the connect tile icon
  // The dark surfaces, sampled from the owner's mockup. It is a navy
  // near-black, not the neutral grey-black the build used to have.
  "#0E1228", // dark card
  "#161D38", // dark popup
  "#04081B", // dark page
  "#0C1125", // dark tab bar and other raised surfaces
  "#080D20", // chart panel
  // The tab bar has its own shade, a step off the page in both themes,
  // because white on #F7F7FB made it disappear.
  "#ECECF3", // tab bar, light
  "#111731", // tab bar, dark
  "#F7F7FB", // light page
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
    // no button in the app does. Neither is a caption sized inline
    // link, which is why leading-tight excuses a line here: it is set
    // to wrap inside a card corner, not to be pressed like a button.
    const isNumeral = line.includes("font-money");
    const isInlineLink = line.includes("leading-tight");
    if (
      line.includes("text-xs font-bold") &&
      !line.includes("uppercase") &&
      !isBadge &&
      !isNumeral &&
      !isInlineLink
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

    // 4. No stray brand colors. Comments are exempt: the notes name
    // retired values on purpose, so that the reason a color was
    // dropped survives next to the code.
    const isComment = line.trim().startsWith("//") || line.trim().startsWith("*");
    for (const hex of isComment ? [] : (line.match(/#[0-9A-Fa-f]{6}/g) ?? [])) {
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
    if (line.includes("bg-[#F2F4F7]") || line.includes("shadow-[0_10px_30px")) {
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
  // Start fresh explains what the box is starting from.
  "Your balance today is",
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

// 8b. THE ONE JOB RULE, AND ONE PLACE FOR THE COLOR.
//
// The owner, August 2026: "the purple color is too overwhelming, it's
// just too much purple, everywhere." Twelve purple objects sat on the
// Track page's first screen, because purple was doing seven jobs:
// brand, button, active tab, link, badge, data line and decoration.
// Purple now means one thing, something you press.
//
// The brand color also lives in exactly one place now, as four custom
// properties in globals.css, reached through bg-brand-top,
// text-brand-mark and friends. Changing the app's action color is four
// lines. It used to be 45 edits across 17 files, which is a sweep
// nobody wins: miss one and two shades ship together.
//
// So a raw brand hex anywhere in src outside globals.css means someone
// pinned a color in place and the next change will miss it.
const BRAND_HEX = /#5525C6|#4915AD|#3D0F94|#7C3AED|#9A57FC|#5B21B6|#4C1D95|#3B1578|#6D28D9/i;

for (const file of files) {
  if (SKIP.some((dir) => file.includes(`/${dir}/`))) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    if (BRAND_HEX.test(line)) {
      note(
        file,
        i + 1,
        "brand color written by hand. It lives in globals.css: use " +
          "bg-brand-top, to-brand-bottom, active:to-brand-press or " +
          "text-brand-mark."
      );
    }
  });
}

// 8. THE FONT LOCK.
//
// "Don't ever change a font again without my permission." The owner,
// August 2026, after I swapped the numeral face during a rebuild and
// he found it days later on the live site. The weight moved in the
// same edit and went unnoticed for just as long.
//
// These two values are his, not defaults. If a font genuinely looks
// wrong, show him a comparison and let him rule. Changing this check
// to make a font change pass is the same offence as the font change.
const FONT_LOCK = [
  {
    file: "src/app/globals.css",
    pattern: /--font-money:\s*var\(--font-inter-tight\)/,
    what: "the numeral face must be Inter Tight",
  },
  {
    file: "src/components/HeroMoney.tsx",
    pattern: /fontWeight:\s*500/,
    what: "the hero money weight must be 500",
  },
];

for (const lock of FONT_LOCK) {
  const text = readFileSync(lock.file, "utf8");
  if (!lock.pattern.test(text)) {
    note(
      lock.file,
      1,
      `${lock.what}. The owner chose it and asked to be consulted first.`
    );
  }
}

if (problems.length === 0) {
  console.log("Design check passed.");
} else {
  console.log(`Design check found ${problems.length} problem(s):\n`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
