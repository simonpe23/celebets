import Portfolio2 from "../portfolio2/Portfolio2";
import { exploreBets } from "../explore/decorate";

// The Portfolio v2 mockup on the sampled palette. Local preview,
// gitignored.
export default function Portfolio2Mock() {
  return <Portfolio2 bets={exploreBets} wire={false} />;
}
