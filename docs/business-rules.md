# Business rules

Every money rule lives in `src/lib/stats.ts`. Nothing else may compute
its own version of these numbers, and the reason is written into the
decisions log: the Track snapshot once computed a settled-only net
profit and disagreed with the rest of the app.

## The money formulas

```
Wallet balance = deposits - withdrawals - all stakes + payouts of won bets
Net profit     = wallet balance + withdrawals - deposits
To Win         = stake x (odds - 1)
To Collect     = stake x odds
Total odds     = To Collect / stake        (derived, stored to 4 decimals)
startedWith    = balance - net profit
```

Currency is USD with 2 decimals. Odds are decimal with 2 decimals.

**Net profit has ONE definition** and every surface shows that same
number.

## The bet flow: money in, money out

The user types the **stake** and the **exact To Collect**. To Collect is
required on every bet.

**There are no odds inputs anywhere in the form.** Total odds are always
derived. The owner can type the exact payout his book shows and the odds
follow it, stored to 4 decimals so the payout comes out exactly.

## Parlays

Each leg has one optional **Chance (%)** field, Kalshi style.

- Leg odds derive from the percentages, then are scaled by one shared
  factor so they multiply to exactly the real total odds. The bookmaker's
  fee gap is spread across the picks.
- If any leg's percentage is missing, the known legs keep the straight
  `100 / percent` conversion, unscaled.
- **Money is never touched by percentages.** They only shape how a bet's
  profit is attributed across its legs.

On a single, the leg's odds equal the bet's derived odds.

## Splitting a bet across its legs

Two functions, and they must use the same weights or every ROI built on
them is nonsense.

`legShares(bet)` splits the **profit**:

- **Won bets:** odds-weighted. Each leg's share follows its risk,
  `odds - 1`. If any leg has no odds, fall back to an even split.
- **Lost bets:** the losing leg or legs carry the whole loss, split
  evenly among them.
- **A leg that came in inside a lost parlay earns exactly zero.** It
  still counts in the won/lost record for its topic.

`legStakeShares(bet)` splits the **stake**, on exactly those weights.

- Won bets: odds-weighted, so every topic in the bet shows the bet's own
  ROI.
- Lost bets: the whole stake sits on the losing legs, the same legs that
  carry the whole loss. **A leg that was right is charged nothing**,
  because charging it would punish a pick that came in.

That stake rule was the missing piece that made per-topic ROI possible
at all. Before it, per-sport ROI showed a dash.

**Still unsolved:** per-sport ROI across a parlay whose stake spans
several sports. There is no agreed rule, so Performance does not show
it, and the Track snapshot shows Best Sport by profit rather than ROI.

## Settlement

**You settle a PICK, not a bet.** The bet's status is always derived
from its legs, by `set_leg_result` in `supabase/phase3.sql`.

The whole thing happens in **one transaction**, so the balance can never
drift out of sync with the legs.

### How the bet's status is decided

```
one leg lost         -> the bet is LOST
every leg won        -> the bet is WON
anything else        -> the bet stays PENDING
```

That is the parlay rule falling out of the data rather than being
written twice: one wrong leg kills the bet, and the bet only wins when
every leg is in.

### What the payout becomes

| New status | `payout` |
|---|---|
| won | `round(stake * total_odds, 2)` |
| lost | nothing |
| pending | `null` |

### Undo is not a separate feature

**Setting a leg back to `pending` IS the undo.** The same function
recalculates the bet, and the payout returns to `null`. There is no
separate undo path that could disagree with the settle path.

### There is no void, push or half-won

`legs.result` and `bets.status` both accept exactly three values:
`pending`, `won`, `lost`. A void or a push has never been asked for and
is not representable. **Do not add a fourth value without the owner
deciding what it means for the money**, because every split rule in this
file assumes three.

### The 15 minute window

A settled bet stays visible in **Live now** for about fifteen minutes
before moving to history, so a mistake can be undone where it happened
rather than hunted down later.

## Cash out

A pending bet can settle at the exact amount received.

- At or above the stake counts as **won**, below it as **lost**.
- `payout` = the amount received either way, so profit is always
  `payout - stake`.
- **Cash out means done.** No pick settling afterwards, and the card
  leaves Live now once the 15 minute undo window closes.
- **Picks still open at cash out inherit the cash out outcome.** A
  profit means they count as won picks, a loss means lost picks. This
  replaced an earlier "cashed out picks do not count" rule.

## Add money (merged buys)

A pending bet can absorb more buys, each with its own amount and payout,
in `bet_buys`. The bet's stake and To Collect grow to the merged totals,
matching how Kalshi merges positions.

- **On singles, every buy counts as its own pick** at its own odds
  (`payout / amount`) in the records and the odds groups.
- **On parlays, picks stay equal to legs.**
- A "N buys" button on the card expands the individual buys.

## Restart my record

There is **no delete-everything button** and never will be. The owner
rejected one: he had asked to reset the tracking balance so a user could
start over, and deleting their bets is not that.

Actuals draws a **line** instead. `tracking_since` goes into the auth
user's metadata, and `sinceLine()` keeps a bet if it was NOT already
settled before that date.

- **Pending bets carry over.** A bet still riding when you draw the line
  is live money, so it belongs to the new record.
- A bet settled exactly ON the line belongs to the old record.
- Net profit, ROI, win rate, the chart, the snapshot and the insights all
  count from the line. **Nothing is deleted.**
- Performance carries an "All time" switch. The review at the foot
  ignores that switch on purpose: mixing the two would put two different
  profits on one screen.
- With no line, `netProfitOf(all bets)` equals balance plus removals
  minus additions exactly, so nothing moves for a user who never
  restarts. Verified arithmetically, not by eye.

**It is fully reversible, and that is the point.** Undo has no time
limit, lives in Settings for as long as a line exists, and reverses both
halves: it clears the date and deletes the exact balance transaction the
restart created, found by the id stored in `tracking_reset_tx`.

## Delete my account

Required by both app stores (Apple 5.1.1(v), Google Play's data deletion
policy). A restart does not count, and should not, because it deletes
nothing.

- Deleting the auth user cascades through every table. No migration was
  needed.
- The route runs on the caller's own verified session, so the id being
  deleted is always their own and can never be passed in.
- **The demo account cannot be deleted.** Its login is shared with
  testers and investors.
- It is permanent, and the confirmation sheet says so first, which is
  the exact opposite of the restart sheet's "Nothing is deleted" green
  opening. Neither may borrow the other's wording.

## Insights and recommendations

- Advice needs 5 settled bets or picks per group. Plain facts have no
  minimum.
- Recommendations rotate randomly on each tap.
- **Insight of the day is seeded by the phone's date**, so it is steady
  all day and new overnight.

## Periods

`periodStart()` is the one function that decides where Today, Week,
Month and Year begin. Weeks start Monday. Both the Track balance strip
and the Performance chips read it, so the same label can never mean two
different date ranges.
