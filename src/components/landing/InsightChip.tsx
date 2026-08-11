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
  // The chip sits on a navy band in the hero and on a page that follows
  // the theme further down. A navy card on a white section reads as a
  // hole cut in the page, so it needs both.
  onDark = true,
  className = "",
}: {
  label: string;
  headline: string;
  value: string;
  tone?: "up" | "down";
  onDark?: boolean;
  className?: string;
}) {
  const money = onDark
    ? tone === "up"
      ? "text-emerald-400"
      : "text-red-400"
    : tone === "up"
      ? "text-emerald-600"
      : "text-red-600";

  const surface = onDark
    ? "border-white/[0.09] bg-[#0E1228]/90 shadow-[0_24px_60px_-20px_rgba(4,8,27,0.9)]"
    : "border-neutral-900/[0.08] bg-white/95 shadow-[0_24px_60px_-24px_rgba(16,19,34,0.45)]";

  return (
    <div
      className={`w-[240px] rounded-2xl border p-4 backdrop-blur-md ${surface} ${className}`}
    >
      <MicroLabel onDark={onDark}>{label}</MicroLabel>
      <p
        className={`mt-2 text-[13px] font-semibold leading-snug ${
          onDark ? "text-white/90" : "text-neutral-800"
        }`}
      >
        {headline}
      </p>
      <p className={`mt-2 font-money text-[22px] font-semibold tabular-nums ${money}`}>
        {value}
      </p>
    </div>
  );
}
