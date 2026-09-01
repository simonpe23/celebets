# Architecture

## Stack

- **Next.js App Router**, TypeScript, Tailwind v4.
- **Supabase** for auth and Postgres, with Row Level Security on every table.
- **Vercel**, deployed from `main`. Merging into `main` is what
  reaches the live site. The Vercel production branch setting must
  match the default branch. See `docs/git-workflow.md`.
- Live at **actuals.cc** (domain at Hostinger, DNS at Hostinger, pointed
  at Vercel). The `vercel.app` address still resolves.

## Routes

Public (no login):

| Route | What it is |
|---|---|
| `/` | Landing page. Logged-in users are redirected to `/app`. |
| `/login` | The only auth page. |
| `/about`, `/privacy`, `/terms` | Legal and footer pages. |
| `/demo/<code>` | The shareable demo link: one click into the demo account. The page forwards the code from the address to `/api/demo-login`. A wrong code renders "That link is not active." |

Private (login gate in `src/middleware.ts`):

| Route | What it is |
|---|---|
| `/app` | **Track**, the home page after login. |
| `/stats` | **Performance Home**, the rebuilt page, live since 31 August 2026. Address kept from the old name. |
| `/stats/lab` | **Performance Lab**, the builder. |
| `/stats/totals` | **Performance Totals**. |
| `/stats/compare`, `/stats/bets`, `/stats/heatmap` | Compare, All Bets and the Heat Map. **Addresses, not pages**: each opens the Performance area on that view. Reaching one from inside Performance never loads anything. |
| `/stats-old` | **Today's old Performance page**, kept alive with his real numbers by his ruling of 31 August 2026. It stays until he retires it himself. |
| `/recommendations` | **Research**. Address kept from the old name. |
| `/insights` | The full insight list. Lights the Performance tab. |
| `/settings` | Settings, reached from the gear on Track. |
| `/transactions` | Balance history. |
| `/connect` | Kalshi connection. |
| `/preview/**` | Design previews. Deployed and public, demo data only. |

**Two names never match their address.** Performance lives at `/stats`
and Research at `/recommendations`, because renaming would break old
links and the tab bar's active-state matching for no user-visible gain.

## API routes

| Route | What it does |
|---|---|
| `/api/parse-slip` | Sends a bet slip screenshot to the Claude API (Haiku) and returns parsed fields. Needs `ANTHROPIC_API_KEY`. |
| `/api/demo-login` | The investor demo door. Needs `NEXT_PUBLIC_DEMO_EMAIL`, `DEMO_CODE`, `DEMO_PASSWORD`. |
| `/api/connect/kalshi/*` | Kalshi connection and sync. Read-only toward Kalshi. |
| `/api/account/delete` | Deletes the auth user. Needs `SUPABASE_SERVICE_ROLE_KEY`. |
| `/api/account/export/bets` | Every bet and leg as CSV. |
| `/api/account/export/transactions` | Balance history as CSV. |
| `/auth/confirm` | Turns emailed token-hash links into sessions. |

## The middleware gate

`src/middleware.ts` redirects any logged-out visitor to `/login`, with
these exceptions:

- `/`, `/about`, `/privacy`, `/terms` are public to everyone.
- `/login` and `/auth/*` are reachable logged out by definition.
- `/api/demo-login` is exempt: its whole job is being called logged out.
- `/demo/` pages are exempt for the same reason: the link's whole
  audience is logged out.
- `/preview/*` is public everywhere, like the footer pages. Ruled by
  the owner 28 August 2026: "open the preview without login, nothing
  needs to be locked." Previews carry made up demo numbers, never user
  data.

`/api/connect/*` is deliberately NOT exempt: those routes act on the
logged-in user's own connection.

## Key files

| File | Owns |
|---|---|
| `src/lib/types.ts` | `SPORTS`, `KALSHI_CATEGORIES`, `TOPICS`, `isTopic`, `NOT_SPORTS`, `SPORT_EMOJI`, and the `Leg` / `Bet` shapes. |
| `src/lib/taxonomy.ts` | Domains, categories per domain, markets per category, periods per sport, competitions per sport, and the alias tables. |
| `src/lib/load-bets.ts` | The signed in user's bets, one query, used by all six live Performance pages. |
| `src/lib/performance-routes.ts` | The two address sets. A Performance page takes a route set, so the same component serves the public preview and the live page. |
| `src/lib/stats.ts` | Every money rule. `legShares`, `legStakeShares`, `betProfit`, `sportRows`, `periodStart`, `sinceLine`. |
| `src/lib/ui.ts` | `CARD`, `INNER`, `BTN`, the outcome pills, `ACCENT`. |
| `src/lib/kalshiSync.ts` | Turns Kalshi fills into bets and classifies them into the taxonomy. |
| `src/lib/connectCrypto.ts` | AES-256-GCM for the stored Kalshi private key. |
| `src/lib/csv.ts` | CSV escaping and the UTF-8 BOM. |

## Environment variables

All set in Vercel by the owner. **None are ever in the repo or in chat.**

| Name | Sensitive | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | no | everywhere |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no | everywhere |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | account deletion only |
| `ANTHROPIC_API_KEY` | **yes** | slip parsing |
| `CONNECT_ENC_KEY` | **yes** | Kalshi key encryption |
| `NEXT_PUBLIC_DEMO_EMAIL` | no | the demo door |
| `DEMO_CODE`, `DEMO_PASSWORD` | **yes** | the demo door |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | no | Google sign-in toggle |

**`NEXT_PUBLIC_` values are baked at build time.** Changing one needs a
redeploy, not just a save. Sensitive must be OFF for `NEXT_PUBLIC_`
values and ON for the rest.

## Checks and test scripts

`npm run check` runs, in order:

1. `design-check.mjs`, the design system rules (fonts, purple, money
   face, em dashes, and rule 12: design values live in the shared files
   and never inside a page). It reads every `.tsx` under `src/`,
   previews included, and the em dash rule also reads the docs and the
   build scripts. The three COLOUR rules are exempt under `/preview`
   until the new palette is approved. See
   `.claude/rules/preview-pages.md`.
2. `synctest.mjs`, the Kalshi money maths and taxonomy round-trips.
3. `tsc --noEmit`.
4. `next build`, **required**, because ESLint's rules-of-hooks only
   runs here.
5. `sitecheck.mjs`, loads every page at 320, 393 and 1512 in both
   themes, 180 page loads, and reads what
   actually rendered.

**Proving a change is invisible.** Some jobs are meant to change
nothing on screen: moving a value into a shared file, pulling a
repeated block into one component. `shotdiff.mjs` is the check for
that. Run one dev server on a git worktree of the old code
(`git worktree add /tmp/base HEAD`) and one on the new, shoot both,
diff them. It reports the number of pixels that moved, so "it looks
the same to me" is never the answer.

Standalone scripts:

| Script | Proves |
|---|---|
| `scrubtest.mjs <port> <theme>` | The Performance chart's press-and-hold scrubbing is alive. |
| `motiontest.mjs <port>` | Page and sheet motion, chart draw, counting numbers, reduced-motion. |
| `pftest.mjs <port>` | Every sport is reachable in the Portfolio prototype's pickers. |
| `synctest.mjs` | Kalshi money splits and competition normalisation. |
| `design-check.mjs` rule 13 | There is ONE bottom bar. Any other file building a bottom-stuck bar that names three or more tabs fails the build. |
| `jumptest.mjs <port>` | The doors between the Home and Lab previews: row taps arrive with the fact selected, Explore Lab lands empty, and Home's KPI row mirrors Lab's cell for cell. |
| `periodtest.mjs <port>` | The Performance period filter really filters: every period changes the numbers, Custom takes two dates, and the window survives a tab switch. |
| `instanttest.mjs <port>` | NOTHING under Performance loads a page. Every door between the six views (menu tabs, ranked rows, the Heat Map pill and its tiles, See these bets, Compare, See all bets, every back arrow) causes ZERO server page requests, each view's own address still opens it, and the chosen window travels. |
| `shotdiff.mjs shoot <port> <dir> [light\|dark] [perf\|live]` | `perf` shoots the six Performance previews at both widths plus ten states a page shot cannot reach. `live` shoots the app and the public pages, and needs running twice, once per theme. |
| `shotdiff.mjs diff <a> <b> [marks]` | Compares two of those folders pixel by pixel, and writes the differing pixels out in magenta. |

## Supabase settings not visible in the repo

Both cost a live test when wrong:

- **Email OTP length must be 6.** Authentication → Sign In / Providers →
  Email. It defaults higher and the app draws exactly six boxes.
- **Email templates must carry `{{ .Token }}`** on BOTH the "Magic link
  or OTP" and "Confirm sign up" tabs. The stock templates send a link,
  and nothing in the app catches those any more.
- **URL configuration** lists the site URL and redirect URLs with `/**`
  wildcards. A new domain must be added here or reset links silently
  fall back to the home page.
- Email is sent through **Resend** from `no-reply@actuals.cc`, wired into
  Supabase custom SMTP. DKIM, SPF, MX and DMARC records live at
  Hostinger.
