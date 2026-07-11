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
