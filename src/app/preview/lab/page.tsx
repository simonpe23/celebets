import Lab from "./Lab";
import { exploreBets } from "../explore/decorate";

// The Lab wireframe: information architecture only, judged before
// any visual design. Local preview, gitignored.
export default function LabPreview() {
  return <Lab bets={exploreBets} />;
}
