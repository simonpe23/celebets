# Phase 4 handover: the laptop

Written 4 September 2026, when the owner said phase 4 should happen in
its own chat. Everything here is either his own words or a number
measured on the real pages. Read `CLAUDE.md` first, then this.

## THE JOB, AND WHO DESIGNS IT

**His problem, his words:** "My app looks like two different products."

**Phase 4 of the size and layout job he approved on 31 August 2026:**
"Laptop and full responsive. He picks from three options first."

**THE LAPTOP DESIGN COMES FROM HIM, NOT A DESIGNER.** Asked directly,
he said: **"i will not brief my designer. we will redesign locally in
the next few days and see what happens."**

**And he is not a designer either.** His words, 2 September 2026: "i am
now debating to do phase 4 here or in a new chat. i am not capable of
doing that work. i am not a designer."

**So do not send him a brief and do not ask him to describe a layout.**
Build finished options on the real pages and let him point at one. That
is the method that worked for the size scale in phase 2, which he chose
by looking at three drawn side by side at `/preview/scale`.

**A standing ruling that governs this whole job:** "Ask me. Do not
choose and tell me afterwards." And on the size scale: "Show me both,
do not pick."

## WHAT IS ALREADY DONE. Do not reopen any of it.

1. **One bottom bar.** `src/components/TabBar.tsx`, four tabs, every
   page. `design-check.mjs` rule 13 fails the build on a second one.
2. **One size scale.** 11, 12, 13, 15, 17, 20, 26 and a 34px hero, in
   `src/app/globals.css`. He chose it from three. Rule 14 fails the
   build on a size written by hand.
3. **One layout system.** `PAGE_FRAME` in `src/lib/ui.ts` is the one
   frame and the one edge rule. Every page's content starts and ends on
   the same line as the tab bar. A page shorter than its window is
   centred as one block, bar included. `sitecheck.mjs` fails the build
   on a misaligned edge.

## THE MEASUREMENTS. Taken 4 September 2026 at 1512x950.

Every page, both the live app and its preview, in light theme.

| Page | Column | Empty sides | Page height | Fills the window |
|---|---|---|---|---|
| Track | 448px | 1064px | 2513px | scrolls |
| Performance Home | 448px | 1064px | 950px | no, short |
| Performance Lab | 448px | 1064px | 1091px | scrolls |
| Performance Totals | 448px | 1064px | 1341px | scrolls |
| All Bets | 448px | 1064px | 3152px | scrolls |
| Compare | 448px | 1064px | 1090px | scrolls |
| Heat Map | 448px | 1064px | 950px | no, short |
| Research | 448px | 1064px | 950px | no, short |
| Settings | 448px | 1064px | 1189px | scrolls |
| Insights | 448px | 1064px | 1654px | scrolls |

**Not one page differs.** Every one uses 448px of 1512 and wastes 1064,
which is 70% of the screen.

**Three consequences worth naming:**

- **Track scrolls 2513px on a laptop** for content that would nearly
  fit one screen if it used the width.
- **Three pages are shorter than the window** and float as a thin strip
  with grey either side.
- Nothing in the app has ever grown past 448px, at any width from 768
  to 1920.

Re-measure rather than trust this table if the layout has moved since.
The script that produced it is trivial: load each page at 1512x950,
read the tab bar's bounding box for the column width, and read
`document.documentElement.scrollHeight` for the page height.

## THREE DIRECTIONS, drafted but NOT chosen

He has seen these three named and has not picked. Build all three on
the real pages and let him look.

- **A. Wider column.** Same design, more room. Cheapest and safest,
  still leaves about 700px empty.
- **B. Two columns.** The page splits left and right on a laptop.
  Halves the scrolling, uses the space, most work.
- **C. Side navigation.** The bottom bar becomes a left sidebar, as
  most web apps do. Uses the width for navigation rather than content.

CLAUDE's recommendation was B, offered as a recommendation only. His
pick is the only thing that decides it.

## NOT IN THIS JOB

**Fonts and colours, his ruling, quoted twice because it was ignored
once already:**

> "Performance use different faces and different purples. I know. That
> is my redesign and I am doing it separately, locally, with a proper
> design system that will work across all pages. Do not touch either."

> "Fonts and colours. That is my redesign, happening separately."

**Do not change a font family, weight or size. Do not change a colour.**
`design-check.mjs` rule 8 fails the build on a font move.

## THE RULES THE CODE MUST OBEY

- **Three files hold every shared value and nothing else may:**
  `src/app/globals.css`, `src/lib/ui.ts`,
  `src/components/performance/ui.ts`. Rule 12 fails the build on a
  colour, a font or a shared size written inside a page. Spacing used
  once on one page is the exception and stays there.
- **Never set a horizontal inset on a page's outer layer.** The frame
  owns the edge.
- **Repeated markup becomes one component.** If a laptop layout is
  drawn on more than one page it is a component, not a copy.
- **Never use an em dash**, anywhere, including comments and docs. Rule
  11 fails the build.

## ONE CHAT OWNS THE PERFORMANCE AREA, and phase 4 will touch it

Ruled 31 August 2026: "one chat from now." Two chats editing the same
six files made him referee merge conflicts he could not read three
times in one evening. His words: "i absolutely hate that i have 3 chats
editing this app."

**This chat has stopped.** It finished the silence job, the restart
work, and phases 1 to 3. It holds nothing open. The phase 4 chat owns
`src/components/performance/`, `src/app/preview/` and `src/app/stats/`
from here.

## FIVE THINGS ALREADY SETTLED THAT A LAPTOP JOB WILL TRIP OVER

Found by auditing this document against `docs/decisions.md` rather than
by being asked. Every one of them would otherwise cost a round.

1. **The landing page is already responsive to 1300px.** Only the app
   half is stuck at 448px. Do not redo the public side.
2. **The public and legal pages are exempt from the type scale and
   pinned.** See `LegalPage.tsx`. Do not drag them into the app's
   scale while making things responsive.
3. **The Performance pages have no dark mode at all**, by his ruling,
   until his own redesign. `sitecheck.mjs` still loads both themes, so
   a laptop layout must not assume a dark variant exists there.
4. **`/stats-old` is alive with his real numbers and must stay** until
   he retires it himself. It is not a dead page to clean up.
5. **`sitecheck.mjs` holds its own list of preview addresses.** A new
   preview page is not checked until it is added to that list, and an
   unchecked page is how the 320px overflow survived for weeks. Adding
   the three laptop options means adding three entries.

## One measured fact that will look like a bug and is not

**The bottom bar does not overlap anything.** Every page was scrolled
to the bottom at laptop size and nothing hides behind it. He suspected
a bug there; it was measured and there is none. Do not go hunting for
it.

## TESTING, and what it costs to skip it

- **`npm run check`** is the gate: design check, the Kalshi money
  maths, `restarttest.mjs`, types, production build, `sitecheck.mjs`
  and `emptytest.mjs`.
- **`sitecheck.mjs`** loads every page at 320, 393, 1512 and a tall
  1512x1600 in both themes, 272 loads, and fails on sideways scroll or
  a misaligned edge. It is the main guard for this job.
- **`shotdiff.mjs`** shoots every page on the old code and the new and
  compares pixel by pixel. **A change meant to be invisible on a phone
  needs this.** "It looks the same to me" is not a check.
- **`emptytest.mjs`, `periodtest.mjs`, `jumptest.mjs`,
  `instanttest.mjs`, `controlstest.mjs`** each need a running dev
  server and each prove something a screenshot cannot see.

### Four traps that cost this chat hours

1. **Never edit a file or kill a server while `npm run check` is
   running.** One gate reported 234 failures that were all self
   inflicted, and the result had to be thrown away.
2. **Killing a check leaves its dev server alive as an orphan**, which
   then squats on the port the next check needs. Three runs in a row
   never finished because of this. Kill `next-server`, not just the
   wrapper.
3. **`pkill -f "next dev"` matches the shell running that very
   command** and kills the job. Write `pkill -f "[n]ext dev"`.
4. **A fixture pinned to a fixed date drifts** out of the record it was
   meant to split. Count back from today.

## HIS COMMUNICATION RULES, which matter more than the code

- **Answer in bullets, never prose.** Anything needing his eyes goes
  first, as its own bullet.
- **Every click comes with a full pasted link.** His words: "u have to
  paste a full link if you want me to click on anything."
- **End every message with his todos.** "end with my todos. always."
- **Never tell him there is nothing to do.** His words, 4 September
  2026: "don't say nothing for you to do ever again. give me a task."
- **Never send a merge link while a check is still running.** He merges
  the link he is given.
- **Never use em dashes.**
- **Quote him. Do not paraphrase.** Two rejected mockup rounds were
  bought with small rewords.

## WHERE TO START

1. Read `CLAUDE.md`, then `docs/decisions.md` from "The four phases".
2. Re-measure the table above on the current code.
3. Build A, B and C on the real pages, behind preview addresses.
4. Send him screenshots of all three and ask him to point at one.
5. Build nothing beyond that until he has pointed.
