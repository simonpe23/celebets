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
21. RENAME THE APP: DONE, August 2026. Celebet became Actuals end to
    end: code and copy, the actuals.cc domain, Supabase URLs, Resend
    sender, Google consent screen, the Instagram handle, and the full
    artwork swap (item 25, favicon, phone icon, wordmark, link
    preview card). The one loose end is the gocelebet.com redirect in
    Vercel, on the owner's list.


## NOW (small, fits the current app, high value per effort)


26. THE AUTH FLOW REDESIGN. SHIPPED and verified live by the owner,
    August 2026, on his phone: Google, an emailed code, and the demo
    door all tested. One auth page at /login, no passwords anywhere:
    Continue with Google, or type an email and a six-digit code
    arrives. The code entry swaps in on the same page and the sixth
    digit submits itself (his ask: "auto-submit as soon as the 6th
    digit lands... i want that"). Start Tracking opens it saying
    "Create your account", Log in says "Welcome back". The landing
    hero and bottom card are one button each, per his five points.
    /signup, /forgot-password and /reset-password are deleted and
    redirect to /login. The code email is the owner's option C, kept
    in supabase/email-login-code.html.

    THE DEMO DOOR, added the same day for investors. The demo account
    cannot receive codes (nobody the owner shares it with reads its
    mailbox), so the demo email gets one permanent code: same landing,
    same auth page, same boxes, but no email is sent and our own
    /api/demo-login checks the code and signs in with the demo
    account's password. Supabase only has this natively for phone
    numbers, so it is built in our code, not theirs. Configured
    entirely by three Vercel settings (NEXT_PUBLIC_DEMO_EMAIL,
    DEMO_CODE, DEMO_PASSWORD, never in the repo); unset means the
    door does not exist. The account was renamed to demo@actuals.cc
    with supabase/demo-account-rename.sql, because the dashboard no
    longer carries an email field. Verified live by the owner.

    The discussion record, kept below:
    The owner: "we have to clarify 2 things:
    the sign up flow, the log in flow." One entrance, two flows.

    THE PROBLEM, in his words: five places to click on the landing
    (email field, its button, the Google button, the header CTA, Log
    in) "and it's not always clear where i should click when i want
    to sign in vs sign up." He has been confused by his own page.

    AGREED IN DISCUSSION, pending his final go:
    - The hero drops the email field and becomes three actions:
      Start Tracking. It's Free / Continue with Google / "Already
      have an account? Log in". The header keeps Log in.
    - THE BUTTON NEVER CHANGES, THE HEADLINE DOES. His insight, from
      Asana's login screen: "Continue with Google" is accurate for
      both signup and login, and the headline above it ("Log in to
      your account" vs "Create your account") is what tells the user
      which mode they are in. Google's brand rules also only permit
      a few fixed phrasings on a G button, so free-form button copy
      is out anyway.
    - Never label anything "Sign up": Start Tracking is the product's
      verb.

    REJECTED: the "smart Continue" from another chat he consulted,
    where typing an email reveals whether an account exists. On a
    betting app that lets anyone check whether a partner, boss or
    landlord gambles. An email-enumeration leak dressed as UX.
    Supabase blocks it deliberately.

    DECIDED, 18 August 2026: THE CODE FLOW. The owner read both
    options and chose passwordless codes. New users never get a
    password. One consequence worth naming early: the forgot-password
    machinery becomes dead code for new users, and if existing
    accounts are migrated too, it can be deleted entirely.

    The fork as it was presented, kept for the record:
    - Code flow (passwordless): type email, get a six-digit code,
      enter it, in. Identical for new and returning users, so the
      signup/login question stops existing, and it leaks nothing.
      Slack and Notion pattern, native in Supabase. Costs: an email
      round trip per new device, and it leans on the days-old
      actuals.cc sender reputation, so it should wait until the
      domain has warmed up.
    - No detection: Start Tracking opens one account screen (email,
      password, Google). Dumb, clean, ships in a week.
    When built, fold in idea 16 below: the account screen becomes the
    panel over the landing.

16. CLOSED, August 2026, overruled by idea 26. Login and sign up as
    drop-down panels on the landing page. The owner later chose a
    separate auth page instead ("login = separate page"), and the
    panels' contents (password fields, Forgot password) no longer
    exist. Kept for the record only.

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

13. Kalshi / Polymarket auto-sync. THE ACTIVE PROJECT, started 19
    August 2026, plan pending approval. Bets placed there appear in
    Actuals automatically via their APIs (Kalshi personal API key
    with RSA request signing, docs.kalshi.com; Polymarket public
    wallet data, no key). Buys map to our buys, sells to cash outs,
    settlements to wins and losses. The architecture: translate at
    the door, one language inside. An imported bet becomes an
    ordinary row in bets, so every existing filter, chart and
    insight works untouched; it carries source and external_id, the
    id being what stops double imports.
    DECIDED by the owner, 19 August:
    - KALSHI FIRST. That is where his real betting lives.
    - NON-SPORT MARKETS IMPORT TOO, under new categories: "I want
      users to be able to track everything." A top-level split sits
      above the sport filter: Sports is the standard view, with an
      option to include Not Sports. His words: "this is a sports app
      first." He expects to refine this shape.
    - FRESH START IS THE STANDARD: connecting imports from that day
      forward, keeping Actuals data unique, and the app explains
      that. Full Kalshi history stays available behind a small
      quiet link, clearly not recommended.
    - A source filter (Kalshi / manual) joins the filter row, so a
      Vegas cash weekend and Kalshi bets share one balance but can
      be told apart.
    Open questions, flagged for the filter phase: does the existing
    Crypto sport move under Not Sports? Long term the owner wants
    BOTH: sync for Kalshi/Polymarket, screenshots for every other
    betting site (idea 12 built the mapping brain this reuses).

7. Personal touch: "Welcome Simon" on login. Needs a settings page
   with name, favorite team, favorite sport.
6. First 10 real users: the technical readiness is DONE (password
   recovery, Resend email from the domain, disclaimer, own accounts).
   What remains is the human part: invite people, watch what they
   do, talk to them. A feedback channel would help.

20. Seasons. A named tracking period you can close and look back at:
    "2026 season, +$1,240". Grows out of the fresh start line shipped
    in August 2026, which already draws the boundary; seasons just
    name it and keep the old ones readable.
    The owner's own example, and the reason it is worth building:
    a weekend trip to Vegas. You want that trip's record on its own,
    separate from the year, without losing either.
    Open questions, none decided:
    - Does a season have an end date, or does it end when the next
      one starts?
    - Can you be in two at once (a Vegas weekend inside the 2026
      season), or is it strictly one at a time?
    - Where do they live: a picker on Performance, or their own page?

## THE BIG ONE (own bucket, needs its own project)

14. ActualsBOT, a prediction market research assistant. DISCOVERY is
    the main feature, rating is secondary. The user arrives with
    nothing and asks about today's games: who is pitching, who is
    injured, which lines look mispriced, where the math points.
    ActualsBOT must therefore know the whole board for a day, not just
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
    ActualsBOT should log its own predictions and show its track
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

19. Insight feed on the home page, a rolling one-liner like a news
    flash. Two flavors, decided separately:
    - Personal: built from the user's own settled bets, the same
      engine as Recommendations. "You are 4-1 on Baseball this
      month." No new data needed, could ship with a later home
      page iteration.
    - Market: "Ohtani pitches tonight, LA wins 5 of 6 when he
      pitches." Needs paid external sports data and must obey the
      never-hallucinate rule. That is ActualsBOT territory (idea 14)
      and waits for it.
    From the owner's home page discussion (August 2026). Not
    approved for building.

18. Celebet as an MCP server, so Claude or ChatGPT can read a user's
    own betting data. The user connects Celebet once, then asks in
    plain language: "how much have I won this year", "which sport is
    costing me money", "what did that Vegas weekend cost me". The
    assistant pulls the real numbers from Celebet and answers.
    Why it fits: every money rule already lives in src/lib/stats.ts,
    so the same split logic that draws the charts can answer the
    questions. No new maths, a new door onto the same data.
    The owner's framing: instead of navigating menus, the AI becomes
    the interface.
    Questions a user should be able to ask, from the owner:
    - Show my bankroll.
    - What was my ROI last month?
    - Which sports am I most profitable in?
    - Find all bets over $100.
    - Add a parlay for tonight's MLB games.
    - Based on my betting history, what mistakes am I repeating?
    Note: that list includes adding a bet, so this is not read only.
    Writing needs its own care, since a wrong bet logged by an
    assistant corrupts every number in the app.
    Open questions for the owner, none decided:
    - How does a user connect their account, and how do they revoke it?
    - Does a written bet need the user to confirm it in the app first?
    - Is this a paid tier, or free for everyone?
    - Does it overlap with ActualsBOT (idea 14), or is ActualsBOT the one
      that answers questions and this one only serves the data?

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
