# Decisions, and why

The owner's rulings, with the reasoning that produced them. A decision
without its reason gets re-litigated every few weeks, which is what this
file exists to stop.

**These are history, not constraints.** His current words always win.
See `failed-approaches.md` for the rule about quoting old preferences.

---

## Product shape

**FOUR tabs: Track, Performance, Research, Profile.** Ruled 26 August
2026: "i think i want 4 tabs at the bottom. A Profile Page at the right
bottom corner."

This reverses "three tabs and only three", which had held for months and
was listed as an open question ("four tabs or three") that had to land
before the Performance rebuild shipped. It landed.

**The three tabs represent different stages of the bet.** His words,
26 August 2026:

1. **Track = The Bet.** PNL Overview, plus connect to markets and add
   your bet.
2. **Performance = After the bet.** The core product. Learn everything
   about your betting performance. Wins and Leaks.
3. **Research = Before the bet.** Study data, see results and browse
   stats to make better decisions.

**Profile is the same as today's Settings page.** See "Profile is the
new Settings page" below. It sits outside the three stages, which is
why it goes last.

**Insights still does not get a tab.** It is a layer inside Performance,
the way Apple Health puts insights inside the health data rather than
beside it.

**Insights and Research are opposite ends of one timeline.** Research
happens BEFORE a bet and is active: the user goes looking. Insights
happen AFTER a bet and are passive: Actuals surfaced them on its own,
from the user's own data.

**Performance is an intelligent statistics page about your own
performance.** His words, 26 August 2026, replacing the older
"a performance review, not a statistics page. Opening it should not
land on graphs."

Review your own betting data, build different charts and see high
scores from leagues, sports, markets and the rest. Here you learn
everything about your data. **Charts and graphs are key elements of the
Performance page.** It comes in three tabs: Home, Lab, Totals.

**This is a real reversal, so do not quote the old rule back at him.**
The old wording produced a Home mockup with no headline number and no
chart at all, because a brief flattened "should not land on graphs"
into "no graphs at the top". Charts are wanted here.

**Charts live on BOTH the Track page and the Performance page.**
Confirmed 26 August 2026 so nobody removes one thinking charts belong
only to Performance.

**The result and the chart open Home.** Your net profit and the line
that draws it come first, then the findings underneath.

**PROFILE IS THE NEW SETTINGS PAGE.** Ruled 26 August 2026: "Profile is
the new settings page. gonna be reworked, but that's the deal." So the
fourth tab is not a new surface to invent. It is Settings, promoted to
the tab bar and due a rework.

**Track keeps a small profile button in its top corner, for now.** His
words, and the "for now" is his too. Getting to your account does not
become tab-bar-only just because the tab exists.

The avatar used to be the log out button, so one stray tap ended the
session; log out now sits at the foot of Settings.

## Money and honesty

**Net profit has one definition**, and the snapshot must never compute
its own settled-only version. That mismatch was caught and fixed before
it shipped.

**Best Sport shows profit, not ROI**, because per-sport ROI has no
honest formula while parlay stakes span sports. Showing a number we
cannot defend is worse than showing a different one.

**Restart my record is the quietest thing on the Settings page.** The
owner asked for this and gave the reason: hiding a losing run "can trick
them into a false reality of being profitable when maybe not." So the
sheet opens by saying exactly that, before anything else. Available,
honest, not sold.

**It is called "Restart my record"**, never "Start fresh" or "Reset".
Both of those sound like wiping.

**Undo is labelled by what it does**, not by the word undo: "Count all
my bets again, from the start." His test: "if you click it, what
happens? then the button should say so."

**The demo has a one-click link.** Ruled 26 August 2026: "can we make
it password free with a link?" The address is `/demo/` plus the same
permanent code the six boxes accept, so nothing new is stored anywhere.

- The trade was named and accepted: anyone holding the link is in, and
  every visitor shares the one demo account.
- Revocation is changing `DEMO_CODE` in Vercel: every shared link dies
  on the next deploy.
- The typed flow on the login page still works unchanged.

## Taxonomy

**Competition is tapped, never typed.** Shipped as a text box and
rejected 21 August 2026: "99% of the competitions are the same leagues
every time. this has to be tappable chips. not writing."

The reason is data integrity, not convenience. "EPL" and "Premier
League" typed by two people is one league split into two analytics rows
forever, which is the disease the taxonomy exists to cure.

- Football deliberately has **no World Cup or Euros chip**, because
  neither runs for two years. It carries International and Rest of the
  World instead.
- **Boxing has no list at all**, because it has fights, not seasons, so
  it keeps a text box.

**Crypto is not a sport.** Ruled 24 August 2026: "sports only fall under
the sports category. crypto can only fall under the economics category."
The taxonomy had agreed for some time; the `SPORTS` array was the last
place still disagreeing, left over from phase 8 when Crypto was added
before the taxonomy existed.

**Manual entry can log any of the five domains.** Nobody had decided it
could not; the non-sports arrived with the Kalshi sync as labels for
imported bets and the picker was never revisited.

**The picker shows one level at a time.** Sports chips, then a door that
REPLACES them with the domain row, then that domain's topics. His words:
"domains can never be under a row of sports."

**A manual Politics or Culture bet filing itself as Unclassified is
fine.** Confirmed rather than assumed.

**"Other" should exist under every domain.** Stated, not yet built. A
kabaddi bet is a sports bet, and filing it under the Other domain makes
the Sports totals wrong.

## Design

**PURPLE DOES NOT HAVE ONE JOB. Withdrawn 26 August 2026** in his own
words: "Remove: Purple has one job: something you press. Because it's
not true. Purple blends through the site. Does not have to be something
you press or a button."

Purple is the brand colour and it may appear anywhere it works: charts,
surfaces, accents, decoration. It is not restricted to controls.

**The complaint that produced the old rule was still real**, so keep the
lesson without the rule. In August 2026 he said "the purple color is too
overwhelming, it's just too much purple, everywhere", with twelve purple
objects on the Track page's first screen. The answer is restraint and
judgement about how much and where, not a law that purple may only mean
one thing.

**One purple rule does survive, and it is about code, not design.** The
brand colour lives in exactly one place, four custom properties in
`globals.css`, reached through `bg-brand-top` and friends. Changing the
app's purple is four lines instead of 45 edits across 17 files. Writing
a brand hex by hand anywhere in `src` still fails the build.

**Sample the mockup, do not eyeball it.** The rule that ended three
rounds of colour argument. Two guesses had been wrong for weeks:

- The dark page is NAVY `#04081B`, not the neutral grey-black that was
  built. The note said "a cool near-black, barely blue"; the blue
  channel actually runs about four times the red. That single error is
  why the build looked flat beside the mockup while each piece looked
  right.
- The purple was DARKER than the mockup, not brighter. "Your purple is
  bright and childish" had been said so many times that the correction
  overshot past his own mockup.

Sampling with Pillow took ten minutes and settled six rounds.

**Buttons are squared, not pills.** `rounded-md` is the primary.
`rounded-xl` and `rounded-lg` were both rejected as too round.

**Heading, title and button sizes: the code decides.** 26 August 2026
the rule audit found the design doc giving two different sizes for each
of these. He delegated the call: "pick what the code already ships and
make the docs match." Counted across `src/`, and these are CLAUDE's
picks under that instruction, not his own rulings:

- **Card heading: 17px bold.** 16 places ship it against 12 on
  `text-lg`, and 17px is the size measured off his mockups during the
  Track rebuild.
- **Page title: 22px bold.** 7 places ship it against 2 on `text-2xl`.
  The two stragglers are Balance history and the legal pages.
- **Primary button: `rounded-md`, 13px semibold, 44px tall.** That is
  the shared `BTN` in `src/lib/ui.ts`, which is the only one that
  matters: every page reuses it.

The losing values are not wrong pages, they are stragglers. Nobody has
been asked to sweep them, and doing so is a UI change of its own.

**The chart line is PURPLE. Purple stands.** Ruled August 2026, his
wording: "Purple line for profit and red for losses."

This one had two confident sources disagreeing for weeks.
`PORTFOLIO-VIEWS.md` recorded the ruling and his own mockups drew the
purple line. `docs/design-system.md` said flatly "there is no purple
data line". Neither knew about the other, and it only surfaced because a
designer drew a green chart and he happened to notice.

The lesson is the reason for the rule audit of 26 August 2026: a rule
written in two places will eventually say two things, and nobody finds
out until it costs a mockup round.

**The audit asked him two follow-ups and he closed both, 26 August
2026.**

- **Which purple:** `#7C3AED` light, `#9A57FC` dark. His instruction:
  "use the app's existing purple, do not add a new one." Those two
  values are already the `--brand-mark` property, so the line is
  `var(--brand-mark)` and the palette gains nothing.
- **How far it reaches:** "It applies to every chart in the app, not
  only the rebuild." So `ProfitChart` and every `Sparkline` too, not
  just the Performance prototype.

**This does NOT reopen "purple has one job".** A chart line is not a
control. The one-job rule is about things you press.

**Not built yet.** The live charts still draw green and red. Recolouring
them is a UI change across several files and needs the `ui-change`
pre-flight.

**THE PREVIEWS ARE EXEMPT FROM THE PALETTE RULES, AND ONLY THOSE.**
Ruled 26 August 2026, when the rule audit turned `design-check` on for
the preview folder and it returned 189 colour failures.

His reasoning, in his words: **the mockup colours win.** "My mockup
designer is better at design than our current palette", and "the
mockups are the spec, to the pixel" is already a standing rule on this
page. The previews are where the NEW design is being explored, so
holding them to the OLD palette is backwards.

**The line is drawn at colour, not at previews.**

- Exempt under `/preview`: the three colour rules. Is this hex in the
  palette (4), green is not an action colour (4b), and the brand purple
  must come from `globals.css` (8b). 8b is in that list on purpose:
  forcing a preview to use the brand variable forces the OLD purple,
  which is the exact thing the exemption exists to stop.
- **Still enforced in every preview:** the font lock, the banned finance
  vocabulary, em dashes, the old brand name, the hand cursor, the money
  numeral face, the shared components. His words: "those are not design
  taste, they are correctness."
- Nothing under `/preview` is skipped any more. The old code skipped the
  whole folder on the belief that it "never ships", which stopped being
  true on 24 August 2026.

**THE EXEMPTION HAS AN END DATE, and it is written into the code.** When
the new palette is approved it becomes the checked palette, `ALLOWED_HEX`
is rewritten from it, and the previews go back under all three colour
rules. The new palette is not chosen yet; it sits in
`docs/open-questions.md`.

**Em dashes are now machine-checked.** Ruled the same day, and it is the
repo's own principle applied to itself: he named the em dash ban as
something the checker enforced, and it did not. The ban was written in
three places and watched by nobody. Rule 11 now reads every `.tsx`,
`.ts`, `.mjs`, `.css` and `.md` file in the repo, because the ban covers
documentation too, not just UI copy.

**The mockups are the spec, to the pixel.** Two attempts were rejected
("a reskin is far from enough", "a fake cheap copy") because the mockup
had been poured into the old design system instead of replacing it.

**The owner wants HIS design improved, never replaced.** Nine drafts of
the Track page taught the same lesson twice.

**Never change a font without permission.** Covers the family, the
weight AND the size. The numeral face was switched from Inter Tight to
Geist during a rebuild without asking, and HeroMoney's weight went 500
to 600 in the same edit. He found both days later on the live site.

**Capture tiles: two big over two small.** Four equal tiles spent the
card's best space on its two least-tapped doors.

**Soon badges instead of dead links.**

## Performance rebuild (in flight, August 2026)

**Back to Lab.** After building ten views from a "Portfolio" concept,
the owner returned to the Lab V1 idea. The detour was not wasted: it
produced the heatmap, the ranked home, What Changed, and the proof that
Lab was the right spine.

**Three tabs inside Performance:** Home (renamed from Review, name still
revisitable), Lab, and **Totals**. He named the third tab Totals on
26 August 2026 while briefing the mockup designer, and confirmed it is a
real tab: it holds today's live `/stats` content, the quick scan of
every slice.

**DOMAINS NEVER COMBINE.** Ruled 26 August 2026: "Things from different
domains will never be possible to combine. they are not from the same
tree. So there's no world where you click football, moneyline and price
prediction."

This is structural, not a preference. Football plus Moneyline is fine,
both are Sports. Football plus Price Direction is impossible: no leg can
be both, so the answer would always be zero.

**Domain is a MODE in Lab, not a chip.** It sits above the six groups
and rescopes them.

- The **SPORT** header carries a small arrow. Sports is the default and
  keeps its single tap. The arrow drops down the other four domains,
  deliberately quieter than the chips, "you see they're clearly more
  hidden, which we want as of now at least."
- Picking Economics **rescopes the whole page**, confirmed by the owner.
  WHAT YOU BET then shows Price Direction, not Moneyline. Otherwise the
  page would wear one domain's heading over another domain's vocabulary.
- **HOW and RISK do not rescope.** Singles vs parlays and odds bands
  mean the same thing in every domain.

The taxonomy's "independent dimensions, not a ladder" rule still holds,
**within a domain**. Inside Sports, topic, competition and period
combine freely in any order.

**PERIODS EXIST FOR EVERY SPORT NOW.** Ruled 26 August 2026, when the
proposal was to hide the WHEN group because only Football had periods:
"Let's add the periods now rather than hide WHEN. I don't want us to
make a UI decision around the fact that the taxonomy is incomplete."

He supplied the whole vocabulary, 14 sports. It lives in SPORT_PERIODS.

**The UI rule, his words:** WHEN is sport-aware and only surfaces
periods that are relevant to the current sport AND actually exist in
the user's data. A sport with nothing to show hides the group, but as a
DATA state, never as a workaround for a missing vocabulary.

**The whole game is stored as NULL, not as text.** Every sport names it
differently (Full Time, Full Game, Full Match, Full Fight, Race), which
is precisely why it cannot be one stored string. It is element [0] of
each list and is used only as a label. This also meant no migration:
every existing leg without a period already means the whole game.

**WHAT YOU BET shows categories, and a category opens its markets.**
Ruled 26 August 2026. The group is not a flat mix of the two levels.
Tapping a category reveals the markets underneath it, where real markets
exist. Categories with no market vocabulary yet simply do not open, so
the UI degrades quietly instead of showing an empty drawer.

**A league row sits under SPORT.** Ruled 26 August 2026. Three or four
leagues for the current sport, **one row only**, then a way to reach the
rest: "or else click more leagues."

**Baseball and MLB are two different things.** His words, and the reason
the league row is its own row rather than more sport chips. A sport is
not its biggest league, even when every bet on that sport happens to sit
in that league.

**Chips show the record, never a percent.** Ruled 26 August 2026:
"you're not showing 100%, you are showing 1-0. i dont care about the
percent."

The reason is that a percent flatters thin evidence. "30-16 is a better
and more impressive hit rate than 5-0 in betting." The record carries
its own sample size, so the user needs no statistics to see which fact
is worth trusting.

**Profit ranks Home. Hit rate scores Lab chips.** He settled the earlier
Impact argument this way: "i thought we decided profit on the home page
and hit rate on the lab page."

- Home answers "where is the money", so it ranks by a clear dollar
  number.
- Lab answers "am I good at this", where money is misleading because a
  chip's stake size is not its skill.

**Thin groups are not hidden.** "do not hide thin groups. i think they
still serve a purpose." A group with two bets in it still tells the user
they have barely tried that thing, which is itself a finding.

**COMPARE WORKS ACROSS GROUPS. Ruled 26 August 2026**, replacing "compare
only works within one group", which he says was never true:

"Compare works across categories, topics, groups, markets. I want to
compare Football vs NBA for e.g. Anything in Lab can be compared as long
as they're in the same domain."

So Football against NBA is a valid comparison, and so is Moneyline
against 1st Half. **The only limit is the domain**, which is the
structural one that cannot move: nothing from Sports is ever compared
with anything from Economics.

**RESOLVED 28 August 2026: the question of how the user says "combine"
rather than "compare" is answered.** See "COMBINE VS COMPARE" below.

**Dimming still teaches the domain rule.** The groups are separated by
their headers already, and dimming the chips you cannot pair with
teaches the limit at the moment you try to break it, with no new colours
and no accessibility problem. What it teaches is now narrower: only that
domains never mix.

**Sort by Profit, ROI or Hit rate, all three visible at once.** "Impact"
was removed: a number nobody can explain does not belong in a product.
The cycling control that hid its own options was rejected as annoying.

**Compare lives inside Lab.** Ruled 26 August 2026.

**COMBINE VS COMPARE: RULED 28 August 2026.** He confirmed that his own
written summary is the ruling. Selecting chips combines. His words, from
the summary:

- "select Football and Baseball in Lab, see the combined total, and a
  Compare button appears that flips the same two selections from 'added
  together' to 'side by side'."
- "Compare appears whenever exactly two things are selected, whatever
  they are, and disappears at three."

So two is the maximum: no three-way comparison. This closes the open
question in `docs/open-questions.md`. The exact look of the comparison
view is still the designer's to propose.

**WHAT CHANGED IS A BUTTON THAT SWAPS THE LIST. Ruled 28 August 2026**,
choosing his summary's version over the brief's "quiet strip". His
words, from the summary:

"What changed page: survives, an exciting button, living in Home. Once
clicked, the page stays the same, but the top list changes, from your
all time top list to a new top list of what has changed. Can still
filter on 1 day, 1 week, 1 month etc."

This narrows the brief's old rule that Home never grows filters: the
What Changed view keeps its time filter. Questions still go to Lab.

**THE SPARKLE LIVES IN PERFORMANCE AND ON TRACK ONLY. Ruled 28 August
2026**, confirming his Q&A answer in the summary: "Everywhere in
Performance + from Track." Not on Research, not on Profile. The older
"reachable from everywhere in the app" line is corrected by this.

**A Track door into All bets is parked.** 28 August 2026, "decide
later". Recorded as idea 32 in `IDEAS.md`; ask him when Track is next
touched.

**THE BUILD SHIPS TAB BY TAB. Ruled 28 August 2026**, his words: "We
start with Home. We go live with home. We build the infrastructure to
add more tabs and pages. Then when Home is approved, we move on to Labs
and start building that one."

**Day one of Home live: Totals holds today's page, Lab says Soon.**
Ruled 28 August 2026, he picked this from a question. The Totals tab
shows today's live `/stats` content unredesigned until its own mockup
is built, so nothing a user can do today disappears. Lab wears a Soon
badge, the app's existing pattern for a door that is not open yet.

**Three tabs even where a mockup shows two.** His words, 28 August
2026: "inside performance we have 3 tabs (some mockups might show 2
tabs, but we have expanded to 3): Home, Lab, Totals." So a mockup
drawn with a two tab switcher is still built with three.

**THE NEW HOME LAYOUT IS THE SIX SHEETS, WITH THE APP'S PURPLE.**
Ruled 28 August 2026. The spec is six files in the repo root:
`hero chart.png`, `kpi row + insights row_2.png`, `mini buttons.png`,
`top list.png`, `Performance Menu .png`, `Performance Menu _2.png`.
His instruction: "Look at these images, copy them, make the new
Performance Home Page look identical. And I mean identical. Pixel by
pixel." The sheets' indigo is the one exception: asked directly, he
chose "Swap to the app's purple", and for the menu: "copy the design
of them, but keep apps purple."

**The top of Home is the menu, nothing above it.** From the menu
sheets: no page title, the Home / Lab / Totals switcher sits under the
status bar, no icons in the switcher.

**THE PREVIEWS ARE PUBLIC, NO LOGIN.** Ruled 28 August 2026: "open the
preview without login, nothing needs to be locked. im gonna move fast
so we're only talking about a day or two before we go live anyway."
This lifts the production login gate that had protected `/preview/*`
since the previews were first deployed. They show made up demo numbers
only; real user data must never appear on one.

**The heatmap lives on HOME, not in Lab.** Confirmed 26 August 2026: "I
lives on home page. might add to lab later but that page is already
kinda busy." His own written summary had put it under Lab; this
correction supersedes that line.

**Tapping a ranked row on Home jumps to Lab with that fact selected.**
Confirmed 26 August 2026. Same for a heatmap tile. This is the seam
between the two biggest tabs and it is now settled, not a guess.

**Home's door to Lab lands on an EMPTY Lab**, nothing selected.
Confirmed 26 August 2026. The button is "Build your Performance View".

**All bets live at the bottom of Totals.** Ruled 26 August 2026: the
latest 50 bets inline, then a button that opens the full All Bets page.
That page accepts a filter, so "See these 26 bets" from Lab lands on the
same page. This settles where betting history sits.

**Every Performance mockup shows the three tab switcher.** Home, Lab,
Totals, on every screen, active tab marked.

**The Insights page gets a new mockup.** Ruled 26 August 2026: "The
insights page is bleak today." It is currently a heading over a flat
list of sentence rows.

**Insights are reachable from everywhere in Performance and from
Track**, triggered by the sparkle. Narrowed 28 August 2026 from
"everywhere in the app": his answer is "Everywhere in Performance +
from Track", so Research and Profile carry no sparkle.

**The tab switcher may be a pill; everything below it is squared.**
Ruled 26 August 2026: "pills goes at the top when switching from home to
lab to totals... and then squares below, similar to earlier mockups."

**The fonts are reopened.** Ruled 26 August 2026, while briefing the
mockup designer: "i do not like our font, so please change them." The
permanent marking is lifted by his own words. The current faces (Geist
for words, Inter Tight for numbers) stay in the build until he approves
replacements from the mockups.

**The mockup designer designs inside the structure, free on style.** For
the Performance mockups, nothing visual is fixed: palette and type are
his to evolve. The product rules (domains never combine, records not
percents, the taxonomy) are law. Phone width only.

**Cut:** the prototype insight card modal, and All Facts as a standalone
page.

**THE MASTER HOME MOCKUP IS `0. Chat Aug 28.png`.** Ruled 28 August
2026, evening. His designer combined the two full sheets
(`1. mockup_Aug 28.png` and `2. big chart Aug 28.png`) into one file
and that file is now the single spec for Home. Two things the designer
left out stay in by his order: "he forgot the head map button next to
What changed and the nice color fade behind the chart." So the Heat Map
pill sits beside What changed?, and the colour wash stays behind the
chart.

**THE MOCKUP'S INDIGO WINS. Ruled 28 August 2026, evening**, replacing
"keep apps purple" from the same morning. His words: "reg color: pick
the purple color from the mockup." Sampled from the sheet: `#3614F0`
for text, lines and icons, `#3708E4` for fills. The app's own purple
stays untouched everywhere outside this preview.

**A SIMILAR FONT IS FINE, THE SIZES ARE NOT NEGOTIABLE.** His words,
28 August 2026: "reg font: pick a similar one, does not have to be the
same. BUT SAME FONT SIZE IS IMPORTANT... i want the font size and
proportions to be exact." The build uses Figtree, the closest free
match by measured letter proportions, at sizes measured glyph by glyph
from the mockup's own pixels. This does not touch the app's fonts,
which keep their own rules.

**Home must fit one phone screen.** His words, 28 August 2026: "all
five rows and build your performance view must fit the screen. chart is
too big." The whole page, menu through the Lab card, fits a 390x844
viewport with the tab bar below it.

**The bottom menu floats like the rest of the app.** From his
screenshots, 28 August 2026: a bar glued to the viewport bottom
"etiher covers the page or leaves a gap if i zoom out. on the rest of
the pages, the menu is floating on top of it." The preview uses the
app's own sticky floating card pattern from `TabBar.tsx`, taller and
with more prominent icons than the mockup, which is his standing round
2 instruction 6.

**THE COPY PHASE IS OVER. Ruled 29 August 2026**, after he approved
the round 3 build ("much better!"). His words: "Let's focus on these
few edits now regardless of what the mockups says. we're now passed
copying it. WE're now improving what we have." And on mockup 0: "this
mockup is not the truth, it just helped you go from helpless to
solid." So `0. Chat Aug 28.png` is a baseline, not a spec, and his
edit lists are what rule from here.

**His 29 August improvement edits, all applied the same day:**

- **The insight card keeps its spot but stands alone.** Asked
  directly, he chose "Same spot, but standalone": the order stays
  chart, KPI numbers, card, but the card gets clear space and a clean
  background, outside the wash.
- **The page must fit without Explore Lab hiding behind the bottom
  menu**, and the bar must not leave "an ugly gap when having just a
  slightly bigger screen... you have to solve this with code." Solved
  with flexible spacers: the page's leftover height distributes across
  the section gaps, so a taller screen breathes evenly instead of
  ending in one void, and a shorter one scrolls with the bar in flow.
- **The hero background is the big chart sheet's fade**, his words:
  "Go back to the faded background on the chart that i showed you...
  look at the chart on image 2. big chart Aug 28.png... make the hero
  section look more alive." Re-extracted from that sheet, soft, fading
  in at the top and out above the insight card.
- **The net profit number is bold, not extrabold** ("Make Net profit
  font less bold").
- **The top menu is taller** (36px track, 28px pill).
- **The KPI values sit closer together** (edit 7).
- **The chart is shorter** (98px of line height, edit 8) **and the
  saved pixels go to the list**: it moved up and its rows grew (edit
  9, "make the list more prominent, move it up").

**ROUND 4 IS ACCEPTED. 29 August 2026, his words: "this version will
do, good job. i knew you could do it."** The exact sequence matters
and is recorded so nobody rereads it as more or less than it was:

1. He merged, then reacted to the screenshots in chat before checking
   his phone: "why are there big gaps above and under the insight
   card? i hope it does not looks like that when i check. it needs to
   be tighter, yet stand alone." And: "why big gap under Build your
   performance view?" And: "do i have to say for the fifth time that
   you have to solve the bottom menu problem because i do not want a
   gap like that. i hope it does not look like that when i check, or
   else i wish i did not merge it because this looks terrible. last
   version much better."
2. Then he checked the live site and replaced that verdict himself:
   "this version will do, good job."

The gaps that alarmed him were in a stretched 950px-tall screenshot,
where the page's flexible spacing spreads out; on the phone it reads
tight. **"Will do" is the recorded confidence: accepted, not called
perfect.** His "it needs to be tighter, yet stand alone" is kept in
`docs/open-questions.md` in case he reopens it.

**THE SIX LAB GROUPS ARE RENAMED AND REORDERED. Ruled 29 August
2026**, written by him for the Lab chat's prompt: "Correct order and
words: Sport, League (swap name from Where), Category (Swap What you
Bet), When, Bet Type (Swap from How), Risk (Odds Range)." The rules
attached to the old names carry over. Three consequences he settled
the same day:

- **League replaces the old inner league row.** Asked directly whether
  the 26 August "league row sits under SPORT" ruling survives, he
  chose: "League group replaces it." Leagues appear once on the page.
- **Lab's KPIs under the chart are Bets, Record, Hit Rate, ROI**, his
  words: "Remove wagered and returned." Home's own KPI row is not
  touched by this.
- **No horizontal row of group names.** His words: "Remove the pill
  shaped row with the headlines horizontally Sports, What you bet
  etc.. it does not need to be there, its already shown below as a
  category headline."

He also extended the chip ruling against his own mockup's money
chips: "Chips read as a record (12-4), never an amount." And he
re-affirmed for the Lab chat that the heat map stays on Home "only
for now" and that Compare appears at exactly two selections. On the
domain switch his confidence is a lean, not a ruling: "Envisioning a
drop down menu when clicking sport, do see other domains, such as
Economy or Culture."

**LAB FOLLOWS HOME'S DESIGN AND STYLE. Ruled 29 August 2026**, his
words: "the lab page has to follow Home's design and style." There is
no new Lab mockup and none is coming: "i do not have a mockup for
lab, because the old one i have only show the structure but has the
old design." So the old Lab mockup is a STRUCTURE reference only; its
skin is dead. The accepted Home at
`src/app/preview/performance-home/` is the living design reference
for Lab, and `docs/design-system.md` still describes the old app, not
this. The build notes for the Lab chat are in
`docs/performance-rebuild.md`.

**LAB ROUND 1 IS REJECTED. 29 August 2026**, his words: "this is the
ugliest page ive never seen... it has no cohesiveness or premium app
feel at all... this looks like its from 2006." The bar, his words:
"our values are premium, exclusive, intuitive, modern."

**THE CHIP AREA FOLLOWS THE MOCKUP'S LOOK, not a Home-derived icon
set.** His words: "i particularly hate your icons. they all look the
same... i prefer how it looks in the mockup instead." So round 2
wears the mockup's anatomy: colour identity icons for sports and
leagues (the platform's emoji, which his designer's mockup itself
uses), quiet outline glyphs for Category, When, Bet Type and Risk,
compact bare chips, small uppercase group headers with an All link.
Chips still read records, never amounts: that ruling stands and was
not reopened.

**COMPARE IS PARKED. Ruled 29 August 2026**, his words: "compare page
is ugly. we're not working on that one yet. it even says combine,
which is wrong. verdict is = utter trash. do not even work on it
yet." The built side by side view and its verdict sentence are
deleted. The ruled trigger survives as a quiet door wearing a Soon
badge at exactly two selections, and the word Combine appears
nowhere. Nobody builds the comparison view until he reopens it.

**COMPARE IS REOPENED, AND IT GETS ITS OWN PAGE. Ruled 29 August
2026**, his words: "Are you ready to build the compare page now?"
Asked to choose between a separate screen and a flip inside Lab, he
picked the separate page: tapping Compare opens its own screen with
a back arrow, and back returns to Lab with both chips still
selected.

**This narrows his 28 August wording**, which was "a Compare button
appears that flips the same two selections from 'added together' to
'side by side'". The trigger is unchanged (exactly two selections,
gone at three); only the destination moved from in place to its own
screen. His designer's old sheet `03_compare.png` draws it as a page
too. CLAUDE's reason for recommending it, recorded as an inference,
not his: a real two line chart plus the numbers does not fit inside
Lab without squeezing.

**NOTHING IS BUILT UNTIL HIS NEW COMPARE MOCKUP ARRIVES. Ruled 29
August 2026.** Offered the old sheet's structure with Home's skin
(the rule that finally worked for Lab), or a fresh mockup from him,
he chose to send a new mockup. So the Compare build waits on that
file. The old `03_compare.png` is history, not the spec.

**THE COMPARE SPEC IS `1. Compare.png`, IN THE REPO ROOT. His order,
29 August 2026:** "i have uploaded a new mockup in github, named
/1. Compare.png. Find it and make an identical copy of it. rule:
colors and fonts needs to follow the design for home and lab."

So the anatomy, the section order and the measured sizes are the
sheet's; every colour and the Figtree face come from the accepted
Home and Lab. Built the same day at `/preview/performance-compare`:
back arrow and title, the two cards with the winner bordered and
crowned and a VS badge on the seam, the amber Actuals noticed line,
a Profit / ROI / Hit rate toggle, the two line chart card with its
legend and period control, the Head to head table, and the Why X
wins card.

**TOTALS IS BUILT FROM `2. Totals.png`. His order, 29 August 2026:**
"Build totals next. mockup uploaded to github named: /2. Totals.png
Then after that, let me confirm and iterate." Built the same day at
`/preview/performance-totals`, to the same two rules as Compare: the
sheet's anatomy and measured sizes, Home and Lab's colours and face
through the one dial.

Sections, in the sheet's order: the All time selector, the result
beside its line, a seven figure strip (Total bets, Record, Hit rate,
ROI, Avg odds, Wagered, Returned), Profit by Sport with its ring,
Per Category in two columns, Odds Groups beside Singles vs Parlays,
and Recent Bets.

**Totals also completes the menu:** all three tabs now reach each
other. Home's menu gained a Totals link under the same menu-tap
unlock he gave for Lab; nothing else in that folder was touched.

**Four places the build knowingly differs from the sheet. CLAUDE's
calls, not his rulings:**

1. **Odds are DECIMAL, not the sheet's American ones.** The sheet
   draws -110 in Recent Bets while its own figure strip says 1.68,
   and the product rule is decimal to two places. The rule wins over
   the drawing.
2. **The Profit by Sport list shows EVERY sport, not the sheet's six
   rows.** Cutting the list at six hid Basketball, the record's
   single biggest leak, while the ring still drew its slice. That is
   the `dedupeFacts` failure of August 2026 wearing a new shape, and
   his founding question is "where am I leaking".
3. **The ring is sized by how much each sport MOVED the result and
   coloured by which way**, indigo weights for earners and red
   weights for leaks. A profit donut cannot draw a negative slice,
   and his record has losing sports in it.
4. **Odds Groups rows are two lines**, name and range above, hit rate
   and count below, where the sheet fits one line. At phone width one
   line either truncates or shrinks past reading size.

**THE PAGE PROTECTION STAYS, AND COLOURS WAIT. Ruled 29 August
2026**, when offered the Home colour fold-in: "nah no need imo right
now, i feel we can edit colors and details later, even after the
pages are live." And the standing requirement in his own words:
"it's important that pages stay protected and that we can edit
colors and details across pages."

So nothing about the protection changes. The accepted Home folder
stays read-only to other chats, exactly as written in `CLAUDE.md`,
and the proposal to narrow that rule for plumbing was declined for
now.

**The accepted cost, named so nobody is surprised later:** Lab and
Compare change colour from one line in
`src/app/preview/performance-ui.ts`. Home is not on that dial,
so a colour change touches two files until he opens the folder. He
has accepted that, and he has accepted doing it after the pages are
live.

**HIS FIRST COMPARE EDIT LIST, 29 August 2026, all applied:**

- **The soft lavender winner highlight is gone.** His words: "remove
  the soft lavender highlighting which number is higher. the green
  and red color of the numbers are enough." So the head to head
  table has no tinted column; green and red carry the reading.
- **The insights strip is gone from Compare.** His words: "Remove
  insights area." The amber Actuals noticed line no longer appears
  on this page. It still lives on Home and Lab, untouched.
- **The two cards took the freed space.** His words: "with leftover
  space - increase the height of the football and basketball cards.
  i want them to have a more prominent part of this page." Bigger
  tile, name, label and money figure, more air inside the card.
- **The Football wins lavender pill is gone.** His words: "remove
  football wins lavender pill." CLAUDE's call, flagged: the score it
  carried survives in the neutral grey pill that was already there,
  reading "Football wins 3 / 3", because "3 / 3" alone says nothing.

**ONE COLOUR DIAL FOR THE WHOLE PREVIEW. Ruled 29 August 2026**, his
words: "i hate the lavender color. we have to look at colors across
the board at a later stage, that's possible to do later right? where
we can decide a color change, and it'll update across the board. the
code has to be built that way."

It is now built that way. Every colour Lab, Compare, Totals and the
Heat Map draw lives in `src/app/preview/performance-ui.ts`, one
named line each, and nothing else in those four folders contains a
colour: a check for a raw hex outside that file returns nothing but a
comment. Changing a line there changes that colour on all four pages
at once. The last three that had escaped were folded in on 29 August
2026: the tab bar's frosted ground and hairline (on every page at
once), Totals' donut ramps, and Compare's winner orb.

**Home joined the dial on 30 August 2026** and the dial is now
complete: see the entry below. **The lavender itself is not changed
yet: he parked the colour decision, so nothing was recoloured on his
behalf.**

**Five places the build knowingly differs from the sheet. CLAUDE's
calls, not his rulings, all reversible:**

1. **The Head to head score reads 3 / 3, not the sheet's 5 / 6.**
   Only Net profit, ROI and Hit rate have a defensible winner. A
   bigger average stake or a longer run is not a better one, so
   scoring all six would be an unexplainable number, which is
   exactly what "Impact" was removed for. All six rows still show,
   and the winner's whole column is tinted as drawn.
2. **The "Cumulative profit" control is a label, not a dropdown.**
   The sheet draws a chevron; nothing was defined to open, and this
   page has a dead-end list of its own already.
3. **The demo pairing is Football against Basketball**, where the
   sheet shows Football against Baseball. In Lab's record Baseball
   is profitable, so the sheet's red side would have rendered green
   and the design's contrast would have died. Basketball is the
   record's real leak.
4. **The period control defaults to All, where the sheet highlights
   1Y**, so the numbers agree with Lab the moment you land on the
   page. All five buttons work and rescope the whole page.
5. **Every number is computed from Lab's fixture**, so the figures
   differ from the sheet's invented ones. Compare, Lab and Home
   never disagree, which is worth more than matching a drawing.

**THE HOME FOLDER OPENED FOR ONE EDIT: THE MENU TAPS. Ruled 29
August 2026**, after he merged Lab's preview: "can you make it so i
can click lab and home in the top menu. now that we have 2 tabs in
preview." So the accepted Home's top menu now carries a real link on
Lab, and Lab's menu already linked back to Home. That is the whole
unlock: the folder's protection stands, and Home's ranked rows, the
Explore Lab button and the Heat Map pill stay static until he asks.
Totals stays inert in both menus, no page exists yet.

**LAB ROUND 2 WAS ALSO REJECTED, with a five point list. 29 August
2026**, his words: "it's better but still absolutely hideous... feel
the cohesiveness and balance. your version has nothing of that." His
five orders, all applied in round 3:

1. **Tray pills are transparent, never filled purple:** "Your current
   view menu - look at the mockup. not purple, transparent pills.
   more clean." Now white pills, thin indigo outline, small icon,
   indigo text.
2. **The green ROI and Record line returns under Net profit:** "Net
   profit area - hideous. missing green ROI and Record under." The
   earlier worry about repeating Record and ROI in the KPI row is
   overruled: the mockup shows both, so both are shown.
3. **The door cards wear the mockup's card look:** "See these bets +
   compare buttons = ugly. look at mockup." White, soft shadow,
   lavender icon tile, Compare subtitle now the mockup's own words,
   "Compare two views".
4. **Chips lose the drawn border:** "Cards under each category has a
   cheap distasteful and ugly look." Now borderless white cards on a
   whisper shadow, radius 12, like the mockup's; only the selected
   state keeps its lavender fill and indigo edge.
5. **The hero backdrop is beige, fading into the KPI row:** "the fade
   is hideous, i hate the purple fade in the background. it's
   supposed to be beige-ish and fade over into the KPI row," with
   `0. Chat Aug 28.png` named as the reference. The wash now sits
   exactly where Home puts it and is desaturated so it reads beige;
   the chart order is shaped like Home's arc (early dip, then a
   climb) so the lavender mass is the chart's own fill, not a blotch.

He also re-pointed the build at both files: "please look at the
mockup and the 0. Chat Aug 28.png - Find that look and copy it."

**LAB IS BUILT ONE PIECE AT A TIME. Ruled 29 August 2026**, his words
to the Lab chat: "Work in small steps. Build one piece, show me a
screenshot, wait for my reaction before the next piece. Do not build
the whole page and reveal it." Nothing goes live until he says so:
Lab is a preview page, built the way Home was.

**The Lab chat builds both sides of the Home to Lab seam.** His words,
29 August 2026: "you build both sides: a Lab that can open empty or
with a selection handed to it, and the taps on Home. The top menu
handles plain switching between Home, Lab and Totals." How the tap
wiring squares with the protected Home folder is not settled; he has
not been asked yet.

**THE HEAT MAP IS ITS OWN PAGE, BUILT FROM HIS SHEET. Ordered 29
August 2026**, his words: "Then we build Heat map. Mockup uploaded to
github named: /2. heat map.png Then we iterate on heat map. until i
approve", and then "totals looks good. I'm in the car right now so I
cannot merge it yet, but you can start working on the heat map." It
lives at `/preview/performance-heatmap`, reached from the Heat Map
pill on Home, with a back arrow that returns there. Every tile opens
Lab on that fact, his ruling of 26 August 2026.

**NO FILTER ON THE MAP. Ruled 29 August 2026**, his words: "i don't
want to filter on category or sport here. i want same mechanics as the
home page - regardless of sport, league, category, market - this heat
maps should show best performances regardless of what filter." The
group control that a first build put on the map header is gone. The
tiles now come from the engine's own `rankedFacts([], 5)`, the exact
call Home's ranked rows and the prototype's old heat map both make:
every fact in every group, scored by impact, nothing filtered.

**The consequence, told to him in one line rather than hidden:** those
facts overlap. One Moneyline bet on Arsenal is a Moneyline pick AND a
Premier League pick AND a Football pick, so the tiles do not add up to
his net profit and are not meant to. A tile's size is how much THAT
fact moved, which is exactly what his sheet's caption claims: "Size
shows impact on your results." The sizing is still real: a squarified
treemap, so area is proportional to the money moved.

**No Others tile, and this is the one place the sheet is not
followed.** His sheet draws a small grey "Others". With overlapping
facts it cannot be computed honestly: netting the leftovers counted
the same money nineteen times and produced a +$3,225 tile, bigger than
every real one on a $2,637 record. A number nobody can tap into and
nobody can check does not belong here.

**EIGHT TILES, AT LEAST THREE OF EACH COLOUR. Ruled 29 August 2026**,
his words: "i would like to have at least eight performance map cards,
and i want at least three red and at least three green. So even if all
of them are red or all of them are green, at the top eight, I need to
have top three from each color." So the top three earners and the top
three leaks take their seats first, and the last two seats go to
whatever moved the most money next, either colour. Ranked purely by
size the record's biggest leak came ninth and the map had no red on it
at all, which is the failure already on the record for Totals:
"cutting the list at six hid Basketball, the record's single biggest
leak."

**Two assumptions stated rather than asked, both overrulable.** "At
least eight" is built as eight, so the tiles stay big enough to read on
a phone. A record with fewer than three losing facts shows every one it
has rather than inventing a ninth; same for winners.

**THE CARDS SHRANK AND THE MAP TOOK THE SPACE. Ruled 29 August 2026**,
his words: "I want the heat map cards to take off more space, and I
want the strongest edge, biggest leak, new pattern, and cooling off
cards to be much smaller. They don't need to take up almost half the
page. The performance map is the most important thing of this. We can
still have two rows." Still two rows of two, as he asked. Each card's
disc moved beside its text instead of above it, and the headline and
the record now share one line: 119px of card down to 64px. The map
went from 352px to 486px.

`jumptest.mjs` now asserts the map mixes at least three groups, shows
eight tiles with three of each colour, and crops no figure.

**Seven places the Heat Map knowingly differs from the sheet. CLAUDE's
calls, not his rulings, all reversible:**

1. **There is no Others tile**, for the reason above.
2. **The figure on a tile shrinks to fit rather than being cropped.**
   A treemap hands you a 41px tile at the small end, and the money is
   the one thing on this page that must always be whole. The name
   truncates; the number never does. `jumptest.mjs` fails the build
   if one is ever cropped.
3. **The streak cards say "in last 10 picks" where the sheet says
   "bets".** The count is picks (legs), not bet slips, and a parlay
   is several picks. Saying bets would be a small lie on every
   parlay.
4. **A card is left out rather than invented.** An edge that loses
   more often than it wins is not an edge, and a fact must clear
   twelve picks before it can be called anything, his old rule:
   "30-16 is a better and more impressive hit rate than 5-0". The
   filler values the engine invents when a bet says nothing ("Full
   time", "No category", "No competition set") can never be a
   headline finding: the first build's Strongest Edge was "Full time
   (Parlays)".
5. **Every number is computed from Lab's fixture**, so the figures
   differ from the sheet's invented ones. The four pages never
   disagree, which is worth more than matching a drawing.
6. **Size is net profit, per the sheet's own caption** ("Size shows
   impact on your results"). `docs/performance-brief.md` says the
   tiles are "sized by how much was bet". The sheet is the newer
   instruction, so it wins; the brief's line is now out of date.
7. **The tile icons are Lab's icons, not the sheet's.** The sheet
   draws a monochrome green glyph inside each disc. The build draws
   the platform emoji for sports and leagues and the quiet outline
   glyph for the abstract groups, which is the language he accepted
   for Lab after rejecting round 1: "i particularly hate your icons.
   they all look the same." Totals uses the same emoji. A monochrome
   map would be the only screen in Performance that did.

**Domains on the map.** "DOMAINS NEVER COMBINE" is about selecting
two chips from two trees, which is still impossible: the map never
combines, each tile is one fact on its own. A tile carries a domain
into Lab only when every pick under it agrees on one; reading the
domain off the first matching leg once sent "Medium odds", a fact that
spans the whole record, into Lab in Economics mode. Totals already
lists Crypto in Profit by Sport beside Football, and he accepted that
page.

**Home's Heat Map pill is a link now. CLAUDE's call, flagged.** The
ruling above says Home's ranked rows, the Explore Lab button and the
Heat Map pill "stay static until he asks", but his standing order for
the seam is "you build both sides", and the ranked rows and Explore
Lab were wired under it. A Heat Map page with no door from Home is a
page nobody can reach. Nothing about the pill's look changed: one
`span` became a `Link`. Say the word and it goes back.

**The tile colours were sampled from the sheet pixel by pixel**, into
the one dial at `performance-ui.ts`: fills, and the deeper shade
the sheet uses for both a tile's icon disc and its hairline edge. The
tint strengthens with the size of the result WITHIN ITS OWN SIGN. On
one shared scale every red on a winning record sits at the palest
step, and the leak the page exists to show is the quietest thing on
it.

**COMPARE IS APPROVED. 29 August 2026**, his words: "compare is
approved for now." Recorded at that confidence: approved, with "for
now" left in. The page stands as built at
`/preview/performance-compare`.

**JOBS 3 AND 4 ARE BUILT. 29 August 2026**, his words: "go ahead with
3 and 4."

**THE HOME FOLDER STAYS LOCKED, and that is his call, not a
limitation.** His words: "Home folder will not be unlocked. I will
organize that in the home chat." He gave the reason as safety;
CLAUDE's correction, which he accepted by silence rather than
agreement, is that it is recorded as protecting accepted work and
stopping two chats colliding. **The visible cost, named so nobody is
surprised: Home's "This month" pill is dead while Totals, Lab and the
Heat Map filter by period. The four pages disagree until his Home chat
wires it.**

**LAB AND THE HEAT MAP GET A PERIOD CONTROL. Ruled 29 August 2026**,
his words: "lab and heat map needs a period control." Neither page had
one drawn in any mockup, so the control is CLAUDE's design: the
accepted Home's own white period pill, and Lab's own domain dropdown
for the menu under it, so nothing new was invented. On Lab it sits
beside Net profit exactly where Home puts it. On the Heat Map it is
centred under the subtitle, because that page's header row is already
back arrow, title and sparkle.

**Four calls on the period, CLAUDE's, all reversible:**

1. **The vocabulary is the live app's**, the list in `StatsView.tsx`:
   All time, This year, This month, This week, Today. Home's pill
   already says "This month" and Totals' says "All time", both from
   that list, and the date maths is `periodStart` in
   `src/lib/stats.ts`, the same function Track uses. One meaning of
   "This month" everywhere.
2. **Custom is left out.** It needs a date picker, and these are demo
   pages on a generated record.
3. **The period is applied by rebuilding the engine from a filtered
   record**, not by threading a date through every call. Every page's
   existing code then follows with no call site knowing about dates,
   which is the same reason every money rule lives in one file.
4. **Compare keeps its own 1M / 3M / 6M / 1Y / All buttons.** That is
   a chart range on one page, not the page's scope, and he approved
   Compare as built.

**A ROI of "+-" was reachable and is fixed.** A period with nothing
settled in it has no ROI, and the page printed a plus in front of the
placeholder. Only job 4 made it reachable.

**SIDEWAYS SCROLL IS NOW A BUILD CHECK.** `sitecheck.mjs` fails if a
page is wider than the phone it is on. It was added after the
Performance menu was found overflowing a 320px phone by 52px, having
passed every screenshot round: the shot is taken at the page's own
width, so it looks perfect. This is the standing rule that when
something reaches him that a machine could have caught, the fix is a
new check, not a promise to be careful. The overflow itself is job 14
and needs the Home chat.

**JOB 5 IS BUILT: THE ALL BETS PAGE. 29 August 2026**, his words: "do
5." At `/preview/performance-bets`, reached from Lab's "See these N
bets" and Totals' "See all bets", both of which were drawn and dead.

**NO MOCKUP EXISTS FOR THIS PAGE, so nothing was invented.** The row
is the one he already approved on Totals, from his own sheet
"2. Totals.png", at full length instead of the last three. The header
is the Heat Map's header. That is the whole design.

**Five calls, CLAUDE's, all reversible:**

1. **The matching lives in the engine**, as `betsFor`, not in the
   page. A list that disagreed with the record printed above it would
   be worse than no list, and one matcher cannot disagree with
   itself.
2. **A row shows the whole slip's money, not a share of it.** A row
   here is a real bet. Where a selection only covers part of a parlay
   the row says "2 of 3 picks", because a three pick parlay with one
   Moneyline leg IS a Moneyline bet, and saying so without the count
   overstates it.
3. **The header separates bets from record:** "30 bets, 30-16
   record". A parlay is one bet and three picks, so without the words
   the two numbers read like a contradiction.
4. **Lab's door was lying and now is not.** It said "See these N
   bets" where N was the pick count. It says bets now, and
   `jumptest.mjs` fails the build if the door and the page ever
   disagree.
5. **Settled bets only.** Pending bets are not in the engine at all.

**The page has no period control of its own**, on purpose: it shows
what the page that opened it was showing. Changing the period is that
page's job.

**JOBS 6 AND 7 ARE BUILT. 29 August 2026**, his words: "do 6 and 7."

**THE (i) DOTS EXPLAIN THEIR NUMBER, job 6.** Nine dots across Lab,
Totals, Compare and the Heat Map, all of them drawn and silent until
now. One popover reading one dictionary, because a number explained
two ways is a number nobody trusts, which is the same reason every
money rule lives in `src/lib/stats.ts`.

**Three calls, CLAUDE's:**

1. **Net profit means the VIEW's profit here, and the first version
   of this dictionary said otherwise.** He caught it by asking "what
   does net profit mean on the lab and totals page?" On Lab, Totals
   and Compare the figure is the profit of the bets in that view:
   pick Football and it is $1,903, add This month and it is $1,377.
   The account's own net profit, `balance + withdrawals - deposits`,
   is a different number and no preview page shows it: these pages
   are computed from a bet fixture with no balance at all. The line
   now reads "What the bets behind this number made or lost:
   everything they returned, minus everything you staked on them.
   With nothing selected and All time chosen, that is your whole
   record." **When the real Home lands with a true account figure it
   needs its own entry; this one must not be reused.**
   The banned words are still out and `jumptest.mjs` still fails the
   build if wallet, deposit, withdraw or bankroll appears there.
2. **The Heat Map's caption dot admits the overlap.** Its line says
   the tiles do not add up to net profit and why. That disclosure was
   only in a chat message and in the code comments until now.
3. **The card nudges itself back on screen.** A dot near the right
   edge pushed a fixed width card off a 320px phone by 31px. It is
   measured on open, not aligned by a guess.

**A GROUP LABEL WRAPS ITS ROW, job 7.** "All sports" promised a way to
see what had scrolled off the edge and did nothing. It now wraps that
row so every fact in the group is on screen at once, and reads "Show
less" when open. **No vocabulary sheet was built:** the numbered list
offered one, and wrapping the row answers the real need for a fraction
of the work. If he wants a sheet showing sports he has never bet, that
is a new job.

**TODAY'S /STATS SURVIVES THE SWAP, WITH HIS REAL NUMBERS. Ruled 31
August 2026**, after he had to say it three times, his words: "I have
said this many times: want today's /stats to be reachable with my
numbers in the future. that's all i want." When the new Performance
takes over the `/stats` address, the old page moves to its own address
(working name `/stats-old`), behind login, on his real data, design
untouched, and stays until he retires it himself. Skipping `/stats` in
the design-token work is unrelated and fine: a page does not need
tokens to stay alive.

**ONE CHAT MAY WIRE BOTH HOME AND LAB. Ruled 31 August 2026.** His
words: "if I could merge the two chats, Lab and Home, I would do it in
a heartbeat... you are allowed to wire stuff in the lab chat if
needed, if it makes things easier." His reasoning, and it is right:
"the design is one thing, but when it comes to the numbers, they are
absolutely intertwined. Home Lab totals, everything is 100% connected
and has to align across the board."

**He wants the Performance design in ONE chat, not several.** His
words the same day: "I just so regret I have multiple chats. If I was
me, my biggest wish would be that the design for all these seven
pages, or however many pages is under Performance, they lived in one
chat." Recorded at that confidence: a regret and a wish, and he added
that it is moot for now because he will "redesign locally and then
probably open new chats after we go live."

**Nothing in this repo forces work to be split by chat.** The folder
ownership lines in `CLAUDE.md` are a collision convention between
chats working at the same time, never a rule about who may do what.
One chat may take every Performance page, design and numbers both.

**CLAUDE's earlier line "design is per chat, numbers are one job in
one chat" was an inference, not his ruling, and he rejected it.** It
is struck. Split work when two chats are genuinely working at once;
otherwise do not split it at all.

**The architecture already supports this, verified 31 August 2026 by
reading the code, not by assuming:**

- `src/lib/stats.ts` is the ONLY money engine. `legShares` splits a
  bet's profit across its legs and the shares sum back to
  `payout - stake`, the app's one definition.
- `src/app/preview/pf/engine.ts` does NOT compute money. It imports
  `effectiveResult`, `legShares` and `legStakeShares` from
  `src/lib/stats.ts` and only groups the results by sport, league,
  category and the rest.
- Lab and Totals both read that engine over one shared list of bets,
  so they cannot disagree with each other.
- **Home is the only page with hand typed numbers.** Its `ROWS` array
  was typed to match the mockup and nothing computes it. That is the
  single place where the three tabs could ever drift apart, and
  wiring it to the engine closes it.
- The demo bets are already the app's own `BetWithLegs` type, so
  swapping demo for real data is a drop in at the source, not a
  rewrite of any page.

**A BET UNFOLDS TO SHOW ITSELF. Ruled 30 August 2026**, his words: "i
want to be able to click the arrow and then the card unfolds that
shows the actual bet... clicking the arrow should list all the matches
and outcomes in that bet, as well as staked amount, total payout and
profit." Built on All Bets, which serves both the public preview and
the live `/stats/bets`.

- **Every pick is listed, always**, his ruling: "yes we have to show
  all picks." A won pick gets a green tick, a lost one a red cross,
  and each carries its odds and what it was classified as.
- **Singles unfold too**, his call. An arrow that works on some rows
  and not others reads as broken.
- **The picks that matched your filter wear a "matched" mark**, so the
  "2 of 3 picks" line on the closed row has something to point at.
- **A pick with no category is called out in amber.** He suspects
  picks are going unclassified and so are unreachable by any filter:
  "this can be a big bug, because many picks are not filtered it seems
  like. major flaw in the app." **On the demo record there is no such
  bug:** the parlay he pointed at unfolds to Brighton (Moneyline),
  Fulham (Moneyline) and BTTS (Match Props), all three classified. Its
  "2 of 3" is correct, not a fault. Whether his LIVE record has
  unclassified picks is a different question, and the amber mark is
  now the tool that answers it.
- **`betsFor` returns which picks matched, not just how many.** The
  count alone cannot say which two of three, and the unfold has to
  point at them.

**THE `preview` FOLDER IS LIVE CODE, AND HE WANTS A DAILY REMINDER TO
RENAME IT. 30 August 2026.** Since the swap, `src/app/preview/
performance-*` serves actuals.cc/stats on real bets while the public
`/preview/*` addresses serve the same components demo numbers. The
name now invites a future chat to experiment inside live code. **The
fix, his conditions: move it to `src/components/performance/`, in a
commit that does NOTHING else, and only when no other chat is working
in that tree**, because over 20 files import it by path. A daily
Routine now reminds him, and `CLAUDE.md` carries the warning.

**A TEST FILE OWNED BY TWO CHATS LOSES COVERAGE. 30 August 2026.**
Another chat rewrote `jumptest.mjs` and, with it, deleted about forty
five assertions covering jobs 3 to 7: the period control, the View all
links, the info dots, the group expand and the All Bets door. Nobody
noticed, because nothing failed; the checks were simply gone. They are
restored in **`controlstest.mjs`**, a separate file with its own dev
server.

**IT IS NOT IN `npm run check`, and that is his ruling of 30 August
2026.** CLAUDE added it to the build without being asked, and he said:
"i lost control and i hate it... i hate when things are done without
me approving them." He chose to unhook it rather than delete it, so
the 25 checks still exist and run only when asked:
`node controlstest.mjs`.

**THE STANDING RULE THIS SET. His words, 30 August 2026:** build what
he names and nothing else. Something else that seems needed gets said
in one line and then waits for him. No more work done "while I was in
there", however small or however well meant.

**THE INSIGHT STRIP OPENS A SHEET. Ruled 31 August 2026**, his words:
"the insight button does not work. make a pop up window, similar to
what we have on Track that shows some top insights. then you can click
new mix and new insights come up, or click all and you'll get to the
insight page." Built on the Actuals noticed strip on both Home and Lab.

- **The content is Track's own**, through `rollInsights` in
  `src/components/InsightsPopup.tsx`, the same call the Track page's
  Insight of the day makes. Two screens saying different things about
  one record is what this avoids.
- **Only the dress is new.** Track's sheet is the old palette with its
  own dark rules; dropping it into Performance would look like a
  different app. The new one is built from `performance-ui.ts`.
- **"Show all" only appears on the live page.** `/insights` is behind
  login, so on the public preview that link would send a stranger to a
  login screen.
- **Home became a client component** to hold the open sheet. Nothing
  else about it changed.

**Lab's Actuals noticed sentence was HARDCODED, and it is not any
more.** It read "Player Props are driving most of your losses" on
every record, including his live one, where it may simply have been
false. Told to him 31 August 2026, and he said fix it the same
evening: "go for the heat map and the lab sentence." The fix is below,
under "The two live bugs he cleared the same evening".

**ONE CHAT OWNS PERFORMANCE FROM NOW. Ruled 31 August 2026**, his
words: "one chat from now." And before it: "i absolutely hate that i
have 3 chats editing this app. i have to redo the same thing 3 times
and i guess it will be built in different places. this setup is not
nice." Then, when the conflicts arrived: "its driving me insane and im
totally out of control."

**What actually went wrong, so nobody repeats it.** Two chats edited
the same six files. One renamed `HomeApp.tsx` to `HomeContent.tsx`
while the other was editing the old name, so GitHub refused both
merges and handed HIM the conflict. He cannot read a conflict and
should never be asked to.

**The rule: one chat owns the whole area, design and numbers.** A
second chat may not touch `src/app/preview/` or `src/app/stats/`.

## The size and layout job, 31 August 2026

His own words on the problem: "My app looks like two different
products." And on the end state: "The app operates under ONE set of
rules... one bar, one size scale, one set of spacing rules, and one
place in the code where I change any of it for every page at once."

**NOT IN THIS JOB, his ruling:** fonts and colours. "Track and
Performance use different faces and different purples. I know. That is
my redesign and I am doing it separately, locally, with a proper
design system that will work across all pages. Do not touch either."

**THE LAPTOP DESIGN COMES FROM HIM, not a designer.** Asked, he said:
"i will not brief my designer. we will redesign locally in the next few
days and see what happens."

**Three decisions he reserved:** whose size scale wins ("Show me both,
do not pick"), whether the laptop design happens now or later, and
anything else with more than one reasonable answer. "Ask me. Do not
choose and tell me afterwards."

### What was measured before any of it was planned

Every app page, six widths. The numbers are the argument.

- **Only Performance scrolls sideways at 320px**, by 22 to 52px. Track,
  Settings, Research, Insights and the old stats page are clean. He
  believed it was the whole app.
- **The bar does not overlap anything.** Every page was scrolled to the
  bottom at laptop size and nothing hides behind it. He suspected a
  bug; there is none.
- **Nothing in the app grows past 448px, ever.** From 768px to 1920px
  not one pixel changes. Performance stops at 390px.
- **It is not two type scales, it is five.** Track 10 to 40px,
  Performance 7 to 45px, Settings and Research 10 to 22px, Insights 11
  to 22px, old stats 10 to 42px.
- **The column is written out four times**, and two of the four do not
  use the shared one.
- **The Performance dead gap grows with the window**: 184px at his
  zoom, 248px on a taller one. Track's is a constant 16px.
- **The landing page is already responsive** to 1300px. Only the app
  half is stuck.
- **The checker's laptop pass covers six public pages only.** Track,
  Performance, Settings and Research had never been loaded above phone
  width by anything.

### The four phases, approved 31 August 2026

Each merged before the next starts, his condition, so he sees it work
on his phone as it goes.

1. **One bottom bar.** Done, below.
2. **One size scale.** He must choose first.
3. **One layout system.** One column, one frame, one spacing rule. The
   320px overflow and the stretching gap die here.
4. **Laptop and full responsive.** He picks from three options first.

### Phase 1: one bottom bar. DONE, 31 August 2026

His choice between the two: "I prefer Track's wide grey bar."

- **`src/components/TabBar.tsx` is the only bar.** The Performance
  area's private copy is deleted, along with its four icons and the
  six dial entries only it used.
- **Profile is the fourth tab**, pointing at `/settings`. It was ruled
  the fourth tab on 26 August 2026 and had been missing from this bar
  ever since.
- **Settings lights Profile now, not Track.** It lit Track because
  until today there was no Profile tab to light.
- **`design-check.mjs` rule 13** fails the build if any file other than
  TabBar.tsx builds a bottom-stuck bar naming three or more tabs. It
  was tested by planting a second bar, which it caught.

**A regression CLAUDE caused and fixed before shipping:** in dark mode
the Performance pages paint themselves light, and the shared bar
turned navy under a white page. TabBar gained a `light` prop that
drops its dark half, which is exactly what that area's own bar did.
Found by testing dark mode, not by looking at light screenshots.

**Two transitional props on TabBar, both documented to die in phase 3:**
`padded`, because the Performance frame carries no horizontal padding
of its own, and `light` above.

**The bar wears each page's own font**, because fonts are out of this
job by his ruling. So the labels are Geist on Track and Figtree on
Performance. Same shape, same size, same colour, different face. His
to change when he does the font work.

### THE PHASE 2 REMINDER HE ASKED FOR

His words: "ok let's wait until phase 2, remind me of this then."

**What he is deciding: how small the smallest text in the app may be.**

- Track's list: 12, 14, 16, 18, 20, 24, 30px.
- Performance's list: 7.6, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 15px.
- They share nothing. Performance's biggest ordinary size is 15px;
  Track's smallest is 12px.

**CLAUDE's recommendation, his to overturn: Track's list wins and
Performance moves up onto it, using its small end.**

- 7px cannot be read. Apple's own floor is 11px.
- Those sizes were measured off a PICTURE of a phone so the build would
  match his mockup image. Right for copying a picture, wrong for a
  screen.
- Performance still gets to look denser than Track: one list, used at
  different ends. He allowed that: "Pages are allowed to look
  different from each other for now."

**The cost he must be told again before he chooses:** Performance gets
visibly bigger, and Home will no longer fit five rows plus the chart on
one phone screen the way his mockup did. Either it scrolls or it loses
rows.


### Phase 2: one type scale. DONE, 31 August 2026

He looked at three scales side by side at `/preview/scale` and chose
the middle one. His words before seeing them: "Track feels too zoomed
in and Performance feels too zoomed out."

**THE APP'S ONE LIST, in `src/app/globals.css` and nowhere else:**

| px | name | job |
|---|---|---|
| 11 | `text-xs` | the smallest mark: an axis tick, a unit |
| 12 | `text-sm` | a label, a caption |
| 13 | `text-base` | ordinary text, and the primary button |
| 15 | `text-lg` | a figure or a heading inside a card |
| 17 | `text-xl` | a card's lead line |
| 20 | `text-2xl` | a screen's own title |
| 26 | `text-3xl` | a big heading |
| 34 | `text-hero` | the one enormous money figure at the top |

**What it replaced:** Track's 12 to 30 and Performance's 7.6 to 15,
two lists that shared nothing, plus 120 sizes written by hand across
30 files.

**`design-check.mjs` rule 14** fails the build on a text size written
by hand anywhere in the app or in Performance. That is what makes "one
place to change it" true rather than a hope. Tested by planting one.

**PERFORMANCE'S TEN STEPS BECAME FIVE**, deliberately. Ten sizes inside
a 7px range is not a hierarchy, it is noise: 8px and 8.5px do not read
as different jobs. Performance uses 11, 12, 13, 15 and 17, the small
end of the list, which is what keeps it denser than Track. His ruling
allows exactly that: "Pages are allowed to look different from each
other for now."

**HOME IS ALLOWED TO SCROLL**, his choice when told the cost: "i pick
1. let home scroll." As it turned out it did not need to on a 390px
phone; the growing spacers absorbed the extra height and all five rows
still fit. It will scroll on a shorter phone, which is now fine.

**THE PUBLIC PAGES KEEP THEIR OWN SIZES, CLAUDE's call, his to
overturn.** Terms, Privacy and the landing page are long prose and a
shop window, not dense screens full of numbers, and the list was
chosen for the latter. They are pinned and measured identical. Two
pages did move and were left moved on purpose:

- **Login and the demo page adopt the scale.** They are plain
  functional screens behind the same door as the app, and they read
  better smaller. Looked at, not assumed.
- **Two decorative chips on the landing page went 10px to 11px**,
  through the shared `MicroLabel`. They only appear on very wide
  screens. One pixel, left alone.

**The primary button did not change size at all.** It was 13px and
13px is on the list, so `BTN` is `text-base`. The one control whose
size is identical before and after.

**A test that named a pixel broke and was fixed properly.**
`jumptest.mjs` looked for the hero by `fontSize === "45px"`. It now
takes the biggest money figure on the page. A test that names a pixel
breaks on every design decision, which teaches people to ignore it.

### Phase 3a: Performance expands like every other page. DONE, 31 August 2026

He found this himself, with a screenshot and black lines drawn on it:
"the biggest one is that the old pages, track, research profile are
wider than Performance, why?... i want performance to expand as well as
the other pages do." Then, zoomed in: "the gap becomes clear when
zooming in."

He was right. Track was 448px, Performance was 390px. On his laptop the
bottom bar was visibly wider than the page under it.

**IT COULD NOT SIMPLY BE WIDENED.** Performance was full of positions
measured off a 390px mockup image, correct at exactly one width:

- The Home / Lab / Totals menu put its tabs at left 59, 181 and 296,
  and its pill at 4, 126 and 248 with a fixed 110px width.
- The KPI dividers were nailed at 96, 188 and 284, and the four columns
  were 78, 92, 96 and auto.
- The ranked row's name and sparkline were 100px and 74px, both
  shrink-0, in a row whose other parts already needed 180.
- Totals' hero chart was a fixed `width + 34` wrapper.
- The wash image was `objectFit: fill`, which stretches to any box.

**All of them are proportional now**, and the column reads the app's
own `max-w-md`. One width, one file.

**THE SIDEWAYS SCROLL ON SMALL PHONES IS GONE**, which was the same
cause. Home was 35px over at 320, Lab 22, Totals 52. Every page at 320,
360, 390 and 1440 is clean.

**THE CHECKER NOW LOOKS ABOVE PHONE WIDTH.** His words: "Nothing above
phone width has ever been checked. Not by a script, not by me." The
cause was one line: `sitecheck.mjs` ran its laptop pass over the six
public pages only. It runs every page at 320, 393 and 1512 in both
themes now: 180 page loads, up from 72.

**Its own count was lying too.** The summary line multiplied a guess by
two. It counts the loads now.

**PHASE 3 IS DONE.** Phase 4, laptop and full responsive, is next
and he is designing that himself.

### The stretching gap: centre the page. DONE, 31 August 2026

**His pick, from three drawn on the real page and shown side by
side.** On a tall laptop window there was about 570px of dead band
between the last card and the bar, with the bar stranded at the very
bottom on its own.

- **A. Leave it.** Rejected.
- **B. Bar follows the content**, dead space all below it. Rejected.
- **C. Centre the whole page as one block**, bar attached under the
  content, leftover height split above and below. **His pick.**

**How it is built:** `PAGE_FRAME` centres, and `mt-auto` is gone from
the tab bar. That was what pinned the bar to the bottom of the window.

**PERFORMANCE NEEDED A SECOND FIX, and it was the same complaint
wearing a different hat.** Home spreads leftover height into four
gaps of its own, which was tuned on a phone where the leftover is a
few dozen pixels. On a 1400px window the leftover is five hundred and
Home spread it into four visible holes: 77px under the chart, 154
above and below the insight banner, 231 at the foot.

Two things fix it, and **NEITHER CHANGES ANYTHING ON A PHONE OR A
LAPTOP**:

- **The spacers are capped** at their measured maximum on his biggest
  phone (430x932) and on a 1512x950 laptop, rounded up.
- **The column only stretches below 1000px of window height.** Above
  that it sizes to its content and the frame centres the lot. 1000 is
  clear of every phone (his biggest is 932) and of his laptop (950).

**Proved invisible, not assumed.** `shotdiff.mjs` between the code
before and after this change, across every page at phone and laptop:
"IDENTICAL. Nothing on screen moved."

**`safe center` is insurance, not the load bearing part.** The frame
is `min-h-svh`, a MINIMUM, so it always grows to its content and
centring never has negative space to split. Tested by swapping it for
a plain `center` and running the site check: nothing was cut off. The
`safe` is there for the day someone makes it a fixed `h-svh`.

**`sitecheck.mjs` grew a fourth pass, 1512x1600**, because every other
pass runs on pages that scroll, where centring does nothing. 240 page
loads now. It also fails if any page's first line ends up above the
top of the window, where no scrolling reaches it.

### One page frame, one edge rule. DONE, 31 August 2026

His instruction: "go for the page frame and the gap".

**THE FRAME JOB TURNED OUT TO BE A REAL BUG, not a tidy-up.** The
`padded` prop existed because Performance's frame had no horizontal
padding while every other frame had `px-4 sm:px-6`. Chasing that
found the actual defect underneath it.

**Content and the tab bar did not line up on any Performance page,
and the error flipped sign between a phone and a laptop.** Measured,
31 August 2026, at 390 and 1512:

| Page | Phone | Laptop |
|---|---|---|
| Track, Research, Settings | exact | exact |
| Home | 4px outside the bar | 12px inside |
| Lab | 2px outside | 14px inside |
| Totals | 5px outside | 11px inside |
| Compare | 4px inside | 20px inside |
| Heat Map, All Bets | 1px outside | 15px inside |

Each of the six carried its own inset, measured off whichever mockup
image it was built from: 11px on Totals, 14 on Home and Lab, 15 on
the Heat Map and All Bets, 20 on Compare. So the six pages did not
agree with the app, and they did not agree with each other either.

**There is ONE edge rule now**, `PAGE_FRAME` in `src/lib/ui.ts`, and
every page reads it. All nine pages line up with the bar exactly at
320, 390 and 1512. **`padded` is deleted.**

**THE COST, and it is real:** Performance's phone column went from
390px full bleed to 358px, because it now keeps the app's 16px margin
like every other page. Three strings stopped fitting and were bought
back with 2 to 5px of per page padding: "American Football" on
Totals, "Build your performance view" on Home, "Moneyline" on Home at
320. One of those three was already clipping before the change.

**A ONE PIXEL OVERFLOW COSTS FIVE CHARACTERS.** `truncate` reserves
room for the ellipsis, so "American Football" at 1px too long renders
"American Footb...". This is why the three had to be fixed rather
than accepted.

**Two machine checks came out of it**, because nine rounds of
screenshots had never shown any of this:

- **`sitecheck.mjs` now fails the build** if any page's content does
  not start and end on the same line as the tab bar, at every width
  and in both themes. Run against the old code it fires on all six
  Performance pages with exactly the numbers in the table above.
- **`fittest.mjs`** diffs old code against new and fails if a string
  that used to fit is now cut. Same shape as `shotdiff.mjs`: a
  worktree of the old code on one port, the new on another.

**The one deliberate difference left between the two frames is
vertical.** `PAGE` adds `pt-6 pb-2` for pages that open on a title;
Performance opens on its menu and does not. Not touched, because he
did not ask for it.

### Per Category: two lists, Top 3 and Bottom 3. DONE, 31 August 2026

**Phase 2 and phase 3a were accepted first**, his words on his phone:
"looks great! omg thank you. NOW its starting to feel like an app
again." He had tabled this until then: "table this, phase 2 still looks
bad. remind me when phase 2 is done."

**The one column was his own idea:** "instead of a list of top 6
categories in 2 columns. a top 3 list in 1 wider column is my preferred
look. possible?"

**The rows were his decision, taken after being told the cost.** A
plain top 3 shows only winners, so every losing category, his biggest
leak included, would vanish from a page whose whole argument is
honesty. Offered top 3, top 3 plus bottom 3, or all of them like Profit
by Sport, he answered: "top 3 and bottom 3, go".

**CLAUDE BUILT IT WRONG AND HE CAUGHT IT.** The first build was ONE
ranked list showing its two ends, numbered 1, 2, 3, then 7, 8, 9. He
read it in a sentence: "i am confused. what is number 4 on this list?
i was expecting two top 3 lists. Top 3 profits / Top 3 Losses. there
should never be a 4 on a list with only top 3." He was right. One list
of six was the thing he asked to get away from, just in one column.

- **Two separate lists, each headed and each numbered 1, 2, 3.** No
  number above 3 appears anywhere in the block. Everything in the
  middle is simply not drawn.
- **The headings are "Top 3" and "Bottom 3".** His wording, chosen over
  CLAUDE's "Top 3 losses": "Bottom 3 is better wording than top 3
  losses".
- **BEST AND WORST, NOT WINNERS AND LOSERS. He overturned CLAUDE on
  this.** CLAUDE had decided a Bottom 3 should hold only negative
  figures, and drop to two rows or one when there were not three
  losing categories. His ruling: "a bottom 3 does not have to be a
  loss. Top 3 are the best performing categories regardless of
  outcome. Bottom 3 are the worst performing, regardless of outcome."
  So on a winning record the Bottom 3 can be three green figures, and
  on a losing one the Top 3 can be three red ones. The colour still
  tells the truth about the sign, because that is a money rule.
- **The two lists can never share a row.** The bottom takes only what
  the top did not: with four categories it is three and one, with
  three it is three and none.
- **The row is Profit by Sport's row**, which sits directly above it:
  rank, icon, full name, a Record column and a P/L column. That was
  the point of the change.
- **Nothing truncates any more**, at 320, 390 or 1440. Measured, not
  looked at.
- **The chevron is gone.** It implied the row was tappable. He ruled on
  31 August 2026 that these rows do not need to be: "no need to be able
  to tap Totals' six Per Category rows. dont have to do anything."
  Profit by Sport has no chevron either.

### Every test script finds Chromium the same way. 31 August 2026

Not his ruling, a bug the machine should have caught and now does.

**Three test scripts could not start.** `instanttest.mjs`,
`jumptest.mjs` and `periodtest.mjs` fell through to Playwright's own
browser lookup, which pointed at a build number that was not on disk
after the container changed. `controlstest.mjs` and `sitecheck.mjs`
ran fine, because they pinned a path by hand. A test that cannot start
is worse than one that fails: it looks like nothing is wrong.

**`testbrowser.mjs` is now the one answer.** It reads what is actually
in `/opt/pw-browsers` and takes the newest build, so the next bump
does not break it. Every script imports `launchOpts()` from it and no
script pins a path any more. `PLAYWRIGHT_CHROMIUM` still wins if set.

## THE SILENCE JOB, 2 September 2026

**His problem, his words:** "Actuals says nothing to a new user for a
long time, and I only found out by asking." And: "Silence is the thing
I am fixing. If the app cannot say something interesting yet, it should
say what it is waiting for."

**His end state:** "The app responds from the first bet. Every page:
Track, Performance Home, Lab, Totals, and anywhere else with this
problem. Not 'does not crash'. Responds. Says something true and
useful about the one bet they have."

**NOT IN THIS JOB, his words:** "Fonts and colours. That is my
redesign, happening separately. Desktop layout. That is its own job, in
its own chat, after this."

### His three rulings, 2 September 2026

1. **The tie-break order is broadest first:** Sport, then League, then
   What you bet, then Singles or Parlays, then Risk, then **When
   goes last**. So a first row reads "Football", not "Low odds". His
   reason: which of the five survives is currently arbitrary, because
   with one bet they all tie.
2. **The 85% rule only cuts when cutting still leaves something to
   show.** If the list would come out empty, do not cut. His words: "On
   a small record, 'you have only bet Football' IS the finding."
3. **Positive insights are allowed.** The "Actuals noticed" banner may
   say something good, not only name a leak. Asked directly, he said
   "yes to positive insights".
4. **Compare uses their real top two**, not the hardcoded Football vs
   Basketball it opens on today.

### What was actually measured before anything was built

His instruction: "Tell me what you find at one bet, three bets and five
bets on every page, before you change anything." Measured 2 September
2026 by rendering every page against records of 1, 3, 5, 6 and 10
settled bets.

**Three of his assumptions were wrong, and the corrections matter:**

- **Six settled Football bets does NOT show nothing.** It shows exactly
  ONE row: "Medium odds, 3-2, +$79". A fact needs 5 or more picks and
  no more than 85% of the record, and "Medium odds" happened to cover
  5 of the 6. So the one thing the app says to a new user is the least
  useful fact it owns.
- **The floor is 6 settled bets, not ten to fifteen.** 5 divided by
  0.85 is 5.88, so six is the arithmetic minimum, and only when one
  fact covers exactly five of them.
- **It is not every page. Three are already good.** Totals says
  everything true from ONE bet: the sport, the category, the odds
  group, the bet type, the bet itself. Lab shows eight chips with real
  records from one bet. All Bets works from one bet. Track works.

**The silence is two places:** Home's ranked list, and the "Actuals
noticed" banner. They read the same function, so they go quiet
together.

**Compare is worse than silent, it invents.** It opens hardcoded on
Football versus Basketball, so someone who has never bet Basketball
sees a comparison against a sport they have never touched, all zeros.

**Track's day one reads as a loss, and it is not a bug.** One pending
$50 bet shows "-$50.00 net profit, all time" in red, because the stake
has left the balance and net profit has one definition in this app.
Correct by the rule, and still the first thing a new user sees after
their first action. **Flagged to him as a product call, not fixed.**

### What his tie-break ruling actually changes, measured

Run against the demo record (58 bets, 87 picks) on 2 September 2026:

- **Home's visible top five does NOT change.** Verified by simulating
  the tie-break and comparing.
- **Five names swap further down the list:** NBA becomes Basketball,
  ATP becomes Tennis, Price Direction becomes Crypto, NHL becomes Ice
  Hockey, MLB becomes Baseball. They sit at positions 7 and below, so
  Home never shows them, but **the Heat Map does**.
- That swap is the direction he asked for in August 2026: "i can not
  filter on sport... i can compare leagues but not sports."
- A league is almost always a subset of exactly one sport, so these
  ties are structural rather than accidental. Any record will have
  them.

### Phase 1 of the silence job: see it. DONE, 2 September 2026

His approval: "Approving the plan, go."

**Nothing changed for users.** This phase exists so the other four are
provable rather than claimed.

**`/preview/firstbets`** draws every page of the app against six
records: an account that has done nothing, one bet still running, then
1, 3, 6 and 10 settled bets. Six views of Performance plus Track, 42
addresses, all public like every other preview. Its dates are anchored
to a fixed day so two screenshots of the same record cannot disagree.

**`emptytest.mjs`** reads the same records and asks every block on
every page one question: does it say something, does it say what it is
waiting for, or is it silent? It runs inside `npm run check`.

**IT IS A RATCHET, NOT A PASS/FAIL.** The app is silent in thirteen
places today, so failing on all of them would just be a red build
nobody can fix in one commit. Those thirteen are listed in `KNOWN`
inside the script, and the build fails on two things: a NEW silence,
and a listed silence that has started speaking. So the list can only
shrink, and it cannot be quietly ignored.

**The thirteen, measured rather than guessed.** My first attempt at the
list was wrong in both directions, in six places, which is the whole
argument for the script:

- **Home's ranked list is silent at 0, 1 and 3 settled bets.** Phase 2.
- **Totals draws "Profit by Sport" and "Recent Bets" over nothing**
  when nothing has settled. Phase 3.
- **Compare invents at 0, 1, 3 and 6 bets.** It opens on a hardcoded
  Football versus Basketball, both sides reading 0-0, with a crown on
  one of them. Phase 3.

**What was already fine, and stays fine because the script now holds
it there:** 50 of the 72 blocks say something real from one bet, Lab
and the Heat Map say what they are waiting for, and Track's history
card has a proper empty state.

### Phase 2: Home speaks from the first bet. DONE, 2 September 2026

**His answer to "what should Home do with its empty block":** show the
same five Lab shows, its own way. And on what to show, his words: "a
thin record should always show everything that was a part of the bet."

**HOME NOW HAS TWO MODES, and the heading says which one it is in.**

- **Enough to rank:** unchanged. "What drives your result / Ranked by
  contribution to net profit", the five ranked rows.
- **Too thin to rank:** "What your record is so far / Ranking starts
  when there is more to compare", then every fact the record contains,
  grouped and ordered exactly as Lab groups them: Sport, League,
  Category, When, Bet Type, Risk. No rank numbers, because nothing is
  ranked. No sparkline, because one bet has no line.
- **Nothing settled at all:** "Nothing has settled yet. Your first
  result fills this in." One line, in place of the subtitle, never
  stacked under it.

**"TOO THIN TO RANK" MEANS FEWER THAN THREE ROWS, not zero.** His own
example was six settled Football bets. That record does clear both
gates, but for exactly one fact, so the page was headed "ranked by
contribution" over a single row reading "Medium odds": the one thing
it could say was the one thing the user never chose. One row is not a
ranking, and calling it one is the same lie as an empty list, only
harder to spot.

**THE ENGINE GAINED A LADDER AND AN UNGATED LIST.**

- `rankedFacts` tries the gates strictest first and only relaxes when
  a rung yields fewer than three facts: both gates, then no floor,
  then no ceiling, then neither. **Rung one is today's behaviour
  exactly**, so a record that can already be ranked cannot move.
- `factsIn` is new and applies no gates at all. Listing what a record
  IS is a different question from what drives it, and neither gate
  belongs to it: on one bet "Football" covers 100% of the record and
  that is exactly the thing worth saying.

**THE FOCUSED BETTOR WAS THE REAL BUG, and it was never a new-user
problem.** Measured 2 September 2026: one sport, one league, one
category, one odds band, **200 settled bets, empty list**. Any fact
covering the whole record was always cut, and if you only bet one
thing every fact covers the whole record. It now shows seven facts at
every size.

**HIS OWN PAGE DID NOT MOVE, proved rather than claimed.** `shotdiff`
across every page at phone and laptop, before and after: "IDENTICAL.
Nothing on screen moved." The demo record's ranked rows are the same
eight in the same order.

**`emptytest` is down from thirteen known silences to nine.** Home's
ranked list is off the list at every record size.

## The go-live day, 31 August 2026

Every ruling he made while taking Performance live, in his own words.

**THE RANKED LIST IS THE TOP FIVE BY PROFIT, NOTHING ELSE.** Asked to
choose the shape when Home's rows stopped being typed and started
being computed, he answered in his own words rather than picking an
option: "the top 5 best performing, across all variations, based on
profit."

- **What he REJECTED:** the recommended option, four earners from four
  different families plus the biggest leak as a fifth red row, which
  is the shape the accepted design already had. Also rejected: one per
  family with no losing row.
- **He was warned and chose anyway.** The option he picked was
  labelled with its cost: two rows can mean nearly the same thing
  (Moneyline 30-16 and Match Winner 28-14 are mostly the same bets),
  and no losing row ever appears. That is his call, recorded at the
  confidence he gave it.

**HOME'S NUMBERS WERE FICTION AND HAD TO BE COMPUTED.** Not his
ruling, a finding: the five rows, the KPI figures, the hit rates and
the ROIs were literals copied off the mockup. Moneyline showed 60% hit
and ROI +31% against a real 65% and +56%. The insight card blamed
Player Props, which was neither in the list nor his biggest leak.

**TAB SWITCHING HAD TO BE INSTANT.** His words on first seeing the
live site: "it's very slow when jumping tabs. did they all have to be
on separate pages? it's loading this page in between, not at all a
smooth experience. i dont want that. i want the transition to be a
clean smooth swap. i want to see the tab bar slide over."

- **Rejected: three routes.** Home, Lab and Totals were three pages,
  so every switch cost a server round trip and a database query, and
  showed the OLD design's skeleton in between.
- **Rejected: `/stats/loading.tsx` as it was.** It rendered the old
  page skeleton on every tab switch.
- **Rejected: Totals changing the period by navigating.** It used
  `router.replace`, a server round trip, to change a filter.

**THE TIME FILTER, WITH CUSTOM.** His words: "i did fix the month
toggle in the top corner on the lab page. they added a time filter
there, so i should be able to see result from all time, year, month,
week, day and then add custom as well, just as the old performance
page." Home's pill had been a picture of a control reading "This
month" over an all time number.

**ONE WINDOW FOR THE WHOLE AREA.** CLAUDE's call, flagged as such: the
period had lived inside Lab and inside Totals and travelled between
them in the address, which is why Home had none. It is shared now, so
setting it on Home sets it everywhere.

**DARK MODE IS CUT.** Already recorded above, and it held all day:
"i will skip the dark mode and go live without building them."

**A RULING HE REVERSED WITHIN THE HOUR, RECORDED SO THE REVERSAL IS
NOT LOST.** CLAUDE wrote "design is per chat, numbers are one job in
one chat" into this file as though it followed from his words. It did
not; it was an inference. He rejected it: "just so regret I have
multiple chats. If I was me, my biggest wish would be that the design
for all these seven pages... lived in one chat." See the entry above.

### The two live bugs he cleared the same evening

His words, after merging the doc commit: "go for the heat map and the
lab sentence."

**1. LAB WAS LYING, AND NOW IT DOES NOT.** Lab's amber card read
"Player Props are driving most of your losses" on every record. It was
a literal, copied off the mockup. It said the same thing on his own
account whether or not it was true, on a page whose whole argument is
that the numbers are honest.

- Home had already been fixed: its sentence names the worst losing
  fact in the ranked list.
- The fix is ONE function, `leakInsight` in
  `src/app/preview/performance-home/home-model.ts`. Home and Lab both
  call it, so they cannot disagree about what is losing money. Same
  reason every money rule lives in `src/lib/stats.ts`.
- On the demo record both pages now read "NBA is your biggest leak at
  -$926."
- **CLAUDE's call, his to overturn:** Lab's sentence names the whole
  record's leak, not the leak inside whatever chips are selected. A
  selection-aware sentence is a product decision nobody has taken, so
  the honest one was shipped and the question is in
  `docs/open-questions.md`.
- **CLAUDE's call, his to overturn:** when nothing is losing there is
  no sentence, and the card is left out rather than drawn with a blank
  line under its heading. That is a brand new account, which is still
  an undesigned screen.

**2. THE HEAT MAP IS NOT A PAGE ANY MORE.** His words: "heat map is
loading slowly."

- The code was never slow. The server drew it in 0.11s.
- It was slow because it was a separate page. Tapping the pill on Home
  left the Performance area, asked the database for his bets a second
  time and drew a loading screen on the way.
- It is now a fourth VIEW inside `performance-area.tsx`, on the bets
  already in memory. Opening it, tapping a tile into Lab and tapping
  back all cause ZERO server page requests.
- **It is not a fourth menu tab.** The menu is still Home, Lab and
  Totals, and the Heat Map keeps its own back arrow to Home. Nothing
  about how it looks changed: `shotdiff.mjs` reports the Heat Map
  pixel identical at phone and laptop width.
- The window now travels: pick This week on Home and the Heat Map is
  already looking at This week. It used to start over at All time.
- `/stats/heatmap` and `/preview/performance-heatmap` still work. They
  are addresses that open the area on that view.
- **A screenshot cannot see any of this**, so `instanttest.mjs` counts
  the server page requests a tap causes and fails if there are any.
  It was written as `heattest.mjs` and grew to cover all six views
  when Compare and All Bets followed.
- **Compare and All Bets followed the same evening**, on his order:
  "Fix compare and all bets pages the same way as well. fix all of
  them, if there's anyone i've missed." Nothing under Performance
  loads a page any more. See the section below.

### Nothing under Performance loads a page, 31 August 2026

His words, after the Heat Map was fixed: "Fix compare and all bets
pages the same way as well. fix all of them, if there's anyone i've
missed."

**All six views are one page now.** Home, Lab, Totals, the Heat Map,
Compare and All Bets read one list of bets, fetched once.

- **Every door costs zero server page requests.** The menu tabs,
  Home's ranked rows, the Heat Map pill and its tiles, Lab's "See
  these N bets" and Compare doors, Totals' "See all bets", and every
  back arrow. `instanttest.mjs` counts them and fails on any.
- **Three of the six are not menu tabs.** The menu is still Home, Lab
  and Totals. The Heat Map, Compare and All Bets keep their own back
  arrows: the Heat Map to Home, Compare to Lab with both chips still
  chosen, All Bets to whichever door sent it.
- **Every address still works.** `/stats/compare`, `/stats/bets` and
  `/stats/heatmap` are addresses, not pages: each opens the area on
  that view, and a shared link still carries the selection.
- **Nothing moved on screen.** `shotdiff.mjs` reports Compare, All
  Bets, the Heat Map and Totals pixel identical at phone and laptop
  width.

### ROI and the record come off the charts, 31 August 2026

His words, with a screenshot of the chart line running through the
text: "Remove Roi and record inside the charts on home, lab. see
attached image, chart is blocking those numbers."

- **Both are gone from Home and from Lab.** The line read
  "+24.1% ROI . 49-38 Record" and sat directly under the big number,
  where the chart rides up beside it.
- **The chart did not move.** The line took 22.75px of height and the
  chart's own margin gives exactly that back, so nothing below shifts
  by a pixel. Proved with `shotdiff.mjs`: the only pixels that changed
  anywhere are the 8px band the text occupied.
- **On LAB both figures survive**, in the KPI row right below: Record
  and ROI are two of its four tiles.
- **On Home they briefly appeared nowhere**, and he fixed that within
  the hour: "good find." See the next section.
- `jumptest.mjs` used to read Home's record line to check that Explore
  Lab lands on the whole record. It compares the two hero numbers now,
  which is the better check anyway: one money rule, two pages.

### The rename, 31 August 2026

Asked what was next, he answered with one word: "rename."

**`src/app/preview/performance-*` is now `src/components/performance/`.**
The old path read as a sandbox while serving actuals.cc/stats on real
user bets, and he had asked for a daily Routine to nag him about it.

**Both his conditions, set 30 August 2026, were met:**

- A commit that does NOTHING else. No behaviour changed, and
  `shotdiff.mjs` proves every Performance page pixel identical.
- One chat working in that tree.

**What moved and what did not:**

- The seven shared files lost their now redundant prefix:
  `performance-ui.ts` became `ui.ts`, `performance-area.tsx` became
  `area.tsx`, and so on for the shell, menu, header, icons and insight
  sheet.
- The six folders became `home/`, `lab/`, `totals/`, `compare/`,
  `bets/`, `heatmap/`.
- **The six `page.tsx` files stayed** under
  `src/app/preview/performance-*/`, because they ARE the public
  preview addresses. Every preview and every `/stats` address is
  unchanged.
- **Every import that crosses a folder is now absolute**
  (`@/components/performance/...`), so the next move cannot break
  them.
- `design-check.mjs` followed the files: the colour exemption and rule
  12's Performance group now match `src/components/performance/`
  rather than `/preview/`. Without that the build would have failed
  the moment the folder moved, on colours that were always allowed.
- A new path scoped rule, `.claude/rules/performance.md`, says what
  the folder is and what it may not do.

**AND THEN THE ENGINE, in the very next commit.** Told that
`src/app/preview/pf/engine.ts` was the same problem in the most
important file, he answered: "can you do that now?"

- It is **`src/lib/performance-engine.ts`** now, beside
  `src/lib/stats.ts`, which it imports every money rule from. It is
  logic, not a component, so `src/lib/` is where it belongs, and
  `src/lib/performance-routes.ts` was already next door.
- 18 files import it: the ten Performance components and the eight
  screens of the Portfolio prototype, which still uses it because that
  is where the engine started life.
- **Nothing under `src/app/preview/` is live any more.** What
  is left there is the six `page.tsx` preview addresses and old
  rejected concepts.
- Same proof as the folder move: the only change inside the file is
  its header comment, and `shotdiff.mjs` reports every Performance
  page pixel identical.

**The daily Routine about the rename can be deleted.**

Older entries in this file still name the old paths. They are a record
of what was decided then and were left alone on purpose.

### Two things he decided NOT to have, 31 August 2026

Both in one message, after the rename: "remove what changed button. i
don't think it's that needed. also no need to be able to tap Totals'
six Per Category rows. dont have to do anything."

**1. "What changed?" is gone from Home.** The lavender pill beside
Heat Map. It was drawn but inert, so nothing stopped working when it
went. CLAUDE had proposed deleting it in August (job 8 on the numbered
list) and this is his decision, not that suggestion being acted on
quietly.

- The Heat Map's New Pattern and Cooling Off cards already answer
  "what moved lately". Two answers to one question is how a page gets
  confusing.
- The `ChangedMark` icon is kept in `icons.tsx` with a note saying
  nothing draws it. It is an icon library; the shape may be wanted.
- Nothing else on Home moved. Only the pill's own pixels changed.

**2. Totals' six Per Category rows stay untappable. WON'T DO.** Job 2
on the numbered list, which was going to make each row open Lab with
that category selected.

- The number stays stable at 2. It is marked WON'T DO, not deleted, so
  nobody proposes it again as if it were new.
- Totals' two "View all" links still open Lab at that group. That door
  is job 3 and it is built.
- This is the second of the two dead controls CLAUDE reported to him.
  One was removed, one was ruled fine as it is.

## Process

**Past reactions are not constraints.** Said twice in two days: "just
because i loved a view from 3 weeks ago does not mean that we have to
keep that view a month or a year later... my opinions will change as we
work through this."

**Do not upgrade his confidence level.** Caught 24 August 2026: "not a
terrible idea" was written up as "settled". That is more dangerous than
inventing a fact, because it looks like listening.

**Answer in bullets.** Repeated many times. The test: could he skim only
the bold bullet openings and miss nothing that needs him?

**Never use em dashes**, anywhere: code, comments, UI copy, commit
messages, documentation.

---

## HOME JOINS THE COLOUR DIAL, 30 August 2026

**He opened the protected folder, for this one job only.** His words:
"src/app/preview/performance-home/ is normally locked and no other
chat may edit it. I am lifting that for this job only. You may edit
it. You may not change how it looks." He also paused the Lab and
Totals chats so this one had right of way.

**Why he wanted it.** His words: "The next job after this one is dark
mode across every page. With one shared file that is one edit. With
Home separate it is 70 by hand."

**What changed.** Home's `page.tsx`, `charts.tsx` and `icons.tsx` no
longer hold a single colour. All three import from
`src/app/preview/performance-ui.ts`, the same file Lab, Totals,
Compare, the Heat Map and All Bets read. Fourteen of Home's colours
did not exist in that file yet, so they were ADDED to it under new
names. Nothing already there was renamed or moved, because 18 files
import those names.

**The new names, all Home's own values, unchanged:** `ROW_TILE_BAD`,
`RANK_INK`, `LAB_CARD`, `ORB_HI`, `ORB_TINT`, `ORB_DEEP`,
`SPARK_RED`, `FACT_GLYPH`, `SELECTOR_CHEV`, `TARGET_RED`,
`TAB_GLYPH`, `WASH_LINE`, `WASH_DOT`.

**Three reds are kept apart on purpose.** `RED` (#FC1B1D) is the
money figure, `SPARK_RED` (#FC1F1F) is the losing sparkline and
`TARGET_RED` (#FB1D1F) is the losing row's target icon. They were
sampled from different parts of his sheet and merging them would
darken two of the three. If he ever wants one red, that is now a
three line edit in one file.

**The proof it did not change.** Home was screenshotted at 390px and
1440px before and after, full page. Both pairs are byte identical
files. That was the whole test he set: "This job has no visible
result. That is the point."

**Still standing after this job:** Home's folder is locked again, and
the Lab chat owns it. The permission was for this one job.

**Flagged for him, not changed:** `CLAUDE.md` still says Home "keeps
its own copies because its folder is protected". That line is now
out of date. He told this chat not to edit `CLAUDE.md`, so it was
left alone.

**THE FILE MOVED, same day, on his order.** Raised as a
recommendation and he took it: "Yes, move the shared file to
src/app/preview/performance-ui.ts and update all the imports. Do it
now, while the other two chats are still paused. That is the whole
reason they are paused."

It now lives at **`src/app/preview/performance-ui.ts`**, beside the
six folders that read it instead of inside one of them. All 19
importing files were rewritten, the docs and `CLAUDE.md` were pointed
at the new path, and Home was screenshotted again afterwards: still
byte identical, both widths, both themes.

**He also opened `CLAUDE.md` for this**, which is normally not edited
from a job chat. His words: "You have my permission to edit it for
this." The permission was for these lines only.

---

## ONE FILE FOR EVERY DESIGN VALUE, 31 August 2026

**What he asked for, his words:** "I want to change one thing in one
file and have it update across every page. Font, font size, a colour,
a height, a corner radius, spacing. One edit, everywhere, from any
chat, with no coordination."

**And what was wrong, his words:** "Right now that is only true for
colours on the Performance preview pages, which read
`src/app/preview/performance-ui.ts`. Everything else, fonts, sizes,
weights, spacing, chart heights, menu heights, is written inside
individual page files. And the Performance top menu is written out
three separate times."

**Two passes, his order, and why:** "DO IT IN TWO PASSES. The second
one touches the live site, so I want to see the first one land before
it starts." Pass one is the six Performance previews. Pass two is
Track, Research, Settings and today's `/stats`.

**The whole job is invisible.** His words: "Do not change how anything
looks. This whole job is invisible." And: "If a screenshot before and
after differs, you did it wrong."

**Pass two does not touch the palette.** His words: "Pass two does not
unify the old and new palettes. The live pages keep their existing
colours through the app's existing colour mechanism. This job shares
sizes, fonts, spacing and shapes, not the palette decision, which I
make separately."

**No dark mode on the previews.** His words: "Do not add dark mode to
the previews. I am deliberately doing that later."

### Home's KPI row mirrors Lab's, 31 August 2026

Straight after the line came off the chart, with a screenshot of Lab's
row: "then i want to change the kpi row on home and mirror labs. see
attached. values should be: Bets, Record, Hit Rate, ROI."

- **Home's four were Bets, Hit rate, Wagered and Returned.** They are
  Bets, Record, Hit rate and ROI now, in that order, wearing Lab's
  icons.
- **This is what put ROI and the record back on Home** an edit after
  they came off the chart. He spotted the hole himself: "good find."
- **The two rows are now identical**, not merely similar. Same values,
  same formatters (the engine's own `hitOf` and `roiOf`, the ones Lab
  calls), same icons, same four column widths, same three divider
  positions. Measured: every cell starts at the same pixel on both
  pages.
- **Wagered and Returned are not lost.** Totals shows both. Recorded
  in `docs/open-questions.md` in case he wants them somewhere on Home.
- **Nothing else on Home moved.** `shotdiff.mjs`: the only pixels that
  changed anywhere are the 28px band the KPI row occupies, and every
  other Performance page is identical.

### What was found before anything was built

- **The page shell was copied six times**, not just the menu. Every
  `page.tsx` repeated the Figtree face, the 390pt column and the whole
  four icon tab bar. The tab bar was byte for byte identical in all
  six.
- **The top menu was in the code twice**, not three times: Home held
  its own copy and `PerfMenu.tsx` served Lab and Totals. Three pages
  drew it. Reported to him as found, not as he described it.
- **The back header was written three times and had already drifted.**
  Compare's row is 44px with a 36px button; All Bets and the Heat Map
  are 40px with a 34px button. Exactly the failure the job exists to
  stop.
- **152 type sizes were typed into pages by hand.** `text-[10.5px]`
  alone appeared 45 times.

### The four calls he approved, 31 August 2026, "Yes to all your calls"

1. **Compare's taller back header stays taller.** Collapsing the two
   shapes would change how Compare looks, and nothing may look
   different. The difference is now written in one place instead of
   hiding in three files. Whoever redesigns Compare should collapse
   it.
2. **Chart heights are named, not equalised.** Home and Lab draw at
   98, the Totals hero at 92, Compare at 132. They are in the dial so
   a change is one edit, not so that they are the same number.
3. **`icons.tsx` moved out of `performance-home/`** to
   `src/app/preview/performance-icons.tsx`. Six pages import it; it
   never belonged to Home. A pure move, no edits to the icons.
4. **One off spacing stays on the page.** A margin used once, on one
   page, is not a token. A dial full of single use values is a second
   place to look, not one place to change.

### What is in the dial now

Colours as before, plus: the Figtree face (loaded once instead of six
times), a ten step type scale, the two weights, six radii, the page
column width, the tab bar width and icon size, the menu's height, pill
and inset, the two back header shapes, and the four chart heights.

They are Tailwind class strings, not numbers, so the pages keep
writing `className` and nothing had to be rewritten as an inline
style. **This was proved with a real build before it was chosen**: a
made up class was put in a `.ts` file, the app was built, and the
class was found in the output CSS. Tailwind v4 reads `.ts` files.

`rounded-full` is deliberately NOT a token. It is a shape, not a
measurement.

### Three shared components replaced the copies

`performance-shell.tsx` (column, face, tab bar), `performance-menu.tsx`
(Home / Lab / Totals, with `performance-menu-live.tsx` for the two
pages that carry a period in the address) and
`performance-header.tsx` (the back header).

### How "invisible" was proved

`shotdiff.mjs`, written for this job. Two dev servers, one on a git
worktree of the old code and one on the new, 24 screenshots each
(six pages at phone and laptop width, plus ten states a page shot
cannot reach: popups, open pickers, an empty result), compared pixel
by pixel. **All 24 identical.** `jumptest.mjs` passed all 46 doors, none failed,
which a screenshot cannot test because it cannot see a tap.

**It caught two real things a screenshot review would have missed:**
Next's dev overlay sitting on top of four pages, and a hydration
error that only appears when a dev server is left running across
midnight (the demo data is dated relative to today).

### The lock on Home is gone, permanently

His order: "src/app/preview/performance-home/ is currently locked to
other chats in CLAUDE.md. Remove that lock permanently as part of this
job, and say in CLAUDE.md that it is gone and why: the one shared file
and the new check replace it."

The lock existed because Home held a private copy of everything. It
holds none now, so a chat editing Home cannot make it disagree with
the other five. Home is still the accepted design and must not be
REDESIGNED without his say; editing it is ordinary work.

---

## PASS TWO: THE LIVE PAGES JOIN THE SAME SYSTEM, 31 August 2026

Pass one moved the six Performance previews onto one file. Pass two did
the same for the live app, and added the check that keeps it that way.

**`/stats` was skipped, his decision.** He asked to be told whether it
was worth doing before it started. It was not: 683 lines that the
rebuilt Performance pages replace, holding three hardcoded sizes. His
words: "Skip /stats in pass two, agreed." It is exempt in
`design-check.mjs` rule 12, with a note pointing at the ruling.

**And it must not break.** His words in the same message: "today's
/stats page survives the swap. When the new Performance takes over the
/stats address, the old page moves to its own address with my real
numbers, and nothing you do may delete or break it." So it was
screenshotted before and after, both themes and both widths, like every
other page. Identical.

### Where the live app's values live now

**`src/app/globals.css`** gained a `@theme` block holding the type scale
and the corner radii the app actually uses. **The values in it are
Tailwind's own defaults, restated**, so writing them down changed
nothing on screen.

That is the point of it. Every page writes `text-sm` and `rounded-xl`,
and until now those numbers lived inside the Tailwind package, where
nobody would look and nobody could change them. Changing the app's body
size is now one line in `globals.css` instead of a sweep across sixty
files.

The line heights are listed beside their sizes on purpose. Change a
size without its line height and the text keeps the old leading, which
reads as a bug months later.

**`src/lib/ui.ts`** gained the strings the pages were repeating word for
word: `PAGE` (the page frame, written out nine times), `COLUMN` (nine),
`PAGE_TITLE` (seven), `SECTION_HEAD` (eleven) and `CARD_FIGURE`.

`CARD_FIGURE` and `SECTION_HEAD` are the same size today and are
deliberately two lines. A heading and a money figure are different
jobs, and moving one should not move the other.

### What was NOT done, and why

- **The palette was not touched**, his instruction: "This job shares
  sizes, fonts, spacing and shapes, not the palette decision, which I
  make separately."
- **`rounded-full` is not a token.** It is a shape, not a measurement.
- **Shadows are not tokenised.** `rgba(24,20,50,0.07)` appears eleven
  times in the Performance previews as a box shadow. It is a real
  shared value and a real gap, raised rather than fixed, because he
  named colours and fonts for this job and a shadow is neither.
- **The old rejected previews under `/preview` were left alone.** They
  are dead code kept so the history survives.
- **Greeting's `text-[22px]`** on Track was left alone: it carries a
  different leading and tracking to the page title, so it is not the
  same thing wearing the same size.

### The check, `design-check.mjs` rule 12

His order: "Add a check to npm run check that FAILS the build on colours
and font families written inside a page. Shared sizes like menu height,
chart height, radii and the type scale become tokens. Per page spacing
stays free."

**WHAT IT CATCHES.** A hex or an `rgb()`/`hsl()` written inside a
Performance preview page. A font family named inside any page, and
`next/font` loaded anywhere but the two files that own the faces. A type
scale step or a radius written by hand in a preview instead of its
token. The live app's page frame, column, page title or card heading
written out by hand instead of `PAGE`, `COLUMN`, `PAGE_TITLE` or
`SECTION_HEAD`.

**WHAT IT CANNOT CATCH.** A colour hidden inside a box shadow, because
every `rgba()` in these pages is a shadow and shadows are not tokenised
yet. A menu or a chart drawn from scratch rather than from its shared
component, because a line by line checker cannot see that a block of
markup is a second copy of another block. A value put in the shared file
that should never have been shared. And a wrong value: it checks that a
number came from the right place, never that the number is right. Only
his eye does that.

**Per page spacing is deliberately free.** Nothing in the rule looks at
`mt-`, `mb-`, `px-`, `py-`, `gap-` or `space-`.

**The rule was tested by breaking the code on purpose**, ten times:
seven violations that must fail the build, and three legitimate things
that must not (a `var(--font-)` reference, per page spacing, and a one
off size). All ten behaved. A check that passes on clean code proves
nothing.

### How "invisible" was proved, again

`shotdiff.mjs` grew a live page set: the landing page, login, about,
terms, privacy, the demo door, and Track, Performance, Settings,
Research, Insights, Connect and Auth through their previews. **Both
themes, both widths: 76 screenshots each side, all identical.**

**The clock had to be pinned to make that possible.** The Performance
chart reads `new Date()` after it mounts and plots up to that moment, so
two runs a minute apart drew two different charts and today's `/stats`
reported about 1,800 changed pixels against itself. Playwright's clock
is now fixed before every shot.

**One thing to know for next time:** running `next build` while a dev
server is up on the same folder wrecks that server's stylesheet, and the
pages then render with no CSS at all. It looked exactly like a
catastrophic design break for about ten minutes. Stop the dev server
before building.
