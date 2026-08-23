import { effectiveResult, legShares, legStakeShares } from "@/lib/stats";
import type { BetWithLegs, Leg } from "@/lib/types";
import { exploreBets } from "../explore/decorate";

// Shared numbers for the three art directions. One computed state so
// all three show the SAME screen: Football selected, every other
// group re-scored to inside Football. Local preview, gitignored.

export interface Fact {
  icon: string;
  label: string;
  money: number;
  wins: number;
  losses: number;
  selected?: boolean;
  muted?: boolean;
}

export interface Group {
  key: string;
  label: string;
  allLabel: string;
  facts: Fact[];
}

const settled = exploreBets.filter(
  (b) => b.status !== "pending" && b.settled_at !== null
);

function pickCount(bet: BetWithLegs): number {
  return Math.max(1, (bet.bet_buys ?? []).length);
}

type Test = (bet: BetWithLegs, leg: Leg) => boolean;

function stats(test: Test) {
  const s = { wins: 0, losses: 0, profit: 0, staked: 0 };
  for (const bet of settled) {
    const shares = legShares(bet);
    const stakes = legStakeShares(bet);
    const isSingle = bet.legs.length === 1;
    bet.legs.forEach((leg, i) => {
      if (!test(bet, leg)) return;
      const result = effectiveResult(bet, leg);
      const picks = isSingle ? pickCount(bet) : 1;
      if (result === "won") s.wins += picks;
      if (result === "lost") s.losses += picks;
      s.profit += shares[i] ?? 0;
      s.staked += stakes[i] ?? 0;
    });
  }
  return s;
}

const inFootball: Test = (_b, leg) => leg.sport === "Football";

const SPORT_ICONS: Record<string, string> = {
  Football: "⚽",
  Baseball: "⚾",
  Tennis: "\u{1F3BE}",
  Crypto: "\u{1FA99}",
  "Ice Hockey": "\u{1F3D2}",
  "American Football": "\u{1F3C8}",
  esports: "\u{1F3AE}",
  Basketball: "\u{1F3C0}",
};

const WHAT_ICONS: Record<string, string> = {
  Moneyline: "\u{1F3AF}",
  "Spread / Handicap": "⚖️",
  "Match Props": "\u{1F9E9}",
  BTTS: "\u{1F945}",
  "Totals (Over/Under)": "\u{1F522}",
  Corners: "\u{1F6A9}",
  "First to Score": "⚡",
  "Player Props": "\u{1F3C3}",
  "Price Direction": "\u{1F4C8}",
  "No category": "▫️",
};

const WHERE_ICONS: Record<string, string> = {
  "Premier League": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "Champions League": "\u{1F3C6}",
  "La Liga": "\u{1F1EA}\u{1F1F8}",
  Eredivisie: "\u{1F1F3}\u{1F1F1}",
  "Ligue 1": "\u{1F1EB}\u{1F1F7}",
  Bundesliga: "\u{1F1E9}\u{1F1EA}",
  "Serie A": "\u{1F1EE}\u{1F1F9}",
};

function factsFor(
  values: string[],
  icons: Record<string, string>,
  testFor: (value: string) => Test,
  selectedValue?: string
): Fact[] {
  return values
    .map((v) => {
      const s = stats(testFor(v));
      return {
        icon: icons[v] ?? "\u{1F4CA}",
        label: v,
        money: Math.round(s.profit),
        wins: s.wins,
        losses: s.losses,
        selected: v === selectedValue,
        muted: v === "No category",
      };
    })
    .filter((f) => f.wins + f.losses > 0 || f.selected)
    .sort((a, b) => b.money - a.money);
}

// The state every direction renders: Football is the question.
export const answer = (() => {
  const s = stats(inFootball);
  return {
    title: "Football",
    profit: Math.round(s.profit),
    wins: s.wins,
    losses: s.losses,
    hit: Math.round((s.wins / Math.max(1, s.wins + s.losses)) * 100),
    roi: s.staked > 0 ? ((s.profit / s.staked) * 100).toFixed(1) : "-",
    bets: settled.filter((b) => b.legs.some((l) => l.sport === "Football"))
      .length,
  };
})();

// Running Football profit for the answer chart, oldest first.
export const spark: number[] = (() => {
  const rows = settled
    .filter((b) => b.legs.some((l) => l.sport === "Football"))
    .sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );
  let run = 0;
  const out = [0];
  for (const bet of rows) {
    const shares = legShares(bet);
    bet.legs.forEach((leg, i) => {
      if (leg.sport === "Football") run += shares[i] ?? 0;
    });
    out.push(run);
  }
  return out;
})();

export const groups: Group[] = [
  {
    key: "sport",
    label: "Sport",
    allLabel: "All sports",
    facts: factsFor(
      Object.keys(SPORT_ICONS),
      SPORT_ICONS,
      (v) => (_b, leg) => leg.sport === v,
      "Football"
    ),
  },
  {
    key: "what",
    label: "What you bet",
    allLabel: "All bet types",
    facts: factsFor(
      [
        "Moneyline",
        "Spread / Handicap",
        "Match Props",
        "BTTS",
        "Totals (Over/Under)",
        "Corners",
        "First to Score",
      ],
      WHAT_ICONS,
      (v) => (b, leg) => {
        if (!inFootball(b, leg)) return false;
        if (["BTTS", "Corners", "First to Score"].includes(v))
          return (leg.market ?? "") === v;
        return (leg.subcategory ?? "No category") === v;
      }
    ),
  },
  {
    key: "where",
    label: "Where",
    allLabel: "All competitions",
    facts: factsFor(
      Object.keys(WHERE_ICONS),
      WHERE_ICONS,
      (v) => (b, leg) => inFootball(b, leg) && leg.competition === v
    ),
  },
  {
    key: "when",
    label: "When",
    allLabel: "All periods",
    facts: factsFor(
      ["Full time", "1st Half"],
      { "Full time": "⏱️", "1st Half": "\u{1F551}" },
      (v) => (b, leg) =>
        inFootball(b, leg) && (leg.period ?? "Full time") === v
    ),
  },
  {
    key: "how",
    label: "How",
    allLabel: "Singles vs parlays",
    facts: factsFor(
      ["Singles", "Parlays"],
      { Singles: "\u{1F3AB}", Parlays: "\u{1F9FE}" },
      (v) => (b, leg) =>
        inFootball(b, leg) &&
        (b.legs.length > 1 ? "Parlays" : "Singles") === v
    ),
  },
  {
    key: "risk",
    label: "Risk",
    allLabel: "All odds groups",
    facts: factsFor(
      ["Low odds", "Medium odds", "High odds"],
      {
        "Low odds": "\u{1F7E2}",
        "Medium odds": "\u{1F7E1}",
        "High odds": "\u{1F534}",
      },
      (v) => (b, leg) => {
        if (!inFootball(b, leg) || leg.odds === null) return false;
        const o = Number(leg.odds);
        if (v === "Low odds") return o <= 1.8;
        if (v === "Medium odds") return o > 1.8 && o <= 3;
        return o > 3;
      }
    ),
  },
];

export function moneyText(v: number): string {
  return `${v < 0 ? "-" : "+"}$${Math.abs(v).toLocaleString("en-US")}`;
}
