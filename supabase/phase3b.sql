-- Celebets Phase 3b: leg odds become optional
-- Paste this whole file into a new Supabase SQL Editor tab and click Run.
--
-- Why this exists: on parlays the betting app sometimes only shows the
-- total odds, so per-leg odds can now be left empty. The existing check
-- that odds must be greater than 1.00 still applies whenever odds are
-- filled in.

alter table public.legs alter column odds drop not null;
