# Actuals: the mockup build plan

Written August 2026, from the four mockups (mobile and web, dark and
light). This file is the shared to do list. Nothing here is approved
for building until the owner says so, phase by phase.

**STATUS, 26 August 2026.** Most of this shipped. The Track page was
built to the mockups and refined across nine drafts, Settings exists
with the theme switch, purple became the action colour, and the four
open questions at the foot are all answered. What is left is marked
below. The settled parts are kept so nobody re-argues them. Where this
file and `docs/decisions.md` disagree, decisions wins.

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

- **Greeting ("Good afternoon, Simon").** DONE. The name lives in the
  auth user's metadata and is edited in Settings.
- **"Recommended" and "Soon" badges.** Pure styling.
- **Performance Snapshot with four sparklines.** Data exists, the
  component exists.
- **Insight of the day.** Today insights rotate at random. "Of the day"
  means pinning one per calendar day, which is a seed, not a feature.
- **Quick Access list (web).** Three links.
- **Recent Activity (web).** A short slice of settled bets.

## Pile 3: new and structural

### 3a. Purple becomes the action color
**DONE.** Purple has one job now: something you press. Green and red
mean money moved and are never an action colour. The old green #4F7A57
and purple #58287F are gone. `design-check` rules 4b and 8b hold the
line. See `docs/design-system.md`.

### 3b. Web layout
The whole app is `max-w-md`, a phone column, on every page. The web
mockups are a real two column dashboard with a top nav. Same
components, new shell. This is layout work, not logic work.

### 3c. A theme toggle
**DONE.** Settings carries System / Light / Dark, stored per device, and
the whole app keys off `data-theme` rather than a media query.

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
4. **Performance page**, rebuilt per `docs/performance-rebuild.md`,
   with Today's Insight first.
5. **Research tab**, shell only until ActualsBOT exists.

No database migration is needed for any of the five phases above. That
became true the moment Push was ruled out. Event start time (3d) is the
only remaining item in this document that would touch the database, and
it is not scheduled.

## Open questions for the owner: ALL FOUR ANSWERED

1. Purple as the primary action colour everywhere? **YES**, ruled
   August 2026. See `docs/decisions.md`.
2. The Recent Form pip strip? **Not built.** It is not on the live
   Track page and no ruling was recorded, so it lapsed rather than
   being decided.
3. Dead links or "Soon" badges? **Badges**, ruled. See
   `docs/decisions.md`.
4. Mobile or web shot first? **Mobile**, and it shipped as Track v9.3.

**Still not scheduled from this file:** the web two-column layout (3b)
and event start time (3d), which is the only item here that would touch
the database.
