// THE MONEY TEST FOR THE KALSHI IMPORT.
//
// WHY IT EXISTS. The first version of the import shipped against
// Kalshi's documented field names and imported exactly nothing: the
// real fills call their size count_fp (a string, and fractional),
// price their contracts in dollar strings rather than cents, and
// charge a separate fee per fill. Every fill computed to zero and was
// silently dropped, and the app cheerfully said "up to date". The
// owner found it by placing real bets.
//
// So the translation now has a test, and it uses RECORDS COPIED FROM
// HIS ACCOUNT rather than from documentation. If Kalshi changes a
// field name again, this fails loudly instead of importing nothing.
//
// It runs inside `npm run check`. Node cannot import a .ts file whose
// relative imports have no extension, so the sources are copied to a
// temp folder with extensions added. That is ugly and it is confined
// to this file.
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
const { deriveBets, sportForTicker } = await import(
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

// A fill in the exact shape Kalshi really answers with.
const fill = (o) => ({
  ticker: "KXBTC15M-26AUG191400-00",
  order_id: "order-1",
  side: "no",
  action: "buy",
  count_fp: "106.26",
  no_price_dollars: "0.3400",
  yes_price_dollars: "0.6600",
  fee_cost: "1.669200",
  created_time: "2026-08-19T17:46:14.353364Z",
  ...o,
});

const meta = new Map([
  [
    "KXBTC15M-26AUG191400-00",
    {
      ticker: "KXBTC15M-26AUG191400-00",
      title: "Bitcoin above 114,000 at 2pm",
      event_ticker: "KXBTC15M-26AUG191400",
    },
  ],
]);

// 1. THE REGRESSION: the owner's own fill must become a real bet.
{
  const [b] = deriveBets([fill()], [], meta);
  eq("real fill produces a bet", Boolean(b), true);
  // 106.26 contracts at $0.34 = $36.1284, plus the $1.6692 fee.
  eq("stake is cost plus fee", b.stake, 37.8);
  eq("to collect is the contract count", b.buys[0].payout, 106.26);
  eq("status", b.status, "pending");
  eq("sport from the series", b.sport, "Crypto");
  eq("the No side is named", b.description, "Bitcoin above 114,000 at 2pm (No)");
}

// 2. Strings and fractions must never produce NaN, which is exactly
// how the first version failed.
{
  const [b] = deriveBets([fill()], [], meta);
  eq("stake is a finite number", Number.isFinite(b.stake), true);
  eq("odds are finite", Number.isFinite(b.totalOdds), true);
}

// 3. Settlement, won: payout is the contracts held, at $1 each.
{
  const [b] = deriveBets(
    [fill()],
    [
      {
        ticker: "KXBTC15M-26AUG191400-00",
        market_result: "no",
        settled_time: "2026-08-19T18:00:00Z",
      },
    ],
    meta
  );
  eq("settled won", b.status, "won");
  eq("payout is the contract count", b.payout, 106.26);
  eq("profit is payout minus stake", Math.round((b.payout - b.stake) * 100) / 100, 68.46);
}

// 4. Settlement, lost: no payout stored, the app's own convention.
{
  const [b] = deriveBets(
    [fill()],
    [
      {
        ticker: "KXBTC15M-26AUG191400-00",
        market_result: "yes",
        settled_time: "2026-08-19T18:00:00Z",
      },
    ],
    meta
  );
  eq("settled lost", b.status, "lost");
  eq("no payout on a plain loss", b.payout, null);
}

// 5. Selling the whole position early is a cash out, net of fees.
{
  const fills = [
    fill(),
    fill({
      order_id: "order-2",
      action: "sell",
      no_price_dollars: "0.5000",
      fee_cost: "1.000000",
      created_time: "2026-08-19T17:55:00Z",
    }),
  ];
  const [b] = deriveBets(fills, [], meta);
  eq("cash out flagged", b.cashedOut, true);
  // 106.26 at $0.50 = $53.13, less the $1 fee.
  eq("cash out pays the sale, net of fee", b.payout, 52.13);
  eq("cash out above stake counts as won", b.status, "won");
}

// 6. Two orders on one market merge into two buys, one bet.
{
  const fills = [
    fill(),
    fill({
      order_id: "order-3",
      count_fp: "50",
      no_price_dollars: "0.4000",
      fee_cost: "0.500000",
      created_time: "2026-08-19T17:50:00Z",
    }),
  ];
  const [b] = deriveBets(fills, [], meta);
  eq("two buys", b.buys.length, 2);
  eq("stake adds up", b.stake, 58.3);
  eq("collect adds up", round2(b.stake * b.totalOdds), 156.26);
}
function round2(v) {
  return Math.round(v * 100) / 100;
}

// 7. Fills of one order arriving in pieces stay one buy.
{
  const fills = [
    fill({ count_fp: "50" }),
    fill({ count_fp: "56.26", created_time: "2026-08-19T17:46:15Z" }),
  ];
  const [b] = deriveBets(fills, [], meta);
  eq("one order is one buy", b.buys.length, 1);
}

// 8. Sport mapping, including the fallback the owner asked for.
eq("crypto series", sportForTicker("KXBTC15M-26AUG191400"), "Crypto");
eq("nfl series", sportForTicker("KXNFLGAME-25SEP04"), "American Football");
eq("unknown lands in Other", sportForTicker("KXHIGHNY-25AUG20"), "Other");

if (failures > 0) {
  console.log(`Sync test found ${failures} problem(s).`);
  process.exit(1);
}
console.log("Sync test passed. The Kalshi money maths is intact.");
