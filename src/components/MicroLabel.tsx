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
  tone = "muted",
  className = "",
}: {
  children: React.ReactNode;
  onDark?: boolean;
  // Purple names Research, the same as everywhere else in the app.
  tone?: "muted" | "purple";
  className?: string;
}) {
  const color =
    tone === "purple"
      ? "text-[#7C3AED] dark:text-[#A78BFA]"
      : onDark
        ? "text-white/40"
        : "text-neutral-400";
  return (
    <span
      className={`block text-[10px] font-bold uppercase tracking-widest ${color} ${className}`}
    >
      {children}
    </span>
  );
}
