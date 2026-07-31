// The Celebet wordmark: "cele" in the text color, "bet" in the brand
// purple. Uses Poppins, standing in for Circular Std until a licence
// for that font is bought.
export default function Wordmark({
  className = "text-2xl",
}: {
  className?: string;
}) {
  return (
    <span
      className={`font-brand font-medium lowercase tracking-tight ${className}`}
    >
      <span className="text-neutral-900 dark:text-white">cele</span>
      <span className="text-[#6C4CE0]">bet</span>
    </span>
  );
}
