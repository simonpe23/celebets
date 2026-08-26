# What has shipped

A dated record of what exists and works, so nobody rebuilds it.

## v1, July 2026, verified by the owner

Five build phases: auth, wallet, singles, parlays, settlement with undo,
stats page, recommendations, deletes, editable dates, mobile polish.

**Exact To Collect.** The owner types the exact payout on any bet, To
Win follows it, odds are stored with 4 decimals so it pays out exactly.

**Cash out** (phase6). A pending bet settles at the exact amount
received. See `business-rules.md`.

**Add money** (phase7). A pending bet absorbs more buys, each with its
own amount and payout, matching how Kalshi merges positions.

**Screenshot import.** Paste bet slip / Upload image on the New Bet
form. A server route sends the image to the Claude API (Haiku) and
pre-fills the form. The user always reviews and places manually.

## Tester readiness, July 2026

- Email confirmation is on. Accounts created before it stay valid.
- Password recovery works across every link shape Supabase sends.
- Emails go through Resend from `no-reply@actuals.cc`.
- The Disclaimer shows on login and home: entertainment only,
  1-800 GAMBLER, adults only, and "Actuals is a part of Peak Street 6
  LLC". That replaced a trademark claim at the rename, on the owner's
  wording: the mark is not filed.

## The rename, August 2026

Celebet became **Actuals**. `sitecheck.mjs` exists because of it: the
owner spent one minute on four pages and found five mistakes that had
shipped. "if I spend a minute and find 5 mistakes, what else is wrong?
makes me even more stressed."

Checking by eye does not scale, and making him the last line of defence
is the failure.

## Analytics centre, August 2026

The stats page became the analytics centre. Presentation only, no
database change.

**The top of Performance was rebuilt** after "there's too much dead
space on the performance page at the top". Four causes, all avoidable:

1. The title was left aligned and the hero centred, so the space between
   them read as a hole.
2. "ALL TIME" sat over the number while "ALL" sat selected in the panel
   below. The same fact twice, and "PROFIT" made it three times.
3. The number, the ROI pill, the record row and the chart were four
   floating things. The eye had nothing to hold.
4. The title did no work: the tab bar already says you are on
   Performance.

The number now lives ON the chart panel, above the line that draws it.
One object instead of five. The subtitle is "Find what pays and what
leaks."

## Track page, August 2026, v9.3

Built to the owner's four mockups (mobile and web, light and dark), then
refined across nine drafts.

The live page: one-row header (brand mark, greeting, gear chip for
Settings), Tracking Balance as a full-bleed band on phones with the
balance at 40px and an edge-to-edge chart, the four capture tiles,
Insight of the day, the Performance Snapshot, then Pending bets.

Navigation is the bottom TabBar only. The page carries no navigation
buttons of its own.

## Login, August 2026

No passwords. One auth page at `/login`, a six-digit emailed code.
`/signup`, `/forgot-password` and `/reset-password` are deleted and
redirect there.

**A new address and a returning one need different `verifyOtp` types**
("signup" vs "email"), because Supabase picks the template by whether
the account exists. `AuthCard` tries one and falls back to the other.
**Never simplify that to a single type:** the wrong one answers "Token
has expired or is invalid", which looks exactly like a wrong code, and
it silently locked out every first-time visitor.

**The demo door**, for investors. The demo account cannot receive codes,
so typing its address skips email entirely and checks one permanent code
through `/api/demo-login`.

## Settings, August 2026

Reached from the gear on Track. Theme (System / Light / Dark), name,
your data, connected accounts, log out, and the quiet Restart my record
with its undo.

## The taxonomy, 21 August 2026

Domains, categories per domain, controlled markets, competitions as
tappable chips with alias normalisation. `phase12` and `phase13` run and
verified.

## Kalshi connect

Read-only. The private key is stored AES-256-GCM encrypted. **No trading
code may ever exist in this repo.**

## App store readiness, 24 August 2026

**Delete my account** and **Export my data** (two CSVs: bets one row per
leg, and balance history). Both required or adjacent to Apple 5.1.1(v)
and Google Play's data deletion policy. No migration was needed: the
schema already cascades.

## Design previews are committed, 24 August 2026

`.gitignore` used to block `/src/app/preview/`, which meant they were
never deployed AND never backed up. The whole Portfolio prototype existed
only inside one temporary container.

Not deployed and not saved are different problems, and one rule was
treating them as one. They are committed now, and the login gate keeps
them away from logged-out visitors.

## The rule audit, 26 August 2026

Every written rule in the repo was read against every other one, and
against the code. It happened because `docs/design-system.md` said
"there is no purple data line" while the owner's own mockups drew one
and `PORTFOLIO-VIEWS.md` recorded him ruling it in. Both sounded
confident. Neither knew about the other. It sat there for weeks and only
surfaced by luck.

**Fixed, because a dated ruling already settled them:**

- `CLAUDE.md` and `docs/architecture.md` still named the old Vercel
  branch `claude/celebets-v1-build-fhio4a`. It was renamed to `main` on
  26 August 2026.
- `docs/design-system.md` claimed a `design-check` "rule 4c" that has
  never existed, and described rule 8b as having an allowlist. It does
  not: it fails on ANY hand-written brand purple in a `.tsx` file.
- `docs/design-system.md` gave the tracking balance as 32px in one table
  and 34px in another. It is 40px.
- `docs/design-system.md` specified the primary button as `rounded-xl`,
  which he had already rejected as too round.
- `README.md` described password auth, told you to turn email
  confirmation OFF, listed migrations only to phase 8, and gave the
  parlay odds rule backwards.
- `IDEAS.md` idea 31 still said manual entry cannot log a non-sport. It
  can, and has been able to since the picker shipped.
- `ROADMAP.md` carried four open questions that were all answered, and
  described purple, the theme toggle and the greeting as unbuilt.
- `CONCEPTS.md` had every Lab concept marked "IN REVIEW" months after
  the round ended.

**Sent to him to rule on, in `docs/open-questions.md`:** seven places
where two rules genuinely disagree and no ruling settles it, including
how far the purple chart line reaches and which purple it is.

**The lesson, and it is the same one as the previous three:** a rule
written in two places will eventually say two things. Where a value can
live in one place, it should. Where it cannot, the copies have to name
each other.
