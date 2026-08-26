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

- Track means capture data.
- Performance means understand yourself.
- Research means understand the game before your next bet.
- Profile is new and its contents are not yet decided.

The first three are a timeline: before the bet, the bet, after the bet.
Profile sits outside that sequence, which is why it goes last.

**Insights still does not get a tab.** It is a layer inside Performance,
the way Apple Health puts insights inside the health data rather than
beside it.

**Insights and Research are opposite ends of one timeline.** Research
happens BEFORE a bet and is active: the user goes looking. Insights
happen AFTER a bet and are passive: Actuals surfaced them on its own,
from the user's own data.

**Performance is a performance review, not a statistics page.** Opening
it should not land on graphs.

**REFINED 26 August 2026: the result and the chart open Home.** Seeing
the first Home mockup without them: "There's no chart and result at the
top of the home page."

The old rule was never "no chart". It was "do not land on a chart
INSTEAD of findings". The order is: your net profit and the line that
draws it first, then the findings underneath. A brief that flattened
this into "no graphs at the top" produced a Home page with no headline
number at all.

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

**Purple has one job: something you press.** Ruled August 2026: "the
purple color is too overwhelming, it's just too much purple,
everywhere."

He was right and the shade was never the problem. Purple was doing seven
jobs at once (brand, button, active tab, link, badge, data line,
decoration) with twelve purple objects on the Track page's first screen.
A colour that means seven things means nothing.

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

**Compare only works within one group.** Sports vs sports, leagues vs
leagues. Cross-group selections combine instead.

**Colour is the wrong tool for that rule.** The groups are already
separated by their headers. Dimming the chips you cannot pair with
teaches the rule at the moment you try to break it, with no new colours
and no accessibility problem.

**Sort by Profit, ROI or Hit rate, all three visible at once.** "Impact"
was removed: a number nobody can explain does not belong in a product.
The cycling control that hid its own options was rejected as annoying.

**Compare lives inside Lab.** Ruled 26 August 2026. How it is presented
is still open; the mockup designer is asked to propose.

**All bets live at the bottom of Totals.** Ruled 26 August 2026: the
latest 50 bets inline, then a button that opens the full All Bets page.
That page accepts a filter, so "See these 26 bets" from Lab lands on the
same page. This settles where betting history sits.

**Every Performance mockup shows the three tab switcher.** Home, Lab,
Totals, on every screen, active tab marked.

**The Insights page gets a new mockup.** Ruled 26 August 2026: "The
insights page is bleak today." It is currently a heading over a flat
list of sentence rows.

**Insights are reachable from everywhere in the app**, triggered by the
sparkle.

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
