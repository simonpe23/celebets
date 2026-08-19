-- PHASE 9: the ground for Kalshi sync (August 2026, idea 13 phase 1).
--
-- Two things and nothing more, because nothing imports yet:
-- a place to keep a user's connected platform, and two quiet fields
-- on bets so an imported bet knows where it came from and can never
-- import twice.
--
-- WRITTEN TO BE RUNNABLE TWICE. The owner's first run created the
-- table and then errored on a later line, so the second run failed on
-- "already exists" at the top. Every statement here now skips what is
-- already in place, and the select at the end proves the outcome
-- instead of trusting it.

create table if not exists connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('kalshi', 'polymarket')),
  -- Kalshi's key id, not secret by itself, and the RSA private key
  -- encrypted (AES-256-GCM, key in a Vercel setting, never in the
  -- database), so a database leak alone does not leak Kalshi keys.
  access_key text not null,
  encrypted_secret text not null,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  unique (user_id, platform)
);

alter table connected_accounts enable row level security;

-- The same shape as every other table: you see and manage only your
-- own connections. drop-then-create because policies have no
-- "if not exists".
drop policy if exists "own connections select" on connected_accounts;
create policy "own connections select" on connected_accounts
  for select using (auth.uid () = user_id);
drop policy if exists "own connections insert" on connected_accounts;
create policy "own connections insert" on connected_accounts
  for insert with check (auth.uid () = user_id);
drop policy if exists "own connections update" on connected_accounts;
create policy "own connections update" on connected_accounts
  for update using (auth.uid () = user_id);
drop policy if exists "own connections delete" on connected_accounts;
create policy "own connections delete" on connected_accounts
  for delete using (auth.uid () = user_id);

-- Where a bet came from. Every bet that exists today was typed in, so
-- the default backfills the whole history honestly.
alter table bets add column if not exists source text not null default 'manual';

-- The platform's own id for an imported bet. The unique index is the
-- duplicate protection: a second import of the same Kalshi fill is a
-- database error, not a double-counted bet.
alter table bets add column if not exists external_id text;
create unique index if not exists bets_external_id_unique
  on bets (user_id, external_id)
  where external_id is not null;

-- Proof, rather than trust: this must print policies = 4 and
-- bet_columns = 2.
select
  (select count(*) from pg_policies
    where tablename = 'connected_accounts') as policies,
  (select count(*) from information_schema.columns
    where table_name = 'bets'
      and column_name in ('source', 'external_id')) as bet_columns;
