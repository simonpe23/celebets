import MicroLabel from "@/components/MicroLabel";
import { formatSignedMoney } from "@/lib/format";
import { SPORT_EMOJI, type Sport } from "@/lib/types";
import { CARD } from "@/lib/ui";

export interface SportBar {
  sport: Sport;
  profit: number;
  wins: number;
  losses: number;
}

// Where the money actually comes from, ranked, with a bar for each.
//
// A "best sport" tile answers one question and hides nine. A ranked
// row answers the real one, which is where am I making it and where am
// I giving it back, and it reads in a second because length carries
// the meaning before the digits do. Winners grow right from the
// middle, losers grow left, so the shape of a good month and a bad one
// are different at a glance.
export default function SportBars({ rows }: { rows: SportBar[] }) {
  const played = rows.filter((r) => r.wins + r.losses > 0);
  if (played.length === 0) return null;

  // Both ends, never just the top. Taking the first five hid every
  // losing sport, which is the half worth knowing about: the point of
  // this block is where the money comes from AND where it goes.
  const shown =
    played.length <= 5
      ? played
      : [...played.slice(0, 3), ...played.slice(-2)];

  const peak = Math.max(...shown.map((r) => Math.abs(r.profit)), 1);

  return (
    <div className={`${CARD} p-4`}>
      <MicroLabel>Where your money comes from</MicroLabel>

      <div className="mt-3 space-y-2.5">
        {shown.map((row) => {
          const up = row.profit >= 0;
          const width = `${Math.max((Math.abs(row.profit) / peak) * 50, 2)}%`;
          return (
            <div key={row.sport} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-center text-base">
                {SPORT_EMOJI[row.sport]}
              </span>

              {/* Zero sits in the middle, so up and down are opposite
                  directions rather than two colors of the same bar. */}
              <span className="relative h-6 grow overflow-hidden rounded-md bg-neutral-100 dark:bg-white/5">
                <span
                  className={`absolute top-1 h-4 rounded-sm ${
                    up ? "left-1/2 bg-emerald-500/80" : "right-1/2 bg-red-500/80"
                  }`}
                  style={{ width }}
                />
                <span className="absolute inset-y-0 left-1/2 w-px bg-neutral-300 dark:bg-white/15" />
              </span>

              <span
                className={`w-20 shrink-0 text-right font-money text-sm font-bold tabular-nums ${
                  up
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatSignedMoney(row.profit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
