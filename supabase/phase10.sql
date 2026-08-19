-- PHASE 10: Other, for everything Kalshi trades that is not a sport.
--
-- WHY. The Kalshi import maps a market's series to a sport and lands
-- everything unrecognised in "Other", which the owner asked for: he
-- wants users to be able to track everything. The database did not
-- know that word, so those picks were rejected while their bet had
-- already been written, leaving bets with no picks at all. The owner
-- saw one on his Track page reading "0 legs".
--
-- Safe to run twice.

alter table public.legs drop constraint if exists legs_sport_check;

alter table public.legs add constraint legs_sport_check check (
  sport in (
    'Football', 'American Football', 'Basketball', 'Baseball',
    'Ice Hockey', 'Tennis', 'Golf', 'esports', 'Crypto', 'Other'
  )
);

-- Clear the damage: imported bets whose pick was refused. They carry
-- no information (a bet with no pick has no sport and no
-- description), and the next sync recreates them properly from
-- Kalshi, which is the source of truth for a Kalshi bet.
delete from public.bets b
where b.source = 'kalshi'
  and not exists (select 1 from public.legs l where l.bet_id = b.id);

-- Proof rather than trust: both must be 0.
select
  (select count(*) from public.bets b
    where b.source = 'kalshi'
      and not exists (select 1 from public.legs l where l.bet_id = b.id)
  ) as headless_kalshi_bets,
  (select count(*) from public.legs where sport = 'Other') as other_picks_blocked;
