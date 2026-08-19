/* eslint-disable @next/next/no-img-element */
// The A mark alone, for places where the full wordmark is too wide:
// the Track header puts it beside the greeting. The artwork is the
// owner's chosen symbol (v2_4, the same file the favicon is built
// from), trimmed into public/brand/mark.png at 256px, plenty for a
// 26px slot on a 3x phone screen.
//
// One file for both themes: the mark is a purple-to-magenta gradient
// on a transparent background and reads on light and dark alike,
// which is exactly why the owner picked it for the favicon.
//
// This replaced a hand-drawn svg of the OLD mark: v9.3 was sketched
// before the rename artwork landed, and the sketch's svg shipped as
// drawn. The owner caught it on the live site.
export default function BrandMark({ size = 26 }: { size?: number }) {
  // The trimmed artwork's own proportions, so the height prop cannot
  // squash it. max-w-none for the same reason Wordmark carries it: a
  // tight flex row squeezes a fixed-height image silently.
  const w = Math.round(size * (232 / 256));
  return (
    <img
      src="/brand/mark.png"
      alt=""
      aria-hidden="true"
      width={w}
      height={size}
      className="block max-w-none shrink-0"
    />
  );
}
