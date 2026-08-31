import TabBar from "@/components/TabBar";
import {
  COLUMN,
  PAGE,
  PAGE_TITLE,
} from "@/lib/ui";

// WHAT YOU SEE WHILE A PAGE IS ON ITS WAY.
//
// Next.js shows this the instant you tap a tab, and swaps in the real
// page when the data lands. Before it existed there was no loading
// state anywhere in the app: the old page stayed fully drawn until the
// server came back, so a tap looked like nothing at all. The owner
// watched testers tap the bar and give up.
//
// It draws the SHAPE of the page, not a spinner. The header and the
// first card land in the same place they will land for real, so the
// page appears to fill in rather than flash and jump.
//
// The tab bar is real, not a placeholder, so it never blinks: it is the
// one thing on screen the user is already touching.
export default function PageSkeleton({
  title,
  activeHref,
  cards = 3,
}: {
  title: string;
  activeHref: string;
  // Roughly how many blocks this page opens with. Getting it close
  // matters more than getting it exact: the closer the grey shapes sit
  // to the real ones, the less the page moves when it arrives.
  cards?: number;
}) {
  return (
    <main className={PAGE}>
      <div className={COLUMN}>
        <h1 className={PAGE_TITLE}>{title}</h1>

        <div className="animate-pulse space-y-4" aria-hidden="true">
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-neutral-900/[0.05] dark:bg-white/[0.05]"
            />
          ))}
        </div>

        <p className="sr-only" role="status">
          Loading {title}
        </p>
      </div>

      <TabBar activeHref={activeHref} />
    </main>
  );
}
