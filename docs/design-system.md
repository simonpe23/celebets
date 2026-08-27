# The design system

Every value here lives in code. **Do not restate them inline.** Import
the component or reuse the exact class string.

`design-check.mjs` enforces the parts that can be enforced. When
something reaches the owner that a machine could have caught, the fix is
a new rule in that file, not a promise to be careful.

## Shared components

Never copy their markup into a page.

| File | What |
|---|---|
| `src/components/MicroLabel.tsx` | The small uppercase label. |
| `src/components/StatTile.tsx` | The labelled number in a card. |
| `src/components/HeroMoney.tsx` | The big money number. |

`src/lib/ui.ts` owns `CARD`, `INNER` (the row inside a card), `BTN`, the
outcome pills, and `ACCENT` / `ACCENT_TINT`.

## Two faces

Words are **Geist**. Numbers are **Inter Tight**, through the
`font-money` variable, at weight 500 on the big hero figures.

- The owner chose Inter Tight on 5 August 2026 from a comparison page.
  It is a decision he made, not a default.
- **Never switch it.** Family, weight AND size. `design-check` rule 8
  fails the build if the numeral face or the hero weight moves.
- Every money value must carry `font-money` or be listed as prose.

## Three weights

`font-medium` does not exist in this app.

| Weight | Used for |
|---|---|
| normal | body text, captions, inputs |
| semibold | field labels, row labels, chips, tile and row numbers |
| bold | buttons, card headings, money inside bet cards |

## Type scale

| Role | Value |
|---|---|
| Micro label | 10px bold uppercase, wide tracking, neutral 400, or white/40 on the dark chart panel |
| Caption | `text-xs`, neutral 500 light / neutral 400 dark |
| Body | `text-sm` |
| Label | `text-sm font-semibold` |
| Card heading | `text-[17px] font-bold` |
| Page title | `text-[22px] font-bold tracking-tight` |

**Both were settled on 26 August 2026 by counting the code**, after the
rule audit found this page giving two sizes for each. 17px beats
`text-lg` 16 places to 12; 22px beats `text-2xl` 7 places to 2. The
stragglers still ship the losing value (Balance history and the legal
pages are `text-2xl`), and sweeping them is a UI change nobody has been
asked for yet.

## The number ladder

Two things set the weight: **size and container**. Bigger goes lighter,
so the optical weight stays even. A number with no card around it goes
one step heavier, because the container is not there to give it
presence.

| Size | Weight | Where |
|---|---|---|
| 14px | bold | money inside a bet card row |
| 16px | semibold | StatTile value, inside a card |
| 18px | bold | the row under the headline, bare on the page |
| 32px | 500 | net profit, on a card with no balance set |
| 40px | 500 | the tracking balance |
| 42px | 500 | analytics headline |

## Buttons, three tiers

| Tier | Spec | Used for |
|---|---|---|
| One | `BTN` from `src/lib/ui.ts`: `rounded-md`, `text-[13px] font-semibold`, 44px tall (`h-11`) | Log out, Start here, Paste bet slip, Upload image, Add leg. `BTN` is the source of truth, settled 26 August 2026 by counting the code. Compact `h-8` and `h-9` variants exist for a button sitting inside a card row. The two popup buttons use `text-base` because they are taller. |
| Two | chips: `text-sm font-semibold`, `px-3 py-2`, `rounded-xl`, 38px tall | Sport, money, category, filters. |
| Three | `text-xs font-semibold` | Only inside a dense card row: Won, Lost, Cash out, Delete, Add money, Remove. |

**Buttons are squared, not pills.** `rounded-md` is the primary.

## Colour

### Purple is the brand colour, and it is not restricted to controls

**Withdrawn 26 August 2026:** "Purple blends through the site. Does not
have to be something you press or a button." The old rule said purple
had one job. It does not.

It is still the colour of the primary button, the active tab, the
selected chip and the primary capture tile. It is ALSO the profit chart
line, and it may be used elsewhere where it works.

**The judgement that remains:** he once had twelve purple objects on one
screen and called it "too much purple, everywhere". That was about
quantity and restraint, not about meaning.

| Value | Use |
|---|---|
| `#5525C6` → `#4915AD` | The BTN vertical gradient. |
| `#3D0F94` | Pressed. |
| `#7C3AED`, `#9A57FC` | Only the border and icon of a purple control. |
| `#9A57FC` | The active tab in dark, because `#5525C6` on the `#0C1125` bar is a contrast ratio of about 2.3 and reads as switched off. |

**One purple rule survives, and it is about code, not design.**
`design-check` rule 8b fails on ANY brand purple written by hand in a
`.tsx` file, with no allowlist. That rule is about keeping the colour in
one place so it can be changed in four lines, not about what purple is
allowed to mean. The brand purple lives in `globals.css`
as four custom properties and is reached through `bg-brand-top`,
`to-brand-bottom`, `active:to-brand-press` and `text-brand-mark`. There
is no rule 4c; an earlier version of this page invented one.

**Retired, and rule 8b fails on all of them:** `#6D28D9`, `#4C1D95`,
`#3B1578`, `#5B21B6`, and `#7C3AED` written as a raw hex anywhere,
filled button or not.

### What replaced purple everywhere else

| Job | Treatment |
|---|---|
| links | Ink plus a chevron. "View all ›", never a coloured link. |
| data | **The profit chart line is PURPLE**, with a soft purple gradient fading beneath it. Ruled 26 August 2026 (see below). A line that is not money (a win rate) is neutral `#94A3B8`. Money FIGURES stay green up, red down; the rule below is about the line only. |
| insights | **The accent**, the app's one secondary colour: warm amber, `#B45309` light and `#FBBF24` dark, trophy a `#FBBF24` → `#B45309` gradient. It marks insights ONLY: the sparkle, the AI badge, the trophy. Never a button, never a link. |
| badges | Neutral. A count is data, a type is a label; neither is a control. |

### Money colours

Green means money went up, red means money went down, and **neither is
ever an action colour.**

- emerald-600 light, emerald-400 dark. Red: red-600 light, red-400 dark.
- **The outcome pills** use the mockup's brighter pair, `#22C55E` and
  `#EF4444`, identical in both themes so a settled pick reads the same
  everywhere. Won and Lost are quiet tinted pills, never filled bars.
- **One green button survives:** Won on a pending pick, `#16A34A`,
  pressed `#15803D`, because it declares an outcome, not an action.
  Rule 4b enforces that it appears nowhere else.

### Surfaces

Light: page `#F7F7FB`, white cards with a hairline ring.

Dark, all sampled from the mockup:

| Surface | Value |
|---|---|
| page | `#04081B` |
| cards | `#0E1228` |
| popups | `#161D38` |
| tab bar and raised surfaces | `#0C1125` |
| chart panel | `#080D20` |
| hairlines | `white/[0.07]` |

It is a **navy** near-black. The page is much darker than everything on
it, and the raised surfaces are nearly all the same value: what
separates a card from a row inside it is **the hairline, not the fill**.

**Cards are defined by their edge, not by a shadow.**

### Capture tile icons

From the mockup, icons only, never buttons: camera `#3B82F6`, pencil
`#F97316`, connect `#22C55E`.

## The tab bar

- The active tab is a **filled icon plus a label, both in purple**, on
  the bar's own surface: `#ECECF3` light, `#111731` dark. Chosen from
  three shown side by side.
- 62px tall, `rounded-xl`. 78px and `rounded-[26px]` were rejected as
  childish.
- **No purple pill behind it.** The block was heavier than everything
  near it.
- Track and Performance fill their shapes when active. The magnifier has
  no solid form that still reads as a magnifier, so it thickens instead.

## Sizing

The build ran about a fifth larger than the mockups for weeks, which is
why the mockup fits Pending Bets on the first screen and the build did
not.

Greeting 22px, card headings 17px, hero balance 40px, primary button
44px tall at 13px.

**Those last two were settled by counting the code**, 26 August 2026.
This section used to say 52px at 16px, which nothing in the app has ever
shipped.

## Other rules from the mockups

- **Sparklines** are a line with a gradient fading under it, or a bare
  line. Never a flat filled block.
- **Card labels are sentence case.** Uppercase survives only where the
  mockup itself shouts (TRACKING BALANCE).
- **Primary buttons carry the BTN gradient with a glow.** A flat fill
  reads cheap.
- **Capture tiles:** two big (Paste bet slip, Upload screenshot) over two
  small (Manual entry, Connect).

## Vocabulary

Actuals never holds money, so it never speaks like a bank.

**Banned in user-facing copy:** wallet, deposit, withdrawal, withdraw,
bankroll. The words are **Tracking Balance, Set Tracking Balance, Add
and Remove, Balance history.**

The database columns are still named deposit and withdrawal, and
renaming them would be a migration with no user-visible gain. Only what
a person reads is checked.

The landing page and the legal pages are exempt: that is the owner's own
marketing copy, and a privacy policy has to be able to say what it does
not collect.

## The chart

**THE LINE IS PURPLE.** Ruled 26 August 2026: "purple stands, update the
design system."

**Which purple, and where it applies.** Ruled 26 August 2026:

- `#7C3AED` light, `#9A57FC` dark. **That is the app's existing purple**,
  the `--brand-mark` custom property, which already carries exactly
  those two values. His instruction: "use the app's existing purple, do
  not add a new one." So the line reads `var(--brand-mark)`. Nothing new
  goes in the palette, and `design-check` rule 8b stays satisfied
  because no hex is written by hand.
- **It applies to EVERY chart in the app**, not only the Performance
  rebuild. His words. That includes `ProfitChart.tsx` and every
  `Sparkline.tsx` (the balance card and the four on the Performance
  Snapshot).
- A line that is not money, like a win rate, stays neutral `#94A3B8`.

**NOT BUILT YET.** The live charts still draw green and red. The
recolour is a UI change across several files and needs the `ui-change`
pre-flight, so it is its own job with the owner's go.

This reverses "there is no purple data line", which was written during
the purple cleanup. That cleanup was right about six of purple's seven
jobs and wrong about this one: the owner's own mockups had always drawn
a purple line with a purple gradient under it, and the cleanup took the
line away without him asking for that.

**Purple therefore means two things now, not one:** something you press,
and the profit line. That is a deliberate exception and the only one.
Everything else the cleanup removed from purple stays removed: no purple
links, no purple badges, no purple decoration.

Green and red are unaffected. **Money figures are still green up and red
down.** The rule above is about the drawn line, not the numbers.

- Drawn by hand as SVG. No chart library.
- **No panel in light mode.** It draws straight on the page, with no
  glow. Chosen from three options after "a black panel on a light page
  does not go". (This bullet used to say the line drew in the app's
  money greens and reds. Superseded by the purple ruling above.)
- **Dark mode keeps the navy panel and the glow.**
- The chart's colours are CSS variables the panel sets, because they are
  SVG attributes and an attribute cannot carry a `dark:` variant.
- It scrubs: touch it anywhere and the headline shows the profit and
  date at that point. The chart owns every touch inside it, so nothing
  scrolls there. Android gets a short vibration; iOS has no vibration
  API in any browser.
- `data-chart-panel` is a **test hook, not a style.**

## Theme

The whole app keys off `data-theme` on `<html>`, not a media query.
`globals.css` declares
`@custom-variant dark (&:where([data-theme="dark"], ...))`, which was the
only way a user choice could beat the phone.

A raw script in the layout head sets the attribute **before first
paint**. A React effect runs after paint, which is the flash itself. The
script and Settings' `apply()` must stay in step: two rules for one
attribute is how a flash comes back.

There is **one** `theme-color` meta tag, rewritten by that script. A
light and dark pair cannot be overridden, so choosing Light on a dark
phone left a navy status bar above a white page.
