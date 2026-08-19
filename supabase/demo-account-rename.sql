-- RENAME THE DEMO ACCOUNT, August 2026.
--
-- The old address carries the retired brand and investors read it, so
-- it becomes demo@actuals.cc. The Supabase dashboard has no field for
-- changing a user's email any more, which is why this is SQL and not
-- click-by-click.
--
-- Two tables, because Supabase keeps the address twice: auth.users is
-- what a login looks up, and auth.identities is the record of HOW the
-- account signs in. Updating only the first leaves them disagreeing,
-- which is the kind of thing that reads fine for months and then
-- breaks something unrelated.
--
-- Safe to run twice: the second run matches nothing.

update auth.users
set email = 'demo@actuals.cc',
    -- A rename must never leave the account unconfirmed, or the demo
    -- door's password sign-in is refused.
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'celebetsdemo@simonpe.com';

update auth.identities
set identity_data = jsonb_set(identity_data, '{email}', '"demo@actuals.cc"'),
    updated_at = now()
where provider = 'email'
  and identity_data ->> 'email' = 'celebetsdemo@simonpe.com';

-- Proof, rather than trust: this must return one row reading
-- demo@actuals.cc with a confirmed date.
select email, email_confirmed_at
from auth.users
where email = 'demo@actuals.cc';
