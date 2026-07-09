-- Celebets Phase 5 features: new sports and sub-categories
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- What it does:
-- 1. Allows the three new sports: Tennis, Golf, esports.
-- 2. Adds an optional sub-category to every pick (Corners, BTTS, ...).
--    The list of sub-categories lives in the app, so adding more later
--    needs no database change.
-- 3. Teaches the place_bet function to save the sub-category.

alter table public.legs drop constraint legs_sport_check;

alter table public.legs add constraint legs_sport_check check (
  sport in (
    'Football', 'American Football', 'Basketball', 'Baseball',
    'Ice Hockey', 'Tennis', 'Golf', 'esports'
  )
);

alter table public.legs add column subcategory text;

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
    insert into public.legs (bet_id, sport, description, odds, subcategory)
    values (
      v_bet_id,
      v_leg->>'sport',
      v_leg->>'description',
      (v_leg->>'odds')::numeric,
      v_leg->>'subcategory'
    );
  end loop;

  return v_bet_id;
end;
$$;
