-- PHASE 12: the Actuals taxonomy, locked with the owner 21 August
-- 2026. Category = repeatable skill (stays in legs.subcategory),
-- and four new dimensions per pick:
--   market          the controlled Actuals instrument (Match Winner,
--                   To Advance, BTTS, Team Total...)
--   period          1st Half / 2nd Half where a sport has periods
--   competition     World Cup, La Liga, ATP... display-grade
--   provider_market the provider's own market name, verbatim: the
--                   explainability trail. NULL marks a pick the
--                   relabel pass has not yet upgraded.
--
-- Also migrates the owner's curated manual labels into the canonical
-- taxonomy, per his own answers about what those bets actually were,
-- and teaches place_bet to store the new dimensions.
--
-- Safe to run twice.

alter table public.legs add column if not exists market text;
alter table public.legs add column if not exists period text;
alter table public.legs add column if not exists competition text;
alter table public.legs add column if not exists provider_market text;

-- The manual legacy labels, one move each. Mirrored in code by
-- MANUAL_LEGACY in src/lib/taxonomy.ts, which the tests enforce.
update public.legs set subcategory = 'Moneyline', market = 'Match Winner'
  where subcategory = 'Win-bet / Moneyline';
update public.legs set subcategory = 'Spread / Handicap', market = 'Goal Difference'
  where subcategory = 'Goal Difference';
update public.legs set subcategory = 'Totals (Over/Under)', market = 'Match Total'
  where subcategory = 'Points Total';
update public.legs set subcategory = 'Totals (Over/Under)', market = 'Team Total'
  where subcategory = 'Team Points Total';
-- The owner's real half bets are all first-half results (his listing,
-- 21 August 2026).
update public.legs set subcategory = 'Moneyline', market = 'Match Winner', period = '1st Half'
  where subcategory = '1st half / 2nd half';
update public.legs set subcategory = 'Match Props', market = 'BTTS'
  where subcategory = 'BTTS (Both Teams to Score)';
update public.legs set market = 'Correct Score'
  where subcategory = 'Correct Score' and market is null;
update public.legs set subcategory = 'Match Props', market = 'Corners'
  where subcategory = 'Corners';
update public.legs set subcategory = 'Match Props', market = 'First to Score'
  where subcategory = 'First team to score';
update public.legs set market = trim(substring(subcategory from 15)), subcategory = 'Player Props'
  where subcategory like 'Player Props: %';

-- place_bet learns the new dimensions. Manual entry sends market and
-- period from the picker; competition is not asked manually yet.
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
    insert into public.legs (bet_id, sport, description, odds, subcategory, market, period)
    values (
      v_bet_id,
      v_leg->>'sport',
      v_leg->>'description',
      (v_leg->>'odds')::numeric,
      v_leg->>'subcategory',
      v_leg->>'market',
      v_leg->>'period'
    );
  end loop;

  insert into public.bet_buys (bet_id, amount, payout)
  values (v_bet_id, p_stake, round(p_stake * p_total_odds, 2));

  return v_bet_id;
end;
$$;

-- Proof rather than trust: 4 new columns, 0 legacy labels left.
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'legs'
      and column_name in ('market', 'period', 'competition', 'provider_market')
  ) as new_columns,
  (select count(*) from public.legs
    where subcategory in (
      'Win-bet / Moneyline', 'Goal Difference', 'Points Total',
      'Team Points Total', '1st half / 2nd half',
      'BTTS (Both Teams to Score)', 'First team to score'
    ) or subcategory like 'Player Props: %'
  ) as legacy_labels_left;
