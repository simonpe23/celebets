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

23. TRACK PAGE V9.3, approved as a direction by the owner, August
    2026, NOT deployed. Waiting on the rename, because the draft's
    header carries the Actuals A mark.

    WHERE IT LIVES: `src/app/preview/track-sharp/page.tsx`, seen at
    /preview/track-sharp, which draws the light and dark phones side
    by side. The file is force-added to git: /src/app/preview/ is in
    .gitignore, so without `git add -f` this work dies with the
    container. It is still gitignored for Tailwind's purposes, which
    is why every style in it is inline.

    HOW IT GOT HERE, so the loop is not repeated. Nine versions. v1
    to v8 progressively replaced the live design and the owner
    rejected all of them: "the original design is still the best
    version I have seen so far." v9 threw the redesign away and
    rebuilt from the live page's own language (src/lib/ui.ts CARD,
    INNER, BTN, 17px bold sentence-case headings inside cards), then
    layered on ONLY what he had praised along the way.

    WHAT V9.3 CHANGES against the live page, the whole list:
    - the Actuals A mark in the header, no emoji and no bell
    - the tracking balance is a FULL BLEED band: it reaches both
      screen edges, chart included, with a hairline above and below.
      Everything under it stays an inset card.
    - the chart is wider and taller, with the Today/Week/Month/Year
      strip under it and Set balance top right
    - Performance Snapshot: four values across one row, no
      sparklines, no emoji
    - insight of the day: brighter crisper golds (#F59E0B light,
      #FBBF24 dark, trophy #FCD34D to #D97706), the halo cut right
      back, no amber ring around the card
    - bigger tabular Inter Tight numbers throughout

    WHAT HE RULED OUT, do not reintroduce:
    - a purple Connect your accounts button. It stays the live
      outlined row with the green icon and the green Coming Soon
      pill. "Too much purple with the purple bg."
    - uppercase section band headings, full-bleed bands for every
      section, the boxed three-cell keypad (all v8)
    - a glowing trophy orb, an amber wash behind the insight text
    - tighter spacing in Track a bet: the gaps match the live card

21. RENAME THE APP. The owner, August 2026: "Celebet does not work."
    No new name or domain chosen yet, so this is parked until he has
    one. Recorded now so the decision is not lost.

    THE CODE IS THE EASY HALF, and it is genuinely easy: 88 mentions
    across 43 files, and most are the visible word in a heading or a
    piece of copy. Half a day, one careful pass, plus new artwork
    (wordmark, og.png, favicon) which is a design job, not a code one.

    THE THREE THINGS THAT NEED CARE, none of them hard, all of them
    silent if missed:
    - `celebet-theme` in localStorage (Settings.tsx). Renaming that
      key logs every existing user out of their theme choice, back to
      System. Fix: read the old key when the new one is missing, so
      the choice carries over.
    - The chart's SVG gradient ids (`celebet-line`, `celebet-area`,
      `celebet-bloom`, `celebet-glow` in ProfitChart.tsx) are internal
      references, not names. They may be left alone or renamed, but
      the id and its `url(#...)` must move together or the chart loses
      its colour with no error.
    - `tracking_since` and `tracking_reset_tx` in auth metadata are
      not branded, so they are safe. Worth stating so nobody renames
      them for tidiness.

    THE HARD HALF IS OUTSIDE THE CODE, and it is where the risk and
    the cost sit: a new domain, DNS at Hostinger, Vercel, Supabase
    Site URL and redirect URLs (miss one and password reset links die
    silently), Resend sender domain with fresh DKIM/SPF/DMARC records
    and a new warm-up period, the Instagram handle, and the trademark
    line for Peak Street 6 LLC.

    THERE ARE NO ACTIVE USERS. The owner, August 2026: 3 or 4 signups
    and nobody using it. That removes most of the caution above:
    - The localStorage migration is not needed. Nobody has a saved
      theme worth carrying over, so the key can simply be renamed.
    - No stale bookmarks, no old links in circulation, no inboxes
      holding mail from the old sender.
    So the rename is a rename, not a migration. It stays cheap only
    while that is true: the cost grows with every real user, so the
    cheapest day to do it is the soonest day he has a name.

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

22. THE GOOGLE SIGN IN SCREEN SAYS THE WRONG NAME. Google login works
    (set up August 2026) but its consent screen reads "Sign in to
    wqhitxtowfhylzpfxkpw.supabase.co" instead of the app's name. The
    owner, correctly: "everyone who reads this will be scared."

    WHY. Google shows the root domain of the callback URL, and the
    callback lives on Supabase's domain. It is not something the code
    can change, and not something Supabase can fix from their side:
    it is a confirmed open issue on their tracker (supabase#33387).

    THE TWO FIXES, and both are needed for the name to show:
    - Supabase's Custom Domain add-on, about $10 a month, billed by
      the hour and NOT covered by the spend cap. Points auth at
      something like auth.<ourdomain>.com, so the screen reads a
      domain the user recognises instead of a random string.
    - Google brand verification, free but slow (days to weeks, wants
      a demo video and proof of domain ownership). This is what
      replaces the domain with the app NAME and logo.

    DO IT AFTER THE RENAME, NOT BEFORE. Verification reviews the app
    name, the domain and the logo, and all three are changing. Doing
    it now means doing it twice and paying for a custom domain on a
    domain that is being retired. Before any real marketing push,
    after the new name is live.

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

    THE SECOND LAYER, added by the owner August 2026, and it is the
    part with the real value. A season is not only a stretch of time.
    It is a COMMITMENT you make and then get measured against.

    His two examples, kept in his words because they are different
    kinds of rule:
    - "I'm gonna bet $100 on every Manchester United game this PL
      season."
    - "I'm gonna cash out on every bet this weekend as soon as I've
      made $100, whatever the end result. As soon as the cash out
      option says I've made $100, I do it."

    Why he wants it: "it'll help bettors committing to certain
    behaviors and avoiding random actions." That reframes the whole
    app. Every competitor answers "what did I win?". This answers
    "did I do what I said I would, and did it work?". A filter on the
    all time record, never a replacement for it.

    A SEASON IS DECLARED BEFORE YOU BET, AND BETS ARE TAGGED INTO IT.
    The owner corrected me on this and it matters, because it removes
    what I had written down as a blocker. I had assumed the app would
    check "did you bet on all 38 Man Utd games" against real fixtures,
    which would need a sports data feed it does not have. That is not
    the design. His words: "Seasons is meant to be a thing you build
    or you set before you start placing bets... with each bet I have
    to be able to log that somehow, that this belongs to this season.
    Or once I'm in the app I can click on my different seasons and
    say, now I'm going to log a bet for this particular season."
    So the season is a container the user opts into, the rules are
    the user's own, and both of his examples are equally buildable
    with no external data.

    WHY IT MATTERS, in his words, and this is the product's whole
    reason to exist: "the problem with sports betting is that you
    just casually bet without looking at the data, without following
    any rules, and that ends up being more like gambling... a lot of
    bettors lose a lot of money just because they're sloppy and they
    just want to have some fun on a boring Friday night. But if you
    set rules for yourself, then you've got to follow it."
    That is a responsible-gambling feature that is also the product's
    sharpest differentiator, which is a rare combination.

    THE ONE THING THE APP STILL CANNOT SEE is a game you skipped.
    Nothing is broken by that, but if the owner wants a "did I show
    up" number, the cheap version is to let him state the target when
    he creates the season ("38 games"), and show 31 of 38 logged. Self
    declared, no fixture feed, no cost. Offered, not decided.

    A STAGED BUILD, if the owner wants it small first:
    - stage 1, the filter: a season is a name, a window, and optional
      filters (sport, category, a text match on the pick). Every
      number on Performance recomputes inside it. No rules yet. This
      is mostly presentation over existing bets plus one small table.
    - stage 2, the commitment: the season carries a stated rule and a
      kept-or-not score. This is the differentiator and the harder
      half, because it needs a rule format the user can express
      without writing code.

    Open questions for the owner, none decided:
    - How does a bet join a season: matched automatically by the
      season's filters, or tagged by hand when logging it?
    - Can one bet belong to several seasons at once?
    - Is the rule a real machine-checked thing, or just a note the
      user writes to hold themselves to it? The note version is a
      tenth of the work and still changes behaviour.
    - What does the app do when you break the rule: say nothing and
      report it later, or warn at the moment you log the bet?
    - Does a broken rule count against a "discipline" score, and does
      the owner want a score at all, or is that too much like a game?

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

19. Insight feed on the home page, a rolling one-liner like a news
    flash. Two flavors, decided separately:
    - Personal: built from the user's own settled bets, the same
      engine as Recommendations. "You are 4-1 on Baseball this
      month." No new data needed, could ship with a later home
      page iteration.
    - Market: "Ohtani pitches tonight, LA wins 5 of 6 when he
      pitches." Needs paid external sports data and must obey the
      never-hallucinate rule. That is CeleBOT territory (idea 14)
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
    - Does it overlap with CeleBOT (idea 14), or is CeleBOT the one
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
