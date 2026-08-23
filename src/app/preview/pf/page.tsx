import App from "./App";
import { exploreBets } from "../explore/decorate";

// The Portfolio living preview. Local preview, gitignored.
export default function PortfolioPreview() {
  return <App bets={exploreBets} />;
}
