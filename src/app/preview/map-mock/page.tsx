import MoneyMap from "../map/MoneyMap";
import { exploreBets } from "../explore/decorate";

// Concept 1, The Money Map, as a mockup on the sampled palette.
// Local preview, gitignored.
export default function MapMock() {
  return <MoneyMap bets={exploreBets} wire={false} />;
}
