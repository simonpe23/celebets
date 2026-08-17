# Rename: the calls I made without asking

The brief said to make the call myself on anything it had not decided,
pick the option that is easiest to reverse, and write down what I chose
and why. This is that list. August 2026.

## 1. The landing page screenshots were regenerated

**The find of the job, and no grep could have caught it.** The landing
page's hero shows three phones. Those are not live components, they are
six PNG screenshots in `public/shots/`, taken on 12 August. The app's
name is baked into those pixels, so `grep -ril celebet src/` came back
clean while the old name was still sitting in the middle of the hero.

I only found it by looking at the screenshot, which is exactly why the
brief asked for that step.

Regenerated all six from the same preview routes and the same settings
`shotset.mjs` uses, except at deviceScaleFactor 2 rather than 3, because
2 is what the shipped files actually were (786x1704, not 1179x2556).

Verified against the old files pixel by pixel:
- `research-light` and `research-dark` came out byte identical, which is
  the control: that page has no wordmark, so nothing should have moved.
- `track` and `performance` differ by 4% and 1%. That is the date, not
  the rename: Insight of the day is seeded by the date, and the chart's
  axis is relative to today. The originals were shot on 12 August.

Reversible: the old files are in git history.

Not artwork, so not covered by the no-logo rule. These are screenshots
of the product, and leaving them would have advertised the old name in
the largest image on the site.

## 2. The Instagram link keeps the old handle

`instagram.com/gocelebet` appears in the landing footer, terms and
privacy. The account genuinely exists under that handle, so renaming
the link would point three pages at a dead URL.

Left the URL. Changed the `aria-label` to "Actuals on Instagram",
because that label names the company, not the handle, and it is what a
screen reader announces.

Fix this when the new handle is registered. It is on the owner's list.

## 3. The wordmark keeps its typeface

`Wordmark.tsx` had to be rebuilt: its whole design was "cele" in the
text colour and "bet" in a purple gradient, and the new name has no such
split. It is now plain text following the theme.

I kept `font-brand`, the app's existing brand face. CLAUDE.md is
explicit that changing a typeface is the owner's decision and never a
side effect of other work. A rename is not permission to change a font.

I also kept the `onDark` prop even though nothing passes it today.
Deleting it would gain nothing and would break a surface that is navy
in both themes.

## 4. One line left in CLAUDE.md, flagged rather than changed

Line 33: "project id wqhitxtowfhylzpfxkpw, named Celebet".

That is the name of the real Supabase project, in the real dashboard.
Renaming the sentence would make the note wrong: it would send a future
reader looking for a project called Actuals that does not exist.

Left it. The owner can rename the project in Supabase, at which point
this line should follow. It is on his checklist.

## 5. Screenshots were taken through the preview routes

`/app`, `/stats` and `/settings` need a session, and this run had no
credentials, so they redirect to `/login`. The `/preview/*` routes exist
for exactly this: they render the SAME components with made up data and
no auth. That is what the light and dark review sheets show.

The real pages are therefore verified by component, not by URL. The
first thing worth checking on a phone is that they render logged in.

## 6. design-check.mjs

One comment mentioned the old name. Renamed. It is a build tool, it runs
inside `npm run check`, and the line is documentation.
