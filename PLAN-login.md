# Login and sign up as panels

Idea 16 in IDEAS.md. Approved in direction by the owner, August 2026.

## Why

Today, tapping Log in on the landing page throws the visitor onto a
different page. They lose the page they were reading, and if they
change their mind they have to find their way back. That is the moment
most people leave.

A panel keeps them where they are. The landing page stays behind it,
so closing the panel costs nothing and they have not "gone" anywhere.

## What a visitor sees

- **Log in** in the header opens the log in panel.
- **Start Tracking** in the header opens the sign up panel.
- **The email field** in the hero, or in the closing block, opens the
  sign up panel with that address already filled in. Only the password
  is left to type.
- **Tap outside, press Escape, or the X** closes it. The landing page
  is exactly where they left it.
- Logging in or signing up goes to the app, same as today.

## What does NOT change

- `/login` and `/signup` stay live pages. Emailed links, bookmarks and
  the few existing signups keep working. The panel is a faster front
  door, not a replacement.
- **Forgot password stays its own page.** It is a different job: it
  sends mail and then you leave to go read it. Putting that inside a
  panel over a marketing page would be pretending it is quick when it
  is not.
- The Home control added to the auth pages stays, since those pages
  stay.

## One change the owner already ruled on

Logging out lands on the landing page instead of the login page.

## Build order, verified one at a time

**Phase 1. The panel, log in working.**
The shell (open, close, Escape, tap outside, focus), and the log in
form inside it. The owner checks it opens, closes and logs him in.

**Phase 2. Sign up in the panel.**
The same shell with the sign up form, wired to both email fields on
the landing page so the typed address carries in. Includes the "check
your email" state, which the current sign up page already has.

**Phase 3. Logout lands on the landing page.**
One line in the sign out route.

## The care points

- **Match the app's existing popup**, do not invent a second style.
  `InsightsPopup.tsx` already defines the pattern: full screen dim, a
  sheet rising from the bottom on a phone, centred card on a laptop.
  The panel reuses that shape so it looks like the same product.
- **Gestures and keys do not show up in a screenshot.** Escape,
  tap-outside and the focus behaviour get driven in a real browser
  before anything is shown, per the permanent rule in CLAUDE.md. A
  design check cannot catch a dead listener.
- **Both themes.** The landing page is light-first but follows the
  device, so the panel is checked on both.
- **The page behind must not scroll** while the panel is open, or the
  landing page drifts under the visitor's thumb on a phone.
- **Nothing is duplicated.** The panel and the `/login` page share the
  same form logic. Two copies of a login form is two places for a bug
  to live.

## Not in scope

- Apple sign in. Needs a paid developer account the owner does not
  have yet.
- Google sign in appears in the panel automatically, but stays
  invisible until `NEXT_PUBLIC_GOOGLE_ENABLED` is set in Vercel and
  the Google credentials are in Supabase.
