-- Celebets Phase 3: set_leg_result function
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Why this exists: settling a leg must also update the parent bet
-- (status, payout, settlement time) in one transaction, so the wallet
-- can never get out of sync with the legs. Calling it with 'pending'
-- is how Undo works: the leg reverts and the bet is recalculated.

create or replace function public.set_leg_result(
  p_leg_id uuid,
  p_result text
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_bet_id uuid;
  v_total integer;
  v_won integer;
  v_lost integer;
  v_new_status text;
begin
  if p_result not in ('pending', 'won', 'lost') then
    raise exception 'Invalid result: %', p_result;
  end if;

  update public.legs
  set result = p_result
  where id = p_leg_id
  returning bet_id into v_bet_id;

  if v_bet_id is null then
    raise exception 'Leg not found';
  end if;

  select
    count(*),
    count(*) filter (where result = 'won'),
    count(*) filter (where result = 'lost')
  into v_total, v_won, v_lost
  from public.legs
  where bet_id = v_bet_id;

  -- One lost leg loses the bet. All legs won wins it. Otherwise pending.
  if v_lost > 0 then
    v_new_status := 'lost';
  elsif v_won = v_total then
    v_new_status := 'won';
  else
    v_new_status := 'pending';
  end if;

  update public.bets
  set
    status = v_new_status,
    payout = case
      when v_new_status = 'won' then round(stake * total_odds, 2)
      else null
    end,
    settled_at = case
      when v_new_status = 'pending' then null
      when settled_at is null then now()
      else settled_at
    end
  where id = v_bet_id;
end;
$$;
