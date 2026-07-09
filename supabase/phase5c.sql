-- Celebets Phase 5c: the pick text becomes optional
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Why this exists: the pick description is for your own eyes only,
-- so the app no longer requires it. This lets the database accept
-- picks without a description. Cards fall back to showing the
-- category or the sport instead.

alter table public.legs alter column description drop not null;
alter table public.legs drop constraint legs_description_check;
