// THE MONEY TEST FOR THE KALSHI IMPORT.
//
// WHY IT EXISTS. The import shipped twice against guessed shapes and
// was wrong twice. Every case in here is either copied from the
// owner's real account or derived from a rule his account proved:
//   - numbers are strings, sizes fractional, prices in dollars,
//     fees real money (his $37.80 BTC bet)
//   - a sell names the OPPOSITE side of the position it closes and
//     pays the held side's price (his $36.83 close, to the cent)
//   - a parlay is a multivariate market whose mve_selected_legs are
//     the picks (his Atletico + Pittsburgh combo)
// If Kalshi changes shape again, this fails loudly inside `npm run
// check` instead of importing nothing, or worse, importing wrong
// money.
//
// Node cannot import a .ts file whose relative imports lack
// extensions, so the sources are copied to a temp folder with
// extensions added. Ugly, and confined to this file.
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "synctest-"));
for (const name of ["kalshiSync", "format", "types", "taxonomy"]) {
  const src = await readFile(`src/lib/${name}.ts`, "utf8");
  await writeFile(
    join(dir, `${name}.ts`),
    src.replace(/from "\.\/(\w+)"/g, 'from "./$1.ts"')
  );
}
const { clampToStart, deriveBets, sportFor, sportForTicker } = await import(
  join(dir, "kalshiSync.ts")
);
const {
  UNCLASSIFIED,
  DOMAIN_CATEGORIES,
  CATEGORY_MARKETS,
  classifyKalshi,
  domainOf,
  marketsFor,
  migrateManualLabel,
  validated,
} = await import(join(dir, "taxonomy.ts"));

let failures = 0;
function eq(name, got, want) {
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failures++;
    console.log(
      `FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`
    );
  }
}
const r2 = (v) => Math.round(v * 100) / 100;

// ---- CASE 1: the owner's $37.80 BTC single, held to a losing
// settlement. Copied from his account.
{
  const fills = [
    {
      ticker: "KXBTC15M-26AUG191400-00",
      order_id: "o1",
      side: "no",
      action: "buy",
      count_fp: "106.26",
      no_price_dollars: "0.3400",
      yes_price_dollars: "0.6600",
      fee_cost: "1.669200",
      created_time: "2026-08-19T17:46:14.353364Z",
    },
  ];
  const settlements = [
    {
      ticker: "KXBTC15M-26AUG191400-00",
      market_result: "yes",
      settled_time: "2026-08-19T18:00:10.623262Z",
    },
  ];
  const meta = new Map([
    [
      "KXBTC15M-26AUG191400-00",
      {
        ticker: "KXBTC15M-26AUG191400-00",
        title: "BTC price up in next 15 mins?",
        event_ticker: "KXBTC15M-26AUG191400",
      },
    ],
  ]);
  const [b] = deriveBets(fills, settlements, meta);
  eq("single: stake includes the fee", b.stake, 37.8);
  eq("single: lost with no stored payout", [b.status, b.payout], ["lost", null]);
  // No series answer here: the pick is honestly Unclassified with a
  // null provider market, which is exactly what the repair pass
  // retries on the next sync.
  eq("single: one leg, Crypto, the No side named", b.legs, [
    {
      sport: "Crypto",
      description: "BTC price up in next 15 mins? (No)",
      result: "lost",
      subcategory: "Unclassified",
      market: null,
      period: null,
      competition: null,
      providerMarket: null,
    },
  ]);
}

// ---- CASE 2: the owner's $109 position CLOSED mid-bet for $36.83.
// The close arrives as a sell of the OPPOSITE side. Copied from his
// account, and his Kalshi receipt says: cost $109.00, paid out
// $36.83, loss -$72.17.
{
  const fills = [
    {
      ticker: "KXBTC15M-26AUG191345-45",
      order_id: "o1",
      side: "no",
      action: "buy",
      count_fp: "185.64",
      no_price_dollars: "0.5700",
      yes_price_dollars: "0.4300",
      fee_cost: "3.185100",
      created_time: "2026-08-19T17:31:01.390251Z",
    },
    {
      ticker: "KXBTC15M-26AUG191345-45",
      order_id: "o2",
      side: "yes",
      action: "sell",
      count_fp: "185.64",
      yes_price_dollars: "0.7900",
      no_price_dollars: "0.2100",
      fee_cost: "2.155900",
      created_time: "2026-08-19T17:38:58.325019Z",
    },
  ];
  // The market settled yes later; a fully closed position must not
  // care.
  const settlements = [
    {
      ticker: "KXBTC15M-26AUG191345-45",
      market_result: "yes",
      settled_time: "2026-08-19T17:45:10.628493Z",
    },
  ];
  const drafts = deriveBets(fills, settlements, new Map());
  eq("close: exactly one bet, not a phantom yes-side one", drafts.length, 1);
  const [b] = drafts;
  eq("close: stake is the receipt's cost", b.stake, 109);
  eq("close: cash out at the receipt's payout", [b.cashedOut, b.payout], [true, 36.83]);
  eq("close: below stake counts as lost", b.status, "lost");
  eq("close: profit matches the receipt", r2(b.payout - b.stake), -72.17);
  eq("close: settled when the position closed", b.settledAt, "2026-08-19T17:38:58.325019Z");
}

// ---- CASE 3: the owner's Atletico + Pittsburgh parlay, $99.99 for
// 223.11 contracts. Copied from his account: a multivariate market
// whose legs are their own markets.
{
  const fills = [
    {
      ticker: "KXMVECROSSCATEGORY-SHARD1-S202660E284F90DA-185E79127FA",
      order_id: "o1",
      side: "yes",
      action: "buy",
      count_fp: "223.11",
      yes_price_dollars: "0.4310",
      no_price_dollars: "0.5690",
      fee_cost: "3.830190",
      created_time: "2026-08-19T17:18:22.15555Z",
    },
  ];
  const meta = new Map([
    [
      "KXMVECROSSCATEGORY-SHARD1-S202660E284F90DA-185E79127FA",
      {
        ticker: "KXMVECROSSCATEGORY-SHARD1-S202660E284F90DA-185E79127FA",
        title: "yes Atletico,yes Pittsburgh",
        event_ticker: "KXMVECROSSCATEGORY-SHARD1-S202660E284F90DA",
        mveLegs: [
          {
            market_ticker: "KXLALIGAGAME-26AUG19ATMMCF-ATM",
            side: "yes",
          },
          {
            market_ticker: "KXMLBGAME-26AUG191235DETPIT-PIT",
            side: "yes",
          },
        ],
      },
    ],
    [
      "KXLALIGAGAME-26AUG19ATMMCF-ATM",
      {
        ticker: "KXLALIGAGAME-26AUG19ATMMCF-ATM",
        title: "Atletico Madrid to win",
        result: "yes",
      },
    ],
    // The MLB leg's market was fetched but has no result yet.
    [
      "KXMLBGAME-26AUG191235DETPIT-PIT",
      {
        ticker: "KXMLBGAME-26AUG191235DETPIT-PIT",
        title: "Pittsburgh to win",
        result: "",
      },
    ],
  ]);
  const [b] = deriveBets(fills, [], meta);
  eq("parlay: stake is the receipt's cost", b.stake, 99.99);
  eq("parlay: still pending", b.status, "pending");
  // Without series data the leg TICKERS still carry the market word
  // (KXLALIGAGAME, KXMLBGAME), so both classify as Moneyline with no
  // provider market recorded, queued for the repair pass to enrich.
  eq("parlay: two legs, each its own sport and result", b.legs, [
    {
      sport: "Football",
      description: "Atletico Madrid to win",
      result: "won",
      subcategory: "Moneyline",
      market: "Match Winner",
      period: null,
      competition: null,
      providerMarket: null,
    },
    {
      sport: "Baseball",
      description: "Pittsburgh to win",
      result: "pending",
      subcategory: "Moneyline",
      market: "Match Winner",
      period: null,
      competition: null,
      providerMarket: null,
    },
  ]);
  eq(
    "parlay: to collect is the contract count",
    r2(b.stake * b.totalOdds),
    223.11
  );
}

// ---- CASE 4: a parlay leg whose own market was NOT fetched falls
// back to the parent title's segment, never to a raw ticker.
{
  const meta = new Map([
    [
      "KXMVE-X-1",
      {
        ticker: "KXMVE-X-1",
        title: "yes Cardiff,yes Tie",
        mveLegs: [
          { market_ticker: "KXEFLCHAMPIONSHIPGAME-1-CAR", side: "yes" },
          { market_ticker: "KXLALIGAGAME-2-TIE", side: "yes" },
        ],
      },
    ],
  ]);
  const fills = [
    {
      ticker: "KXMVE-X-1",
      order_id: "o1",
      side: "yes",
      action: "buy",
      count_fp: "100",
      yes_price_dollars: "0.5000",
      no_price_dollars: "0.5000",
      fee_cost: "1.000000",
      created_time: "2026-08-17T10:00:00Z",
    },
  ];
  const [b] = deriveBets(fills, [], meta);
  eq("fallback legs read from the parent title", b.legs.map((l) => l.description), [
    "Cardiff",
    "Tie",
  ]);
  eq("EFL and LALIGA both map to Football", b.legs.map((l) => l.sport), [
    "Football",
    "Football",
  ]);
}

// ---- CASE 5: two orders merge into two buys, one bet; pieces of one
// order stay one buy.
{
  const fill = (o) => ({
    ticker: "KXWTAMATCH-26AUG08SABALE-SAB",
    order_id: "o1",
    side: "yes",
    action: "buy",
    count_fp: "100",
    yes_price_dollars: "0.5000",
    no_price_dollars: "0.5000",
    fee_cost: "1.000000",
    created_time: "2026-08-09T00:04:39Z",
    ...o,
  });
  const [b] = deriveBets(
    [fill(), fill({ count_fp: "50" }), fill({ order_id: "o2", count_fp: "60", created_time: "2026-08-09T01:00:00Z" })],
    [],
    new Map()
  );
  eq("order pieces merge, orders stay apart", b.buys.length, 2);
  eq("tennis from the series", b.legs[0].sport, "Tennis");
}

// ---- CASE 6: partial close, then a winning settlement: both sales
// and the win count, fees on both sides.
{
  const fills = [
    {
      ticker: "KXBTC15M-X-30",
      order_id: "o1",
      side: "no",
      action: "buy",
      count_fp: "100",
      no_price_dollars: "0.5000",
      yes_price_dollars: "0.5000",
      fee_cost: "1.000000",
      created_time: "2026-08-19T10:00:00Z",
    },
    {
      ticker: "KXBTC15M-X-30",
      order_id: "o2",
      side: "yes",
      action: "sell",
      count_fp: "40",
      yes_price_dollars: "0.4000",
      no_price_dollars: "0.6000",
      fee_cost: "0.500000",
      created_time: "2026-08-19T10:05:00Z",
    },
  ];
  const settlements = [
    { ticker: "KXBTC15M-X-30", market_result: "no", settled_time: "2026-08-19T10:15:00Z" },
  ];
  const [b] = deriveBets(fills, settlements, new Map());
  // stake 51.00; sells 40 x 0.60 - 0.50 = 23.50; 60 held win 60.
  eq("partial close: payout is sells plus the win", b.payout, 83.5);
  eq("partial close: won", b.status, "won");
}

// ---- THE HISTORY FLOOR. Actuals promises on four screens that an
// import reaches back to one date, so the import must not quietly
// carry in a bet from before it, and must not import HALF of one
// either.
{
  const START = "2026-07-01T00:00:00.000Z";
  const fills = [
    // Well inside the window: stays.
    { ticker: "A", created_time: "2026-07-05T10:00:00Z" },
    // Straddles the date: one buy before, one after. The whole market
    // goes, because half its money is out of reach.
    { ticker: "B", created_time: "2026-07-02T10:00:00Z" },
    { ticker: "B", created_time: "2026-06-28T10:00:00Z" },
    // Entirely before: never in.
    { ticker: "C", created_time: "2026-06-01T10:00:00Z" },
  ];
  const kept = clampToStart(fills, START);
  eq(
    "history floor: only markets that started in the window",
    kept.map((f) => f.ticker),
    ["A"]
  );

  // The exact boundary belongs to the new record, the same ruling as
  // the app's own restart line.
  eq(
    "history floor: midnight itself is inside",
    clampToStart([{ ticker: "D", created_time: START }], START).length,
    1
  );

  // A market whose money is all inside must survive with ALL of it.
  const many = [
    { ticker: "E", created_time: "2026-07-03T10:00:00Z" },
    { ticker: "E", created_time: "2026-07-04T10:00:00Z" },
  ];
  eq("history floor: an in-window market keeps every buy", clampToStart(many, START).length, 2);
}

// ---- CASE: KALSHI'S OWN TAXONOMY (phase 3). Series data copied
// from the owner's real account, 20 August 2026: the category names
// the family, the tags name the sport (in Kalshi's words: Soccer,
// and plain Football means the American kind), the title names the
// bet type and becomes the pick's sub-category.
{
  const series = new Map([
    ["KXITFWMATCH", { category: "Sports", title: "ITF Women's Match", tags: ["Tennis"] }],
    ["KXWCGOAL", { category: "Sports", title: "World Cup Goal", tags: ["Soccer"] }],
    ["KXNFLGAME", { category: "Sports", title: "Pro Football Game", tags: ["Football"] }],
    ["KXBTC15M", { category: "Crypto", title: "Bitcoin price up down", tags: ["BTC"] }],
    ["KXHIGHNY", { category: "Climate and Weather", title: "Highest temperature in NYC", tags: [] }],
    ["KXPRES", { category: "Politics", title: "Presidential Election", tags: [] }],
    ["KXCPI", { category: "Economics", title: "Monthly inflation", tags: [] }],
    ["KXOSCARS", { category: "Culture", title: "Oscars Best Picture", tags: [] }],
    ["KXAAPL", { category: "Companies", title: "Apple announcement", tags: [] }],
    ["KXQUANTUM", { category: "Science and Technology", title: "Quantum milestone", tags: [] }],
    ["KXMYSTERY", { category: "Something Brand New", title: "Mystery market", tags: [] }],
  ]);
  eq("taxonomy: Politics named", sportFor("KXPRES-28-X", series), "Politics");
  eq("taxonomy: Economics named", sportFor("KXCPI-26SEP-X", series), "Economics");
  eq(
    "taxonomy: Culture is Entertainment here",
    sportFor("KXOSCARS-27-X", series),
    "Entertainment"
  );
  eq("taxonomy: Companies named", sportFor("KXAAPL-26-X", series), "Companies");
  eq(
    "taxonomy: Science and Technology named",
    sportFor("KXQUANTUM-26-X", series),
    "Tech & Science"
  );
  eq(
    "taxonomy: a category we have never seen lands safely in Other",
    sportFor("KXMYSTERY-26-X", series),
    "Other"
  );
  eq("taxonomy: Tennis tag wins", sportFor("KXITFWMATCH-26AUG19ROMSAR-ROM", series), "Tennis");
  eq("taxonomy: Soccer tag is Football here", sportFor("KXWCGOAL-26X-Y", series), "Football");
  eq(
    "taxonomy: plain Football tag is the American kind",
    sportFor("KXNFLGAME-26X-Y", series),
    "American Football"
  );
  eq("taxonomy: Crypto category wins", sportFor("KXBTC15M-26AUG191700-00", series), "Crypto");
  eq(
    "taxonomy: a weather category gets its real name",
    sportFor("KXHIGHNY-25AUG20", series),
    "Weather"
  );
  eq(
    "taxonomy: no series answer falls back to the prefix table",
    sportFor("KXMLBGAME-26AUG19-PIT", new Map()),
    "Baseball"
  );

  const fills = [
    {
      ticker: "KXITFWMATCH-26AUG19ROMSAR-ROM",
      order_id: "o1",
      side: "yes",
      action: "buy",
      count_fp: "16.21",
      yes_price_dollars: "0.9200",
      no_price_dollars: "0.0800",
      fee_cost: "0.083600",
      created_time: "2026-08-19T20:27:23.249264Z",
    },
  ];
  const meta = new Map([
    [
      "KXITFWMATCH-26AUG19ROMSAR-ROM",
      {
        ticker: "KXITFWMATCH-26AUG19ROMSAR-ROM",
        title: "Will Camila Romero win the match?",
        event_ticker: "KXITFWMATCH-26AUG19ROMSAR",
      },
    ],
  ]);
  const [b] = deriveBets(fills, [], meta, series);
  eq(
    "taxonomy: the pick carries the full classification",
    [
      b.legs[0].subcategory,
      b.legs[0].market,
      b.legs[0].competition,
      b.legs[0].providerMarket,
    ],
    ["Moneyline", "Match Winner", "ITF Women's", "ITF Women's Match"]
  );
  eq("taxonomy: and the tag's sport", b.legs[0].sport, "Tennis");
}

// ---- Sport mapping spot checks, including the ones his account
// actually contained.
eq("ITF is Tennis", sportForTicker("KXITFMATCH-26AUG06OETFIX"), "Tennis");
eq("EFL cup is Football", sportForTicker("KXEFLCUPSPREAD-26AUG06BRCWAL"), "Football");
eq("club friendly is Football", sportForTicker("KXCLUBFGAME-26AUG12MUNLEE"), "Football");
eq("weather is Other", sportForTicker("KXHIGHNY-25AUG20"), "Other");

// ---- THE TAXONOMY. Locked with the owner on 21 August 2026.
// Category = repeatable skill, Market = controlled instrument,
// Domain / Sport / Competition / Period = independent dimensions.
// Every mapping below is a real series from his accounts.
{
  const cases = [
    // [series title, ticker, category, market, period, competition]
    ["World Cup Game", "KXWCGAME-X", "Moneyline", "Match Winner", null, "World Cup"],
    ["World Cup Advance", "KXWCADVANCE-X", "Moneyline", "To Advance", null, "World Cup"],
    ["World Cup 1st Half", "KXWC1H-X", "Moneyline", "Match Winner", "1st Half", "World Cup"],
    ["World Cup Total", "KXWCTOTAL-X", "Totals (Over/Under)", "Match Total", null, "World Cup"],
    ["World Cup Correct Score", "KXWCSCORE-X", "Correct Score", "Correct Score", null, "World Cup"],
    ["World Cup BTTS", "KXWCBTTS-X", "Match Props", "BTTS", null, "World Cup"],
    ["World Cup Corners", "KXWCCORNERS-X", "Match Props", "Corners", null, "World Cup"],
    ["World Cup First Goal", "KXWCFIRSTGOAL-X", "Match Props", "First to Score", null, "World Cup"],
    ["World Cup Goal", "KXWCGOAL-X", "Player Props", "Goalscorer", null, "World Cup"],
    ["Men's World Cup winner", "KXMENWORLDCUP-X", "Tournament Winner", "Tournament Winner", null, "Men's World Cup"],
    ["EFL Cup Spread", "KXEFLCUPSPREAD-X", "Spread / Handicap", "Spread", null, "EFL Cup"],
    ["Professional Baseball Game", "KXMLBGAME-X", "Moneyline", "Match Winner", null, "Professional Baseball"],
    ["ATP Tennis Match", "KXATPMATCH-X", "Moneyline", "Match Winner", null, "ATP Tennis"],
    ["Challenger ATP ", "KXATPCHALLENGERMATCH-X", "Moneyline", "Match Winner", null, "Challenger ATP"],
    ["Club Friendlies", "KXCLUBFGAME-X", "Moneyline", "Match Winner", null, "Club Friendlies"],
    ["Bitcoin price up down", "KXBTC15M-X", "Price Direction", "Price Direction", null, null],
    ["La Liga Game", "KXLALIGAGAME-X", "Moneyline", "Match Winner", null, "La Liga"],
  ];
  for (const [title, ticker, category, market, period, competition] of cases) {
    const c = classifyKalshi(title, ticker);
    eq(`taxonomy: ${title}`, [c.category, c.market, c.period, c.competition],
       [category, market, period, competition]);
  }

  // UNCLASSIFIED IS THE ONLY FALLBACK. Never a guess, never Match
  // Props, never an old category.
  eq("taxonomy: a never-seen series is Unclassified",
     classifyKalshi("Highest temperature in NYC", "KXHIGHNY-X").category, UNCLASSIFIED);
  eq("taxonomy: a parlay container is never one category",
     classifyKalshi("MVE Sport Mutli Game", "KXMVESPORTSMULTIGAMEEXTENDED-X").category,
     UNCLASSIFIED);

  // NO PROVIDER CAN MINT A CATEGORY: a classification is only valid
  // if its category is registered in the pick's domain.
  eq("taxonomy: an unregistered category is rejected to Unclassified",
     validated("Politics", { category: "Moneyline", market: "Match Winner", period: null, competition: null }).category,
     UNCLASSIFIED);
  eq("taxonomy: a registered one passes",
     validated(domainOf("Football"), classifyKalshi("La Liga Game", "KXLALIGAGAME-X")).category,
     "Moneyline");

  // SAME BET = SAME CANONICAL CATEGORY. A manual pick and its
  // imported twin must land together, whatever door they came in.
  const pairs = [
    ["Win-bet / Moneyline", "La Liga Game", "KXLALIGAGAME-X"],
    ["Correct Score", "World Cup Correct Score", "KXWCSCORE-X"],
    ["BTTS (Both Teams to Score)", "World Cup BTTS", "KXWCBTTS-X"],
    ["Corners", "World Cup Corners", "KXWCCORNERS-X"],
    ["First team to score", "World Cup First Goal", "KXWCFIRSTGOAL-X"],
    ["Points Total", "World Cup Total", "KXWCTOTAL-X"],
    ["Player Props: Goalscorer", "World Cup Goal", "KXWCGOAL-X"],
  ];
  for (const [manual, kalshiTitle, ticker] of pairs) {
    eq(
      `same bet = same category: ${manual}`,
      migrateManualLabel(manual).category,
      classifyKalshi(kalshiTitle, ticker).category
    );
  }
  // The owner's half bets: first-half results, both doors agree on
  // category AND period.
  const mHalf = migrateManualLabel("1st half / 2nd half");
  const kHalf = classifyKalshi("World Cup 1st Half", "KXWC1H-X");
  eq("same bet = same category: halves", [mHalf.category, mHalf.period], [kHalf.category, kHalf.period]);

  // THE TEXT BACKFILL. Old parlay markets stop returning their leg
  // data, so legs still carrying a raw series title must be
  // classifiable from that title alone, with no network. These are
  // the exact labels left stranded on the owner's Old account.
  for (const [raw, category, market, competition] of [
    ["World Cup Game", "Moneyline", "Match Winner", "World Cup"],
    ["Professional Baseball Game", "Moneyline", "Match Winner", "Professional Baseball"],
    ["Pro Basketball Game", "Moneyline", "Match Winner", "Pro Basketball"],
  ]) {
    const c = classifyKalshi(raw, "");
    eq(`backfill from text: ${raw}`, [c.category, c.market, c.competition],
       [category, market, competition]);
  }

  // THE CATALOG ROUND (21 August 2026), from Kalshi's own 13,338
  // series rather than the owner's trades: the coverage an NFL or NBA
  // bettor would have fallen through.
  for (const [title, category, market] of [
    ["Pro Football player Passing Touchdowns", "Player Props", "Passing Yards"],
    ["EPL Anytime Goalscorer", "Player Props", "Goalscorer"],
    ["Pro Basketball Player Assists", "Player Props", "Assists"],
    ["Pro Basketball Player Points + Rebounds", "Player Props", "Points"],
    ["WTA Tennis Aces", "Player Props", "Aces"],
    ["Pro Football Interceptions", "Player Props", "Player Stat"],
    ["AP Pro Football Defensive Rookie of the Year", "Awards", "Player of the Year"],
    ["NHL Hart Memorial Trophy", "Awards", "Trophy"],
    ["Pro Baseball Championship MVP", "Awards", "MVP"],
    ["Pro Baseball American League Manager of the Year", "Awards", "Coach of the Year"],
    ["Lebron's Next Team", "Transfers & Moves", "Next Team"],
    ["Stanford Next Coach", "Transfers & Moves", "Next Coach"],
    ["Messi retirement", "Transfers & Moves", "Retirement"],
    ["Pro Football Playoff Qualifiers", "Moneyline", "To Advance"],
    ["Serie A Relegation", "Moneyline", "To Advance"],
    ["Serie A Top 4 Finishers", "Moneyline", "To Advance"],
    ["ACC Champion", "Tournament Winner", "Tournament Winner"],
    ["SEC Regular Season Champions", "Tournament Winner", "Tournament Winner"],
    ["World Cup Goals Allowed", "Totals (Over/Under)", "Team Total"],
    ["T20 Total Runs", "Totals (Over/Under)", "Match Total"],
  ]) {
    const c = classifyKalshi(title, "");
    eq(`catalog: ${title}`, [c.category, c.market], [category, market]);
  }

  // Junk and one-off novelties must stay honest.
  for (const junk of ["test", "DONT USE", "Beast Water", "SF Inaugural Spelling Bee Winner?"]) {
    const c = classifyKalshi(junk, "");
    if (c.category !== UNCLASSIFIED && junk !== "SF Inaugural Spelling Bee Winner?") {
      eq(`catalog: junk stays Unclassified (${junk})`, c.category, UNCLASSIFIED);
    }
  }

  // THE EPL TRAP. Kalshi tags the Premier League "Football" on some
  // series and "Soccer" on others; trusting the tag would file the
  // owner's biggest market under American Football.
  const eplSeries = new Map([
    ["KXEPLANYGOAL", { category: "Sports", title: "EPL Anytime Goalscorer", tags: ["Football"] }],
    ["KXEPLTEAMPOINTS", { category: "Sports", title: "Team Points", tags: ["Soccer"] }],
    ["KXUCLLEAGUE", { category: "Sports", title: "League to Win UEFA Champions League", tags: ["Football"] }],
    ["KXNFLPASSTDS", { category: "Sports", title: "Pro Football player Passing Touchdowns", tags: ["Football"] }],
    ["KXNCAAFACC", { category: "Sports", title: "ACC Champion", tags: ["Football"] }],
  ]);
  eq("EPL tagged Football is still soccer", sportFor("KXEPLANYGOAL-X", eplSeries), "Football");
  eq("EPL tagged Soccer is soccer", sportFor("KXEPLTEAMPOINTS-X", eplSeries), "Football");
  eq("UCL tagged Football is soccer", sportFor("KXUCLLEAGUE-X", eplSeries), "Football");
  eq(
    "NFL tagged Football is American Football",
    sportFor("KXNFLPASSTDS-X", eplSeries),
    "American Football"
  );
  eq(
    "College football tagged Football is American Football",
    sportFor("KXNCAAFACC-X", eplSeries),
    "American Football"
  );

  // Player Props markets are per sport: no Goalscorer for basketball.
  eq(
    "player props: basketball vocabulary",
    marketsFor("Player Props", "Basketball"),
    ["Points", "Rebounds", "Assists", "Threes"]
  );
  eq(
    "player props: football vocabulary",
    marketsFor("Player Props", "Football"),
    ["Goalscorer", "Assists", "Score or Assist", "Shots"]
  );
  eq(
    "non-prop markets are the same for every sport",
    marketsFor("Moneyline", "Baseball"),
    ["Match Winner", "To Advance"]
  );

  // THE DOMAIN LIST, the owner's ten (21 August 2026). Crypto is a
  // LEVEL 2 value inside Economics, not a domain of its own, so a BTC
  // price bet must still validate.
  eq("domains: Crypto sits under Economics", domainOf("Crypto"), "Economics");
  eq("domains: a sport sits under Sports", domainOf("Rugby"), "Sports");
  eq("domains: Health names its own domain", domainOf("Health"), "Health");
  eq(
    "domains: a crypto price bet still validates",
    validated(domainOf("Crypto"), classifyKalshi("Bitcoin price up down", "KXBTC15M-X")).category,
    "Price Direction"
  );
  eq(
    "domains: Crypto is no longer a registered domain",
    DOMAIN_CATEGORIES.Crypto ?? null,
    null
  );

  // Every market the mappers can emit is registered under its
  // category, and every registered category belongs to a domain.
  const allRegistered = Object.values(DOMAIN_CATEGORIES).flat();
  for (const cat of Object.keys(CATEGORY_MARKETS)) {
    eq(`register: ${cat} belongs to a domain`, allRegistered.includes(cat), true);
  }
}

if (failures > 0) {
  console.log(`Sync test found ${failures} problem(s).`);
  process.exit(1);
}
console.log("Sync test passed. The Kalshi money maths is intact.");
