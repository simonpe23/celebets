import { round2, round4 } from "./format";
import {
  classifyKalshi,
  domainOf,
  validated,
  type Classification,
} from "./taxonomy";
import type { Sport } from "./types";

// TRANSLATION AT THE DOOR. Kalshi speaks in contracts, dollar-string
// prices and tickers; inside Actuals everything is a bet with a
// stake, a To Collect, buys, legs and an outcome. This file is the
// whole translation, and it is PURE: raw Kalshi records in, bet
// shapes out, no network and no database, so the money maths is
// testable without a Kalshi account (synctest.mjs, wired into npm
// run check).
//
// EVERY SHAPE HERE WAS READ OFF THE OWNER'S REAL ACCOUNT, 19 August
// 2026, after two rounds of documentation-led guesses each imported
// something wrong. The three facts that cost a live test each:
//
// 1. Numbers are STRINGS, sizes are fractional (count_fp "106.26"),
//    and prices are dollar strings (no_price_dollars "0.3400"), with
//    a real fee per fill (fee_cost) that is part of the money.
//
// 2. CLOSING A POSITION IS RECORDED BACKWARDS. Selling your No
//    contracts arrives as {action: "sell", side: "yes"}: the side
//    named is the OPPOSITE of the position being closed, and the
//    money received is the count times the price of the side you
//    actually held. Proven to the cent against the owner's Kalshi
//    receipt: 185.64 contracts, no_price 0.21, fee 2.16 = $36.83.
//
// 3. A PARLAY IS A MULTIVARIATE MARKET (ticker KXMVE...). The market
//    object carries mve_selected_legs, one entry per pick with its
//    own market_ticker and side, which is how a football + baseball
//    combo becomes a real Actuals parlay with a sport per leg
//    instead of one strange single called "yes Atletico,yes
//    Pittsburgh".
//
// The mapping mirrors how the owner already tracked Kalshi by hand:
//   every buy of the held side        -> a buy (add money)
//   closing the whole position early  -> cash out at what it paid
//   settlement                        -> won or lost, exactly

export type KalshiFill = {
  ticker: string;
  order_id?: string;
  ts?: number; // epoch seconds, Kalshi's own clock field
  side: "yes" | "no";
  action: "buy" | "sell";
  count_fp?: string | number;
  count?: string | number;
  yes_price_dollars?: string | number;
  no_price_dollars?: string | number;
  yes_price?: string | number; // cents, the older documented shape
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
  // "yes" | "no" once the market is decided, "" while open.
  result?: string;
  // Present on a multivariate (parlay) market: the picks inside it.
  mveLegs?: { market_ticker: string; side: string }[];
};

// What Kalshi's series endpoint says about one ticker prefix: the
// broad category, the bet type as a title, the sport as a tag.
export type KalshiSeriesMeta = {
  category?: string;
  title?: string;
  tags?: string[];
};

export type LegDraft = {
  sport: Sport;
  description: string;
  result: "pending" | "won" | "lost";
  // The canonical Actuals category (a registered skill, or
  // Unclassified). Same field manual entry fills, which is what makes
  // "same bet = same category" hold across both doors.
  subcategory: string;
  // The taxonomy's other dimensions, from src/lib/taxonomy.ts.
  market: string | null;
  period: string | null;
  competition: string | null;
  // The provider's own market name, verbatim: the explainability
  // trail. Null also marks a pick whose series lookup failed, which
  // is exactly what the repair pass retries.
  providerMarket: string | null;
};

export type BetDraft = {
  externalId: string;
  stake: number;
  totalOdds: number;
  status: "pending" | "won" | "lost";
  placedAt: string;
  settledAt: string | null;
  payout: number | null;
  cashedOut: boolean;
  legs: LegDraft[];
  // Every buy, first included: a bet's stake is the sum of its buys
  // and To Collect the sum of their payouts, the app's invariant.
  buys: { amount: number; payout: number; createdAt: string }[];
};

// Which sport a market belongs to, from the ticker's series prefix
// (the part before the first dash, e.g. KXNFLGAME), checked with and
// without the KX prefix, longest match first. Anything unrecognised
// lands in Other: the owner ruled that non-sport markets import too,
// and phase 3 refines Other into categories.
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
  ["ITF", "Tennis"],
  ["TENNIS", "Tennis"],
  ["PGA", "Golf"],
  ["GOLF", "Golf"],
  ["MASTERS", "Golf"],
  ["RYDERCUP", "Golf"],
  ["EPL", "Football"],
  ["EFL", "Football"],
  ["UCL", "Football"],
  ["UEL", "Football"],
  ["LALIGA", "Football"],
  ["SERIEA", "Football"],
  ["BUNDESLIGA", "Football"],
  ["LIGUE1", "Football"],
  ["MLS", "Football"],
  ["FIFA", "Football"],
  ["WORLDCUP", "Football"],
  ["CLUBF", "Football"],
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

// Kalshi's sport tags, measured off the owner's account (20 August
// 2026): a Sports-category series carries the sport as a tag, and
// the tag says "Soccer" where this app says Football. American
// football is the one to watch: Kalshi's US tag for it is plain
// "Football".
const TAG_SPORTS: Record<string, Sport> = {
  tennis: "Tennis",
  soccer: "Football",
  football: "American Football",
  baseball: "Baseball",
  basketball: "Basketball",
  hockey: "Ice Hockey",
  "ice hockey": "Ice Hockey",
  golf: "Golf",
  esports: "esports",
};

// Kalshi's non-sport categories, normalised into this app's names by
// a contains-match, so a rename on their side ("Climate" becoming
// "Climate and Weather") keeps mapping instead of breaking. Order
// matters only where words overlap; anything unmatched falls through
// to the prefix table and finally to Other, so a category we have
// never seen degrades safely instead of failing an import.
const CATEGORY_SPORTS: [string, Sport][] = [
  ["crypto", "Crypto"],
  ["politic", "Politics"],
  ["election", "Politics"],
  ["econom", "Economics"],
  ["financial", "Economics"],
  ["inflation", "Economics"],
  ["culture", "Entertainment"],
  ["entertain", "Entertainment"],
  ["music", "Entertainment"],
  ["movie", "Entertainment"],
  ["climate", "Weather"],
  ["weather", "Weather"],
  ["compan", "Companies"],
  ["science", "Tech & Science"],
  ["tech", "Tech & Science"],
  ["health", "Health"],
  ["world", "World"],
  ["transport", "World"],
];

// The sport for one market, best source first: Kalshi's own series
// taxonomy (category + tags), then the hand-kept ticker-prefix table
// for markets whose series lookup failed.
export function sportFor(
  ticker: string,
  series: Map<string, KalshiSeriesMeta>
): Sport {
  const prefix = ticker.split("-")[0]?.toUpperCase() ?? "";
  const s = series.get(prefix);
  if (s) {
    const cat = (s.category ?? "").toLowerCase();
    if (cat === "sports") {
      for (const tag of s.tags ?? []) {
        const mapped = TAG_SPORTS[tag.toLowerCase()];
        if (mapped) return mapped;
      }
    } else if (cat !== "") {
      for (const [word, sport] of CATEGORY_SPORTS) {
        if (cat.includes(word)) return sport;
      }
    }
  }
  return sportForTicker(ticker);
}

// The full classification for one market: sport-validated canonical
// category plus the taxonomy's dimensions, with the provider's own
// series title preserved. The mapper cannot mint a category: its
// output is validated against the pick's domain register.
export function classifyMarket(
  ticker: string,
  series: Map<string, KalshiSeriesMeta>
): Classification & { providerMarket: string | null } {
  const prefix = ticker.split("-")[0]?.toUpperCase() ?? "";
  const title = series.get(prefix)?.title?.trim() || null;
  const sport = sportFor(ticker, series);
  const cls = validated(domainOf(sport), classifyKalshi(title, ticker));
  return { ...cls, providerMarket: title };
}

// Every number on a Kalshi record can arrive as a string.
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function priceOf(f: KalshiFill, side: "yes" | "no"): number {
  const dollars = side === "yes" ? f.yes_price_dollars : f.no_price_dollars;
  if (dollars !== undefined && dollars !== null) return num(dollars);
  return num(side === "yes" ? f.yes_price : f.no_price) / 100;
}

// One fill, translated to the position it belongs to. Fact 2 above:
// a sell names the opposite side, and pays the price of the side
// actually held.
type Trade = {
  ticker: string;
  positionSide: "yes" | "no";
  isBuy: boolean;
  count: number;
  money: number; // count times the held side's price, before fees
  fee: number;
  time: string;
  orderKey: string;
};

function toTrade(f: KalshiFill): Trade | null {
  if (f.side !== "yes" && f.side !== "no") return null;
  if (f.action !== "buy" && f.action !== "sell") return null;
  const isBuy = f.action === "buy";
  const positionSide = isBuy ? f.side : f.side === "yes" ? "no" : "yes";
  const count = num(f.count_fp ?? f.count);
  if (count <= 0) return null;
  return {
    ticker: f.ticker,
    positionSide,
    isBuy,
    count,
    money: count * priceOf(f, positionSide),
    fee: num(f.fee_cost),
    time: f.created_time,
    orderKey: f.order_id ?? f.created_time,
  };
}

// Buys merged per order: one market order can fill in many pieces
// seconds apart, and a row of near-identical micro-buys would pollute
// the odds groups where every buy counts as its own pick.
function mergeBuys(
  buys: Trade[]
): { amount: number; payout: number; createdAt: string }[] {
  const byOrder = new Map<string, Trade[]>();
  for (const t of buys) {
    byOrder.set(t.orderKey, [...(byOrder.get(t.orderKey) ?? []), t]);
  }
  return [...byOrder.values()]
    .map((group) => ({
      // The stake is what left the account: contracts plus the fee.
      amount: round2(group.reduce((s, t) => s + t.money + t.fee, 0)),
      // A winning contract pays exactly $1, so the count IS the To
      // Collect.
      payout: round2(group.reduce((s, t) => s + t.count, 0)),
      createdAt: group.map((t) => t.time).sort()[0],
    }))
    .filter((b) => b.amount > 0 && b.payout > 0)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// The picks inside a bet. A multivariate market becomes a real
// parlay: one leg per selected market, each with its own sport, its
// description from that market's own title when it was fetched, and
// its own result the moment its game decides, which is how the app's
// per-pick records work. Everything else is a single.
function legsFor(
  ticker: string,
  side: "yes" | "no",
  status: BetDraft["status"],
  cashedOut: boolean,
  meta: Map<string, KalshiMarketMeta>,
  series: Map<string, KalshiSeriesMeta>
): LegDraft[] {
  const m = meta.get(ticker);
  const mve = m?.mveLegs ?? [];

  if (side === "yes" && mve.length >= 2) {
    // The parent title reads "yes Atletico,yes Pittsburgh": the
    // fallback description when a leg's own market was not fetched.
    const segments = (m?.title ?? "").split(",");
    return mve.map((leg, i) => {
      const legMeta = meta.get(leg.market_ticker);
      const fallback = (segments[i] ?? leg.market_ticker)
        .replace(/^\s*(yes|no)\s+/i, "")
        .trim();
      const base = legMeta?.title?.trim() || fallback || leg.market_ticker;
      const wantsNo = leg.side.toLowerCase() === "no";
      const result =
        legMeta?.result === "yes" || legMeta?.result === "no"
          ? legMeta.result === leg.side.toLowerCase()
            ? "won"
            : "lost"
          : "pending";
      // Each pick carries ITS OWN classification: a cross-category
      // parlay's tennis leg is Tennis Moneyline, never the parent's
      // container.
      const cls = classifyMarket(leg.market_ticker, series);
      return {
        sport: sportFor(leg.market_ticker, series),
        description: wantsNo ? `${base} (No)` : base,
        result,
        subcategory: cls.category,
        market: cls.market,
        period: cls.period,
        competition: cls.competition,
        providerMarket: cls.providerMarket,
      };
    });
  }

  const title = m?.title?.trim() || ticker;
  const sportTicker = m?.event_ticker || ticker;
  const cls = classifyMarket(sportTicker, series);
  return [
    {
      sport: sportFor(sportTicker, series),
      description: side === "no" ? `${title} (No)` : title,
      // A cashed out bet's picks stay pending and inherit the cash
      // out outcome through effectiveResult, the app's own rule.
      result: cashedOut ? "pending" : status,
      subcategory: cls.category,
      market: cls.market,
      period: cls.period,
      competition: cls.competition,
      providerMarket: cls.providerMarket,
    },
  ];
}

// THE HISTORY FLOOR. Actuals promises on four screens that a history
// import reaches back to one date, so the import has to obey it.
//
// The rule works on MARKETS, not on single fills, and that is the
// whole point. Dropping fills alone would keep a market whose first
// buy landed in June and whose second landed in July, and derive its
// bet from half the money: a wrong stake, a wrong payout, a wrong
// profit. A bet belongs to the record only if it STARTED inside the
// promised window, so one fill older than the floor disqualifies its
// whole market.
//
// The caller must walk slightly past the floor for this to see the
// disqualifying fills. Kalshi's own paging does that naturally: a
// page stops after the first row older than the floor, so the rest of
// that page is exactly the evidence needed.
export function clampToStart(
  fills: KalshiFill[],
  startIso: string
): KalshiFill[] {
  const started_before = new Set(
    fills.filter((f) => f.created_time < startIso).map((f) => f.ticker)
  );
  return fills.filter(
    (f) => f.created_time >= startIso && !started_before.has(f.ticker)
  );
}

export function deriveBets(
  fills: KalshiFill[],
  settlements: KalshiSettlement[],
  meta: Map<string, KalshiMarketMeta>,
  series: Map<string, KalshiSeriesMeta> = new Map()
): BetDraft[] {
  const settled = new Map(settlements.map((s) => [s.ticker, s]));
  const byPosition = new Map<string, Trade[]>();
  for (const f of fills) {
    const t = toTrade(f);
    if (!t) continue;
    const key = `${t.ticker}:${t.positionSide}`;
    byPosition.set(key, [...(byPosition.get(key) ?? []), t]);
  }

  const out: BetDraft[] = [];
  for (const [key, trades] of byPosition) {
    const ticker = key.slice(0, key.lastIndexOf(":"));
    const side = key.slice(key.lastIndexOf(":") + 1) as "yes" | "no";

    const buys = mergeBuys(trades.filter((t) => t.isBuy));
    if (buys.length === 0) continue;

    const sells = trades.filter((t) => !t.isBuy);
    // Net of fees, for the same reason a buy's stake includes them.
    const sellRevenue = round2(
      sells.reduce((s, t) => s + t.money - t.fee, 0)
    );
    const boughtCount = trades
      .filter((t) => t.isBuy)
      .reduce((s, t) => s + t.count, 0);
    const soldCount = sells.reduce((s, t) => s + t.count, 0);

    const stake = round2(buys.reduce((s, b) => s + b.amount, 0));
    const toCollect = round2(buys.reduce((s, b) => s + b.payout, 0));
    if (stake <= 0 || toCollect <= 0) continue;

    const settlement = settled.get(ticker);
    const lastSell = sells
      .map((t) => t.time)
      .sort()
      .at(-1);

    let status: BetDraft["status"] = "pending";
    let payout: number | null = null;
    let settledAt: string | null = null;
    let cashedOut = false;

    // Closing the whole position first, BEFORE settlement: a market
    // that later settles adds nothing to a position of zero, and in
    // the app's language leaving early is a cash out whatever the
    // market did afterwards. At or above stake counts as won, below
    // as lost, profit is always payout minus stake.
    if (soldCount >= boughtCount) {
      cashedOut = true;
      payout = sellRevenue;
      status = sellRevenue >= stake ? "won" : "lost";
      settledAt = lastSell ?? null;
    } else if (settlement) {
      const won = (settlement.market_result ?? "").toLowerCase() === side;
      const heldAtSettle = Math.max(0, boughtCount - soldCount);
      // Contracts held times the $1 a winner pays, plus whatever
      // partial sells brought in along the way. The settlement's own
      // revenue field is not used: it read 0 on a market the owner
      // had traded, and its unit is undocumented.
      const total = round2((won ? heldAtSettle : 0) + sellRevenue);
      status = won ? "won" : "lost";
      // A plain lost bet stores NO payout, the app's own convention.
      payout = total > 0 ? total : null;
      settledAt = settlement.settled_time ?? lastSell ?? null;
    }

    out.push({
      externalId: `kalshi:${ticker}:${side}`,
      stake,
      // The odds checks in the database demand > 1.00. Fees can push
      // a near-certain market's real ratio to 1.00 or below; the
      // clamp keeps the bet importable, and the settled money (stake
      // and payout) stays exact regardless.
      totalOdds: Math.max(1.01, round4(toCollect / stake)),
      status,
      placedAt: buys[0].createdAt,
      settledAt,
      payout,
      cashedOut,
      legs: legsFor(ticker, side, status, cashedOut, meta, series),
      buys,
    });
  }

  return out.sort((a, b) => a.placedAt.localeCompare(b.placedAt));
}
