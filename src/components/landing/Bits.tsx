// The small repeated pieces of the landing page, in one file so none of
// them can drift from its twin. Built to the owner's mockup.

// The small label above a headline. Bare uppercase text, no pill: the
// owner cut the rounded background in v6 ("redesign it with no rounded
// corners or just write it without any sharp background"). Two tones:
// brand for a section that exists, green for one that does not yet.
export function Eyebrow({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "soon";
}) {
  const skin =
    tone === "brand"
      ? "text-brand-top dark:text-brand-mark"
      // emerald-700 as a class, not a hex. #16A34A and #15803D are
      // both reserved for the app's one green BUTTON, and a rule that
      // bends for a label is not a rule. The outcome green is too pale
      // to read as small text on a light page.
      : "text-emerald-700 dark:text-[#22C55E]";
  return (
    <span
      className={`block text-[13px] font-bold uppercase tracking-[0.16em] ${skin}`}
    >
      {children}
    </span>
  );
}

// The reassurance line under a sign up button. A tick and three words.
//
// On a phone the three run smaller and tighter so they hold ONE row:
// the owner caught them breaking two-and-one, which read as ragged. If
// a very narrow screen still has to wrap, justify-center keeps the
// spill line centred instead of hanging left.
export function TrustRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 sm:justify-start sm:gap-x-6">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 sm:gap-2 sm:text-[14px]"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-[15px] w-[15px] shrink-0 text-[#22C55E] sm:h-[18px] sm:w-[18px]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10 1.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Zm4 6.1-4.8 5.3a.9.9 0 0 1-1.3.05L5.9 11.2a.9.9 0 1 1 1.2-1.32l1.3 1.2 4.2-4.6A.9.9 0 1 1 14 7.8Z" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

// A checklist line in the analytics section: a ringed tick, a bold
// title, a quiet line under it.
export function CheckItem({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brand-top/35 text-brand-top dark:border-brand-mark/40 dark:text-brand-mark">
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4.5 10.5 8 14l7.5-8" />
        </svg>
      </span>
      <span>
        <span className="block text-[18px] font-bold">{title}</span>
        <span className="mt-1 block text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {body}
        </span>
      </span>
    </li>
  );
}

// A dot grid, for the corner behind a phone. Pure decoration, and the
// only piece of texture on the page that is a pattern rather than a
// gradient, which is why it is small and sits in one corner.
export function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute opacity-[0.5] dark:opacity-[0.35] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(currentColor 1.2px, transparent 1.2px)",
        backgroundSize: "14px 14px",
        color: "rgba(124,58,237,0.35)",
      }}
    />
  );
}
