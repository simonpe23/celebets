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
- The owner runs SQL pastes in the Supabase SQL Editor themselves.
  Give exact click-by-click instructions and the expected success message.

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

## Idea backlog

- New ideas go into IDEAS.md, in a NOW, SOON, or FUTURE bucket.
- When the owner says "I have a new idea, store it", add it to
  IDEAS.md in the bucket they pick (recommend one if they don't).
- Ideas are never built from the file alone. Building always needs a
  presented plan and explicit approval, per the workflow rules.

## Product facts

- App: Celebets, a mobile-first manual sports bet tracker. Single user.
- Stack: Next.js App Router, TypeScript, Tailwind, Supabase with RLS,
  deployed on Vercel from branch claude/celebets-v1-build-fhio4a.
- Currency: USD with 2 decimals. Decimal odds with 2 decimals.
- Wallet balance = deposits - withdrawals - all stakes + payouts of won bets.
- Net profit = wallet balance + withdrawals - deposits.
- To Win = stake x (odds - 1). To Collect = stake x odds.
- Parlay total odds = product of leg odds, but the owner can type over the
  total (betting apps charge fees). Leg odds are optional on parlays.
- A lost parlay pays nothing. Legs that were right in a lost parlay earn
  zero money. They only count in the per-sport won/lost record.
- Sports (fixed): Football (soccer), American Football, Basketball,
  Baseball, Ice Hockey, Tennis, Golf, esports (lowercase).
- Picks have an optional sub-category (Corners, BTTS, ...). The lists
  live in SUBCATEGORIES in src/lib/types.ts, Football only so far.
  Adding sub-categories is a code change, never a database change.
  Nested choices are stored as "Group: Choice" (Player Props: Assists).
- All SQL files through supabase/phase5b.sql have been run and
  confirmed by the owner (July 2026). Transaction dates are editable.
