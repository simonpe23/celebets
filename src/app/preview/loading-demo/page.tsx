import PageSkeleton from "@/components/PageSkeleton";

// Shows the loading screen on its own. The real ones live in
// src/app/*/loading.tsx and only appear mid navigation, which is too
// brief to photograph.
export default function LoadingDemo() {
  return <PageSkeleton title="Performance" activeHref="/stats" cards={3} />;
}
