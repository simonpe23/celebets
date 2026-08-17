# Actuals: the mockup build plan

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
- **Pile 3, new and structural.** New pages, a layout rebuild, or a
  product decision from the owner first.

## Two places we deliberately do NOT follow the mockups

Ruled by the owner, August 2026.

**No Push.** The mockups show Won / Lost / Push on every pending leg.
Push is not wanted. Settling stays exactly as it works today: Won and
Lost on each pick, plus Add money, Cash out and Delete on the bet. That
already covers a push in practice, by cashing out at the stake, and the
calculations are known to be right. This removes the only database
migration phase 1 would have needed.

**No American odds.** The mockups show +175 and -125. Actuals keeps
what it has: you enter a chance percentage and the exact payout, and a
bet reads "Aug 6, 2026, $99.97 at 3.32". American odds may become a
setting later, once a settings page exists. Not now.

A third, smaller divergence: the mockup's Pending Bets card shows only
the three outcome buttons. Ours keeps Add money, Cash out and Delete
too, because those are real features the art simply did not draw.

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

### 3b. Web layout
The whole app is `max-w-md`, a phone column, on every page. The web
mockups are a real two column dashboard with a top nav. Same
components, new shell. This is layout work, not logic work.

### 3c. A theme toggle
Dark mode exists but follows the phone. The owner wants both on demand,
which needs somewhere to put the switch, which means the settings page.

### 3d. Event start time
The mockups show "Today, 7:00 PM" on pending bets. We store when a bet
was placed, never when the game starts. One new nullable column, plus a
field in the form and in the slip parser.

### 3e. Not now
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
3. **Web layout.** Two columns, top nav, responsive down to the phone.
4. **Performance page**, rebuilt per the flow doc in CLAUDE.md, with
   Today's Insight first.
5. **Research tab**, shell only until CeleBOT exists.

No database migration is needed for any of the five phases above. That
became true the moment Push was ruled out. Event start time (3d) is the
only remaining item in this document that would touch the database, and
it is not scheduled.

## Open questions for the owner

1. Purple as the primary action color everywhere, with green and red
   kept only for money? Recommended.
2. Keep or drop the Recent Form pip strip? It is not in the mockups.
3. Dead links for product shots, or "Soon" badges? Recommended: badges.
   They photograph the same and never feel broken. The bell is the one
   exception: draw it without the dot until notifications exist, since
   a dot promises something to open.
4. Mobile shot or web shot first? It decides what phase 1 builds.
