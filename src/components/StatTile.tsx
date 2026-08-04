// The one tile used everywhere a small labelled number appears, on the
// home page and on the stats page. Keeping it in a single file is what
// stops the two pages drifting apart.
//
// The type scale that goes with it:
//   tile label   10px bold uppercase, wide tracking, neutral 400
//   tile value   16px bold, tabular figures
//   hero value   18px bold, one tier up, for the row under a headline
//   card heading 18px bold
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        {label}
      </p>
      <p className={`mt-1 text-base font-bold tabular-nums ${tone ?? ""}`}>
        {value}
      </p>
    </div>
  );
}
