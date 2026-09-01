---
description: Design system values and vocabulary for any UI file
paths:
  - "src/components/**"
  - "src/app/**/*.tsx"
  - "src/lib/ui.ts"
---

# Design system rules

Full reference: `docs/design-system.md`. The rules that bite:

- **Never restate a design value inline.** Import the component or reuse
  the exact class string. If a value lives in two places, that is the
  bug; fix that first.
- **THERE IS ONE BOTTOM BAR:** `src/components/TabBar.tsx`, four tabs,
  on every page. There were two until 31 August 2026, and they
  disagreed about how many tabs the app has. `design-check` rule 13
  fails the build if a second one appears.
- **THE APP HAS ONE LIST OF TEXT SIZES**, in `src/app/globals.css`:
  11 (`text-xs`), 12 (`text-sm`), 13 (`text-base`), 15 (`text-lg`),
  17 (`text-xl`), 20 (`text-2xl`), 26 (`text-3xl`), 34 (`text-hero`).
  **Never write a size by hand.** `design-check` rule 14 fails the
  build on `text-[Npx]` anywhere in the app or in Performance. Chosen
  by him on 31 August 2026 from three drawn side by side. The public
  pages are exempt and pinned: see `LegalPage.tsx`.
- **Colours, type sizes and corner radii live in three files and
  nowhere else:** `src/app/globals.css` (the app's scale and radii),
  `src/lib/ui.ts` (the live app's repeated class strings) and
  `src/components/performance/ui.ts` (the Performance area).
  `design-check` rule 12 fails the build on a colour or a font written
  inside a page, and on a shared size written by hand.
  **Spacing used once, on one page, is the exception and stays there.**
  Any chat may edit those three files without asking or pausing.
  Today's `/stats` is exempt, by his ruling.
- **Never change a font without asking.** Family, weight AND size. Words
  are Geist, numbers are Inter Tight through `font-money` at weight 500
  on hero figures. `design-check` rule 8 fails the build if this moves.
  The faces are under review (owner reopened them 26 August 2026, the
  mockup designer is proposing new ones), but the build keeps these
  until he approves replacements.
- **`font-medium` does not exist here.** Only normal, semibold, bold.
- **Purple is the brand colour and is NOT restricted to controls.**
  The "one job" rule was withdrawn 26 August 2026: "Purple blends
  through the site." It covers the profit chart line too. Use judgement
  about how much, not a law about meaning.
- **Purple for certain:** primary button, active tab, selected chip,
  primary capture tile, and the profit chart line.
- **Green and red mean money moved.** Never an action colour. The one
  survivor is the Won button on a pending pick, `#16A34A`.
- **Amber is the insight accent** and marks insights only: the sparkle,
  the AI badge, the trophy. Never a button, never a link.
- **Links are ink plus a chevron.** "View all ›", never a coloured link.
- **Buttons are squared.** `rounded-md` primary. Not pills.
- **Cards are defined by their edge, not a shadow.**
- **Never use em dashes**, including in UI copy, comments and docs.
  `design-check` rule 11 fails the build on one, in `.tsx`, `.ts`,
  `.mjs`, `.css` and `.md` alike.
- **The previews are exempt from the COLOUR rules only**, until the new
  palette is approved. Every other rule applies to them in full. See
  `.claude/rules/preview-pages.md`.

## Banned vocabulary in user-facing copy

wallet, deposit, withdrawal, withdraw, bankroll.

Say **Tracking Balance, Set Tracking Balance, Add, Remove, Balance
history.** The database columns keep the old names; only what a person
reads is checked. `design-check` rule 7 enforces this.

## Before showing the owner any UI change

Use the `ui-change` skill. It has the full pre-flight.
