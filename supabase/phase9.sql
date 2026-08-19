-- PHASE 9: the ground for Kalshi sync (August 2026, idea 13 phase 1).
--
-- Two things and nothing more, because nothing imports yet:
-- a place to keep a user's connected platform, and two quiet fields
-- on bets so an imported bet knows where it came from and can never
-- import twice.

-- One row per user per platform. The platform's credential is stored
-- ENCRYPTED (AES-256-GCM, key in a Vercel setting, never in the
-- database), so a database leak alone does not leak Kalshi keys.
--   access_key        Kalshi's key id. Not secret by itself.
--   encrypted_secret  the RSA private key, encrypted. Only the server
--                     route that talks to Kalshi can decrypt it.
create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('kalshi', 'polymarket')),
  access_key text not null,
  encrypted_secret text not null,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  unique (user_id, platform)
);

alter table connected_accounts enable row level security;

-- The same shape as every other table: you see and manage only your
-- own connections. The server routes act with the user's own session,
-- so these policies are the whole story.
create policy "own connections select" on connected_accounts
  for select using (auth.uid () = user_id);
create policy "own connections insert" on connected_accounts
  for insert with check (auth.uid () = user_id);
create policy "own connections update" on connected_accounts
  for update using (auth.uid () = user_id);
create policy "own connections delete" on connected_accounts
  for delete using (auth.uid () = user_id);

-- Where a bet came from. Every bet that exists today was typed in, so
-- the default backfills the whole history honestly.
alter table bets add column source text not null default 'manual';

-- The platform's own id for an imported bet. The unique index is the
-- duplicate protection: a second import of the same Kalshi fill is a
-- database error, not a double-counted bet.
alter table bets add column external_id text;
create unique index bets_external_id_unique
  on bets (user_id, external_id)
  where external_id is not null;
