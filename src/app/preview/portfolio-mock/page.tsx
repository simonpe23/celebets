import Portfolio from "../portfolio/Portfolio";
import { exploreBets } from "../explore/decorate";

// Concept 2, The Portfolio, as a mockup on the sampled palette.
// Local preview, gitignored.
export default function PortfolioMock() {
  return <Portfolio bets={exploreBets} wire={false} />;
}
