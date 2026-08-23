import MoneyMap from "./MoneyMap";
import { exploreBets } from "../explore/decorate";

// Concept 1, The Money Map, as a wireframe. Local preview,
// gitignored.
export default function MapWireframe() {
  return <MoneyMap bets={exploreBets} wire />;
}
