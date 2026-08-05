// The small uppercase label that names a number. One file, so the
// eleven places that use it can never drift apart.
//
// 10px bold uppercase, wide tracking. Neutral 400 on a light card,
// white at 40 percent on the dark chart panel.
// Rendered as a span, not a paragraph, so it is also valid inside a
// form label. A paragraph inside a label is invalid HTML.
export default function MicroLabel({
  children,
  onDark = false,
  className = "",
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`block text-[10px] font-bold uppercase tracking-widest ${
        onDark ? "text-white/40" : "text-neutral-400"
      } ${className}`}
    >
      {children}
    </span>
  );
}
