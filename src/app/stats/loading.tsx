import PageSkeleton from "@/components/PageSkeleton";

export default function Loading() {
  return <PageSkeleton title="Performance" activeHref="/stats" cards={3} />;
}
