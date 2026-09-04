// SINCE RESTART IS NOT A DATE FILTER, and this is the machine that
// says so.
//
// His ruling of 4 September 2026 put the restart line into the period
// pill Performance already draws. That makes it look like every other
// entry in the list, and it is not one. Every other period keeps a bet
// by its `settled_at`, which silently drops anything still running.
// The restart line does the opposite on purpose: a bet still riding
// when you draw the line is live money, so it belongs to the NEW
// record.
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

// 1. No line stored: every bet survives, so nothing moves for the vast
//    majority of users, who have never restarted.
check("no line keeps every bet", ids(betsIn(ALL, "since", undefined, null)), ids(ALL));
check("no line, undefined too", ids(betsIn(ALL, "since")), ids(ALL));

// 2. THE CARRY OVER, the whole reason this file exists. A bet still
//    running crosses the line. A bet settled before it does not. A bet
//    settled exactly ON it belongs to the old record.
check(
  "the line keeps what is after it and what is still riding",
  ids(betsIn(ALL, "since", undefined, LINE)),
  ids([AFTER, RIDING])
);

// 3. The contrast that makes the point. An ordinary period drops the
//    running bet. If "since" is ever rewritten as one of these, this
//    line starts failing.
const monthly = betsIn(ALL, "month");
check(
  "an ordinary period drops a running bet",
  monthly.some((b) => b.id === "riding"),
  false
);

// 4. One rule, two callers. Performance must not compute its own
//    version of Track's line.
check(
  "betsIn since equals sinceLine exactly",
  ids(betsIn(ALL, "since", undefined, LINE)),
  ids(sinceLine(ALL, LINE))
);

// 5. A nonsense date must not hide anybody's record.
check("a bad date keeps every bet", ids(betsIn(ALL, "since", undefined, "not a date")), ids(ALL));

// 6. The pill offers it, and it reads first because it is the default
//    for whoever has a line.
check("since is in the list", PERIODS.some((p) => p.key === "since"), true);
check("since reads first", PERIODS[0].key, "since");
check("since is labelled", PERIODS[0].label, "Since restart");

if (fails.length) {
  console.log("Restart test FAILED:\n");
  for (const f of fails) console.log("  - " + f + "\n");
  process.exit(1);
}
console.log("Restart test passed. Since restart carries running bets over the line.");
