import Link from "next/link";
import HeroMoney from "@/components/HeroMoney";
import MicroLabel from "@/components/MicroLabel";
import { formatMoney } from "@/lib/format";
import { SPORT_EMOJI, type BetWithLegs } from "@/lib/types";

// What is riding right now.
//
// Every other surface in this app looks backwards: profit charts,
// records, history. But a bettor opens the app on a Sunday afternoon to
// find out what is still alive, not what happened in July. This is the
// one panel about the next few hours, so it goes first.
//
// Purple, not the chart's near black, so the two dark panels on the
// page never get confused: purple is what could happen, the chart is
// what did.
export default function InPlayHero({
  liveBets,
  weekProfit,
}: {
  liveBets: BetWithLegs[];
  weekProfit: number;
}) {
  const riding = liveBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const toCollect = liveBets.reduce(
    (sum, b) => sum + Number(b.stake) * Number(b.total_odds),
    0
  );

  // Every sport with something live, so the panel says what is on
  // without needing the cards below it.
  const sports = [
    ...new Set(liveBets.flatMap((b) => b.legs.map((l) => l.sport))),
  ].filter(Boolean);

  const legCount = liveBets.reduce((sum, b) => sum + b.legs.length, 0);

  return (
    <section className="overflow-hidden rounded-3xl bg-[#2E1250] bg-[linear-gradient(135deg,#2E1250_0%,#58287F_60%,#7C3FAF_100%)] p-5 shadow-[0_18px_40px_-20px_rgba(46,18,80,0.9)] ring-1 ring-white/10">
      {liveBets.length === 0 ? (
        <>
          <MicroLabel onDark>Nothing in play</MicroLabel>
          <p className="mt-2 text-lg font-bold text-white">
            No bets running right now.
          </p>
          <p className="mt-1 text-sm text-white/60">
            This week you are{" "}
            <span className="font-money font-semibold text-white">
              {weekProfit >= 0 ? "+" : "-"}
              {formatMoney(Math.abs(weekProfit))}
            </span>
            . Paste a slip below to start the next one.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <MicroLabel onDark>In play</MicroLabel>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {liveBets.length} live
            </span>
          </div>

          <p className="mt-2 text-white">
            <HeroMoney
              value={toCollect}
              signed={false}
              className="text-[42px]"
            />
          </p>
          <p className="mt-1 text-sm text-white/60">
            to collect on{" "}
            <span className="font-money font-semibold text-white/90">
              {formatMoney(riding)}
            </span>{" "}
            riding, across {legCount} {legCount === 1 ? "pick" : "picks"}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {sports.map((sport) => (
              <span
                key={sport}
                className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white/90"
              >
                {SPORT_EMOJI[sport as keyof typeof SPORT_EMOJI]} {sport}
              </span>
            ))}
          </div>

          <Link
            href="#live-now"
            className="mt-4 block rounded-xl bg-white/15 py-2.5 text-center text-sm font-bold text-white active:bg-white/25"
          >
            Settle picks
          </Link>
        </>
      )}
    </section>
  );
}
