import { formatMoney, formatOdds, round2 } from "@/lib/format";
import { SPORT_EMOJI, type BetWithLegs } from "@/lib/types";

interface Props {
  bets: BetWithLegs[];
}

export default function PendingBets({ bets }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold">Live now</h2>

      {bets.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No pending bets. Place one above.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {bets.map((bet) => {
            const stake = Number(bet.stake);
            const totalOdds = Number(bet.total_odds);
            return (
              <div
                key={bet.id}
                className="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="space-y-2">
                  {bet.legs.map((leg) => (
                    <div
                      key={leg.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <p className="text-sm font-medium">
                        {SPORT_EMOJI[leg.sport]} {leg.description}
                      </p>
                      <p className="text-sm font-semibold text-neutral-500">
                        {formatOdds(Number(leg.odds))}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-center dark:border-neutral-800">
                  <div>
                    <p className="text-xs text-neutral-500">Ticket cost</p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatMoney(stake)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">To Win</p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatMoney(round2(stake * (totalOdds - 1)))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">To Collect</p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatMoney(round2(stake * totalOdds))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
