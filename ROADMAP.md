# Celebet: the mockup build plan

Written August 2026, from the four mockups (mobile and web, dark and
light). This file is the shared to do list. Nothing here is approved
for building until the owner says so, phase by phase.

## The short version

All four mockups are buildable. Nothing in them needs a technology we
do not already have. The work splits into three very different piles,
and knowing which pile something sits in is the whole point of this
document.

- **Pile 1, already built.** Just needs re-dressing to match the art.
- **Pile 2, new but cheap.** A few hours each, no database change.
- **Pile 3, new and structural.** Database migrations, new pages, or a
  product decision from the owner first.

## Pile 1: we already have this

Everything below is live today and only needs restyling.

| In the mockup | What powers it today |
| --- | --- |
| Tracking Balance, net profit | `src/app/app/page.tsx` money math |
| The sparkline in the balance card | `src/components/Sparkline.tsx` |
| Paste bet slip, Upload screenshot | `src/app/api/parse-slip` |
| Manual entry | `src/components/NewBetForm.tsx` |
| Insight of the day text | `buildInsightPool` in `src/lib/stats.ts` |
| Net Profit, ROI, Win Rate, Best Sport | `totals` and `sportRows` |
| Pending Bets, with per leg settling | `src/components/LiveBets.tsx` |
| Track / Performance / Research tabs | `src/components/TabBar.tsx` |
| Dark mode surfaces | already designed, follows the phone |

## Pile 2: new, but cheap

- **Greeting ("Good afternoon, Simon").** Needs a display name. Can be
  derived from the email until a settings page exists.
- **American odds (+175, -125).** We store decimal odds and can convert
  both ways with no database change. This is a display setting.
- **"Recommended" and "Soon" badges.** Pure styling.
- **Performance Snapshot with four sparklines.** Data exists, the
  component exists.
- **Insight of the day.** Today insights rotate at random. "Of the day"
  means pinning one per calendar day, which is a seed, not a feature.
- **Quick Access list (web).** Three links.
- **Recent Activity (web).** A short slice of settled bets.

## Pile 3: new and structural

### 3a. Purple becomes the action color
Today green #4F7A57 is "a button you press" and purple #58287F means
recommendations. Every mockup makes purple the primary action and keeps
green and red strictly for money going up and down. That is a cleaner
rule than the one we have, but it is a change to every button in the
app. Mechanical, and `design-check.mjs` will catch anything missed.

### 3b. Push as a bet outcome
The mockups show Won / Lost / Push on every pending leg. We only have
won and lost, in three places: the `legs.result` database constraint,
the `set_leg_result` and `cash_out_bet` functions, and every money rule
in `src/lib/stats.ts`.

The good news: our per leg odds multiply up to the bet's total odds, so
a pushed leg can be voided correctly by dividing it out of the total.
The payout math works.

The caveat: when a parlay was entered without a chance percentage on
every leg, the legs do not multiply exactly to the total, so the
recalculated payout would be approximate. That needs an owner ruling.

Note: this is not only cosmetic. Today a push can only be recorded by
cashing out at exactly the stake, which lands on the right money but
the wrong label.

### 3c. Web layout
The whole app is `max-w-md`, a phone column, on every page. The web
mockups are a real two column dashboard with a top nav. Same
components, new shell. This is layout work, not logic work.

### 3d. A theme toggle
Dark mode exists but follows the phone. The owner wants both on demand,
which needs somewhere to put the switch, which means the settings page.

### 3e. Event start time
The mockups show "Today, 7:00 PM" on pending bets. We store when a bet
was placed, never when the game starts. One new nullable column, plus a
field in the form and in the slip parser.

### 3f. Not now
- **Connect accounts.** This is idea 13 in IDEAS.md. Correctly marked
  "Soon" in the mockup itself.
- **Notification bell.** No notification system exists. The dot is
  currently decoration.
- **"How it works".** Needs a video or a walkthrough that does not
  exist yet.

## Suggested order

1. **Track page, mobile, both themes.** The product shot the owner
   wants, at the highest fidelity we can reach without a migration.
2. **Settings page.** Name, theme toggle, odds format. Unblocks the
   greeting and the light/dark switch.
3. **Push.** Migration plus the money rules.
4. **Web layout.** Two columns, top nav, responsive down to the phone.
5. **Performance page**, rebuilt per the flow doc in CLAUDE.md, with
   Today's Insight first.
6. **Research tab**, shell only until CeleBOT exists.

## Open questions for the owner

1. Purple as the primary action color everywhere, with green and red
   kept only for money? Recommended.
2. Push on parlays entered without chance percentages: accept an
   approximate recalculated payout, or ask the user to confirm the new
   payout?
3. American or decimal odds by default, and is it a setting?
4. Keep or drop the Recent Form pip strip? It is not in the mockups.
5. Dead links for product shots, or "Soon" badges? Recommended: badges.
   They photograph the same and never feel broken.
