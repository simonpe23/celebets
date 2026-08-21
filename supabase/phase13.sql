-- PHASE 13: six more sports, and competition on manual entry.
--
-- WHY. Kalshi's catalog audit (21 August 2026) showed real volume in
-- sports Actuals did not know, and the owner ruled six of them in.
-- The picks table must learn the words or those picks get rejected
-- while their bet is already written, which is the "0 legs" bug of
-- phase 10 all over again.
--
-- place_bet also learns competition, the last taxonomy dimension the
-- manual door could not capture: World Cup, Premier League, ATP.
-- Free text on purpose, because leagues are endless and Actuals owns
-- the category vocabulary, not the world's competitions.
--
-- Safe to run twice.

alter table public.legs drop constraint if exists legs_sport_check;

alter table public.legs add constraint legs_sport_check check (
  sport in (
    'Football', 'American Football', 'Basketball', 'Baseball',
    'Ice Hockey', 'Tennis', 'Golf', 'esports',
    'Cricket', 'MMA', 'Rugby', 'Motorsport', 'Boxing', 'Table Tennis',
    'Crypto', 'Other',
    'Politics', 'Economics', 'Entertainment', 'Weather',
    'Companies', 'Tech & Science', 'Health', 'World'
  )
);

create or replace function public.place_bet(
  p_stake numeric,
  p_total_odds numeric,
  p_legs jsonb
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_bet_id uuid;
  v_leg jsonb;
begin
  if p_legs is null or jsonb_array_length(p_legs) < 1 then
    raise exception 'A bet needs at least one leg';
  end if;

  insert into public.bets (user_id, stake, total_odds)
  values (auth.uid(), p_stake, p_total_odds)
  returning id into v_bet_id;

  for v_leg in select * from jsonb_array_elements(p_legs) loop
    insert into public.legs (
      bet_id, sport, description, odds, subcategory, market, period, competition
    )
    values (
      v_bet_id,
      v_leg->>'sport',
      v_leg->>'description',
      (v_leg->>'odds')::numeric,
      v_leg->>'subcategory',
      v_leg->>'market',
      v_leg->>'period',
      v_leg->>'competition'
    );
  end loop;

  insert into public.bet_buys (bet_id, amount, payout)
  values (v_bet_id, p_stake, round(p_stake * p_total_odds, 2));

  return v_bet_id;
end;
$$;

-- Proof rather than trust: the constraint exists and place_bet
-- mentions competition.
select
  (select count(*) from information_schema.check_constraints
    where constraint_name = 'legs_sport_check') as sport_check_present,
  (select count(*) from pg_proc
    where proname = 'place_bet'
      and prosrc like '%competition%') as place_bet_has_competition;
