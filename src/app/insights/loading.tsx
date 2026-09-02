import PageSkeleton from "@/components/PageSkeleton";

export default function Loading() {
  return <PageSkeleton title="Your insights" activeHref="/stats" cards={3} back />;
}
