# Working with this project's owner

The owner has no coding experience. These rules are permanent.

## Communication rules

- Speak plainly. Short sentences. Explain at a level a non-coder can grasp.
- Be brief. Default to a handful of bullets, not a report. The owner
  said answers are too long (August 2026). Cut the reasoning unless it
  changes a decision. Do not list every test that passed, just say it
  works. Do not restate what was asked.
- Never compress several ideas into one long sentence.
- Write in short bullets, not long text blocks.
- Never bury an important note or a task in the middle of a text block.
  Tasks for the owner must be their own clearly marked bullet.
- Never use em dashes anywhere: not in code, comments, UI copy, commit
  messages, or documentation. Use commas, periods, colons, or parentheses.

## Workflow rules

- Never build until the owner explicitly approves the plan.
- Build in phases. The owner verifies each phase before the next starts.
- Ask questions on any ambiguity. Make no assumptions on product decisions.
- This is a v1: prefer simple and working over clever.
- Database changes: the owner has a Supabase connector installed in
  Claude (project id wqhitxtowfhylzpfxkpw, named Celebet). Claude can
  apply SQL directly via apply_migration after the owner approves the
  change. Keep saving each change as a supabase/*.sql file in the repo
  for the record. If the connector is ever unavailable, fall back to
  the old way: the owner pastes the SQL in the Supabase SQL Editor
  with click-by-click instructions.

## UI rules (permanent, added August 2026 after wasting the owner's time)

The owner should never have to catch a typography or spacing
inconsistency. Finding one is a failure, not feedback.

Tailwind v4 skips gitignored files when it generates classes, so the
local preview pages in src/app/preview never get new utility classes.
Use inline styles there, or the preview silently falls back and you
compare two identical things.

Run `node design-check.mjs` before every screenshot. It reads the
system below and fails on drift. Never show the owner a screenshot
while it is failing.

THE SWEEP RULE (added August 2026, after the owner had to ask three
times whether a font change had reached the whole app):

A preview is a comparison. If place A is updated and place B is not,
the comparison is worthless and the owner cannot decide anything. So:

- Never show a preview until the change is applied everywhere it
  belongs. Not "mostly". Everywhere.
- Before the screenshot, list every place the thing appears and
  decide each one, including the ones that should NOT change.
  Undecided is not allowed.
- Say in the message which files were swept and what was left out on
  purpose, with the reason.
- When a change has a pattern (a color, a font, a size), add a rule
  to design-check.mjs so the machine catches the next one, not the
  owner. The money font rule is the worked example.

Before showing any UI change:

1. Change shared values in the shared file, never in one page.
   If a value lives in two places, that is the bug. Fix that first.
2. Sweep the whole app for the thing being changed. Grep for the class
   or color across src/ and confirm every hit. A design change is never
   finished in one file.
3. Change nothing the owner did not ask for. Alignment, casing, size
   and color are product decisions. Propose them, do not apply them.
   Reverting an unrequested change costs the owner a full round trip.
4. Compare the two pages side by side before showing anything. The
   home page and the stats page must look like one product.
5. Show options when the owner is judging looks. Two or three named
   variants beat one guess.
6. Before proposing a deploy, say what else in the app the change
   touches, and show those screens too. The owner asked for this
   (August 2026). A font change is never one screen.
7. Coach the owner on focus. He knows he can get stuck on a small
   detail before shipping. When that happens, say "I will store it,
   let us finish X first". If he insists, drop it and do as he asks.

### The design system

Everything below lives in code. Do not restate these values inline,
import the component or reuse the exact class string.

SHARED COMPONENTS. Never copy their markup into a page.
- src/components/MicroLabel.tsx  the small uppercase label
- src/components/StatTile.tsx    the labelled number in a card
- src/components/HeroMoney.tsx   the big money number

TWO TYPEFACES, ONE RULE.
- Numbers are Inter Tight, applied with the `font-money` class.
- Words are Geist.
- Money inside a sentence stays Geist. Changing face mid sentence
  reads as a bug. design-check.mjs enforces both halves.

THREE WEIGHTS. font-medium does not exist in this app.
- normal    body text, captions, inputs
- semibold  field labels, row labels, chips, tile and row numbers
- bold      buttons, card headings, money inside bet cards

TYPE SCALE.
- Micro label   MicroLabel: 10px bold uppercase, wide tracking,
                neutral 400, or white/40 on the dark chart panel
- Caption       text-xs, neutral 500 light / neutral 400 dark
- Body          text-sm
- Label         text-sm font-semibold
- Card heading  text-lg font-bold
- Page title    text-2xl font-bold

NUMBER LADDER. Two things set the weight: size and container.
Bigger goes lighter, so the optical weight stays even. A number with
no card around it goes one step heavier, because the container is not
there to give it presence.
- 14px  bold      money inside a bet card row
- 16px  semibold  StatTile value, inside a card
- 18px  bold      the row under the headline, bare on the page
- 32px  weight 500  wallet balance
- 42px  weight 500  analytics headline

BUTTONS, THREE TIERS.
- Tier one    text-sm font-bold, px-3 py-2.5, rounded-xl.
              Log out, Home, Start here, Analytics, Recommendations,
              Paste bet slip, Upload image, Add leg. The two popup
              buttons use text-base font-bold because they are taller.
- Tier two    chips: text-sm font-semibold, px-3 py-2, rounded-xl,
              38 pixels tall. Sport, money, category, filters.
- Tier three  text-xs font-semibold. Only inside a dense card row
              (Won, Lost, Cash out, Delete, Add money, Remove).

COLOR.
- Ink is the default. Muted is neutral 500 light, neutral 400 dark,
  everywhere, with no exceptions.
- Two greens with two jobs. #4F7A57 is a button you press.
  emerald-600 light and emerald-400 dark means money went up.
  Never mix them.
- Red: red-600 light, red-400 dark, means money went down.
- Purple #58287F is recommendations and the wordmark. Nothing else.
- Dark mode surfaces: page #0B0D14, cards #151A28, popups #1A2032,
  borders white/10 and white/15.

## Status

- v1 is complete and verified by the owner (July 2026). All five build
  phases shipped: auth, wallet, singles, parlays, settlement with undo,
  stats page, recommendations, deletes, editable dates, mobile polish.
- All SQL files in supabase/ have been run by the owner, in order:
  schema.sql, phase2.sql, phase3.sql, phase3b.sql, phase4.sql,
  phase4b.sql.
- Exact To Collect: the owner can type the exact payout on any bet,
  To Win follows it, odds are stored with 4 decimals to pay out exactly.
- Stats money rules: won bet profit splits across sports weighted by
  leg odds (minus 1). Lost bet stake is charged to the losing pick(s).
  With a sport filter active, the whole stats page speaks in that
  sport's picks and that sport's share of money.
- Recommendations rotate randomly on each tap: advice needs 5 settled
  bets or picks per group, plain facts have no minimum.
- Cash out (phase6.sql, run and verified July 2026): a pending bet can
  settle at the exact amount received. At or above stake counts as won,
  below as lost, payout = the amount either way, so profit is always
  payout minus stake. Cash out means done: no pick settling afterwards,
  the card leaves Live now after the 15 minute undo window.
- Picks still open at cash out inherit the cash out outcome in the
  records: profit = won picks, loss = lost picks (rule changed by the
  owner in phase 7, replacing the old "cashed out picks do not count").
- Screenshot import (verified July 2026): Paste bet slip / Upload
  image on the New Bet form. A server route (src/app/api/parse-slip)
  sends the image to the Claude API (Haiku) and pre-fills the form.
  The user always reviews and places manually. Needs the
  ANTHROPIC_API_KEY environment variable in Vercel (set by the owner,
  key never in the repo or chat). Unknown sports come back empty,
  categories may be free text with a clear link.
- Add money (phase7.sql, run and verified July 2026): a pending bet
  can absorb more buys, each with its own amount and payout (bet_buys
  table). The bet's stake and To Collect grow to the merged totals,
  matching how Kalshi merges positions. On singles every buy counts
  as its own pick at its own odds (payout / amount) in the records
  and odds groups. On parlays picks stay = legs. A "N buys" button on
  cards expands the individual buys.

## Analytics centre (August 2026, shipped and verified on phone and laptop)

- The stats page is now the analytics centre. No database change was
  needed, this is presentation only.
- Profit over time chart: running profit from a settled bet's date,
  always starting at zero for the chosen period. Green above zero,
  red below. Drawn by hand as SVG, no chart library.
- The chart sits on a dark panel even in light mode, because a glow
  needs darkness. That was the change that made it stop looking thin.
- The period control (ALL, 1D, 1W, 1M, 1Y, plus a calendar button for
  a custom range) lives on the panel, because it changes the panel.
- Page order: header, headline profit with ROI pill, bare Bets /
  Record / Hit rate row, chart panel, sport filter, three tiles
  (Staked, Returned, ROI), sports breakdown, the older tables,
  betting history.
- Recommendations moved to the top of the page, next to Home. The
  buried "All recommendations" link is gone, Show all lives in the
  popup.
- Per-sport money uses betProfitFor in src/lib/stats.ts, the same
  split rules as the Per sport table. Per-sport ROI is NOT possible
  yet: a parlay's stake covers several sports and there is no agreed
  rule for splitting it. That needs an owner decision.
- The chart scrubs: touch it anywhere and the headline shows the
  profit and date at that point. The chart owns every touch inside
  it, so nothing scrolls there. You scroll from outside it. Android
  gets a short vibration on touch, iPhone gets none (no browser on
  iOS has a vibration API, and the switch trick did not fire).
- The page is called Analytics. The web address stays /stats so old
  bookmarks keep working.
- Dark mode is designed, not default. It follows the phone's setting.
  A real toggle needs a settings page, which does not exist yet.

## The flow: Track, Performance, Research (owner, August 2026)

Written down as given. Not built. Mockups are coming next.

THE SPLIT THAT MAKES IT WORK. Insights and Research are opposite
ends of one timeline:
- Research happens BEFORE a bet. It is active. The user goes looking.
- Insights happen AFTER a bet. Celebet surfaced them on its own.

AN INSIGHT is something Celebet discovered. Not something the user
asked for, not something an AI researched. It comes from the user's
own data. Examples given by the owner:
- You have won 63% of bets between 1.01 and 1.80 odds.
- Parlays account for 72% of your losses.
- Tennis has become your most profitable sport.
- You are 9-1 betting Dodgers home games.
- You perform much better on weekdays.

RESEARCH is the user looking for information before betting:
who is pitching tonight, is LeBron playing, Dodgers trends, compare
odds, the weather, what the community thinks, ask CeleBOT.

THREE TABS, AND ONLY THREE. Track, Performance, Research. Insights
does NOT get a tab. It becomes a layer inside Performance, the way
Apple Health puts insights inside the health data rather than beside
it.

PERFORMANCE IS A PERFORMANCE REVIEW, NOT A STATISTICS PAGE. Opening
it should not land on graphs. Order ruled by the owner:
1. Today's Insight
2. Key Insights
3. Performance Snapshot
4. Charts
5. Sports Breakdown
6. Odds Groups
7. Singles vs Parlays
8. History and Trends
The owner's example of the top of that page: Today's Insight, then
Biggest Strength (MLB Favorites +$812), Biggest Weakness (Player
Props -18% ROI), Trending (your ROI has improved three weeks in a
row).

THE HOME PAGE INSIGHT CARD. Its link must not read "View Insights",
because that sounds like a separate product. It reads "View
Performance" or "See Why" or "Open Performance", because tapping it
enters the Performance area, whose first section is Today's Insight.

THE ONE LINE SUMMARY:
- Track means capture data.
- Performance means understand yourself.
- Research means understand the game before your next bet.

## Tester readiness (July 2026, complete and verified)

- Email confirmation is ON: new signups must click a link before they
  can log in. Accounts created before this stay valid. The setting
  lives on the Supabase Sign In / Providers page, not inside the
  Email provider popup (use the dashboard search for "confirm email").
- Minimum password length is 8, matched in the signup and reset pages.

- Password recovery works: Forgot password link, /forgot-password,
  and /reset-password. The reset page accepts every link shape
  Supabase sends (code exchange, tokens in the address bar, token
  hash) and /auth/confirm handles token-hash links. Both are exempt
  from the login gate in middleware.
- Emails are sent through Resend from no-reply@gocelebet.com, wired
  into Supabase custom SMTP (host smtp.resend.com, username resend,
  password = a Resend API key scoped to gocelebet.com). DNS records
  for DKIM, SPF, MX, and DMARC live at Hostinger.
- Supabase URL configuration: Site URL https://gocelebet.com, and
  redirect URLs for gocelebet.com, www.gocelebet.com, and the
  vercel.app address, all with /** wildcards. New domains must be
  added here or reset links silently fall back to the home page.
- Disclaimer component shows on login, signup, reset, and home:
  entertainment only, 1-800 GAMBLER, adults only, plus the
  Celebet trademark line for Peak Street 6 LLC.
- Testers each create their own account. The old demo account is
  only for people who want a quick peek.

## Idea backlog

- New ideas go into IDEAS.md, in a NOW, SOON, or FUTURE bucket.
- When the owner says "I have a new idea, store it", add it to
  IDEAS.md in the bucket they pick (recommend one if they don't).
- Ideas are never built from the file alone. Building always needs a
  presented plan and explicit approval, per the workflow rules.

## Product facts

- App: Celebet, a mobile-first manual sports bet tracker.
- Live at gocelebet.com (Hostinger domain, Hostinger keeps DNS,
  pointed at Vercel). The vercel.app address still works too.
- The owner has an Instagram account for finding test users.
- Stack: Next.js App Router, TypeScript, Tailwind, Supabase with RLS,
  deployed on Vercel from branch claude/celebets-v1-build-fhio4a.
- Currency: USD with 2 decimals. Decimal odds with 2 decimals.
- Wallet balance = deposits - withdrawals - all stakes + payouts of won bets.
- Net profit = wallet balance + withdrawals - deposits.
- To Win = stake x (odds - 1). To Collect = stake x odds.
- Bet flow (redesigned and verified July 2026): money in, money out.
  The owner types the stake and the exact To Collect (required on
  every bet). There are NO odds inputs anywhere in the form. Total
  odds are always derived: To Collect / stake, stored with 4 decimals.
- Parlays: each leg has one optional Chance (%) field (Kalshi style).
  Leg odds derive from the percentages and are scaled by one shared
  factor so they multiply exactly to the real total odds (the fee gap
  is spread across the picks). If any leg's % is missing, the known
  legs keep the straight 100 / percent conversion, unscaled. Money is
  never touched by percentages.
- On singles the leg's odds = the bet's derived odds.
- The stats row (Today, week, month, year) sits under the wallet card
  and at the top of the stats page.
- The pick description is optional everywhere. Cards fall back to the
  category, then the sport.
- The owner has a demo account (celebetsdemo@simonpe.com) holding the
  old test data, shared with a few testers. Friction of manual logging
  is the top known product problem, screenshot import is the planned
  answer (see IDEAS.md).
- A lost parlay pays nothing. Legs that were right in a lost parlay earn
  zero money. They only count in the per-sport won/lost record.
- Sports (fixed): Football (soccer), American Football, Basketball,
  Baseball, Ice Hockey, Tennis, Golf, esports (lowercase), Crypto
  (phase8.sql, for crypto price markets).
- Picks have an optional sub-category (Corners, BTTS, ...). The lists
  live in SUBCATEGORIES in src/lib/types.ts, Football only so far.
  Adding sub-categories is a code change, never a database change.
  Nested choices are stored as "Group: Choice" (Player Props: Assists).
- All SQL files through supabase/phase8.sql have been run (July 2026).
  phase8 (Crypto) was applied by Claude via the Supabase connector.
  Transaction dates are editable.
