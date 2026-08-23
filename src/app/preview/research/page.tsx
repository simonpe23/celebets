import Research from "@/components/Research";

// Mirrors src/app/recommendations/page.tsx. activeHref exists because
// the preview's URL is /preview/research and would light no tab.
export default function ResearchPreview() {
  return <Research activeHref="/recommendations" />;
}
