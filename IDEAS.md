# Celebets idea backlog

How this file works:
- The owner says "I have a new idea" and tells Claude to store it.
- Every idea lands in one of three buckets: NOW, SOON, or FUTURE.
- The owner decides the bucket. Claude may recommend one.
- Nothing in this file is approved for building. Building always needs
  an explicit plan and the owner's approval first.

## NOW (small, fits the current app, high value per effort)

1. Recommendations list: a page or section showing every
   recommendation statement that is currently true, not just the
   random mix of 4.
2. Sub-categories per sport: what kind of pick it was. Football:
   winner, corners, final result, goal scorer. Baseball: run line,
   first 5 innings, and so on. Feeds richer stats. Needs product
   decisions on the exact lists.
3. Add Tennis as a sport.
4. Own domain: buy a domain and connect it to Vercel. No code needed,
   click-by-click instructions from Claude.

## SOON (after the NOW items)

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
