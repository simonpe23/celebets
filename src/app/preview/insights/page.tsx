import AllInsights from "@/components/AllInsights";
import { performanceBets } from "../performance/data";

// Mirrors src/app/insights/page.tsx.
export default function InsightsPreview() {
  return <AllInsights bets={performanceBets} sport={null} />;
}
