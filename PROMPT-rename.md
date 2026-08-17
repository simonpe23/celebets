# The rename prompt

This file has THREE parts. Only PART 2 gets copied.

- PART 1: notes for you. Do not copy.
- PART 2: the prompt. Copy this, all of it, nothing else.
- PART 3: your own checklist for later. Do not copy.

---

# PART 1: notes for you (DO NOT COPY ANY OF THIS)

Written August 2026, for the day the name is settled.

Before you paste anything, fill in the six blanks marked
`<<< DECIDE >>>` inside Part 2. Type your answer on the `My answer:`
line under each one. Nothing else in Part 2 needs editing.

Then open a fresh session and paste Part 2 in one go.

Built to the prompt shape in CLAUDE.md, against the repo as measured
on 17 August 2026: 135 mentions of "celebet" across 49 files.

## The order, and why the domain is not first

Buying the domain and moving to it are two different jobs.

1. PICK THE NAME. The only real blocker. Part 2 says Actuals; if the
   answer is Seasons, Part 2 needs rewriting first.
2. BUY the domain and grab the Instagram handle the same day. About
   twelve dollars, and it stops the name being taken while you think.
   Point it at nothing yet.
3. PASTE PART 2. It ships on gocelebet.com and cannot break the
   address.
4. MOVE the domain, using Part 3.

Why the code rename goes before the move: every genuinely dangerous
step is in the move (login redirects, password reset email, DNS). If
both happen in one window and login breaks, there is no way to tell
whether it was DNS or one of 135 code edits. Renaming first means the
app is already proven, so the move is debugged on its own.

The reverse order is also worse for your testers. A site called
Celebet living at actualshq.com is more confusing than Actuals living
at gocelebet.com.

When the move happens, KEEP gocelebet.com ALIVE as a redirect. Old
links, your testers' bookmarks and any saved logins all point there.

---

# PART 2: THE PROMPT

## ▼▼▼ COPY EVERYTHING FROM THIS LINE ▼▼▼

BUILD: Rename the app from Celebet to Actuals, everywhere in the code,
and deploy it. This is the code and copy rename only. The domain stays
gocelebet.com for now and moves later, so nothing you do can break the
live site's address.

DONE MEANS, and check every one of these yourself before you tell me
it is finished:
1. `grep -ril celebet src/` returns nothing, except the allowlist below.
2. `npm run check` passes. Not design-check on its own, the full thing.
3. You screenshot the landing page, login, Track, Performance and
   Settings, in BOTH themes, and look at each one yourself. Fix
   anything clipped, overlapping or half renamed, then shoot again.
4. The theme choice survives the rename. Set Dark in Settings on the
   old key, reload, and confirm it is still Dark. This is the trap in
   IDEAS.md item 21 and it is silent when it breaks.
5. The Performance chart still draws in colour. Its SVG gradient ids
   contain the word celebet and the fill references must move with
   them, or the line goes black with no error.
6. `node scrubtest.mjs 3105 dark` and `... light` both pass, because
   the chart file is being edited.
7. Everything is committed and pushed.

ALREADY DECIDED, do not ask me about any of these:
- The name is Actuals. Capital A, no other styling. Not ACTUALS, not
  actuals, except where a URL or a code identifier needs lowercase.
- The word "Celebet" in user-facing copy becomes "Actuals". Sentences
  stay as they are otherwise. "Celebet fills the rest in" becomes
  "Actuals fills the rest in".
- localStorage key: rename `celebet-theme` to `actuals-theme`, and
  read the old key when the new one is missing, so nobody gets thrown
  back to System. Delete the old key after migrating it.
- The chart's SVG ids: rename them, they are internal references. The
  id and its url(#...) must move together.
- package.json name: change it to "actuals".
- supabase/*.sql: LEAVE THESE ALONE. They are a record of migrations
  already run, not live code. Renaming history is a lie.
- Domain references in code (metadataBase, Supabase redirect URLs,
  the og image, email addresses): LEAVE THEM ON gocelebet.com. They
  move in a separate job once DNS is ready. Changing them now breaks
  login and link previews.
- The demo account email stays as it is. I have to change that myself.
- Do not touch the Track page redesign. Track v9.3 is a separate deploy.
- Branching: work on claude/celebets-home-redesign-wip, and when every
  DONE MEANS item passes, merge it into claude/celebets-v1-build-fhio4a
  and push, which deploys to Vercel. You have my permission to push to
  the live branch for this task only.

<<< DECIDE 1 >>> THE WORDMARK. src/components/Wordmark.tsx is built
around splitting "cele" and "bet" into two colours. Actuals has no
such split, so this component has to be rebuilt, not find-replaced.
Pick one:
  (a) Plain text "Actuals" in the display font, one colour, no
      gradient. Simplest and it always works.
  (b) The A mark from brand/actuals/ beside the word.
  (c) The wordmark SVGs already in brand/actuals/.
My answer: ______

<<< DECIDE 2 >>> THE TRADEMARK LINE. The disclaimer says Celebet is a
trademark of Peak Street 6 LLC. Change it to Actuals, or remove the
line until the mark is actually filed?
My answer: ______

<<< DECIDE 3 >>> THE HEADER. Does the app header get the A mark now,
or stay text only until the Track redesign ships?
My answer: ______

<<< DECIDE 4 >>> ARTWORK. Regenerate favicon and og.png as Actuals
from brand/actuals/, or leave the old Celebet artwork in place until
I approve new versions?
My answer: ______

<<< DECIDE 5 >>> THE TESTERS. Deploying this means the live site says
Actuals while the address is still gocelebet.com. My 3 or 4 testers
will see that. Deploy anyway, or hold the merge and just push the wip
branch for me to review?
My answer: ______

<<< DECIDE 6 >>> THE DOCS. Rename Celebet inside CLAUDE.md, IDEAS.md,
ROADMAP.md and README.md too, or leave the notes alone since they are
a history of decisions?
My answer: ______

IF I DIDN'T DECIDE SOMETHING: make the call yourself, pick the option
that is easiest to reverse, and write what you chose and why in a file
called RENAME-DECISIONS.md at the root. Do not stop and wait for me.

DON'T TOUCH: the supabase/ folder, anything to do with the domain or
email addresses, the Track redesign preview, the brand/ source files
themselves, and any file under src/app/preview except by accident.

CHECKPOINT: after the first pass, before you polish anything, send me
one screenshot of the landing page and one of Track, both in dark. Then
keep going without waiting for my reply. If I answer, use it. If I do
not, carry on.

WHEN DONE: commit, push, and give me a short list of what to test on my
phone, plus the list of things I still have to do myself in Supabase,
Vercel, Hostinger and Resend.

## ▲▲▲ STOP COPYING AT THIS LINE ▲▲▲

---

# PART 3: your own checklist (DO NOT COPY ANY OF THIS)

Claude cannot click a dashboard. These stay yours, and none of them
block the code rename. Do them in this order, and only after the code
rename is live and working on the old address.

1. Buy the domain and point Hostinger DNS at Vercel.
2. Add the new domain in Vercel, keeping gocelebet.com as a redirect.
3. Supabase: new Site URL and redirect URLs, with `/**` wildcards.
4. Resend: verify the new sending domain, then DKIM, SPF and DMARC at
   Hostinger, then update the SMTP password in Supabase.
5. Google Cloud: the consent screen branding (IDEAS.md item 22).
6. Instagram handle.

Ask Claude for click-by-click steps for any of them.
