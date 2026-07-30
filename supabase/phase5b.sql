-- Celebet Phase 5b: allow editing your own transactions
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Why this exists: the app now lets you change the date of a deposit
-- or withdrawal. The database allowed adding and deleting transactions
-- but not changing them. This rule allows it, for your own rows only.

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
