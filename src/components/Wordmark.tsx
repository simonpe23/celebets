// The Celebet wordmark: "cele" in the text color, "bet" in the brand
// purple with a soft gradient through it for depth. Uses Poppins,
// standing in for Circular Std until a licence for that font is bought.
export default function Wordmark({
  className = "text-2xl",
}: {
  className?: string;
}) {
  return (
    <span
      className={`font-brand font-semibold lowercase tracking-tight ${className}`}
    >
      <span className="text-neutral-900 dark:text-white">cele</span>
      <span className="bg-gradient-to-br from-[#9A57FC] via-[#7C3AED] to-[#5B21B6] bg-clip-text text-transparent">
        bet
      </span>
    </span>
  );
}
