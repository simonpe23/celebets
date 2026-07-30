# Celebets idea backlog

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
- Also shipped unnumbered: cash out, add money with per-buy
  tracking, and the money-first bet flow (stake + To Collect,
  no odds inputs anywhere).

## NOW (small, fits the current app, high value per effort)

4. Own domain: buy a domain and connect it to Vercel. No code needed,
   click-by-click instructions from Claude.
12. Screenshot import: paste a bet slip image (Kalshi one-tap copy),
    AI reads it and pre-fills the whole form for review. Needs an
    Anthropic API key and a tiny per-slip cost (1 to 3 cents).
    Answers the number one problem: logging friction. Owner already
    approves of the concept, needs a plan and the API setup.

## SOON (after the NOW items)

13. Kalshi / Polymarket auto-sync: bets placed there appear in
    Celebets automatically via their APIs (Kalshi personal API key,
    Polymarket public wallet data). Buys map to our buys, sells to
    cash outs, settlements to wins and losses. Big build: secure key
    storage, background sync, market-name-to-sport mapping, duplicate
    protection. Wants the settings page first. Screenshot import
    (idea 12) builds the mapping brain this will reuse. Long term the
    owner wants BOTH: sync for Kalshi/Polymarket, screenshots for
    every other betting site.

7. Personal touch: "Welcome Simon" on login. Needs a settings page
   with name, favorite team, favorite sport.
6. First 10 real users: open the app to a small test group and learn
   from them. The database is already built for multiple users with
   row level security. Needs before launch: email confirmation back
   on, a simple disclaimer, and a feedback channel.

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
