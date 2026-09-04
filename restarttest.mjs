// THE RESTART LINE IS NOT A DATE FILTER, and this is the machine that
// says so.
//
// His ruling of 4 September 2026, then his order the same day to draw
// it as a button, made the restart a SCOPE beside the period pill:
// the button picks which record, the pill picks which window inside
// it. Every period in that pill keeps a bet by its `settled_at`, which
// silently drops anything still running. The restart line does the
// opposite on purpose: a bet still riding when you draw the line is
// live money, so it belongs to the NEW record.
//
// Written as a date filter this would look right, pass every
// screenshot, agree with Track most of the time, and quietly lose a
// running bet from somebody's fresh record. Nothing on the screen
// would say so. So the rule is pinned here instead.
//
// Node cannot import a .ts file whose imports lack extensions, so the
// sources are copied to a temp folder with extensions added, the same
// trick synctest.mjs uses.
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = await mkdtemp(join(tmpdir(), "restarttest-"));
await mkdir(join(dir, "lib"), { recursive: true });

for (const name of ["stats", "format", "types", "taxonomy"]) {
  let src;
  try {
    src = await readFile(`src/lib/${name}.ts`, "utf8");
  } catch {
    continue;
  }
  await writeFile(
    join(dir, "lib", `${name}.ts`),
    src.replace(/from "\.\/(\w+)"/g, 'from "./$1.ts"')
  );
}
const period = await readFile("src/components/performance/lab/period.ts", "utf8");
await writeFile(
  join(dir, "period.ts"),
  period.replace(/from "@\/lib\/(\w+)"/g, 'from "./lib/$1.ts"')
);

const { betsIn, PERIODS } = await import(join(dir, "period.ts"));
const { sinceLine } = await import(join(dir, "lib", "stats.ts"));

const LINE = "2026-06-01T00:00:00.000Z";
const bet = (id, settled) => ({
  id,
  stake: 10,
  total_odds: 2,
  status: settled ? "won" : "pending",
  placed_at: "2026-01-01T00:00:00.000Z",
  settled_at: settled,
  payout: settled ? 20 : null,
  cashed_out: false,
  legs: [],
  bet_buys: [],
});

// Placed before the line in every case, so only `settled_at` decides.
const BEFORE = bet("before", "2026-05-01T00:00:00.000Z");
const ON = bet("on", LINE);
const AFTER = bet("after", "2026-07-01T00:00:00.000Z");
const RIDING = bet("riding", null);
const ALL = [BEFORE, ON, AFTER, RIDING];

const ids = (list) => list.map((b) => b.id).sort().join(",");
const fails = [];
const check = (what, got, want) => {
  if (got !== want) fails.push(`${what}\n      got  ${got}\n      want ${want}`);
};

// 1. The button off: every bet survives, which is also what somebody
//    who has never restarted always sees.
check("not restarted keeps every bet", ids(betsIn(ALL, "all", undefined, LINE, false)), ids(ALL));
check("and by default", ids(betsIn(ALL, "all")), ids(ALL));

// 2. THE CARRY OVER, the whole reason this file exists. A bet still
//    running crosses the line. A bet settled before it does not. A bet
//    settled exactly ON it belongs to the old record.
check(
  "the line keeps what is after it and what is still riding",
  ids(betsIn(ALL, "all", undefined, LINE, true)),
  ids([AFTER, RIDING])
);

// 3. The contrast that makes the point. An ordinary period drops the
//    running bet. If the restart is ever folded into one of these,
//    this line starts failing.
check(
  "an ordinary period drops a running bet",
  betsIn(ALL, "month").some((b) => b.id === "riding"),
  false
);

// 4. THE TWO QUESTIONS COMPOSE. Which record first, then which window
//    inside it. They are not alternatives and they cannot contradict.
const scoped = betsIn(ALL, "custom", { from: "2026-06-15", to: "2026-12-31" }, LINE, true);
check(
  "a window applies inside the restarted record",
  ids(scoped),
  ids([AFTER])
);

// 5. One rule, two callers. Performance must not compute its own
//    version of Track's line.
check(
  "restarted equals sinceLine exactly",
  ids(betsIn(ALL, "all", undefined, LINE, true)),
  ids(sinceLine(ALL, LINE))
);

// 6. Asking for a restarted record when there is no restart must not
//    hide anybody's bets.
check("no line stored keeps every bet", ids(betsIn(ALL, "all", undefined, null, true)), ids(ALL));
check("a bad date keeps every bet", ids(betsIn(ALL, "all", undefined, "not a date", true)), ids(ALL));

// 7. The restart is NOT one of the periods. It was for an hour on
//    4 September 2026, and the button beside the pill then printed the
//    same words twice.
check("the restart is not in the period list", PERIODS.some((p) => p.key === "since"), false);
check("the period list still leads with All time", PERIODS[0].key, "all");

if (fails.length) {
  console.log("Restart test FAILED:\n");
  for (const f of fails) console.log("  - " + f + "\n");
  process.exit(1);
}
console.log("Restart test passed. The restart line carries running bets over, and composes with the window.");
