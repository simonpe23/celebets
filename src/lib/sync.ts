// ONE SWITCH FOR THE "NOT YET" COPY.
//
// Connecting a platform works; importing the bets does not, yet. So
// three screens carry a temporary line saying so, and the owner's
// worry (August 2026) was the obvious one: those lines have to
// disappear the day importing ships, and remembering to delete three
// strings is exactly the kind of promise that gets broken.
//
// So they are not three strings. They are this boolean. Phase 2
// flipped it to true the day the sync shipped, and every "being
// built now" line was replaced by the real copy in the same move.
export const IMPORTING_LIVE = true;

// HOW FAR BACK WE PROMISE, in one place because it is a promise and
// promises must not disagree with each other across four screens.
//
// Measured, not guessed (19 August 2026): all three of Kalshi's
// portfolio lists end within half an hour of each other on 13 June
// 2026, and Kalshi's own cursor says end of list on each. Around
// that date Kalshi moved to fractional shares. Their own app scrolls
// back years on internal access; no outside app can. Pikkit, a
// funded competitor with the same feature, stops at the same wall.
//
// So Actuals stopped saying "all" and "everything". The owner's
// ruling: state one clean date and keep it. July 1 sits safely after
// the real edge, which means the promise holds even if an account's
// data starts a little later than the owner's did.
// THE DATE ITSELF, and the only place it is typed. The import
// enforces it and four screens print it, so if the promise and the
// code could be edited apart they eventually would be. Everything
// below is derived from this line.
export const KALSHI_HISTORY_FROM_ISO = "2026-07-01T00:00:00.000Z";

const startDate = new Date(KALSHI_HISTORY_FROM_ISO);

// "July 1, 2026", for the screens. UTC on purpose: the promise is one
// date for everyone, not a date that moves with the reader's clock.
export const KALSHI_HISTORY_FROM = startDate.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

// "July 1", for a second mention in a block that has already said the
// year once.
export const KALSHI_HISTORY_SHORT = startDate.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
