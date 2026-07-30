-- Celebet Phase 4: delete permissions
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Why this exists: the app now has delete buttons for bets and for
-- deposits and withdrawals. These two rules allow you to delete your
-- own rows (and only your own). Deleting a bet also deletes its legs
-- automatically, that link already exists in the schema.

create policy "Users can delete own bets"
  on public.bets for delete
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
