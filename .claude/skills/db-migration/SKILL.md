---
name: db-migration
description: Changing the Supabase schema. Use when a change needs a new table, column, constraint or RPC. Covers the approval gate, the connector, the file record, and the fallback when the connector is unavailable.
---

# Database changes

## 0. Check whether you actually need one

Several things that look like migrations are not:

- **Auth user metadata needs no migration.** `full_name`,
  `tracking_since` and `tracking_reset_tx` all live there.
- **Account deletion needed no migration**, because every table already
  cascades from `auth.users`.
- **Adding a category or market is a code change**, not a schema change.
  Only adding a TOPIC touches `legs_sport_check`.

## 1. Get approval first

Never apply a schema change before the owner approves the plan. Say in
plain words:

- What the change does.
- Whether existing rows are affected.
- Whether it is reversible.

## 2. Write the file first

`supabase/phaseN.sql`, next number in sequence. The file is the record
even when the connector applies it.

- **Safe to run twice.** `drop constraint if exists`,
  `create table if not exists`, `create or replace function`.
- **Open with a comment saying WHY**, not just what.
- **End with a proof query** that returns a count the owner can read
  back.

## 3. Apply it

**Preferred:** the owner has a Supabase connector in Claude (project id
`wqhitxtowfhylzpfxkpw`, named Celebet). Apply via `apply_migration`
after approval.

**Fallback, if the connector is unavailable:** give the owner
click-by-click instructions to paste it into the Supabase SQL Editor.

**Warn him every time:** Supabase's SQL editor runs your SELECTION, not
the file, whenever any text is selected. `phase13` failed on a rerun
with "syntax error at or near Companies" because a double-click had
selected that one word. Tell him to press Cmd+A or click into empty
space before Run.

## 4. Verify

- Ask for the proof query's numbers back.
- Run `npm run check`.
- Record the result in `docs/data-model.md` under Migrations.

## Settings that live outside the repo

Some things cannot be fixed with SQL and have each cost a live test:

- **Email OTP length must be 6.** The app draws exactly six boxes.
- **Email templates must carry `{{ .Token }}`** on both the "Magic link
  or OTP" and "Confirm sign up" tabs.
- **URL configuration** needs every domain listed with `/**` wildcards,
  or reset links silently fall back to the home page.

See `docs/architecture.md`.
