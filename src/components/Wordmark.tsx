// The Actuals wordmark: the name as plain text, one colour, following
// the theme. Near-black on light, white on dark.
//
// It used to be "cele" in the text colour and "bet" in a purple
// gradient. That split was the whole design and it does not survive
// the rename, so this is a rebuild, not a find and replace.
//
// NO ARTWORK HERE ON PURPOSE. The owner split the rebrand from the
// logo work in August 2026 ("this is too much going on at the same
// time"), so the mark, the favicon and the link preview image are a
// separate job. See IDEAS.md item 25. Text is the safe placeholder:
// it is sharp at every size, it needs no dark mode variant, and it
// cannot render as a white box on a dark page the way the current
// PNGs would.
//
// The typeface is unchanged. font-brand is the app's existing brand
// face and swapping it is a product decision the owner has to make,
// not something a rename is allowed to do quietly.
//
// onDark is for a surface that is navy in BOTH themes, like the
// landing hero or footer. Without it the text follows the theme and
// turns near-black on a navy band, which is how the old wordmark
// vanished on a light phone.
export default function Wordmark({
  className = "text-2xl",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span
      className={`font-brand font-semibold tracking-tight ${
        onDark ? "text-white" : "text-neutral-900 dark:text-white"
      } ${className}`}
    >
      Actuals
    </span>
  );
}
