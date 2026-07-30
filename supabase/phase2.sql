-- Celebet Phase 2: place_bet function
-- Paste this whole file into the Supabase SQL Editor and click Run.
--
-- Why this exists: placing a bet writes two things, the bet and its legs.
-- This function saves them together in one transaction, so a dropped
-- connection can never leave a half-saved bet behind.

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
    insert into public.legs (bet_id, sport, description, odds)
    values (
      v_bet_id,
      v_leg->>'sport',
      v_leg->>'description',
      (v_leg->>'odds')::numeric
    );
  end loop;

  return v_bet_id;
end;
$$;
