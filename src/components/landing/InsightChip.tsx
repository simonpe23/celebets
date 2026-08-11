// A CARD LIFTED OUT OF THE APP AND FLOATED BESIDE THE PHONE.
//
// The owner: "no symbols or graphic of any value". This is the answer.
// Not an icon, and not decoration: it is the product's own insight
// card, blown up so a stranger can read one at full size without
// squinting at a 200px phone screen. It shows what the app is FOR,
// which no icon can do.
//
// Each one carries a real sentence in the app's own voice, the money in
// the app's own numeral face and money colours, and the same hairline
// and radius as the real cards. Anything else would be a mock of a mock.
import MicroLabel from "@/components/MicroLabel";

export default function InsightChip({
  label,
  headline,
  value,
  tone = "up",
  className = "",
}: {
  label: string;
  headline: string;
  value: string;
  tone?: "up" | "down";
  className?: string;
}) {
  // It follows the theme in CSS rather than by a prop. It used to take
  // an onDark boolean, and the moment the hero stopped being navy in
  // both themes every call site had to be told which band it was
  // standing on. A card that reads its own surroundings cannot be put
  // on the wrong one.
  const money =
    tone === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";

  return (
    <div
      className={`w-[240px] rounded-2xl border border-neutral-900/[0.08] bg-white/90 p-4 shadow-[0_24px_60px_-24px_rgba(16,19,34,0.4)] backdrop-blur-md dark:border-white/[0.09] dark:bg-[#0E1228]/90 dark:shadow-[0_24px_60px_-20px_rgba(4,8,27,0.9)] ${className}`}
    >
      <MicroLabel>{label}</MicroLabel>
      <p className="mt-2 text-[13px] font-semibold leading-snug text-neutral-800 dark:text-white/90">
        {headline}
      </p>
      <p className={`mt-2 font-money text-[22px] font-semibold tabular-nums ${money}`}>
        {value}
      </p>
    </div>
  );
}
