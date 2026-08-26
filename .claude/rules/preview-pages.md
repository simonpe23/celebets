---
description: How the design preview pages work and what they are for
paths:
  - "src/app/preview/**"
---

# Preview page rules

These are design previews, not product. They exist so the owner can
judge a change on a real phone before it ships.

## They are committed and deployed

`.gitignore` used to block this folder, which meant the previews were
never deployed AND never backed up. Days of design work lived only
inside one temporary container.

Committed since 24 August 2026, by the owner's ruling.

**The old note about Tailwind skipping gitignored files no longer
applies.** Utility classes generate here normally now. Inline styles are
no longer required as a workaround.

## They are private, without any extra code

`src/middleware.ts` treats `/preview/*` as public **only in
development**. In production a logged-out visitor who guesses the URL is
bounced to `/login`. A logged-in user reaches it, which is the point.

Do not "fix" this by adding another gate.

## What is live here

- `src/app/preview/pf/`, the Portfolio prototype for the Performance
  rebuild. Engine, skin and motion are all reusable. See
  `docs/performance-rebuild.md`.
- Everything else under `/preview` is an older, rejected concept. Kept
  so the history is not lost, not because it is worth reading.

## Testing them

- `pftest.mjs <port>` proves every topic is reachable in the prototype's
  pickers. It exists because an absence is what a screenshot cannot
  show.
- `motiontest.mjs <port>` proves the motion is alive.
- Both need a running dev server.
