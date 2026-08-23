import Questions from "./Questions";
import { exploreBets } from "../explore/decorate";

// Upgrade B, Questions First, as a wireframe. Local preview,
// gitignored.
export default function QuestionsPreview() {
  return <Questions bets={exploreBets} />;
}
