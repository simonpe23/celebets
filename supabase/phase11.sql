-- PHASE 11: real names for the Not Sports categories.
--
-- WHY. Phase 3 of the Kalshi sync stops dumping every non-sport
-- market into "Other": the import now reads Kalshi's own category
-- field and names the pick properly (Politics, Economics, Weather...).
-- The database has to know those words or the picks get rejected,
-- which is the "0 legs" bug of phase 10 all over again.
--
-- The names are Actuals' own, normalised from Kalshi's categories in
-- code (src/lib/kalshiSync.ts), so a Kalshi rename cannot break the
-- database: anything unrecognised still lands in Other.
--
-- Safe to run twice.

alter table public.legs drop constraint if exists legs_sport_check;

alter table public.legs add constraint legs_sport_check check (
  sport in (
    'Football', 'American Football', 'Basketball', 'Baseball',
    'Ice Hockey', 'Tennis', 'Golf', 'esports', 'Crypto', 'Other',
    'Politics', 'Economics', 'Entertainment', 'Weather',
    'Companies', 'Tech & Science', 'Health', 'World'
  )
);

-- Proof rather than trust: the constraint exists and allows 18 values.
select
  count(*) as sport_check_present
from information_schema.check_constraints
where constraint_name = 'legs_sport_check';
