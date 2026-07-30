# Working with this project's owner

The owner has no coding experience. These rules are permanent.

## Communication rules

- Speak plainly. Short sentences. Explain at a level a non-coder can grasp.
- Use more words when needed for clarity, but no essays. Find the balance.
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

## Idea backlog

- New ideas go into IDEAS.md, in a NOW, SOON, or FUTURE bucket.
- When the owner says "I have a new idea, store it", add it to
  IDEAS.md in the bucket they pick (recommend one if they don't).
- Ideas are never built from the file alone. Building always needs a
  presented plan and explicit approval, per the workflow rules.

## Product facts

- App: Celebet, a mobile-first manual sports bet tracker. Single user.
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
