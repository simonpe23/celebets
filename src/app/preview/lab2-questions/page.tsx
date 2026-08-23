import Lab2 from "../lab2/Lab2";
import { exploreBets } from "../explore/decorate";

// Upgrade B, Questions First, as a mockup: V1's exact skin, opening
// as ready-made questions with the board folded in reserve. Local
// preview, gitignored.
export default function Lab2QuestionsPreview() {
  return <Lab2 bets={exploreBets} questions />;
}
