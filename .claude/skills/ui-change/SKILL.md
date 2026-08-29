---
name: ui-change
description: The pre-flight before showing the owner any UI change or screenshot. Use whenever a change touches layout, colour, type, spacing, copy, or anything the owner will look at. Covers the sweep, the check, both themes, both widths, and gesture testing.
---

# Shipping a UI change

The owner should never have to catch a typography or spacing
inconsistency. Finding one is a failure, not feedback.

Work through this in order. Do not skip to the screenshot.

## 1. Change the shared value, not the page

Change it in the shared file: `src/lib/ui.ts`, or the component that
owns it. **If a value lives in two places, that is the bug. Fix that
first.**

## 2. Sweep the whole app

A design change is never finished in one file.

- Grep for the class, colour or value across `src/`. Confirm every hit.
- **List every place the thing appears and decide each one**, including
  the ones that should NOT change. Undecided is not allowed.
- When the change has a pattern (a colour, a font, a size), **add a rule
  to `design-check.mjs`** so the machine catches the next one, not the
  owner. The money font rule is the worked example.

**Why this is non-negotiable:** a preview is a comparison. If place A is
updated and place B is not, the comparison is worthless and the owner
cannot decide anything.

## 3. Change nothing he did not ask for

Alignment, casing, size and colour are product decisions. **Propose
them, do not apply them.** Reverting an unrequested change costs him a
full round trip.

**Fonts need explicit permission every time.** Family, weight and size.

## 4. Run `npm run check`

```
npm run check
```

That is design-check, synctest, tsc, a **real production build**, and
sitecheck. **Never show a screenshot while it is failing.**

Do NOT run `node design-check.mjs` on its own. ESLint's rules-of-hooks
only runs inside `next build`, and a session's worth of failed Vercel
deploys got through once because the build was skipped.

## 5. If it touches touch, drag, long press or scroll

**Gestures do not show up in a screenshot.** Press-and-hold scrubbing on
the Performance chart was dead for four days with green builds and
perfect screenshots.

```
node scrubtest.mjs 3000 dark
node scrubtest.mjs 3000 light
```

**Both themes.** A gesture proven on one is not proven on the other: a
class change is exactly how the listeners came unstuck the first time.

For the Performance prototype, also `node motiontest.mjs 3000`.

## 6. Screenshot at BOTH widths, in BOTH themes

His words: "this app is for phones also. if any preview is made, it has
to be double checked for phone as well. thats your job, not mine."

- Phone 430x932 and laptop 1512x950.
- Light and dark.
- Set the theme with `localStorage.setItem("actuals-theme", ...)` in an
  init script before navigating.

The squashed-logo bug is the reason: a header change was previewed at
1512px only, shipped, and he found the logo warped on his own phone.

## 7. Compare the pages side by side

Track and Performance must look like one product.

## 8. Write the message

- Say which files were swept, and what was left out on purpose, with the
  reason.
- Say what else in the app the change touches, and show those screens
  too.
- **Show options when he is judging looks.** Two or three named variants
  beat one guess.
- Bullets. Anything that needs his eyes goes first, as its own bullet.

## Recovering a broken dev server

`npm run check` runs `next build`, which overwrites `.next` and kills a
running dev server. Standard recovery:

```
pkill -f "next-server"; rm -rf .next; npm run dev
```

## Screenshots he will judge

The phone-size screenshot goes first, always. A taller or wider
viewport spreads the layout and reads as broken to him: on 29 August
2026 an unlabeled 950px-tall shot nearly made him regret a merge that
his phone then proved fine. Any non-phone view comes after the phone
one and says plainly what it is and why it looks different.
