# Working with this project's owner

The owner has no coding experience. These rules are permanent.

## Communication

- **Answer in bullets, not prose.** The test for every reply: could he
  skim only the bold bullet openings and miss nothing that needs him?
- **Anything that needs his eyes goes FIRST**, as its own bullet, never
  buried mid-paragraph and never after a comma.
- **Any click he must make comes with a full pasted link.** His words,
  28 August 2026: "u have to paste a full link if you want me to click
  on anything." Never say "merge the branch" or name a button without
  the URL that leads to it.
- **Be brief.** A handful of bullets, not a report. Cut reasoning unless
  it changes a decision. Do not list every test that passed; say it
  works. Do not restate the question.
- Short sentences. Explain at a level a non-coder can grasp.
- Never compress several ideas into one long sentence.
- **Never use em dashes anywhere:** not in code, comments, UI copy,
  commit messages, or documentation. Use commas, periods, colons or
  parentheses.

## Working rules

- **Never build until he explicitly approves the plan.**
- Build in phases. He verifies each phase before the next starts.
- **Ask on any ambiguity. Make no assumptions on product decisions.**
- **Do not upgrade his confidence level.** "Not a terrible idea" is not
  "settled". Record what he actually said, at the confidence he said it.
  Label your own inferences as inferences.
- **His past reactions are not constraints.** Never argue for keeping
  something because he once liked it. His current words are the only
  spec. Decisions he marks permanent stay permanent until he reopens
  them himself (he reopened the fonts, 26 August 2026).
- **Challenge him.** He has asked for this directly. If something does
  not hold together, say so before it is built.
- This is a v1: prefer simple and working over clever.
- **Coach him on focus.** When he gets stuck on a small detail before
  shipping, say "I will store it, let us finish X first". If he insists,
  drop it and do as he asks.

## Before he sees any document meant for someone else

A brief, a prompt, anything he will forward. Two rules, both bought on
26 August 2026 at the cost of three rejected mockup rounds.

- **QUOTE HIM. DO NOT PARAPHRASE.** Both disasters that day were a small
  reword with a huge result. "Opening it should not land on graphs"
  became "no graphs at the top", which deleted the chart panel. "He
  knows our style, he is free to work with what he already knows" became
  "beat the palette", and the designer threw the style away. Where a
  summary is unavoidable, mark it as your summary, not his rule.
- **Audit it before handing it over, not when he pushes back.** Read the
  document against `docs/decisions.md` line by line and report what is
  missing, unasked. That check takes two minutes and it found six
  omissions he should never have had to find himself.

**"Are you sure?" must never be answered with confidence.** If he asks,
name the check you ran and what it returned. If you cannot name one, you
did not run one: go and run it.

## Before he sees any UI change

- **Run `npm run check`.** Never show a screenshot while it is failing.
- **Check phone AND laptop width, in BOTH themes.** Every time.
- **Sweep the whole app** for whatever changed. A design change is never
  finished in one file.
- **Change nothing he did not ask for.** Propose, do not apply.
- **Never change a font without permission.** Family, weight and size.

Full procedure: the **`ui-change`** skill.

## When something reaches him that a machine could have caught

The fix is a new rule in `design-check.mjs` or in this repo's docs, not
a promise to be careful. Making him the last line of defence is the
failure.

**Screenshots cannot see everything.** Gestures, motion and absences all
need a script: `scrubtest.mjs`, `motiontest.mjs`, `pftest.mjs`,
`jumptest.mjs`.

## Product facts

- **Actuals**, a mobile-first manual sports bet tracker. Renamed from
  Celebet, August 2026.
- Live at **actuals.cc**. Deployed on Vercel from **`main`**. Merging
  into `main` is what reaches the live site. The old build branch was
  renamed to `main` on 26 August 2026. See `docs/git-workflow.md`.
- Next.js App Router, TypeScript, Tailwind v4, Supabase with RLS.
- **Four tabs:** Track (capture data), Performance (understand
  yourself), Research (understand the game before your next bet),
  Profile (bottom right). Ruled 26 August 2026, replacing "three tabs
  and only three".
- **The three are stages of a bet:** Track is the bet, Performance is
  after it, Research is before it. **Profile IS today's Settings page**,
  promoted to a tab and due a rework. Track keeps its small profile
  button in the top corner for now.
- Performance lives at `/stats` and Research at `/recommendations`. The
  addresses were kept from the old names on purpose.
- USD, 2 decimals. Decimal odds, 2 decimals.
- **The user types the stake and the exact To Collect. There are no odds
  inputs anywhere.** Total odds are always derived.
- `Net profit = balance + withdrawals - deposits`, and **it has one
  definition**. No surface computes its own version.
- **Every money rule lives in `src/lib/stats.ts`.**
- Peak Street 6 LLC. The mark is not filed, so no trademark claims.

## What is in flight right now

**Check this before starting anything, so two chats do not collide.**
Keep it current: when a job finishes, delete its line.

- **The Performance page rebuild.** Three tabs inside `/stats`: Home,
  Lab, Totals. **Do not redesign `/stats`, `StatsView.tsx` or anything
  under `src/app/preview/pf/` in another chat.**
  **`src/app/preview/performance-home/` is the ACCEPTED Home and the
  design reference for Lab: read it, never edit it from another
  chat.** **`src/app/preview/performance-lab/` is the ACCEPTED Lab:
  same rule, read it, never edit it from another chat.** The Lab
  chat owns both that folder and Compare, on branch
  `claude/actuals-lab-redesign-onv3s8`. It also edits
  `sitecheck.mjs` (the PREVIEW list) and `jumptest.mjs`.
  - The thinking is settled and written: read
    **`docs/performance-brief.md`** first. It is the argument.
  - `docs/mockup-briefs.md` holds draft designer prompts. **Reference
    only, not rules.** He writes his own prompts now.
  - What is still undecided is in `docs/open-questions.md`.
  - Current stage: **Home and Lab are both ACCEPTED and live as
    previews, 29 August 2026.** Home: "this version will do, good
    job." Lab: "merged, checked the phone, works well." They sit at
    `/preview/performance-home` and `/preview/performance-lab`, the
    menu switches between them, and Home's ranked rows jump into Lab
    with that fact selected (`jumptest.mjs` proves all seven doors).
    The copy phase is over ("we're now passed copying it. WE're now
    improving what we have"), so his edit lists rule, not the mockup
    files. Status lives in `docs/performance-rebuild.md`.
    **Compare is built and merged**, its own page at
    `/preview/performance-compare`, from his sheet `1. Compare.png`,
    reached from Lab at exactly two selections. He merged it without
    a verdict, so it is live but not marked accepted.
    **Totals and the Heat Map are merged and live as previews.**
    Totals at `/preview/performance-totals` from `2. Totals.png`
    ("totals looks good"). The Heat Map at
    `/preview/performance-heatmap` from `2. heat map.png`, reached
    from Home's Heat Map pill; his words on the last round, 29
    August 2026: "you're right, good decisions. merged it now."
    Recorded at that confidence: he approved the calls and merged.
    He has not called the page finished. Its map has NO filter, his
    ruling: the tiles are Home's own ranked facts across every
    group, eight of them with three of each colour guaranteed. The
    differences from the sheet are in `docs/decisions.md`.
    **Every control on the five preview pages was clicked and
    logged, 29 August 2026.** What works and what is still drawn
    but inert is listed in `docs/performance-rebuild.md`.
    **Colours: every Performance page reads one dial**,
    `src/app/preview/performance-ui.ts`. Home, Lab, Totals, Compare,
    the Heat Map and All Bets all import from it and none of them
    holds a colour of its own. Home joined and the file moved out of
    the `performance-lab` folder on 30 August 2026, both on his
    order, with zero visual change. **Never write a hex in a
    Performance preview file. Add a line to the dial and import it.**
    What has NOT happened is the colour work itself: he parked the
    palette on 29 August 2026, "even after the pages are live".
    The three menu tabs reach each other.
    **The remaining work is a NUMBERED LIST in
    `docs/performance-rebuild.md`, jobs 1 to 13**, written 29 August
    2026 so he can start one by saying its number. The numbers are
    stable: mark a job DONE, never renumber. Nothing on it starts
    before he says the number.
    Build order, his words: "Home, Lab, Totals are the main pages.
    Other pages inside Performance are: Compare, All Bets, Insights."
    Home ships first and goes live alone: on day one Totals holds
    today's `/stats` content unredesigned and Lab wears a Soon badge.
    A mockup showing a two tab switcher is still built with three.
- **App Store submission**, in a separate chat with the owner. Settings
  and store config, not code.

## How work reaches the live site

1. **`main` is the live code.** actuals.cc shows whatever is on `main`.
2. **Every chat works on its own branch, never directly on `main`.**
3. **Work reaches the site by being merged into `main`.**
4. **The owner clicks Merge.** Nothing goes live without it.

**Do not improvise a different model of this.** It was re-litigated
across several chats and he had to referee. Full detail, and the words
that get confused (push, deploy, merge), in `docs/git-workflow.md`.

## When a task is finished

**Do this yourself, before telling him it is done. Do not ask him to
remember any of it.** His only job is clicking Merge.

1. **Write down anything he ruled on**, into `docs/decisions.md`. A
   ruling that lives only in a chat dies with that chat.
2. **Delete this task's line** from "What is in flight right now", if it
   had one. A stale in-flight list is worse than none.
3. **Update the docs the work changed.** New route, new rule, new
   gotcha.
4. **Run `npm run check`, then commit and push.**
5. **Tell him in one bullet what to merge**, and what it changes on the
   live site.

## Secrets

- **Never put a key in the repo or in chat.** He types them straight
  into Vercel.
- `NEXT_PUBLIC_` values are baked at build time: changing one needs a
  redeploy, not just a save.
- Actuals is **read-only toward Kalshi**. No trading code may exist here.

## Where everything else lives

| File | What |
|---|---|
| `docs/architecture.md` | Stack, routes, env vars, the middleware gate, test scripts. |
| `docs/data-model.md` | Tables, cascades, metadata, the taxonomy levels. |
| `docs/business-rules.md` | Every money rule and why it is that way. |
| `docs/decisions.md` | His rulings, with the reasoning behind each. |
| `docs/failed-approaches.md` | What was built and thrown away, and the lesson. Read before proposing something obvious. |
| `docs/open-questions.md` | Live, undecided. Nothing here may be built. |
| `docs/design-system.md` | The full colour, type and component reference. |
| `docs/performance-rebuild.md` | The in-flight Performance work. |
| `docs/owner-summary-performance.md` | **His own written summary of the Performance redesign. Primary source, outranks the rest.** |
| `docs/performance-brief.md` | The Performance redesign argued through, for the mockup designer. |
| `docs/todays-stats-page.md` | What live `/stats` actually looks like, for briefing Totals. |
| `docs/mockup-briefs.md` | Draft designer prompts. Reference, NOT rules. |
| `docs/git-workflow.md` | Branches, merging, and what push / deploy / merge each mean. Settled, do not contradict. |
| `docs/history.md` | What has shipped, dated. |
| `IDEAS.md` | Future work, in NOW / SOON / FUTURE buckets. |
| `ROADMAP.md` | Track page divergences from the mockups. |
| `PORTFOLIO-VIEWS.md` | The prototype's view-by-view build log. |

Skills: **`ui-change`**, **`db-migration`**, **`mockup-build`**,
**`idea-capture`**.

Path-scoped rules load automatically from `.claude/rules/` for the
design system, the taxonomy, SQL files and the preview pages.
