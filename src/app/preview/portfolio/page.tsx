import Portfolio from "./Portfolio";
import { exploreBets } from "../explore/decorate";

// Concept 2, The Portfolio, as a wireframe. Local preview,
// gitignored.
export default function PortfolioWireframe() {
  return <Portfolio bets={exploreBets} wire />;
}
