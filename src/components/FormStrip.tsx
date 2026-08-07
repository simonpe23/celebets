import MicroLabel from "@/components/MicroLabel";
import type { BetWithLegs } from "@/lib/types";

// Your last ten bets as a row of pips, newest on the right.
//
// This is borrowed from football, not from finance. Every league table
// in the world prints a form guide, and every fan reads it instantly
// without being taught. A betting app is the natural home for one, and
// it answers "how am I going right now" faster than any figure can:
// a run of red is a feeling before it is a number.
//
// Pending bets show as hollow pips, so what is still live sits in the
// same line as what has landed.
export default function FormStrip({
  settled,
  pending,
}: {
  settled: BetWithLegs[];
  pending: number;
}) {
  const recent = [...settled]
    .sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    )
    .slice(-10);

  if (recent.length === 0) return null;

  const last5 = recent.slice(-5);
  const wonLast5 = last5.filter((b) => b.status === "won").length;

  // A streak only counts from the newest end, and only while it holds.
  let streak = 0;
  const streakWon = recent[recent.length - 1]?.status === "won";
  for (let i = recent.length - 1; i >= 0; i--) {
    const won = recent[i].status === "won";
    if (won !== streakWon) break;
    streak += 1;
  }

  const headline =
    streak >= 3
      ? `${streak} ${streakWon ? "wins" : "losses"} in a row`
      : `Won ${wonLast5} of the last ${last5.length}`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 px-1">
        <MicroLabel>Recent form</MicroLabel>
        <span
          className={`text-sm font-semibold ${
            streak >= 3
              ? streakWon
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {headline}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        {recent.map((bet) => (
          <span
            key={bet.id}
            title={bet.status}
            className={`h-2.5 grow rounded-full ${
              bet.status === "won"
                ? "bg-emerald-500"
                : bet.status === "lost"
                  ? "bg-red-500"
                  : "bg-neutral-400"
            }`}
          />
        ))}
        {Array.from({ length: Math.min(pending, 3) }).map((_, i) => (
          <span
            key={`pending-${i}`}
            title="pending"
            className="h-2.5 grow rounded-full ring-1 ring-inset ring-neutral-400/60 dark:ring-white/25"
          />
        ))}
      </div>
    </div>
  );
}
