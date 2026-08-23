import Lab2 from "./Lab2";
import { exploreBets } from "../explore/decorate";

// The styled Lab + Review, built to the owner's mockup sheets.
// Local preview, gitignored.
export default function Lab2Preview() {
  return <Lab2 bets={exploreBets} />;
}
