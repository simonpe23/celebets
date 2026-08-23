import Portfolio2 from "./Portfolio2";
import { exploreBets } from "../explore/decorate";

// The Portfolio v2 wireframe. Local preview, gitignored.
export default function Portfolio2Wireframe() {
  return <Portfolio2 bets={exploreBets} wire />;
}
