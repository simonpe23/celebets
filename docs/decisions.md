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
`src/app/preview/performance-lab/ui.ts`. Home is not on that dial,
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

It is now built that way. Every colour Lab and Compare draw lives in
`src/app/preview/performance-lab/ui.ts`, one named line each, and
nothing else in those folders contains a colour: a check for a raw
hex outside that file returns nothing. Changing a line there changes
that colour on both pages at once.

**The accepted Home is the one page still outside the dial**, because
that folder is protected from this chat. It keeps its own copies of
the same values. Opening it for a one line import per colour is a
small mechanical job, and until he asks for it a colour change means
editing two files rather than one. **The lavender itself is not
changed yet: he parked the colour decision, so nothing was recoloured
on his behalf.**

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
