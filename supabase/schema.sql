-- Celebets v1 database schema
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- It is safe to run once on a fresh project.

-- 1. Profiles: one row per user, created automatically on sign up.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Automatically create a profile whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Transactions: deposits and withdrawals into the virtual wallet.

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('deposit', 'withdrawal')),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- 3. Bets: one row per bet (single or parlay).

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stake numeric(12, 2) not null check (stake > 0),
  total_odds numeric(10, 2) not null check (total_odds > 1.00),
  status text not null default 'pending' check (status in ('pending', 'won', 'lost')),
  placed_at timestamptz not null default now(),
  settled_at timestamptz,
  payout numeric(12, 2) check (payout is null or payout > 0)
);

alter table public.bets enable row level security;

create policy "Users can view own bets"
  on public.bets for select
  using (auth.uid() = user_id);

create policy "Users can insert own bets"
  on public.bets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bets"
  on public.bets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Legs: the individual picks inside a bet.

create table public.legs (
  id uuid primary key default gen_random_uuid(),
  bet_id uuid not null references public.bets (id) on delete cascade,
  sport text not null check (
    sport in ('Football', 'American Football', 'Basketball', 'Baseball', 'Ice Hockey')
  ),
  description text not null check (char_length(trim(description)) > 0),
  odds numeric(10, 2) not null check (odds > 1.00),
  result text not null default 'pending' check (result in ('pending', 'won', 'lost'))
);

alter table public.legs enable row level security;

-- Leg access follows the ownership of the parent bet.
create policy "Users can view legs of own bets"
  on public.legs for select
  using (
    exists (
      select 1 from public.bets
      where bets.id = legs.bet_id and bets.user_id = auth.uid()
    )
  );

create policy "Users can insert legs on own bets"
  on public.legs for insert
  with check (
    exists (
      select 1 from public.bets
      where bets.id = legs.bet_id and bets.user_id = auth.uid()
    )
  );

create policy "Users can update legs of own bets"
  on public.legs for update
  using (
    exists (
      select 1 from public.bets
      where bets.id = legs.bet_id and bets.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bets
      where bets.id = legs.bet_id and bets.user_id = auth.uid()
    )
  );

-- Helpful indexes for the queries the app will run.
create index transactions_user_id_idx on public.transactions (user_id, created_at desc);
create index bets_user_id_idx on public.bets (user_id, placed_at desc);
create index bets_user_settled_idx on public.bets (user_id, settled_at desc);
create index legs_bet_id_idx on public.legs (bet_id);
