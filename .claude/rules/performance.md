---
description: The Performance area, which is live code on real user bets
paths:
  - "src/components/performance/**"
  - "src/app/stats/**"
---

# The Performance area

**This is LIVE CODE. It serves actuals.cc/stats on real user bets.**

It moved here from `src/app/preview/performance-*` on 31 August 2026,
because that path read as a sandbox while serving real users. If you
find a doc or a comment pointing at the old path, the doc is stale.

`src/app/preview/pf/engine.ts` has NOT moved yet. Every money figure
on every Performance page comes from it, so it is as live as this
folder. Moving it is its own commit, and the owner has not been asked.

## One component, two callers

| Caller | Data |
|---|---|
| `src/app/stats/**` | The signed in user's own bets, behind login. |
| `src/app/preview/performance-*/page.tsx` | Demo bets. Public by ruling. |

The six `page.tsx` files under `src/app/preview/` stayed behind because
they ARE the public preview addresses. They are three lines each.

**Never put real user data on a preview page.** Public is the standing
state, ruled 28 August 2026.

## Six views, one page

`area.tsx` renders all six: Home, Lab, Totals, the Heat Map, Compare
and All Bets. The bets are loaded once and switching views asks the
server for nothing.

- **The menu draws three of them.** Home, Lab, Totals. The other three
  wear a back arrow instead.
- **Nothing here may become a `<Link>` that loads a page.** A door
  keeps a real `href` so the address works, and calls the tab area's
  callback on tap. `instanttest.mjs` counts server page requests and
  fails on any.

## One file holds every shared value

`src/components/performance/ui.ts` holds the colours, the font, the
type scale, the two weights, the radii and the shared heights.

**Never write a hex, a font family or a shared size inside a view. Add
a line to that file and import it.** Spacing used once, on one page,
stays on the page. `design-check.mjs` rule 12 fails the build on this.

Three things are shared components, not copies: `shell.tsx` (the
column, the face and the tab bar), `menu.tsx` (Home / Lab / Totals) and
`header.tsx` (the back header).

ANY chat may edit those without asking or pausing. The existing
convention holds: whoever merges second merges `main` in first.

## What design-check does here

**Exempt, and only here: the three COLOUR rules.** Is this hex in the
palette (4), green is not an action colour (4b), and the brand purple
must come from `globals.css` (8b). These pages carry the mockup
designer's palette, and the new palette is not chosen yet. See
`docs/open-questions.md`.

**Everything else applies in full**: the font lock, the banned finance
vocabulary, em dashes, the old brand name, the hand cursor, the money
numeral face, the shared components.

## Testing

Every one of these needs a running dev server.

- `instanttest.mjs <port>` proves nothing loads a page.
- `jumptest.mjs <port>` proves the doors between Home and Lab, and that
  Home's KPI row mirrors Lab's.
- `periodtest.mjs <port>` proves the period filter really filters.
- `controlstest.mjs <port>` clicks every control.
- `shotdiff.mjs` proves a change meant to be invisible is invisible.
