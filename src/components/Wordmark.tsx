// The Celebet wordmark: "cele" in the text color, "bet" in the brand
// purple with a soft gradient through it for depth. Uses Poppins,
// standing in for Circular Std until a licence for that font is bought.
// onDark is for the landing page's hero and footer, which are navy in
// BOTH themes. Without it the "cele" half follows the theme and turns
// near-black on a navy band, so on a light phone the wordmark simply
// vanished. The "bet" half needs the lifted purple there too, because
// brand-mark drops to the deep #7C3AED on a light theme and goes muddy
// against the navy.
export default function Wordmark({
  className = "text-2xl",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={`font-brand font-semibold lowercase tracking-tight ${className}`}
    >
      <span className={onDark ? "text-white" : "text-neutral-900 dark:text-white"}>
        cele
      </span>
      <span
        className={`bg-clip-text text-transparent ${
          onDark
            ? "bg-gradient-to-br from-brand-lift to-brand-glow"
            : "bg-gradient-to-br from-brand-mark via-brand-top to-brand-press"
        }`}
      >
        bet
      </span>
    </span>
  );
}
