// The one tile used everywhere a small labelled number appears, on the
// home page and on the stats page. Keeping it in a single file is what
// stops the two pages drifting apart.
//
// The type scale that goes with it:
//   tile label   MicroLabel
//   tile value   16px semibold, tabular figures, numeral face
//   hero value   18px semibold, one tier up, under a headline only
//   card heading 18px bold
import MicroLabel from "@/components/MicroLabel";

export default function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-300/70 bg-[#F2F4F7] p-3 text-center dark:border-white/10 dark:bg-[#151A28]">
      <MicroLabel>{label}</MicroLabel>
      <p
        className={`mt-1 font-money text-base font-semibold tabular-nums ${tone ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}
