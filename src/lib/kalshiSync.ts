import { round2, round4 } from "./format";
import type { Sport } from "./types";

// TRANSLATION AT THE DOOR. Kalshi speaks in contracts, cents and
// tickers; inside Actuals everything is a bet with a stake, a To
// Collect, buys, and an outcome. This file is the whole translation,
// and it is PURE: raw Kalshi records in, bet shapes out, no network
// and no database, so the money maths is testable without a Kalshi
// account. The route that syncs does the fetching and the writing.
//
// The mapping mirrors how the owner already tracked Kalshi by hand,
// which is what the app's money model was built around:
//   every fill that buys the held side   -> a buy (add money)
//   selling the whole position early     -> cash out at what it paid
//   settlement                           -> won or lost, exactly
// One Actuals bet per market per side. Kalshi settles a market once,
// so that is also one bet per lifecycle, and the external id keeps a
// second import from ever double-counting it.
//
// Known v1 simplification, on purpose: a PARTIAL sell of a pending
// position is rare and does not exist in the manual model either.
// Until settlement such a bet shows its full To Collect; at
// settlement the sold part's revenue joins the payout, so the final
// profit is exact even when the ride was unusual.

// THE REAL SHAPES, read off the owner's own account (19 August 2026)
// after the first build imported nothing. Kalshi's fills do not look
// like the documentation this was first written against:
//   count_fp             a STRING, and fractional: "106.26" contracts
//   no_price_dollars     a STRING in DOLLARS: "0.3400", not cents
//   fee_cost             charged per fill, real money, separate
// The old names are kept as fallbacks so a future account answering
// in the older shape still works. Everything is parsed through num(),
// because every number here arrives as text.
export type KalshiFill = {
  ticker: string;
  order_id?: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  count_fp?: string | number;
  count?: string | number;
  yes_price_dollars?: string | number;
  no_price_dollars?: string | number;
  yes_price?: string | number; // cents, older shape
  no_price?: string | number;
  fee_cost?: string | number;
  created_time: string;
};

export type KalshiSettlement = {
  ticker: string;
  market_result?: string;
  settled_time?: string;
};

export type KalshiMarketMeta = {
  ticker: string;
  title?: string;
  event_ticker?: string;
};

export type BetDraft = {
  externalId: string;
  sport: Sport;
  description: string;
  stake: number;
  totalOdds: number;
  status: "pending" | "won" | "lost";
  placedAt: string;
  settledAt: string | null;
  payout: number | null;
  cashedOut: boolean;
  // Every buy, first included, matching the app's invariant: a bet's
  // stake is the sum of its buys and To Collect the sum of their
  // payouts.
  buys: { amount: number; payout: number; createdAt: string }[];
};

// Which sport a Kalshi market belongs to, from the ticker's series
// prefix (the part before the first dash, e.g. KXNFLGAME). Checked
// with and without the KX prefix, longest match first. Anything not
// recognised lands in Other: the owner ruled that non-sport markets
// import too ("I want users to be able to track everything"), and
// phase 3 refines Other into proper categories with the Sports /
// everything filter above them.
const SERIES_SPORTS: [string, Sport][] = [
  ["NFL", "American Football"],
  ["NCAAF", "American Football"],
  ["SUPERBOWL", "American Football"],
  ["NBA", "Basketball"],
  ["WNBA", "Basketball"],
  ["NCAAB", "Basketball"],
  ["MLB", "Baseball"],
  ["WORLDSERIES", "Baseball"],
  ["NHL", "Ice Hockey"],
  ["STANLEYCUP", "Ice Hockey"],
  ["ATP", "Tennis"],
  ["WTA", "Tennis"],
  ["TENNIS", "Tennis"],
  ["PGA", "Golf"],
  ["GOLF", "Golf"],
  ["MASTERS", "Golf"],
  ["RYDERCUP", "Golf"],
  ["EPL", "Football"],
  ["UCL", "Football"],
  ["UEL", "Football"],
  ["LALIGA", "Football"],
  ["SERIEA", "Football"],
  ["BUNDESLIGA", "Football"],
  ["LIGUE1", "Football"],
  ["MLS", "Football"],
  ["FIFA", "Football"],
  ["WORLDCUP", "Football"],
  ["CS2", "esports"],
  ["CSGO", "esports"],
  ["LOL", "esports"],
  ["DOTA", "esports"],
  ["VALORANT", "esports"],
  ["ESPORTS", "esports"],
  ["BTC", "Crypto"],
  ["ETH", "Crypto"],
  ["SOL", "Crypto"],
  ["DOGE", "Crypto"],
  ["XRP", "Crypto"],
  ["ADA", "Crypto"],
  ["CRYPTO", "Crypto"],
];

export function sportForTicker(ticker: string): Sport {
  const series = ticker.split("-")[0]?.toUpperCase() ?? "";
  const bare = series.startsWith("KX") ? series.slice(2) : series;
  let best: Sport | null = null;
  let bestLen = 0;
  for (const [prefix, sport] of SERIES_SPORTS) {
    if (bare.startsWith(prefix) && prefix.length > bestLen) {
      best = sport;
      bestLen = prefix.length;
    }
  }
  return best ?? "Other";
}

// Every number on a Kalshi record can arrive as a string.
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Contracts on this fill. Fractional: Kalshi sells parts of a
// contract, so this is not an integer.
function contracts(f: KalshiFill): number {
  return num(f.count_fp ?? f.count);
}

// What one contract cost or paid, in dollars.
function priceDollars(f: KalshiFill): number {
  const dollars = f.side === "yes" ? f.yes_price_dollars : f.no_price_dollars;
  if (dollars !== undefined && dollars !== null) return num(dollars);
  // The older documented shape: cents.
  return num(f.side === "yes" ? f.yes_price : f.no_price) / 100;
}

// Kalshi's fee on this fill. It is money that left the account, so a
// buy's stake includes it and a sell's proceeds are net of it. Without
// this the app would report a profit the user never made.
function fee(f: KalshiFill): number {
  return num(f.fee_cost);
}

// What the fill cost (buy) or returned (sell), before fees.
function gross(f: KalshiFill): number {
  return contracts(f) * priceDollars(f);
}

// Fills merged per order: one market order can fill in many small
// pieces seconds apart, and a row of near-identical micro-buys would
// pollute the odds groups where every buy counts as its own pick.
function mergeBuys(
  fills: KalshiFill[]
): { amount: number; payout: number; createdAt: string }[] {
  const byOrder = new Map<string, KalshiFill[]>();
  for (const f of fills) {
    const key = f.order_id ?? `${f.created_time}`;
    byOrder.set(key, [...(byOrder.get(key) ?? []), f]);
  }
  return [...byOrder.values()]
    .map((group) => ({
      // The stake is what left the account: the contracts' cost plus
      // Kalshi's fee.
      amount: round2(group.reduce((s, f) => s + gross(f) + fee(f), 0)),
      // Every contract pays exactly $1 if it wins, so the contract
      // count IS the To Collect.
      payout: round2(group.reduce((s, f) => s + contracts(f), 0)),
      createdAt: group
        .map((f) => f.created_time)
        .sort()[0],
    }))
    .filter((b) => b.amount > 0 && b.payout > 0)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function deriveBets(
  fills: KalshiFill[],
  settlements: KalshiSettlement[],
  meta: Map<string, KalshiMarketMeta>
): BetDraft[] {
  const settled = new Map(settlements.map((s) => [s.ticker, s]));
  const byMarket = new Map<string, KalshiFill[]>();
  for (const f of fills) {
    if (f.side !== "yes" && f.side !== "no") continue;
    const key = `${f.ticker}:${f.side}`;
    byMarket.set(key, [...(byMarket.get(key) ?? []), f]);
  }

  const out: BetDraft[] = [];
  for (const [key, marketFills] of byMarket) {
    const [ticker, side] = [
      key.slice(0, key.lastIndexOf(":")),
      key.slice(key.lastIndexOf(":") + 1) as "yes" | "no",
    ];

    const buys = mergeBuys(marketFills.filter((f) => f.action === "buy"));
    if (buys.length === 0) continue;

    const sellFills = marketFills.filter((f) => f.action === "sell");
    // Net of fees, for the same reason a buy's stake includes them.
    const sellRevenue = round2(
      sellFills.reduce((s, f) => s + gross(f) - fee(f), 0)
    );
    const boughtCount = marketFills
      .filter((f) => f.action === "buy")
      .reduce((s, f) => s + contracts(f), 0);
    const soldCount = sellFills.reduce((s, f) => s + contracts(f), 0);

    const stake = round2(buys.reduce((s, b) => s + b.amount, 0));
    const toCollect = round2(buys.reduce((s, b) => s + b.payout, 0));
    if (stake <= 0 || toCollect <= 0) continue;

    const m = meta.get(ticker);
    const title = m?.title?.trim() || ticker;
    const description = side === "no" ? `${title} (No)` : title;

    const settlement = settled.get(ticker);
    const lastSell = sellFills
      .map((f) => f.created_time)
      .sort()
      .at(-1);

    let status: BetDraft["status"] = "pending";
    let payout: number | null = null;
    let settledAt: string | null = null;
    let cashedOut = false;

    if (settlement) {
      const won =
        (settlement.market_result ?? "").toLowerCase() === side;
      const heldAtSettle = Math.max(0, boughtCount - soldCount);
      // Computed from the fills, NOT from the settlement's own
      // revenue field. On the owner's account that field read 0 on a
      // market he had traded both ways, and its unit is undocumented;
      // contracts held times the $1 a winning contract pays is
      // determined entirely by data we can see and check.
      const settleRevenue = won ? heldAtSettle : 0;
      status = won ? "won" : "lost";
      // A plain lost bet stores NO payout, matching the app's own
      // convention ("a plain lost bet has no payout"), and some
      // schema checks require a stored payout to be above zero.
      const total = round2(settleRevenue + sellRevenue);
      payout = total > 0 ? total : null;
      settledAt = settlement.settled_time ?? lastSell ?? null;
    } else if (soldCount >= boughtCount) {
      // The whole position was sold before the market decided: the
      // app's cash out, to the cent. At or above stake counts as won,
      // below as lost, profit is always payout minus stake.
      cashedOut = true;
      payout = sellRevenue;
      status = sellRevenue >= stake ? "won" : "lost";
      settledAt = lastSell ?? null;
    }

    out.push({
      externalId: `kalshi:${ticker}:${side}`,
      sport: sportForTicker(m?.event_ticker || ticker),
      description,
      stake,
      totalOdds: round4(toCollect / stake),
      status,
      placedAt: buys[0].createdAt,
      settledAt,
      payout,
      cashedOut,
      buys,
    });
  }

  return out.sort((a, b) => a.placedAt.localeCompare(b.placedAt));
}
