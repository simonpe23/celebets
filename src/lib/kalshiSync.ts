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

export type KalshiFill = {
  ticker: string;
  order_id?: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  count: number;
  yes_price: number; // cents
  no_price: number; // cents
  created_time: string;
};

export type KalshiSettlement = {
  ticker: string;
  market_result?: string;
  revenue?: number; // cents, what Kalshi paid at settlement
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

function cents(fill: KalshiFill): number {
  return fill.side === "yes" ? fill.yes_price : fill.no_price;
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
      amount: round2(
        group.reduce((s, f) => s + (f.count * cents(f)) / 100, 0)
      ),
      payout: round2(group.reduce((s, f) => s + f.count, 0)),
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
    const sellRevenue = round2(
      sellFills.reduce((s, f) => s + (f.count * cents(f)) / 100, 0)
    );
    const boughtCount = marketFills
      .filter((f) => f.action === "buy")
      .reduce((s, f) => s + f.count, 0);
    const soldCount = sellFills.reduce((s, f) => s + f.count, 0);

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
      const settleRevenue =
        typeof settlement.revenue === "number"
          ? settlement.revenue / 100
          : won
            ? heldAtSettle
            : 0;
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
