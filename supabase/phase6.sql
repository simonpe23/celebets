-- Celebet Phase 6: cash out
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- What it does:
-- 1. Bets learn a cashed_out flag.
-- 2. cash_out_bet settles a pending bet at the exact amount received:
--    at or above the stake counts as won, below counts as lost, and
--    the amount becomes the payout either way.
-- 3. undo_cash_out reverts a cash out and recalculates the bet from
--    its picks.
-- 4. set_leg_result is updated: picks on a cashed out bet can still
--    be marked won or lost for the records, but the bet's money and
--    status never change anymore.

alter table public.bets add column cashed_out boolean not null default false;

create or replace function public.cash_out_bet(
  p_bet_id uuid,
  p_amount numeric
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_stake numeric;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Cash out amount must be above 0';
  end if;

  select stake into v_stake
  from public.bets
  where id = p_bet_id and status = 'pending';

  if v_stake is null then
    raise exception 'Bet not found or already settled';
  end if;

  update public.bets
  set
    status = case when p_amount >= v_stake then 'won' else 'lost' end,
    payout = p_amount,
    settled_at = now(),
    cashed_out = true
  where id = p_bet_id;
end;
$$;

create or replace function public.undo_cash_out(
  p_bet_id uuid
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_total integer;
  v_won integer;
  v_lost integer;
  v_new_status text;
begin
  update public.bets
  set cashed_out = false
  where id = p_bet_id and cashed_out = true;

  if not found then
    raise exception 'Bet not found or not cashed out';
  end if;

  select
    count(*),
    count(*) filter (where result = 'won'),
    count(*) filter (where result = 'lost')
  into v_total, v_won, v_lost
  from public.legs
  where bet_id = p_bet_id;

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
      else now()
    end
  where id = p_bet_id;
end;
$$;

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
  v_cashed_out boolean;
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

  -- A cashed out bet's money and status are final. The pick result
  -- above was still recorded for the per sport records.
  select cashed_out into v_cashed_out
  from public.bets
  where id = v_bet_id;

  if v_cashed_out then
    return;
  end if;

  select
    count(*),
    count(*) filter (where result = 'won'),
    count(*) filter (where result = 'lost')
  into v_total, v_won, v_lost
  from public.legs
  where bet_id = v_bet_id;

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
