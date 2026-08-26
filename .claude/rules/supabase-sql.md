---
description: Conventions for SQL migration files
paths:
  - "supabase/**"
---

# SQL file rules

- **One file per change**, named `phaseN.sql`, in order. The file is the
  record even when Claude applies it through the connector.
- **Every file must be safe to run twice.** Use
  `drop constraint if exists`, `create table if not exists`,
  `create or replace function`.
- **Open with a comment saying WHY**, not just what. Several existing
  files explain the bug they fix, which is why they are still readable
  months later.
- **End with a proof query** where possible: something that returns a
  count the owner can read back to confirm it worked. `phase12` and
  `phase13` both did, and both were confirmed by their numbers.

## Things this schema already does

- **Every table cascades from `auth.users`.** Deleting the auth user
  removes every row that person owns. Do not add a table that breaks
  that chain.
- **Row Level Security on everything.** A user can only see their own
  rows.
- `legs_sport_check` lists all 24 valid topics. Adding a topic means
  editing that constraint.

## The gotcha that cost a rerun

**Supabase's SQL editor runs your SELECTION, not the file**, whenever
any text is selected. `phase13` failed on its second run with "syntax
error at or near Companies" because a double-click had selected that one
word.

Tell the owner to clear the selection or press Cmd+A before Run.

## Applying a migration

Use the `db-migration` skill.
