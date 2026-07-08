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
  Baseball, Ice Hockey.
