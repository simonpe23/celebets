-- Celebets Phase 8: Crypto as a new top-level option
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Allows picks with Crypto alongside the sports, for betting on
-- crypto markets (Bitcoin price and similar).

alter table public.legs drop constraint legs_sport_check;

alter table public.legs add constraint legs_sport_check check (
  sport in (
    'Football', 'American Football', 'Basketball', 'Baseball',
    'Ice Hockey', 'Tennis', 'Golf', 'esports', 'Crypto'
  )
);
