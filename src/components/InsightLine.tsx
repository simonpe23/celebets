import Link from "next/link";
import MicroLabel from "@/components/MicroLabel";
import { CARD } from "@/lib/ui";

// One sentence about the user's own betting, sitting between the
// numbers and the bets. It is the only place on the home screen that
// draws a conclusion instead of reporting a figure, which is what
// makes the page feel like it is paying attention.
//
// It opens Performance, not a separate insights page. An insight is
// something Celebet noticed in your own data, so it belongs inside
// the place where you understand yourself, the way Apple Health keeps
// insights inside the health data.
export default function InsightLine({ text }: { text: string | null }) {
  if (!text) return null;

  return (
    <Link href="/stats" className={`${CARD} flex items-start gap-3 p-4`}>
      <span
        className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-[#58287F] dark:bg-[#A97FD0]"
        aria-hidden="true"
      />
      <span className="min-w-0">
        <MicroLabel tone="purple">Today&rsquo;s insight</MicroLabel>
        <span className="mt-0.5 block text-sm font-semibold">{text}</span>
        <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
          Open Performance
        </span>
      </span>
    </Link>
  );
}
