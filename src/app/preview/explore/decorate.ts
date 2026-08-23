import type { BetWithLegs, Leg } from "@/lib/types";
import { previewBets } from "../data";

// PREVIEW ONLY, like everything in this gitignored folder.
//
// The shared fixture predates the competition and period work, so its
// legs carry nulls in the dimension fields. This file decorates the
// SAME bets with realistic dimension values, keyed on the pick's
// description, and money is never touched: every stake, payout and
// outcome stays exactly as the fixture pinned them, so this page's
// net profit agrees with Track and Performance to the cent.
//
// It also adds four Football Match Props bets, because the fixture
// has only one (BTTS) and the whole point of the Market level is the
// drill Match Props -> BTTS / Corners / First to Score. The four are
// two wins and two losses that cancel to exactly $0, all inside
// Football, so the pinned figures survive: net profit unchanged,
// best sport gap unchanged.

// description -> [competition, period]. A missing entry means the
// pick keeps null, which the page must handle honestly anyway.
const FOOTBALL: Record<string, [string, string | null]> = {
  "Real Madrid to win": ["La Liga", "1st Half"],
  "Arsenal to win": ["Premier League", null],
  "Feyenoord to win": ["Eredivisie", null],
  "Sevilla to win": ["La Liga", null],
  "PSG to win": ["Ligue 1", null],
  "Porto -1": ["Champions League", null],
  "Roma to win": ["Serie A", null],
  "Benfica to win": ["Champions League", null],
  "Lyon to win": ["Champions League", null],
  "Over 2.5 goals": ["Premier League", null],
  "Napoli to win": ["Serie A", null],
  "Inter to win": ["Serie A", null],
  "Bayern -1.5": ["Bundesliga", null],
  "Both teams to score": ["Premier League", null],
  "Over 1.5 goals": ["Bundesliga", "1st Half"],
  "Ajax to win": ["Eredivisie", null],
};

const TENNIS_COMP: Record<string, string> = {
  "Alcaraz to win": "Wimbledon",
  "Swiatek to win": "Roland Garros",
  "Sinner in straight sets": "ATP",
  "Medvedev to win": "US Open",
  "Sabalenka to win": "WTA",
  "Rybakina to win": "WTA",
  "Ruud to win": "ATP",
};

// Tennis picks that stay No category on purpose: the honest state a
// manual pick is in when its user never chose one.
const TENNIS_NO_CATEGORY = new Set(["Gauff to win", "Fritz to win"]);

const ESPORTS_COMP: Record<string, string> = {
  "Navi to win": "CS2",
  "FaZe to win": "CS2",
  "G2 to win map 1": "CS2",
  "T1 to win": "League of Legends",
  "Fnatic to win": "League of Legends",
};

function decorateLeg(bet: BetWithLegs, leg: Leg): Leg {
  const d = leg.description ?? "";
  if (leg.sport === "Football") {
    const hit = FOOTBALL[d];
    if (hit) return { ...leg, competition: hit[0], period: hit[1] };
    return leg;
  }
  if (leg.sport === "American Football") return { ...leg, competition: "NFL" };
  if (leg.sport === "Basketball") return { ...leg, competition: "NBA" };
  if (leg.sport === "Baseball") return { ...leg, competition: "MLB" };
  if (leg.sport === "Ice Hockey") return { ...leg, competition: "NHL" };
  if (leg.sport === "esports") {
    return { ...leg, competition: ESPORTS_COMP[d] ?? null };
  }
  if (leg.sport === "Tennis") {
    if (TENNIS_NO_CATEGORY.has(d)) return leg;
    return {
      ...leg,
      subcategory: leg.subcategory ?? "Moneyline",
      market: leg.market ?? "Match Winner",
      competition: TENNIS_COMP[d] ?? null,
    };
  }
  if (leg.sport === "Crypto") {
    // One pick stays Unclassified with its provider words kept, the
    // honest shape of a Kalshi series no rule covered.
    if (d === "SOL above 250") {
      return {
        ...leg,
        subcategory: "Unclassified",
        provider_market: "Solana price range at close",
      };
    }
    return {
      ...leg,
      subcategory: "Price Direction",
      market: "Price Direction",
      provider_market: "Bitcoin price today",
    };
  }
  return leg;
}

function daysAgo(days: number, hour = 18): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// The four zero-net Match Props bets. Wins pay stake * 2 so each
// win's profit equals its stake, and each is paired with a loss of
// the same stake: +100 -100 +80 -80 = 0.
function matchProp(
  id: string,
  market: string,
  description: string,
  competition: string,
  stake: number,
  won: boolean,
  days: number
): BetWithLegs {
  return {
    id,
    stake,
    total_odds: 2,
    status: won ? "won" : "lost",
    placed_at: daysAgo(days, 9),
    settled_at: daysAgo(days),
    payout: won ? stake * 2 : 0,
    cashed_out: false,
    bet_buys: [],
    legs: [
      {
        id: `${id}a`,
        sport: "Football",
        description,
        odds: 2,
        result: won ? "won" : "lost",
        subcategory: "Match Props",
        market,
        period: null,
        competition,
        provider_market: null,
      },
    ],
  };
}

const EXTRA: BetWithLegs[] = [
  matchProp("mp1", "Corners", "Over 9.5 corners", "Premier League", 100, true, 19),
  matchProp("mp2", "Corners", "Over 10.5 corners", "La Liga", 100, false, 12),
  matchProp("mp3", "First to Score", "City first to score", "Premier League", 80, true, 8),
  matchProp("mp4", "First to Score", "Arsenal first to score", "Serie A", 80, false, 5),
];

export const exploreBets: BetWithLegs[] = [
  ...previewBets.map((bet) => ({
    ...bet,
    legs: bet.legs.map((leg) => decorateLeg(bet, leg)),
  })),
  ...EXTRA,
];
