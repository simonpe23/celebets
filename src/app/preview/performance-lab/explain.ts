// WHAT EVERY NUMBER MEANS, job 6. One dictionary, one line each,
// serving the (i) dots on Lab, Totals, Compare and the Heat Map.
//
// One place, because a number explained two ways is a number nobody
// trusts. It is the same reason every money rule lives in
// src/lib/stats.ts.
//
// THE VOCABULARY IS CHECKED. "wallet", "deposit" and "withdrawal" are
// banned from anything a person reads. design-check rule 7 fails the
// build on them, and jumptest.mjs checks the rendered card too.
//
// NET PROFIT MEANS TWO DIFFERENT THINGS AND THIS FILE ONLY EXPLAINS
// ONE OF THEM. On Lab, Totals and Compare the figure is the profit of
// THE BETS IN THAT VIEW: pick Football, or This month, and the number
// is theirs, not the account's. The account's own net profit is
// `balance + withdrawals - deposits` from docs/business-rules.md, and
// no page here shows it: these previews are computed from a bet
// fixture with no balance at all. The first build of this dictionary
// gave the account definition on both pages, which was wrong the
// moment anything was selected. When the real Home lands with a true
// account figure, it needs its own entry; do not reuse this one.

export const EXPLAIN: Record<string, { title: string; line: string }> = {
  "Net profit": {
    title: "Net profit",
    line: "What the bets behind this number made or lost: everything they returned, minus everything you staked on them. With nothing selected and All time chosen, that is your whole record.",
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
