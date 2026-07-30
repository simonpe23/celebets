# Celebet

A mobile-first web app for manually tracking sports bets: wallet, profit and loss, and performance statistics.

## Stack

- Next.js (App Router, TypeScript)
- Supabase (database plus email and password auth, with Row Level Security)
- Tailwind CSS
- Hosted on Vercel

## Setup

1. Create a Supabase project and run `supabase/schema.sql`, then `supabase/phase2.sql`, `supabase/phase3.sql`, `supabase/phase3b.sql`, `supabase/phase4.sql`, `supabase/phase4b.sql`, `supabase/phase5.sql`, `supabase/phase5b.sql`, `supabase/phase5c.sql`, `supabase/phase6.sql`, `supabase/phase7.sql`, and `supabase/phase8.sql` in the SQL Editor.
2. In Supabase, go to Authentication > Sign In / Providers and turn off "Confirm email" (optional, recommended for single-user use).
3. Copy `.env.example` to `.env.local` and fill in your project URL and publishable (anon) key.
4. `npm install`, then `npm run dev`.

## Money math

- Wallet balance = deposits - withdrawals - all stakes + payouts of won bets
- Net profit = wallet balance + withdrawals - deposits
- To Win = stake x (odds - 1), To Collect = stake x odds
- Parlay total odds = product of all leg odds
