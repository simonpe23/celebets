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
for (const name of ["kalshiSync", "format", "types"]) {
  const src = await readFile(`src/lib/${name}.ts`, "utf8");
  await writeFile(
    join(dir, `${name}.ts`),
    src.replace(/from "\.\/(\w+)"/g, 'from "./$1.ts"')
  );
}
const { clampToStart, deriveBets, sportForTicker } = await import(
  join(dir, "kalshiSync.ts")
);

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
  eq("single: one leg, Crypto, the No side named", b.legs, [
    {
      sport: "Crypto",
      description: "BTC price up in next 15 mins? (No)",
      result: "lost",
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
  eq("parlay: two legs, each its own sport and result", b.legs, [
    { sport: "Football", description: "Atletico Madrid to win", result: "won" },
    { sport: "Baseball", description: "Pittsburgh to win", result: "pending" },
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

// ---- Sport mapping spot checks, including the ones his account
// actually contained.
eq("ITF is Tennis", sportForTicker("KXITFMATCH-26AUG06OETFIX"), "Tennis");
eq("EFL cup is Football", sportForTicker("KXEFLCUPSPREAD-26AUG06BRCWAL"), "Football");
eq("club friendly is Football", sportForTicker("KXCLUBFGAME-26AUG12MUNLEE"), "Football");
eq("weather is Other", sportForTicker("KXHIGHNY-25AUG20"), "Other");

if (failures > 0) {
  console.log(`Sync test found ${failures} problem(s).`);
  process.exit(1);
}
console.log("Sync test passed. The Kalshi money maths is intact.");
