# Working with this project's owner

The owner has no coding experience. These rules are permanent.

## Communication rules

- Speak plainly. Short sentences. Explain at a level a non-coder can grasp.
- Be brief. Default to a handful of bullets, not a report. The owner
  said answers are too long (August 2026). Cut the reasoning unless it
  changes a decision. Do not list every test that passed, just say it
  works. Do not restate what was asked.
- ANSWER IN BULLETS, NOT PROSE. Repeated by the owner again on 18
  August after a decision he disagreed with sat mid-paragraph and he
  only found it a day later by rereading: "why do you keep burying
  important stuff in the middle of walls of text? i wonder how many
  times i've said that now." The test for every reply: could he skim
  only the bold bullet openings and miss nothing that needs him?
  Anything that needs his eyes goes FIRST, as its own bullet, never
  after a comma.
- Never compress several ideas into one long sentence.
- Write in short bullets, not long text blocks.
- Never bury an important note or a task in the middle of a text block.
  Tasks for the owner must be their own clearly marked bullet.
- Never use em dashes anywhere: not in code, comments, UI copy, commit
  messages, or documentation. Use commas, periods, colons, or parentheses.

## Workflow rules

- Never build until the owner explicitly approves the plan.
- Build in phases. The owner verifies each phase before the next starts.
- Ask questions on any ambiguity. Make no assumptions on product decisions.
- This is a v1: prefer simple and working over clever.
- Database changes: the owner has a Supabase connector installed in
  Claude (project id wqhitxtowfhylzpfxkpw, named Celebet). Claude can
  apply SQL directly via apply_migration after the owner approves the
  change. Keep saving each change as a supabase/*.sql file in the repo
  for the record. If the connector is ever unavailable, fall back to
  the old way: the owner pastes the SQL in the Supabase SQL Editor
  with click-by-click instructions.

## UI rules (permanent, added August 2026 after wasting the owner's time)

The owner should never have to catch a typography or spacing
inconsistency. Finding one is a failure, not feedback.

Tailwind v4 skips gitignored files when it generates classes, so the
local preview pages in src/app/preview never get new utility classes.
Use inline styles there, or the preview silently falls back and you
compare two identical things.

Run `npm run check` before every screenshot. It is design-check, tsc, a
real production build, AND sitecheck.mjs, which loads all 36 pages in
both themes and reads what actually rendered, plus the public pages
again at laptop width. Never show the owner a
screenshot while it is failing.

SITECHECK EXISTS BECAUSE OF THE RENAME, August 2026. The owner spent
one minute on four pages and found five mistakes I had shipped. His
words: "if I spend a minute and find 5 mistakes, what else is wrong?
makes me even more stressed." Checking by eye does not scale, and
making him the last line of defence is the failure.

It reads the RENDERED page, which is the point: grep cannot see copy
assembled at runtime, text inside a component, a page title, an alt
attribute, or where a link actually goes. It catches a page that 500s,
a page that 404s, an image that never loaded, a broken internal link,
any console error, a login gate that stopped redirecting, and any old
brand name left on screen.

It starts its own dev server when none is running and stops it after,
because a check that needs three commands is a check that gets skipped.
Point it at a real address to test a deploy: `npm run sitecheck --
https://actuals.cc`. That fails from inside Claude's sandbox,
whose proxy blocks the domain, but it works from the owner's machine.

When something reaches the owner that a machine could have caught, the
fix is a rule here or in design-check.mjs, not a promise to be careful.

Do NOT run `node design-check.mjs` on its own. In August 2026 the
owner got a session's worth of "Failed preview deployment" emails
from Vercel while design-check and tsc were both green: ESLint's
rules-of-hooks only runs inside `next build`. If the build is not
part of the check, the check is a lie.

GESTURES DO NOT SHOW UP IN A SCREENSHOT. Added August 2026, after the
owner found that press and hold scrubbing on the Performance chart had
been dead for four days. I broke it fixing something else: the chart
stopped rendering on its first pass, so the touch listeners attached to
an element that did not exist and never attached again. No error, no
warning, no failing build, and every screenshot looked perfect.

So: after ANY change to a component that handles touch, drag, long
press or scroll, run `node scrubtest.mjs <port>` against a dev server,
in BOTH themes: `node scrubtest.mjs 3000 dark` and `... light`. It
drives a real finger across the chart and checks the headline follows.
A design check cannot catch a dead event listener.

The chart panel has a light surface as well as a dark one now, and a
gesture proven on one is not proven on the other: a class change is
exactly how the listeners came unstuck the first time.

THE SWEEP RULE (added August 2026, after the owner had to ask three
times whether a font change had reached the whole app):

A preview is a comparison. If place A is updated and place B is not,
the comparison is worthless and the owner cannot decide anything. So:

- Never show a preview until the change is applied everywhere it
  belongs. Not "mostly". Everywhere.
- Before the screenshot, list every place the thing appears and
  decide each one, including the ones that should NOT change.
  Undecided is not allowed.
- Say in the message which files were swept and what was left out on
  purpose, with the reason.
- When a change has a pattern (a color, a font, a size), add a rule
  to design-check.mjs so the machine catches the next one, not the
  owner. The money font rule is the worked example.

THE PHONE RULE (added August 2026, in the owner's words: "this app
is for phones also. if any preview is made, it has to be double
checked for phone as well. thats your job, not mine.") Every preview
of anything gets checked at phone width AND laptop width before he
sees it. The squashed-logo bug is the reason: a header change was
previewed at 1512px only, shipped, and the owner found the logo
warped on his own phone. A layout change is never one screen width.

Before showing any UI change:

1. Change shared values in the shared file, never in one page.
   If a value lives in two places, that is the bug. Fix that first.
2. Sweep the whole app for the thing being changed. Grep for the class
   or color across src/ and confirm every hit. A design change is never
   finished in one file.
3. Change nothing the owner did not ask for. Alignment, casing, size
   and color are product decisions. Propose them, do not apply them.
   Reverting an unrequested change costs the owner a full round trip.

   NEVER CHANGE A FONT WITHOUT HIS PERMISSION. His words, August 2026,
   after I swapped the numeral face from Inter Tight to Geist during a
   rebuild, wrote a note in this file justifying it, and he found it
   days later on the live site. This covers the family, the weight and
   the size: HeroMoney's weight went 500 to 600 in the same edit and
   nobody caught that for days either. Ask first. Every time. If a
   font looks wrong to you, say so and show him a comparison.
   design-check rule 8 fails the build if the numeral face or the hero
   weight moves, so this cannot happen by accident again.
4. Compare the two pages side by side before showing anything. The
   home page and the stats page must look like one product.
5. Show options when the owner is judging looks. Two or three named
   variants beat one guess.
6. Before proposing a deploy, say what else in the app the change
   touches, and show those screens too. The owner asked for this
   (August 2026). A font change is never one screen.
7. Coach the owner on focus. He knows he can get stuck on a small
   detail before shipping. When that happens, say "I will store it,
   let us finish X first". If he insists, drop it and do as he asks.

### The design system

Everything below lives in code. Do not restate these values inline,
import the component or reuse the exact class string.

SHARED COMPONENTS. Never copy their markup into a page.
- src/components/MicroLabel.tsx  the small uppercase label
- src/components/StatTile.tsx    the labelled number in a card
- src/components/HeroMoney.tsx   the big money number

TWO FACES. Words are Geist. Numbers are INTER TIGHT, through the
`font-money` variable, at weight 500 on the big hero figures.
- The owner chose Inter Tight on 5 August 2026 from a comparison page
  of candidates. It is a decision he made, not a default.
- DO NOT SWITCH IT. I pointed `font-money` at Geist during the Track
  rebuild because the condensed cut read narrow beside the mockup, and
  I never asked. He caught it days later and put it back. A typeface
  the owner picked is a product decision: propose, never apply.
- The same mistake raised HeroMoney from weight 500 to 600. The number
  ladder below said 500 the whole time, so the code and the notes
  disagreed and nobody noticed. Back at 500.
- design-check enforces that every money value carries `font-money` or
  is listed as prose.

THREE WEIGHTS. font-medium does not exist in this app.
- normal    body text, captions, inputs
- semibold  field labels, row labels, chips, tile and row numbers
- bold      buttons, card headings, money inside bet cards

TYPE SCALE.
- Micro label   MicroLabel: 10px bold uppercase, wide tracking,
                neutral 400, or white/40 on the dark chart panel
- Caption       text-xs, neutral 500 light / neutral 400 dark
- Body          text-sm
- Label         text-sm font-semibold
- Card heading  text-lg font-bold
- Page title    text-2xl font-bold

NUMBER LADDER. Two things set the weight: size and container.
Bigger goes lighter, so the optical weight stays even. A number with
no card around it goes one step heavier, because the container is not
there to give it presence.
- 14px  bold      money inside a bet card row
- 16px  semibold  StatTile value, inside a card
- 18px  bold      the row under the headline, bare on the page
- 32px  weight 500  wallet balance
- 42px  weight 500  analytics headline

BUTTONS, THREE TIERS.
- Tier one    text-sm font-bold, px-3 py-2.5, rounded-xl.
              Log out, Home, Start here, Analytics, Recommendations,
              Paste bet slip, Upload image, Add leg. The two popup
              buttons use text-base font-bold because they are taller.
- Tier two    chips: text-sm font-semibold, px-3 py-2, rounded-xl,
              38 pixels tall. Sport, money, category, filters.
- Tier three  text-xs font-semibold. Only inside a dense card row
              (Won, Lost, Cash out, Delete, Add money, Remove).

COLOR (rewritten three times in August 2026, and only the third time
from measurements).

THE RULE THAT ENDED IT: SAMPLE THE MOCKUP, DO NOT EYEBALL IT. The
owner re-uploaded mobile-dark-10.png and every value below was read
out of it with Pillow. Two of my guesses had been wrong for weeks:
- The dark page is NAVY (#04081B), not the neutral grey-black I built.
  My own note said "a cool near-black, barely blue". The blue channel
  actually runs about four times the red. That single error is why the
  build looked flat beside the mockup while each piece looked right.
- The purple was DARKER than the mockup, not brighter. The owner had
  said "your purple is bright and childish" so many times that I
  over-corrected past his mockup and landed on #4C1D95.
Keep the mockup files. If they are lost, ask for them again rather
than matching by eye. Sampling took ten minutes and settled six
rounds of argument.

- Ink is the default. Muted is neutral 500 light, neutral 400 dark,
  everywhere, with no exceptions.
- PURPLE HAS ONE JOB: SOMETHING YOU PRESS. Ruled by the owner, August
  2026: "the purple color is too overwhelming, it's just too much
  purple, everywhere."
  He was right and the shade was not the problem. Purple was doing
  seven jobs at once (brand, button, active tab, link, badge, data
  line, decoration) and twelve purple objects sat on the Track page's
  first screen. A color that means seven things means nothing, so
  nothing looked important.
  Purple is now the primary button, the active tab, the selected chip
  and the primary capture tile. That is all.
  Values, sampled from the mockup: the vertical gradient #5525C6 down
  to #4915AD, pressed #3D0F94, chosen by the owner in a labelled A/B
  over the flat #4C1D95. #7C3AED and #9A57FC survive only as the
  border and icon of a purple control.
  design-check rule 8b fails on purple in any file not on its
  allowlist, and every entry on that list names the control it is for.
- WHAT REPLACED IT, so the app is not just purple and white:
  links      ink plus a chevron. "View all ›", never a colored link.
  data       green up, red down. The balance sparkline is money, so it
             is green or red. A line that is not money (a win rate) is
             neutral #94A3B8. There is no purple data line.
  insights   THE ACCENT, the app's one secondary color: warm amber,
             #B45309 on light and #FBBF24 on dark, with the trophy a
             #FBBF24 to #B45309 gradient. It is the opposite
             temperature to purple, which is where the variety comes
             from, and it marks insights ONLY: the sparkle, the AI
             badge, the trophy. Never a button, never a link.
             ACCENT and ACCENT_TINT live in src/lib/ui.ts.
  badges     the pending count and the PARLAY chip are neutral. A
             count is data, a type is a label; neither is a control.
- THE FILL SWEEP (August 2026). Seventeen filled buttons across the
  app were still on the old text purple with a #6D28D9 press. That is
  why the purple kept reading wrong after each fix: the rule was
  written but only the newest buttons obeyed it. design-check rule 4c
  now fails on every retired value (#6D28D9, #4C1D95, #3B1578) and on
  any filled #7C3AED button.
- THE SET BALANCE BUTTON, settled after six rounds. 32px tall, auto
  width, 13px semibold, a 6px radius, the BTN gradient, sitting under Net
  profit. It went 52px, then 44px, and the owner still called it too
  big every time because only the size moved. The real answer was
  that setting a tracking balance happens ONCE, so it never deserved
  a full width primary button. Its label shortens to "Set balance"
  once a balance exists. BalanceCard keeps a `control` prop (under,
  corner, link, button) and /preview/buttons compares them.
- Buttons are squared, not pills. rounded-md is the primary, and the
  owner rejected rounded-xl and rounded-lg as too round.
- THE TAB BAR. The active tab is a FILLED icon plus a label, both in
  purple, on the bar's own surface: #ECECF3 on light, #111731 on dark.
  Chosen by the owner from three shown side by side (tinted, white,
  ink). It used to be white on the #F7F7FB page and blurred into
  everything. 62px tall, not 78, and rounded-xl, not rounded-[26px],
  which he called childish. There is
  NO purple pill behind it: the owner sent a screenshot of the look
  he wanted and the block was heavier than everything near it. Track
  and Performance fill their shapes when active; the magnifier has no
  solid form that still reads as a magnifier, so it thickens instead.
  The active purple is #5525C6, the Set balance button's purple, ruled
  by the owner: one purple per screen, not two shades of it. Dark uses
  #9A57FC, because #5525C6 on the #0C1125 bar is a contrast ratio of
  about 2.3 and the selected tab reads as switched off. #9A57FC is
  the mockup's own active tab color, so dark is not a compromise.
- Green means money went up, red means money went down, and neither
  is ever an action color. emerald-600 light, emerald-400 dark.
  Red: red-600 light, red-400 dark.
- One green button survives: Won on a pending pick, #16A34A, pressed
  #15803D, because it declares an outcome, not an action.
  design-check rule 4b enforces that it appears nowhere else.
- The outcome pills use the mockup's own brighter pair, #22C55E and
  #EF4444, identical in both themes so a settled pick reads the same
  everywhere. Tailwind's emerald-600 and red-600 were too dull.
- The capture tiles carry their own icon colors, from the mockup:
  camera #3B82F6, pencil #F97316, connect #22C55E. Icons only,
  never buttons.
- Light surfaces: page #F7F7FB, white cards with a hairline ring.
- Dark surfaces, all sampled: page #04081B, cards #0E1228, popups
  #161D38, tab bar and other raised surfaces #0C1125, chart panel
  #080D20, hairlines white/[0.07]. It is a navy near-black. The page
  is much darker than everything sitting on it, and the raised
  surfaces are nearly all the same value: what separates a card from
  a row inside it is the hairline, not the fill.
- Cards are defined by their EDGE, not by a shadow. The heavy
  violet-cast shadow was another invention.
- src/lib/ui.ts owns CARD, INNER (the row inside a card), BTN, and
  the OUTCOME pills. Won and Lost are quiet tinted pills, never
  filled bars: a filled bar shouted louder than the bet it settled.

CAPTURE TILES. Two big tiles (Paste bet slip, Upload screenshot) over
two small ones (Manual entry, Connect). Ruled by the owner: four equal
tiles spent the card's best space on its two least tapped doors.

SIZE. The build ran about a fifth larger than the mockups for weeks,
which is why the mockup fits Pending Bets on the first screen and the
build did not. Greeting 22px, card headings 17px, hero balance 34px,
primary button 52px tall at 16px.

## Status

- v1 is complete and verified by the owner (July 2026). All five build
  phases shipped: auth, wallet, singles, parlays, settlement with undo,
  stats page, recommendations, deletes, editable dates, mobile polish.
- All SQL files in supabase/ have been run by the owner, in order:
  schema.sql, phase2.sql, phase3.sql, phase3b.sql, phase4.sql,
  phase4b.sql.
- Exact To Collect: the owner can type the exact payout on any bet,
  To Win follows it, odds are stored with 4 decimals to pay out exactly.
- Stats money rules: won bet profit splits across sports weighted by
  leg odds (minus 1). Lost bet stake is charged to the losing pick(s).
  With a sport filter active, the whole stats page speaks in that
  sport's picks and that sport's share of money.
- Recommendations rotate randomly on each tap: advice needs 5 settled
  bets or picks per group, plain facts have no minimum.
- Cash out (phase6.sql, run and verified July 2026): a pending bet can
  settle at the exact amount received. At or above stake counts as won,
  below as lost, payout = the amount either way, so profit is always
  payout minus stake. Cash out means done: no pick settling afterwards,
  the card leaves Live now after the 15 minute undo window.
- Picks still open at cash out inherit the cash out outcome in the
  records: profit = won picks, loss = lost picks (rule changed by the
  owner in phase 7, replacing the old "cashed out picks do not count").
- Screenshot import (verified July 2026): Paste bet slip / Upload
  image on the New Bet form. A server route (src/app/api/parse-slip)
  sends the image to the Claude API (Haiku) and pre-fills the form.
  The user always reviews and places manually. Needs the
  ANTHROPIC_API_KEY environment variable in Vercel (set by the owner,
  key never in the repo or chat). Unknown sports come back empty,
  categories may be free text with a clear link.
- Add money (phase7.sql, run and verified July 2026): a pending bet
  can absorb more buys, each with its own amount and payout (bet_buys
  table). The bet's stake and To Collect grow to the merged totals,
  matching how Kalshi merges positions. On singles every buy counts
  as its own pick at its own odds (payout / amount) in the records
  and odds groups. On parlays picks stay = legs. A "N buys" button on
  cards expands the individual buys.

## Analytics centre (August 2026, shipped and verified on phone and laptop)

- The stats page is now the analytics centre. No database change was
  needed, this is presentation only.
- Profit over time chart: running profit from a settled bet's date,
  always starting at zero for the chosen period. Green above zero,
  red below. Drawn by hand as SVG, no chart library.
- THE CHART HAS NO PANEL IN LIGHT MODE. It draws straight on the page,
  with the app's ordinary money greens and reds and no glow. Chosen by
  the owner from three (white card, soft tint, no panel), after he
  said a black panel on a light page "does not go". He was right and
  the old rule ("a glow needs darkness") only ever considered the
  glow, never the page around it.
- DARK MODE IS UNCHANGED: the navy panel and the glow belong there.
  The chart's colors are CSS variables the panel sets, because they
  are SVG attributes and an attribute cannot carry a dark: variant.
- The period control (ALL, 1D, 1W, 1M, 1Y, plus a calendar button for
  a custom range) lives on the panel, because it changes the panel.
- Page order: header, ONE dark panel holding the period chips, the
  headline profit with its ROI pill, the Bets / Record / Hit rate row
  and the chart, then sport filter, three tiles
  (Staked, Returned, ROI), sports breakdown, the older tables,
  betting history.
- Recommendations moved to the top of the page, next to Home. The
  buried "All recommendations" link is gone, Show all lives in the
  popup.
- Per-sport money uses betProfitFor in src/lib/stats.ts, the same
  split rules as the Per sport table. Per-sport ROI is NOT possible
  yet: a parlay's stake covers several sports and there is no agreed
  rule for splitting it. That needs an owner decision.
- The chart scrubs: touch it anywhere and the headline shows the
  profit and date at that point. The chart owns every touch inside
  it, so nothing scrolls there. You scroll from outside it. Android
  gets a short vibration on touch, iPhone gets none (no browser on
  iOS has a vibration API, and the switch trick did not fire).
- The page is called Analytics. The web address stays /stats so old
  bookmarks keep working.
- Dark mode follows a data attribute on <html>, not a media query.
  System, Light and Dark live on the settings page, and the choice is
  saved in localStorage on that device. See the settings section.

THE TOP OF PERFORMANCE (rebuilt August 2026). The owner: "there's too
much dead space on the performance page at the top... i don't think we
get the best possible information."

Four causes, all mine:
1. The title was left aligned and the hero centred, so the space
   between them read as a hole, not as breathing room.
2. "ALL TIME" sat over the number while "ALL" sat selected in the chart
   panel just below. The same fact twice. "PROFIT" labelled the panel
   as well, which made it three times.
3. The number, the ROI pill, the record row and the chart were four
   floating things on a plain page. The eye had nothing to hold.
4. The title did no work: the tab bar already says you are on
   Performance.

The number now lives ON the chart panel, above the line that draws it,
with the record row under a hairline. One object instead of five.
ProfitPanel already had a `header` slot built for this and nothing had
used it. The "PROFIT" label is gone, because a signed money figure
sitting under it says the same thing louder.

The subtitle is "Find what pays and what leaks." The owner offered
three lines of copy (Learn, Analyze, Improve). One line earns its
place at the top of a page opened daily; three become wallpaper by the
third visit. The other two belong on the landing page or the empty
state, not above live numbers.

data-chart-panel on that section is a TEST HOOK, not a style.
scrubtest.mjs used to find the panel by the word "PROFIT", so deleting
that label silently pointed the test at another card and it reported
the gesture dead when it was fine. Never let a test find its target by
copy.

## The flow: Track, Performance, Research (owner, August 2026)

Written down as given. Not built. Mockups are coming next.

THE SPLIT THAT MAKES IT WORK. Insights and Research are opposite
ends of one timeline:
- Research happens BEFORE a bet. It is active. The user goes looking.
- Insights happen AFTER a bet. Actuals surfaced them on its own.

AN INSIGHT is something Actuals discovered. Not something the user
asked for, not something an AI researched. It comes from the user's
own data. Examples given by the owner:
- You have won 63% of bets between 1.01 and 1.80 odds.
- Parlays account for 72% of your losses.
- Tennis has become your most profitable sport.
- You are 9-1 betting Dodgers home games.
- You perform much better on weekdays.

RESEARCH is the user looking for information before betting:
who is pitching tonight, is LeBron playing, Dodgers trends, compare
odds, the weather, what the community thinks, ask ActualsBOT.

THREE TABS, AND ONLY THREE. Track, Performance, Research. Insights
does NOT get a tab. It becomes a layer inside Performance, the way
Apple Health puts insights inside the health data rather than beside
it.

PERFORMANCE IS A PERFORMANCE REVIEW, NOT A STATISTICS PAGE. Opening
it should not land on graphs. Order ruled by the owner:
1. Today's Insight
2. Key Insights
3. Performance Snapshot
4. Charts
5. Sports Breakdown
6. Odds Groups
7. Singles vs Parlays
8. History and Trends
The owner's example of the top of that page: Today's Insight, then
Biggest Strength (MLB Favorites +$812), Biggest Weakness (Player
Props -18% ROI), Trending (your ROI has improved three weeks in a
row).

THE HOME PAGE INSIGHT CARD. Its link must not read "View Insights",
because that sounds like a separate product. It reads "View
Performance" or "See Why" or "Open Performance", because tapping it
enters the Performance area, whose first section is Today's Insight.

THE ONE LINE SUMMARY:
- Track means capture data.
- Performance means understand yourself.
- Research means understand the game before your next bet.

BUILT, August 2026. Research is a shell: a search field and six doors
(Who is playing, Team and player trends, Compare odds, Weather, What
the community thinks, Ask ActualsBOT). Every one needs data Actuals does
not have, so none of them work and the section says "Coming to
Research" rather than wearing six identical Soon badges. The icons are
ink: a color would say the door works. They earn one when they ship.

The full insight list used to BE the Research tab, which contradicted
the split above. It moved to /insights, reached from "Show all" in the
insights sheet, and it lights the Performance tab because that is the
area it belongs to.

The Research address stays /recommendations, the same reasoning as
Performance living at /stats: old links and the tab bar's match both
keep working, and a redirect is one more thing to get wrong.

## The Track page (August 2026, built to the owner's mockups, deployed,
## then refined as v9.3, deployed and verified by the owner)

V9.3, THE REFINEMENT ROUND, shipped 19 August. Nine drafts taught the
same lesson as the first build: the owner wants HIS design improved,
never replaced. What v9.3 changed on the live page: the header is one
row (the real brand mark from public/brand/mark.png, the greeting
without the emoji, a gear chip for Settings, ruled by the owner over
the "semi-vague" initial avatar); Tracking Balance is a full-bleed
band on phones (a card again from sm up) with the balance at 40px,
the profit arrow line, the edge-to-edge chart with a dashed
started-here baseline, and a Today/Week/Month/Year strip whose date
ranges come from periodStart in stats.ts, THE SAME function
Performance's chips read; the snapshot lost its mini sparklines and
sport emoji. Kept against the sketch on purpose: View Insights on the
insight card, and the fully working pending and history cards.

THE MOCKUPS ARE THE SPEC, TO THE PIXEL. The owner rejected two earlier
attempts ("a reskin is far from enough", "a fake cheap copy") because
the mockup was poured into the old design system instead of replacing
it. What that cost, written down so it is never repeated:
- A mockup is an anatomy, not a palette. Copy the skeleton first
  (what is in the card, in what order, at what size), then the color.
- The old system's habits are the tell: uppercase labels everywhere,
  full width action bars, three-column stat grids, five rows of text
  where the mockup has two.
- Primary buttons are a vertical violet gradient with a glow (BTN in
  src/lib/ui.ts). A flat fill reads cheap.
- Sparklines are a line with a gradient fading under it, or a bare
  line. Never a flat filled block.
- Card labels are sentence case. Uppercase survives only where the
  mockup itself shouts (TRACKING BALANCE).
- Pending Bets is ONE card holding the heading, View all, and the
  bets as lighter inner rows. Parlays open with a rail threading the
  leg icons, singles collapse to a row with a chevron.

The owner drew four mockups (mobile and web, light and dark) and they
are the spec, with the divergences listed in ROADMAP.md. The home page
is now the Track page: greeting, Tracking Balance card with the purple
balance sparkline and one Set Tracking Balance button, the four
capture tiles (Paste bet slip with a Recommended badge, Upload
screenshot, Manual entry, Connect accounts with a Soon badge), Insight
of the day linking to Performance, the Performance Snapshot, then
Pending bets. History and charts live on Performance.

Navigation is the bottom TabBar: Track, Performance, Research. The
home page carries no navigation buttons of its own anymore.

Decisions locked in during this build:
- Net profit has ONE definition (balance + removals minus additions)
  and every surface shows that same number. The snapshot must never
  compute its own settled-only version, that mismatch was caught and
  fixed before it shipped.
- Insight of the day is seeded by the phone's date: steady all day,
  new overnight.
- The greeting uses the Google account's first name and greets bare
  on email accounts. A mangled email prefix is worse than no name.
- Best Sport in the snapshot shows profit, not ROI, because per sport
  ROI has no honest formula yet (parlay stakes span sports).
- Soon badges instead of dead links, ruled by the owner. The pip
  strip (recent form) was dropped by the owner.

## Login (August 2026): no passwords, a six-digit code

- There is ONE auth page, /login. Start Tracking opens it greeting
  "Create your account", Log in greets "Welcome back", and the button
  between them never changes. /signup, /forgot-password and
  /reset-password are deleted and redirect here.
- Two Supabase settings this code depends on, neither of them visible
  in the repo. Both cost the owner a live test when they were wrong:
  - EMAIL OTP LENGTH MUST BE 6. Authentication, Sign In / Providers,
    Email. It goes up to 10, the project was on 8, and the app draws
    exactly six boxes, so a correct code could never be entered.
  - THE EMAIL TEMPLATES MUST CARRY {{ .Token }}, on BOTH the "Magic
    link or OTP" and "Confirm sign up" tabs. The stock templates send
    a sign-in LINK, and nothing in the app catches those any more.
- A NEW address and a RETURNING one need different verifyOtp types
  ("signup" vs "email"), because Supabase picks the template by
  whether the account exists. AuthCard tries one and falls back to the
  other. Never simplify that to a single type: the wrong one answers
  "Token has expired or is invalid", which looks exactly like a wrong
  code, and it silently locked out every first-time visitor.
- THE DEMO DOOR, for investors. The demo account cannot receive codes,
  so typing its address skips the email entirely and checks one
  permanent code through /api/demo-login. Configured only by three
  Vercel settings (NEXT_PUBLIC_DEMO_EMAIL, DEMO_CODE, DEMO_PASSWORD);
  with any unset the door does not exist. NEXT_PUBLIC_ values are
  baked at build time, so a change needs a REDEPLOY, not just a save.

## Tester readiness (July 2026, complete and verified)

- Email confirmation is ON: new signups must click a link before they
  can log in. Accounts created before this stay valid. The setting
  lives on the Supabase Sign In / Providers page, not inside the
  Email provider popup (use the dashboard search for "confirm email").
- Minimum password length is 8, matched in the signup and reset pages.

- Password recovery works: Forgot password link, /forgot-password,
  and /reset-password. The reset page accepts every link shape
  Supabase sends (code exchange, tokens in the address bar, token
  hash) and /auth/confirm handles token-hash links. Both are exempt
  from the login gate in middleware.
- Emails are sent through Resend from no-reply@actuals.cc, wired
  into Supabase custom SMTP (host smtp.resend.com, username resend,
  password = a Resend API key scoped to actuals.cc). DNS records
  for DKIM, SPF, MX, and DMARC live at Hostinger.
- Supabase URL configuration: Site URL https://gocelebet.com, and
  redirect URLs for gocelebet.com, www.gocelebet.com, and the
  vercel.app address, all with /** wildcards. New domains must be
  added here or reset links silently fall back to the home page.
- Disclaimer component shows on login, signup, reset, and home:
  entertainment only, 1-800 GAMBLER, adults only, plus the line
  "Actuals is a part of Peak Street 6 LLC". That replaced a trademark
  claim at the rename, on the owner's wording: the mark is not filed.
- Testers each create their own account. The old demo account is
  only for people who want a quick peek.

## Idea backlog

- New ideas go into IDEAS.md, in a NOW, SOON, or FUTURE bucket.
- When the owner says "I have a new idea, store it", add it to
  IDEAS.md in the bucket they pick (recommend one if they don't).
- Ideas are never built from the file alone. Building always needs a
  presented plan and explicit approval, per the workflow rules.

## Product facts

- App: Actuals, a mobile-first manual sports bet tracker. Renamed
  from Celebet in August 2026.
- Live at actuals.cc (Hostinger domain, Hostinger keeps DNS,
  pointed at Vercel). The vercel.app address still works too.
- The owner has an Instagram account for finding test users.
- Stack: Next.js App Router, TypeScript, Tailwind, Supabase with RLS,
  deployed on Vercel from branch claude/celebets-v1-build-fhio4a.
- Currency: USD with 2 decimals. Decimal odds with 2 decimals.
- Wallet balance = deposits - withdrawals - all stakes + payouts of won bets.
- Net profit = wallet balance + withdrawals - deposits.
- To Win = stake x (odds - 1). To Collect = stake x odds.
- Bet flow (redesigned and verified July 2026): money in, money out.
  The owner types the stake and the exact To Collect (required on
  every bet). There are NO odds inputs anywhere in the form. Total
  odds are always derived: To Collect / stake, stored with 4 decimals.
- Parlays: each leg has one optional Chance (%) field (Kalshi style).
  Leg odds derive from the percentages and are scaled by one shared
  factor so they multiply exactly to the real total odds (the fee gap
  is spread across the picks). If any leg's % is missing, the known
  legs keep the straight 100 / percent conversion, unscaled. Money is
  never touched by percentages.
- On singles the leg's odds = the bet's derived odds.
- The stats row (Today, week, month, year) sits under the wallet card
  and at the top of the stats page.
- The pick description is optional everywhere. Cards fall back to the
  category, then the sport.
- The owner has a demo account (celebetsdemo@simonpe.com) holding the
  old test data, shared with a few testers. Friction of manual logging
  is the top known product problem, screenshot import is the planned
  answer (see IDEAS.md).
- A lost parlay pays nothing. Legs that were right in a lost parlay earn
  zero money. They only count in the per-sport won/lost record.
- Sports (fixed): Football (soccer), American Football, Basketball,
  Baseball, Ice Hockey, Tennis, Golf, esports (lowercase), Crypto
  (phase8.sql, for crypto price markets).
- Picks have an optional sub-category (Corners, BTTS, ...). The lists
  live in SUBCATEGORIES in src/lib/types.ts, Football only so far.
  Adding sub-categories is a code change, never a database change.
  Nested choices are stored as "Group: Choice" (Player Props: Assists).
- All SQL files through supabase/phase13.sql have been run, in order.
  phase8 (Crypto) was applied by Claude via the Supabase connector.
  phase12 (the taxonomy columns) and phase13 (six more sports, plus
  competition on manual entry) were run by the owner and both returned
  their proof numbers, 21 August 2026.
  Transaction dates are editable.
- COMPETITION IS TAPPED, NEVER TYPED. It shipped as a text box and
  the owner rejected that on 21 August 2026: "99% of the competitions
  are the same leagues every time. this has to be tappable chips. not
  writing." He is right, and the reason is data integrity, not
  convenience: "EPL" and "Premier League" typed by two people is one
  league split into two analytics rows forever, the same disease the
  taxonomy exists to cure. SPORT_COMPETITIONS in src/lib/taxonomy.ts
  holds his approved list per sport, and COMPETITION_ALIASES pulls
  Kalshi's words onto the same chip. Football deliberately has no
  World Cup or Euros chip (neither runs for two years) and carries
  International and Rest of the World instead. Boxing has no list at
  all, because it has fights, not seasons, so it keeps a text box.
- SUPABASE'S SQL EDITOR RUNS YOUR SELECTION, not the file, whenever
  any text is selected. phase13 failed on its second run with "syntax
  error at or near Companies" because a double-click had selected that
  one word. Clear the selection, or press Cmd+A, before Run.

## Settings (August 2026, built and verified)

- Reached by tapping the AVATAR, not from a tab. The owner ruled three
  tabs and only three. The avatar used to be the log out button, so one
  stray tap ended the session; log out now sits at the foot of Settings.
- Address is /settings. It shows the tab bar with Track lit, because it
  is reached from Track.

THEME. System, Light or Dark, stored in localStorage under
`actuals-theme`. System is the default and stores nothing, so anyone
who never opens Settings keeps following their phone forever.
- The key was `celebet-theme` before the rename. Both readers, the raw
  script in layout.tsx and Settings after mount, fall back to the old
  key once, copy it across and delete it. They have to stay identical:
  two rules for one attribute is how the theme flash comes back.
- The whole app keys off `data-theme` on <html>. globals.css declares
  `@custom-variant dark (&:where([data-theme="dark"], ...))`, so a
  media query alone can no longer decide anything. That swap was the
  only way a user choice could beat the phone.
- A raw script in the layout head sets the attribute BEFORE the first
  paint. A React effect runs after paint, which is the flash itself.
  The script and Settings' `apply()` must stay in step: two rules for
  one attribute is how a flash comes back.
- There is ONE theme-color meta tag, rewritten by that script. A light
  and dark pair cannot be overridden, so choosing Light on a dark phone
  left a navy status bar above a white page.

START A NEW RECORD, and there is NO delete-everything button anywhere.

I built one. The owner rejected it: he had asked to reset the tracking
balance so a user could start over, and deleting their bets is not
that. His words: "i think data is still valuable despite wanting a
fresh reset of your tracking."

So Actuals draws a LINE instead. `tracking_since` goes into the auth
user's metadata (no migration), and `sinceLine()` in src/lib/stats.ts
keeps a bet if it was NOT already settled before that date.
- That one rule carries pending bets over, which the owner wanted: a
  bet still riding when you draw the line is live money, so it belongs
  to the new record.
- A bet settled exactly ON the line belongs to the old record.
- Net profit, ROI, win rate, the chart, the snapshot and the insights
  all count from the line. Nothing is deleted.
- Performance carries an "All time" switch, so the old record is one
  tap away. The review at the foot ignores that switch on purpose: it
  is the CURRENT record, and mixing the two would put two different
  profits on one screen.
- With no line, netProfitOf(all bets) equals balance + removals minus
  additions exactly, so nothing moves for a user who never starts
  fresh. Verified with a arithmetic test, not by eye.
- startedWith is now derived as balance minus net profit, so
  startedWith + netProfit = balance holds with or without a line.

IT IS FULLY REVERSIBLE, and that is the point. The owner rejected my
first version of this too: "too much risk in the start fresh button.
there must be an option to regret the start fresh... i don't want
people to accidentally loose all their data."
- Undo has NO time limit. It lives in Settings for as long as a line
  exists, not for fifteen minutes.
- Undo sits BESIDE the restart, in the same quiet section, at the same
  tiny weight. It is not a button in Your data. The owner cut that: "a
  restart is uncommon. to undo a restart is even more unique. we can't
  have a big button that talks about such a minor part of the app."
- It is labelled by what it does, not by the word undo: "Count all my
  bets again, from the start". His test: "if you click it, what
  happens? then the button should say so."
- Undo reverses BOTH halves: it clears the date and deletes the exact
  balance transaction the restart created. Its id is stored beside the
  date in metadata (`tracking_reset_tx`) so Undo cannot touch anything
  else the user has done to their balance since.
- The sheet leads with "Nothing is deleted" in green, then two lists:
  what changes, and what does not. The owner's fear was a user tapping
  this and believing their bets were gone, so the reassurance comes
  before the consequences, not after.
- The normal wording is "Your record started on <date>", stated as a
  plain fact in Your data. Ruled by the owner: "a restart is just a
  what if. most users will not restart." Without a restart that date is
  the first thing the user ever tracked.
- The restart itself is the QUIETEST thing on the page: below Log out,
  no card, no button, muted underlined text. The owner asked for this
  and gave the reason, which is a good one: hiding a losing run "can
  trick them into a false reality of being profitable when maybe not."
  So the sheet opens by saying exactly that, before anything else.
  Available, honest, not sold.
- The control is called "Restart my record", never "Start fresh" or
  "Reset". Fresh and reset both sound like wiping.

NAME. Stored in the auth user's metadata (`full_name`), not a table, so
it needed no migration. It is the same field Google fills in, and the
same one the Track greeting reads.