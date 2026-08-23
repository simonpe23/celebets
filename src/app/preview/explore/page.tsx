import Explorer from "./Explorer";
import { exploreBets } from "./decorate";
import { DEPOSITS } from "../performance/data";

// The Performance explorer preview: the "path you walk" direction,
// for the owner to judge before any real build. Local only, this
// folder is gitignored.
export default function ExplorePreview() {
  const staked = exploreBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const payouts = exploreBets.reduce(
    (sum, b) => sum + Number(b.payout ?? 0),
    0
  );
  const balance = DEPOSITS - staked + payouts;
  const netProfit = Math.round((balance - DEPOSITS) * 100) / 100;

  return <Explorer bets={exploreBets} netProfit={netProfit} />;
}
