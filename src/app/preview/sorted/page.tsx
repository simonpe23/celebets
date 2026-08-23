import Sorted from "./Sorted";
import { exploreBets } from "../explore/decorate";

// Upgrade A, The Sorted Lab, as a wireframe. Local preview,
// gitignored.
export default function SortedPreview() {
  return <Sorted bets={exploreBets} />;
}
