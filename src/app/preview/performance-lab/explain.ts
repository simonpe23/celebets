// WHAT EVERY NUMBER MEANS, job 6. One dictionary, one line each,
// serving the (i) dots on Lab, Totals, Compare and the Heat Map.
//
// One place, because a number explained two ways is a number nobody
// trusts. It is the same reason every money rule lives in
// src/lib/stats.ts.
//
// THE VOCABULARY IS CHECKED. "wallet", "deposit" and "withdrawal" are
// banned from anything a person reads, so Net profit is written in the
// words the product actually uses: Tracking Balance, Add, Remove.
// design-check rule 7 fails the build on the banned ones.

export const EXPLAIN: Record<string, { title: string; line: string }> = {
  "Net profit": {
    title: "Net profit",
    line: "Your Tracking Balance, plus everything you have removed, minus everything you have added. One definition, the same on every screen.",
  },
  ROI: {
    title: "ROI",
    line: "What you made for every dollar you put at risk. +20% means twenty cents back on each dollar staked.",
  },
  "Hit rate": {
    title: "Hit rate",
    line: "The share of your picks that won. It says nothing about the money: a 30% hit rate at long odds can beat a 70% one at short.",
  },
  Record: {
    title: "Record",
    line: "Picks won and lost, not bet slips. A three pick parlay counts as three picks.",
  },
  "Avg stake": {
    title: "Average stake",
    line: "What you put on a typical bet in this view. A bigger one is not a better one.",
  },
  "Performance map": {
    title: "Performance map",
    line: "Every tile is one fact from your record: a sport, a league, a category, anything. Size is how much money it moved, colour is which way it went.",
  },
  "Map sizing": {
    title: "About the sizes",
    line: "These facts overlap. One Moneyline bet on Arsenal is a Moneyline pick and a Premier League pick and a Football pick, so the tiles do not add up to your net profit. Each tile's size is how much that one thing moved.",
  },
  "Total bets": {
    title: "Total bets",
    line: "Settled bet slips in this view. A parlay is one bet, however many picks are on it.",
  },
  "Avg odds": {
    title: "Average odds",
    line: "The typical decimal odds you took in this view. 2.00 doubles your stake.",
  },
};
