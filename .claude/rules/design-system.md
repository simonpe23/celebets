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
- **Never change a font without asking.** Family, weight AND size. Words
  are Geist, numbers are Inter Tight through `font-money` at weight 500
  on hero figures. `design-check` rule 8 fails the build if this moves.
  The faces are under review (owner reopened them 26 August 2026, the
  mockup designer is proposing new ones), but the build keeps these
  until he approves replacements.
- **`font-medium` does not exist here.** Only normal, semibold, bold.
- **Purple means two things, and only two.** Something you press, AND
  the profit chart line (with its gradient). The line was ruled back to
  purple on 26 August 2026. Nothing else: no purple links, badges or
  decoration.
- **Pressable purple:** Primary button,
  active tab, selected chip, primary capture tile. Nothing else.
- **Green and red mean money moved.** Never an action colour. The one
  survivor is the Won button on a pending pick, `#16A34A`.
- **Amber is the insight accent** and marks insights only: the sparkle,
  the AI badge, the trophy. Never a button, never a link.
- **Links are ink plus a chevron.** "View all ›", never a coloured link.
- **Buttons are squared.** `rounded-md` primary. Not pills.
- **Cards are defined by their edge, not a shadow.**
- **Never use em dashes**, including in UI copy and comments.

## Banned vocabulary in user-facing copy

wallet, deposit, withdrawal, withdraw, bankroll.

Say **Tracking Balance, Set Tracking Balance, Add, Remove, Balance
history.** The database columns keep the old names; only what a person
reads is checked. `design-check` rule 7 enforces this.

## Before showing the owner any UI change

Use the `ui-change` skill. It has the full pre-flight.
