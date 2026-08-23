import BalanceCard from "@/components/BalanceCard";
import { previewBets } from "../data";
import { betProfit } from "@/lib/stats";
import { round2 } from "@/lib/format";

// Three ways to draw a once-ever setup control, side by side.
export default function ButtonVariants() {
  const settled = previewBets
    .filter((b) => b.status !== "pending" && b.settled_at !== null)
    .sort(
      (a, b) =>
        new Date(a.settled_at ?? 0).getTime() -
        new Date(b.settled_at ?? 0).getTime()
    );
  let running = 1296;
  const series = [1296, ...settled.map((b) => (running = round2(running + betProfit(b))))];

  const common = {
    balance: 1714.26,
    netProfit: 418.26,
    startedWith: 1296,
    hasBalance: true,
    betCount: settled.length,
    userId: "preview",
    series,
  };

  const label = "text-[11px] font-bold uppercase tracking-widest text-neutral-400";

  return (
    <main className="min-h-dvh px-4 py-6">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div>
          <p className={label}>Ruled: small button, under Net profit</p>
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            A&apos;s size in B&apos;s place, darker and squarer.
          </p>
          <BalanceCard {...common} control="under" />
        </div>

        <div>
          <p className={label}>A. Corner button</p>
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            Small, squared, beside the label. Frees the whole bottom of the card.
          </p>
          <BalanceCard {...common} control="corner" />
        </div>

        <div>
          <p className={label}>B. Quiet text link</p>
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            No button at all. Smallest possible footprint.
          </p>
          <BalanceCard {...common} control="link" />
        </div>

        <div>
          <p className={label}>C. Full width (today)</p>
          <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            For comparison, now in the darker purple and squared corners.
          </p>
          <BalanceCard {...common} control="button" />
        </div>
      </div>
    </main>
  );
}
