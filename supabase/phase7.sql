-- Celebets Phase 7: add money to a pending bet
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- What it does:
-- 1. New bet_buys table: every buy on a bet gets its own row with its
--    own amount and payout, like Kalshi's order history.
-- 2. Every existing bet gets its first buy backfilled from its stake.
-- 3. place_bet now records the first buy when a bet is placed.
-- 4. add_money adds a buy to a pending bet and updates the bet's
--    totals: stake grows by the amount, the payout target grows by
--    that buy's payout.

create table public.bet_buys (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payout numeric(12, 2) not null check (payout > 0),
  created_at timestamptz not null default now()
);

alter table public.bet_buys enable row level security;

create policy "Users can view buys of own bets"
  on public.bet_buys for select
  using (
    exists (
      select 1 from public.bets
      where bets.id = bet_buys.bet_id and bets.user_id = auth.uid()
    )
  );

create policy "Users can insert buys on own bets"
  on public.bet_buys for insert
  with check (
    exists (
      select 1 from public.bets
      where bets.id = bet_buys.bet_id and bets.user_id = auth.uid()
    )
  );

-- Backfill: every existing bet becomes one buy. Safe to run twice.
insert into public.bet_buys (bet_id, amount, payout, created_at)
select b.id, b.stake, round(b.stake * b.total_odds, 2), b.placed_at
from public.bets b
where not exists (
  select 1 from public.bet_buys x where x.bet_id = b.id
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
    insert into public.legs (bet_id, sport, description, odds, subcategory)
    values (
      v_bet_id,
      v_leg->>'sport',
      v_leg->>'description',
      (v_leg->>'odds')::numeric,
      v_leg->>'subcategory'
    );
  end loop;

  insert into public.bet_buys (bet_id, amount, payout)
  values (v_bet_id, p_stake, round(p_stake * p_total_odds, 2));

  return v_bet_id;
end;
$$;

create or replace function public.add_money(
  p_bet_id uuid,
  p_amount numeric,
  p_payout numeric
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_stake numeric;
  v_total_odds numeric;
  v_status text;
  v_new_stake numeric;
  v_new_collect numeric;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Amount must be above 0';
  end if;
  if p_payout is null or p_payout <= 0 then
    raise exception 'Payout must be above 0';
  end if;

  select stake, total_odds, status
  into v_stake, v_total_odds, v_status
  from public.bets
  where id = p_bet_id;

  if v_stake is null then
    raise exception 'Bet not found';
  end if;
  if v_status <> 'pending' then
    raise exception 'Money can only be added to a pending bet';
  end if;

  v_new_stake := v_stake + p_amount;
  v_new_collect := round(v_stake * v_total_odds, 2) + p_payout;

  if v_new_collect <= v_new_stake then
    raise exception 'Total payout must stay above the total stake';
  end if;

  insert into public.bet_buys (bet_id, amount, payout)
  values (p_bet_id, p_amount, p_payout);

  update public.bets
  set
    stake = v_new_stake,
    total_odds = round(v_new_collect / v_new_stake, 4)
  where id = p_bet_id;
end;
$$;
