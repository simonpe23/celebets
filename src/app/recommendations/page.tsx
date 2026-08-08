import Research from "@/components/Research";

// The Research tab. The address stays /recommendations, the same
// reasoning as /stats being called Performance: old bookmarks and the
// tab bar's match both keep working, and a redirect is one more thing
// to get wrong.
//
// What used to live here, the full insight list, moved to /insights.
// Insights happen after a bet; Research happens before one.
export default function ResearchPage() {
  return <Research />;
}
