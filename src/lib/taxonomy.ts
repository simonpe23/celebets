import type { Sport } from "./types";

// THE ACTUALS TAXONOMY. Locked with the owner on 21 August 2026
// after three planning rounds, and the lock matters: implementation
// must not quietly reshape it. The model:
//
//   Category  = a repeatable betting SKILL ("am I good at X?")
//   Market    = the controlled, Actuals-owned instrument of that
//               skill (Match Winner, To Advance, Team Total, BTTS)
//   Domain / Sport / Competition / Period = independent DIMENSIONS
//   Raw provider data = preserved separately, the explainability
//               trail from every classification back to its source
//
// These are dimensions of one pick, never a ladder: Competition does
// not live under Market, a competition holds many categories and one
// category spans many competitions.
//
// THE THREE STRUCTURAL RULES:
// 1. Categories are registered PER DOMAIN, owned by Actuals. Sports
//    is simply the most mature register; Politics or Weather earn
//    their own lists the day real markets justify them. The Sport
//    dimension chooses what is OFFERED, it never owns the taxonomy.
// 2. A provider mapper's only legal outputs are registered values or
//    Unclassified. No provider can mint a category, which is how
//    "same bet = same category" survives new integrations.
// 3. Unclassified is the ONLY fallback. Match Props has explicit
//    membership and never catches strays; a domain without a
//    register produces honest Unclassified picks, not an invented
//    taxonomy. Wrong analytics are worse than incomplete analytics.
//
// Distinct on purpose: a manual bet whose user never picked a
// category stores NULL ("No category"), while a failed
// classification stores UNCLASSIFIED. Two different facts.

export const UNCLASSIFIED = "Unclassified";

// ---------------------------------------------------------------
// DOMAINS. Derived from the existing sport field, no new storage:
// every sport value maps to exactly one domain.
// ---------------------------------------------------------------

export type Domain =
  | "Sports"
  | "Politics"
  | "Economics"
  | "Entertainment"
  | "Weather"
  | "Companies"
  | "Tech & Science"
  | "Health"
  | "World"
  | "Other";

const SPORTS_DOMAIN: Sport[] = [
  "Football",
  "American Football",
  "Basketball",
  "Baseball",
  "Ice Hockey",
  "Tennis",
  "Golf",
  "esports",
  "Cricket",
  "MMA",
  "Rugby",
  "Motorsport",
  "Boxing",
  "Table Tennis",
];

// Level 2 values that do not name their own domain. Crypto sits
// under Economics by the owner's ruling (21 August 2026): a BTC price
// bet is a financial bet, and Crypto as its own domain made the top
// level longer without making it clearer.
const LEVEL_TWO_DOMAINS: Record<string, Domain> = {
  Crypto: "Economics",
};

export function domainOf(sport: Sport): Domain {
  if ((SPORTS_DOMAIN as string[]).includes(sport)) return "Sports";
  return LEVEL_TWO_DOMAINS[sport] ?? (sport as Domain);
}

// ---------------------------------------------------------------
// THE CATEGORY REGISTER, per domain. Empty means "no real markets
// have justified a taxonomy yet": their picks classify to
// Unclassified until evidence arrives, never to an invented list.
// ---------------------------------------------------------------

export const DOMAIN_CATEGORIES: Partial<Record<Domain, readonly string[]>> = {
  Sports: [
    "Moneyline",
    "Spread / Handicap",
    "Totals (Over/Under)",
    "Correct Score",
    "Player Props",
    "Match Props",
    "Tournament Winner",
    // Added 21 August 2026 after auditing Kalshi's whole catalog with
    // the owner: awards and player movement are each about a tenth of
    // their sports series, and each is a distinct skill (reading award
    // voting, reading the transfer market) rather than reading a game.
    "Awards",
    "Transfers & Moves",
  ],
  // Crypto's price markets live in the Economics domain now.
  Economics: ["Price Direction"],
};

// The controlled market vocabulary inside each category. Match Props
// is EXPLICIT MEMBERSHIP ONLY: additions are a deliberate edit here,
// never a fallback.
export const CATEGORY_MARKETS: Record<string, readonly string[]> = {
  Moneyline: ["Match Winner", "To Advance"],
  "Spread / Handicap": ["Spread", "Goal Difference"],
  "Totals (Over/Under)": ["Match Total", "Team Total"],
  "Correct Score": ["Correct Score"],
  // The union across sports, for validating an imported pick. The
  // manual picker uses marketsFor(), which narrows to the sport.
  "Player Props": [
    "Runs",
    "Wickets",
    "Rounds",
    "Method of Victory",
    "Goalscorer",
    "Assists",
    "Score or Assist",
    "Shots",
    "Passing Yards",
    "Rushing Yards",
    "Receiving Yards",
    "Touchdowns",
    "Points",
    "Rebounds",
    "Threes",
    "Strikeouts",
    "Hits",
    "Home Runs",
    "Goals",
    "Saves",
    "Aces",
    "Games Won",
    "Top 10",
    "Made Cut",
    "Kills",
    "Maps Won",
    "Player Stat",
  ],
  "Match Props": ["BTTS", "Corners", "First to Score"],
  "Tournament Winner": ["Tournament Winner"],
  "Awards": ["MVP", "Player of the Year", "Coach of the Year", "Trophy"],
  "Transfers & Moves": ["Next Team", "Next Coach", "Retirement"],
  "Price Direction": ["Price Direction"],
};

// PLAYER PROP MARKETS ARE PER SPORT. Offering a basketball bettor
// "Goalscorer" was the football-only vocabulary flaw; these are the
// owner's approved lists (21 August 2026), deliberately short so the
// picker stays scannable, extended later from real usage.
export const PLAYER_PROP_MARKETS: Partial<Record<Sport, readonly string[]>> = {
  Football: ["Goalscorer", "Assists", "Score or Assist", "Shots"],
  "American Football": [
    "Passing Yards",
    "Rushing Yards",
    "Receiving Yards",
    "Touchdowns",
  ],
  Basketball: ["Points", "Rebounds", "Assists", "Threes"],
  Baseball: ["Strikeouts", "Hits", "Home Runs"],
  "Ice Hockey": ["Goals", "Assists", "Shots", "Saves"],
  Tennis: ["Aces", "Games Won"],
  Golf: ["Top 10", "Made Cut"],
  esports: ["Kills", "Maps Won"],
  Cricket: ["Runs", "Wickets"],
  Boxing: ["Rounds", "Method of Victory"],
  MMA: ["Rounds", "Method of Victory"],
};

// The markets a sport actually offers inside a category: Player
// Props swaps in its own per-sport vocabulary, everything else is
// the same list for every sport.
export function marketsFor(category: string, sport: Sport): readonly string[] {
  if (category === "Player Props") return PLAYER_PROP_MARKETS[sport] ?? [];
  return CATEGORY_MARKETS[category] ?? [];
}

// Which of the domain's categories the manual picker OFFERS for a
// sport (the sport dimension selects, it does not own). Football has
// the full set; other sports lose the football-specific families.
const FOOTBALL_ONLY = new Set(["Correct Score", "Match Props"]);
export function categoriesForSport(sport: Sport): readonly string[] {
  const domain = domainOf(sport);
  const registered = DOMAIN_CATEGORIES[domain] ?? [];
  if (domain !== "Sports") return registered;
  if (sport === "Football") return registered;
  return registered.filter((c) => !FOOTBALL_ONLY.has(c));
}

// Period vocabularies are sport-appropriate, never a universal
// assumption. Only sports with real period bets in the data have
// one; null stored means full match / unspecified, and no fake
// "Full match" default is ever written.
export const SPORT_PERIODS: Partial<Record<Sport, readonly string[]>> = {
  Football: ["1st Half", "2nd Half"],
};

// A provider mapper result is only valid if the category is
// registered in the pick's domain. This is rule 2 with teeth.
export function validated(
  domain: Domain,
  c: Classification
): Classification {
  if (c.category === UNCLASSIFIED) return c;
  const registered = DOMAIN_CATEGORIES[domain] ?? [];
  if (!registered.includes(c.category)) {
    return { category: UNCLASSIFIED, market: null, period: c.period, competition: c.competition };
  }
  return c;
}

export type Classification = {
  category: string; // a registered category, or UNCLASSIFIED
  market: string | null;
  period: string | null;
  competition: string | null;
};

// ---------------------------------------------------------------
// THE KALSHI MAPPER. Kalshi's series title is always competition +
// market type mashed together ("World Cup Correct Score", "La Liga
// Game"), measured off the owner's real accounts on 20 August 2026.
// Every rule below is evidence-backed by real bets; anything no rule
// covers is Unclassified, visibly, never a guess.
// ---------------------------------------------------------------

type Rule = {
  // Matched against the lowercased title (period phrases removed).
  match: RegExp;
  category: string;
  market: string;
  // Keep the whole title as the competition instead of stripping the
  // matched words (used where the title IS the competition).
  keepTitle?: boolean;
  // No competition dimension exists for this rule (crypto price
  // markets have no World Cup).
  noCompetition?: boolean;
};

const KALSHI_RULES: Rule[] = [
  // Most specific first.
  //
  // THE CATALOG ROUND (21 August 2026): rules below this comment came
  // from auditing all 13,338 Kalshi series rather than the owner's
  // own trades, which is what closes the coverage hole an NFL or NBA
  // bettor would have fallen into. Junk titles ("test", "DONT USE")
  // and one-off novelties stay Unclassified on purpose.

  // AWARDS. "AP Pro Football Defensive Rookie of the Year", "NHL
  // Hart Memorial Trophy", "Pro Baseball Gold Glove".
  { match: /\bmvp\b/, category: "Awards", market: "MVP" },
  {
    match: /(player|rookie|comeback player) of the year/,
    category: "Awards",
    market: "Player of the Year",
  },
  {
    match: /(coach|manager) of the year/,
    category: "Awards",
    market: "Coach of the Year",
  },
  {
    match: /\b(trophy|gold glove|award|cy young|heisman|ballon)\b/,
    category: "Awards",
    market: "Trophy",
  },

  // TRANSFERS AND MOVES. "Lebron's Next Team", "Stanford Next Coach",
  // "Messi retirement".
  {
    match: /next team|transfers?\b|\bsigns?\b|\bdrafted\b|draft position/,
    category: "Transfers & Moves",
    market: "Next Team",
  },
  {
    match: /next (coach|manager)|\bcoach\b.*\b(out|hired|fired)\b/,
    category: "Transfers & Moves",
    market: "Next Coach",
  },
  { match: /retirement|retires?\b/, category: "Transfers & Moves", market: "Retirement" },

  // QUALIFYING. "Playoff Qualifiers", "Serie A Relegation", "Top 4
  // Finishers": all "does this team get through", which is the To
  // Advance market inside Moneyline.
  {
    match: /qualifiers?\b|qualify|relegation|knockout|top \d+ (finishers?|points scorer)|playoff qualifier/,
    category: "Moneyline",
    market: "To Advance",
  },

  // PLAYER STATS. "Pro Football Passing Touchdowns", "NBA Player
  // Assists", "WTA Tennis Aces", "Pro Baseball Outs Recorded".
  { match: /passing (yards|touchdowns|completions)/, category: "Player Props", market: "Passing Yards" },
  { match: /rushing yards/, category: "Player Props", market: "Rushing Yards" },
  { match: /receiving yards|receptions/, category: "Player Props", market: "Receiving Yards" },
  { match: /anytime goalscorer|goalscorer|goal contributions/, category: "Player Props", market: "Goalscorer" },
  { match: /player (points \+ rebounds|points|pts)|points \+ rebounds/, category: "Player Props", market: "Points" },
  { match: /player rebounds|\brebounds\b/, category: "Player Props", market: "Rebounds" },
  { match: /player assists/, category: "Player Props", market: "Assists" },
  { match: /\baces\b/, category: "Player Props", market: "Aces" },
  { match: /strikeouts/, category: "Player Props", market: "Strikeouts" },
  { match: /home runs?\b/, category: "Player Props", market: "Home Runs" },
  { match: /\bsaves\b/, category: "Player Props", market: "Saves" },
  { match: /interceptions?\b|outs recorded|stats? leaders?|season stat/, category: "Player Props", market: "Player Stat" },

  // SEASON TOTALS. "Pro football exact wins Houston", "Team Rushing
  // Yards", "T20 Total Runs", "World Cup Goals Allowed".
  {
    match: /exact wins|\bwins\b [a-z]|team (points|rushing yards|goals)|goals allowed/,
    category: "Totals (Over/Under)",
    market: "Team Total",
  },

  // CHAMPIONS. "ACC Champion", "SEC Regular Season Champions".
  { match: /champions?\b/, category: "Tournament Winner", market: "Tournament Winner" },
  { match: /team total/, category: "Totals (Over/Under)", market: "Team Total" },
  { match: /\btotals?\b/, category: "Totals (Over/Under)", market: "Match Total" },
  { match: /correct score/, category: "Correct Score", market: "Correct Score" },
  { match: /btts|both teams to score/, category: "Match Props", market: "BTTS" },
  { match: /corners?\b/, category: "Match Props", market: "Corners" },
  { match: /first (goal|to score|team to score)/, category: "Match Props", market: "First to Score" },
  { match: /spread/, category: "Spread / Handicap", market: "Spread" },
  { match: /goal difference/, category: "Spread / Handicap", market: "Goal Difference" },
  { match: /advance/, category: "Moneyline", market: "To Advance" },
  // "World Cup Goal" holds player goalscorer props ("Lamine Yamal:
  // 1+ goals"), proven by the owner's own bets.
  { match: /\bgoals?$/, category: "Player Props", market: "Goalscorer" },
  // "Men's World Cup winner". Guarded so a "... Match Winner" title
  // could never read as a futures market. Named Tournament Winner
  // (the owner, 21 August): "outright" is trade jargon, and it sat
  // next to Moneyline in the picker confusing which was which.
  {
    match: /winner\s*$/,
    category: "Tournament Winner",
    market: "Tournament Winner",
  },
  { match: /friendl/, category: "Moneyline", market: "Match Winner", keepTitle: true },
  { match: /\b(game|match|matches)\b/, category: "Moneyline", market: "Match Winner" },
  // Kalshi's 15-minute crypto markets ("Bitcoin price up down").
  {
    match: /price (up|down|direction)/,
    category: "Price Direction",
    market: "Price Direction",
    noCompetition: true,
  },
];

function cleanCompetition(raw: string): string | null {
  const cleaned = raw
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s:,-]+|[\s:,-]+$/g, "")
    .trim();
  return cleaned === "" ? null : cleaned;
}

export function classifyKalshi(
  seriesTitle: string | null | undefined,
  ticker: string
): Classification {
  const title = (seriesTitle ?? "").trim();
  const upperTicker = ticker.toUpperCase();

  // A multivariate (parlay container) market is many skills at once,
  // so the container itself is never one category. Its legs classify
  // through their own series.
  if (upperTicker.includes("MVE")) {
    return { category: UNCLASSIFIED, market: null, period: null, competition: null };
  }

  // The period dimension, lifted out before market matching so
  // "World Cup 1st Half Total" would read as a Totals bet in the
  // first half, not as a strange market name.
  let period: string | null = null;
  let working = title;
  const periodMatch = working.match(/1st half|first half|2nd half|second half/i);
  if (periodMatch) {
    period = /2nd|second/i.test(periodMatch[0]) ? "2nd Half" : "1st Half";
    working = working.replace(periodMatch[0], " ");
  }

  const lower = working.toLowerCase();
  for (const rule of KALSHI_RULES) {
    const m = lower.match(rule.match);
    if (!m) continue;
    if (
      rule.category === "Tournament Winner" &&
      /\b(game|match)\b/.test(lower)
    ) {
      continue;
    }
    const competition = rule.noCompetition
      ? null
      : rule.keepTitle
        ? cleanCompetition(title)
        : cleanCompetition(
            working.slice(0, m.index) + " " + working.slice((m.index ?? 0) + m[0].length)
          );
    return { category: rule.category, market: rule.market, period, competition };
  }

  // A bare title once the period is removed ("World Cup 1st Half"):
  // its real bets are half-time results ("Will France win the 1st
  // Half?"), so it is a Moneyline with a period, evidence-backed.
  if (period !== null && cleanCompetition(lower) !== null) {
    return {
      category: "Moneyline",
      market: "Match Winner",
      period,
      competition: cleanCompetition(working),
    };
  }

  // Some series carry the market word only in the TICKER ("Challenger
  // ATP " with KXATPCHALLENGERMATCH). The title is then the
  // competition whole.
  if (/GAME|MATCH/.test(upperTicker)) {
    return {
      category: "Moneyline",
      market: "Match Winner",
      period,
      competition: cleanCompetition(title),
    };
  }

  return { category: UNCLASSIFIED, market: null, period, competition: null };
}

// ---------------------------------------------------------------
// THE MANUAL LEGACY MAP. The owner's curated pre-taxonomy labels,
// migrated once by phase12.sql; this mirror exists so the tests can
// enforce that a manually entered bet and its imported twin land in
// the same category. "1st half / 2nd half" maps to 1st Half because
// every real bet under it was a first-half result, the owner's own
// listing (21 August 2026).
// ---------------------------------------------------------------

export const MANUAL_LEGACY: Record<
  string,
  { category: string; market: string; period?: string }
> = {
  "Win-bet / Moneyline": { category: "Moneyline", market: "Match Winner" },
  "Goal Difference": { category: "Spread / Handicap", market: "Goal Difference" },
  "Points Total": { category: "Totals (Over/Under)", market: "Match Total" },
  "Team Points Total": { category: "Totals (Over/Under)", market: "Team Total" },
  "1st half / 2nd half": {
    category: "Moneyline",
    market: "Match Winner",
    period: "1st Half",
  },
  "BTTS (Both Teams to Score)": { category: "Match Props", market: "BTTS" },
  "Correct Score": { category: "Correct Score", market: "Correct Score" },
  Corners: { category: "Match Props", market: "Corners" },
  "First team to score": { category: "Match Props", market: "First to Score" },
};

export function migrateManualLabel(
  old: string
): { category: string; market: string; period: string | null } | null {
  const direct = MANUAL_LEGACY[old];
  if (direct) {
    return {
      category: direct.category,
      market: direct.market,
      period: direct.period ?? null,
    };
  }
  if (old.startsWith("Player Props: ")) {
    return {
      category: "Player Props",
      market: old.slice("Player Props: ".length).trim(),
      period: null,
    };
  }
  return null;
}

// Free text arriving through the manual door (the bet-slip parser's
// AI reading, mostly) must not mint categories any more than a
// provider can. An exact match on a registered category or a legacy
// label coerces; anything else becomes null, a bet with no category,
// never a junk row in the analytics.
export function coerceManualCategory(
  label: string
): { category: string; market: string | null; period: string | null } | null {
  const trimmed = label.trim();
  if (trimmed === "") return null;
  const lower = trimmed.toLowerCase();
  for (const cats of Object.values(DOMAIN_CATEGORIES)) {
    for (const cat of cats ?? []) {
      if (cat.toLowerCase() === lower) {
        return { category: cat, market: null, period: null };
      }
    }
  }
  return migrateManualLabel(trimmed);
}
