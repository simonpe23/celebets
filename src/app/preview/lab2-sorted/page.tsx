import Lab2 from "../lab2/Lab2";
import { exploreBets } from "../explore/decorate";

// Upgrade A, The Sorted Lab, as a mockup: V1's exact skin with the
// signal-ranked, self-folding board. Local preview, gitignored.
export default function Lab2SortedPreview() {
  return <Lab2 bets={exploreBets} sorted />;
}
