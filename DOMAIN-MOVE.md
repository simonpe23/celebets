# Moving to actuals.cc

Written August 2026, when the owner bought actuals.cc.

The order matters. Nothing here breaks the live site if you follow it,
because gocelebet.com keeps working the whole way through and only
stops being the main address at the very end.

THE ONE RULE THAT PREVENTS EVERY SILENT FAILURE: **add the new address
before removing the old one.** Never swap. A missing redirect URL does
not throw an error, it just sends a password reset link to the wrong
page, and you would only find out from a user who cannot get in.

Nothing in the app's login code needs changing. Every auth redirect is
built from the address the browser is already on
(`window.location.origin`), so it follows the domain automatically.

---

## PHASE 1: point the domain. Nothing changes for users.

- [ ] **Hostinger:** point actuals.cc at Vercel. Take the exact records
      from Vercel's own domain panel rather than copying them from
      here. Vercel is expanding its IP range, so the values move:
      in August 2026 it wanted an A record on `@` to `216.198.79.1`
      and a per-domain CNAME on `www`, while the older
      `76.76.21.21` and `cname.vercel-dns.com` still worked and only
      produced a "DNS Change Recommended" warning.
      Changing between them is safe at any time. Both answer during
      propagation, so the site never drops.
- [ ] **Vercel:** add actuals.cc as a domain on the project. Add
      www.actuals.cc too and let Vercel redirect one to the other.
- [ ] Wait until it loads with a padlock. DNS can take an hour, SSL is
      issued automatically once DNS resolves.

DONE, 18 August 2026. actuals.cc and www.actuals.cc both resolve to
Vercel and the app answers on them.

At this point the app answers on BOTH addresses. Logging in on
actuals.cc will work. Password reset will not, yet.

## PHASE 2: make accounts work on the new address.

- [ ] **Supabase, URL Configuration:** ADD to Redirect URLs, keep
      everything already there:
      `https://actuals.cc/**` and `https://www.actuals.cc/**`
- [ ] Test on actuals.cc: create an account, confirm the email, log
      out, do a password reset. All three must work.
- [ ] Only once that passes, change **Site URL** to
      `https://actuals.cc`.

DONE, 18 August 2026. Tested and verified by the owner: signup, email
confirmation and password reset all work on actuals.cc.

## PHASE 3: email. Start it when you are not in a hurry.

- [ ] **Resend:** add actuals.cc as a sending domain.
- [ ] **Hostinger:** add the DKIM, SPF and DMARC records Resend gives
      you. These are new records, they do not replace the gocelebet
      ones.
- [ ] Wait for Resend to verify the domain.
- [ ] **Supabase, SMTP settings:** change the sender to
      `no-reply@actuals.cc`. The username stays `resend` and the
      password is a Resend API key scoped to the new domain.
- [ ] Send yourself a password reset and check it arrives, and that it
      is not in spam.

DONE, 18 August 2026. Verified by the owner: the reset email arrives
from Actuals <no-reply@actuals.cc> and the link works.

Two things that were not obvious on the way through:
- The Resend API key had to be replaced, not reused. The old one was
  scoped to gocelebet.com, so it could not send from the new domain.
- The sender NAME is a plain text field in Supabase and has nothing to
  do with the domain. It said Celebet long after the rename, and could
  have been fixed on day one.

Why this one wants its own slot, rather than being squeezed between
other changes:
- There is waiting in it. You add the records, then Resend verifies
  them, and that takes anywhere from minutes to hours. It cannot be
  hurried.
- Do it alone. If a reset email stops arriving afterwards you want one
  suspect, not three.
- A brand new sending domain has no reputation, so the first few emails
  are the most likely to land in spam. Send nothing bulk until it has
  warmed up.

It does not need a whole day. It needs an unhurried hour and a real
test at the end.

## PHASE 4: the code. Claude does this, about ten minutes.

Do NOT do this before Phase 1 is finished and actuals.cc resolves.
`metadataBase` is what turns the preview image into a full web address,
so pointing it at a domain that does not answer yet blanks every link
preview.

- [ ] `src/app/layout.tsx`: `metadataBase` and the openGraph `url` move
      to `https://actuals.cc`.
- [ ] `src/app/preview/og/page.tsx`: the address on the card currently
      reads actualshq.com, which is not a domain you are keeping. It
      becomes actuals.cc, and the card is regenerated.
- [ ] Docs: CLAUDE.md and IDEAS.md still describe gocelebet.com as the
      live address.

DONE, 18 August 2026. metadataBase, the openGraph url, the card's
address and the docs all say actuals.cc.

The card's ARTWORK is still the old logo and stays that way until the
new logo files arrive. Only the address on it was corrected, because it
had been left reading actualshq.com, a domain the owner does not own.

## PHASE 5: finish up.

- [ ] **Vercel:** set gocelebet.com to permanently redirect to
      actuals.cc, rather than serving the site itself. Old links, your
      testers' bookmarks and anything you have already posted keep
      working.
- [x] **Google Cloud, OAuth consent screen.** DONE 18 August 2026. App
      name, home page, privacy and terms links all moved to actuals.cc.
      The order matters: actuals.cc has to be added to Authorized
      domains BEFORE Google will accept a link pointing at it.
      The OAuth client itself needed nothing, because its redirect URI
      points at Supabase rather than at the app's domain.
      This does NOT fix the "sign in to wqhitxtowfhylzpfxkpw.supabase.co"
      line on the Google popup. That comes from Supabase and needs a
      paid custom domain plus brand verification. IDEAS.md item 22.
- [ ] **Instagram:** the link in your bio.
- [ ] Leave the old Supabase redirect URLs in place for a few weeks,
      then remove them. There is no rush and no cost to keeping them.

## What does NOT need touching

- The login, signup and password reset code. It follows the domain.
- Vercel environment variables. `ANTHROPIC_API_KEY` and the Supabase
  keys are unrelated to the domain.
- The Supabase project id. It stays `wqhitxtowfhylzpfxkpw` forever,
  whatever the project is named.
- The demo account address, unless you want to change it for tidiness.

## Still open, not part of this move

- The favicon and the link preview artwork, waiting on the new logo
  files. See IDEAS.md item 25.
