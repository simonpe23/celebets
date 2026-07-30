-- Celebet Phase 4b: exact payouts
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Why this exists: you can now type the exact To Collect amount from
-- your betting app. The app converts it into precise odds behind the
-- scenes. Odds need 4 decimals of storage for the payout to land on
-- the exact cent. Displays everywhere still show 2 decimals.

alter table public.bets alter column total_odds type numeric(10, 4);
