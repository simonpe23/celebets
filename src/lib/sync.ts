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
