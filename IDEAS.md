# Celebet idea backlog

How this file works:
- The owner says "I have a new idea" and tells Claude to store it.
- Every idea lands in one of three buckets: NOW, SOON, or FUTURE.
- The owner decides the bucket. Claude may recommend one.
- Nothing in this file is approved for building. Building always needs
  an explicit plan and the owner's approval first.

## DONE (July 2026)

1. Recommendations list page, plus per-sport version. Shipped.
2. Sub-categories per sport, Football first. Shipped.
3. Tennis, Golf, esports added. Shipped.
5. Quick logging package: stake chips, optional pick, percent input
   with exact To Collect. Shipped.
12. Screenshot import: paste a bet slip, AI pre-fills the form.
    Shipped and verified July 2026.
4. Own domain: gocelebet.com, bought at Hostinger, live on Vercel
   July 2026. Hostinger keeps DNS (A record @ to Vercel, CNAME www),
   so Hostinger email like support@gocelebet.com stays easy to add.
- Also shipped unnumbered: cash out, add money with per-buy
  tracking, and the money-first bet flow (stake + To Collect,
  no odds inputs anywhere).

## NOW (small, fits the current app, high value per effort)

16. Login and sign up as drop-down panels on the landing page, instead
    of their own pages. Tapping Login or Sign up opens a panel over
    the landing page holding the email and password fields, the
    Google button, and the Forgot password link. Tap outside or press
    Escape to close. Decided by the owner: both login and sign up get
    a panel, the panel may cover most of a phone screen, the /login
    and /signup pages stay alive behind the scenes so emailed links
    and bookmarks keep working, and logging out lands on the landing
    page instead of the login page. Build it together with the
    landing page rebuild so the panel matches that design, not twice.

## SOON (after the NOW items)

15. Full visual redesign. The owner wants a fresher, more modern look
    with more imagery, inspired by the competitor Pikkit
    (https://www.pikkit.com): dark theme, big bold headlines, product
    shots, charts as hero visuals, strong accent color on a near-black
    background. Celebet today is deliberately plain (white cards,
    green accents). Worth doing before inviting users from Instagram.
    Keep every number and rule exactly as they are, this is looks
    only. Decided by the owner (August 2026): the app stays light by
    default, and dark mode becomes a switch in app settings later.
    The landing page can still be dark on its own.
    Decisions needed first: dark by default or a theme toggle,
    which charts to feature, and whether a public landing page comes
    with it (today the app opens straight to the login screen).

17. Budget periods with a start and an end date. Today the wallet runs
    forever with no time frame. The owner wants a budget tied to a
    window: a Vegas weekend, leave Friday, back Sunday, set the amount
    up front and see winnings and losses for that trip only. It would
    sit alongside the always-on wallet, not replace it.
    Open questions for the owner, none decided yet:
    - Does the budget just label and report, or does it warn or block
      when you go over?
    - Separate pot of money, or a slice of the main wallet?
    - Can several periods run at once (a trip and a tournament)?
    - After the end date, does it lock, keep counting, or just close?
    - Does it need a name, like "Vegas August"?

13. Kalshi / Polymarket auto-sync: bets placed there appear in
    Celebet automatically via their APIs (Kalshi personal API key,
    Polymarket public wallet data). Buys map to our buys, sells to
    cash outs, settlements to wins and losses. Big build: secure key
    storage, background sync, market-name-to-sport mapping, duplicate
    protection. Wants the settings page first. Screenshot import
    (idea 12) builds the mapping brain this will reuse. Long term the
    owner wants BOTH: sync for Kalshi/Polymarket, screenshots for
    every other betting site.

7. Personal touch: "Welcome Simon" on login. Needs a settings page
   with name, favorite team, favorite sport.
6. First 10 real users: the technical readiness is DONE (password
   recovery, Resend email from the domain, disclaimer, own accounts).
   What remains is the human part: invite people, watch what they
   do, talk to them. A feedback channel would help.

## THE BIG ONE (own bucket, needs its own project)

14. CeleBOT, a prediction market research assistant. DISCOVERY is
    the main feature, rating is secondary. The user arrives with
    nothing and asks about today's games: who is pitching, who is
    injured, which lines look mispriced, where the math points.
    CeleBOT must therefore know the whole board for a day, not just
    the games in one bet. Secondary feature: paste or describe your
    current thinking and get it rated (implied probability from the
    payout, an estimate per leg, the gap, expected value, a rating,
    leg ranking, what to check before start).
    Ordering note: rating alone is too late in the flow to be
    useful, the bet is already placed by then. Discovery comes first.
    Suggested first version: one sport (baseball has the richest
    data and matches the owner's examples), a "today's board" view,
    and a chat grounded in that day's fetched data. Rating then
    comes nearly free from the same data.
    CeleBOT should log its own predictions and show its track
    record, so its opinions can be judged instead of trusted.
    Hard requirement from the owner: it can NEVER hallucinate.
    Every claim must come from real fetched data about the actual
    event (schedules, confirmed starting pitchers, team records,
    run rates, injuries, live odds), never from model memory.
    Design consequence: the model does the reasoning and the
    writing, tools do the facts. No data on hand = say so, never
    invent. Show sources and timestamps.
    Data sources to evaluate: a sports data API for schedules,
    lineups, and stats; an odds API for market prices across books;
    Capology (https://www.capology.com/pricing) for player salaries,
    which per Soccernomics predict long-run football results better
    than almost anything else. All are paid subscriptions.
    Phasing (see chat for full plan): 1) math-only rater, free and
    no hallucination risk. 2) live odds comparison. 3) event data
    (pitchers, records, injuries). 4) salary and long-run models.
    Also needs: rate limits and a cost ceiling per user, a clear
    "not financial advice, entertainment only" disclaimer, and
    responsible gambling wording.

## FUTURE (big builds, new infrastructure, or business decisions)

5. Native app in the App Store. Interim step available much earlier:
   the web app can be installed to the home screen (PWA) and feel
   90% like an app for free.
8. News feed with live scores and upcoming games. Needs a paid or
   rate-limited external sports data source. Real running costs.
9. Feed of betting advice from X/Twitter. X API access is expensive,
   content rights and moderation questions.
10. Community advice feed inside the app. Social features: moderation,
    reporting, abuse handling. A different product category.
11. Legal readiness for scaling (owner handles outside Claude Code,
    kept on the radar): responsible gambling disclaimers, age limits,
    privacy policy for user data, no-affiliation statement. Becomes
    real the moment idea 6 ships.
