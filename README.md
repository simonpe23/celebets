# Actuals

A mobile-first web app for manually tracking bets: tracking balance, profit and loss, and performance statistics.

## Stack

- Next.js (App Router, TypeScript)
- Supabase (database plus passwordless auth: a six-digit emailed code, or Google, with Row Level Security)
- Tailwind CSS
- Hosted on Vercel

## Setup

1. Create a Supabase project and run every file in `supabase/` in order: `schema.sql`, then `phase2` through `phase13` (including `phase3b`, `phase4b`, `phase5b` and `phase5c`), then `demo-account-rename.sql`. See `docs/data-model.md` for the current list.
2. In Supabase, leave "Confirm email" ON, set the email OTP length to 6, and put `{{ .Token }}` in both the "Magic link or OTP" and "Confirm sign up" templates. See `docs/architecture.md`.
3. Copy `.env.example` to `.env.local` and fill in your project URL and publishable (anon) key.
4. `npm install`, then `npm run dev`.

## Money math

- Balance = deposits - withdrawals - all stakes + payouts of won bets
- Net profit = balance + withdrawals - deposits
- To Win = stake x (odds - 1), To Collect = stake x odds
- Total odds = To Collect / stake. Always derived, never typed, stored to 4 decimals. Leg odds are then scaled to multiply to exactly that total.

The full set, with the reasoning behind each, is in `docs/business-rules.md`. Every money rule lives in `src/lib/stats.ts`.
