/* eslint-disable @next/next/no-img-element */
// The Actuals wordmark, as the owner's own artwork (August 2026, from
// brand/actuals/logos-final, cropped in public/brand). Two files, one
// per theme, because ink baked into a PNG cannot follow a CSS colour:
//   wordmark-dark.png   dark ink, for light surfaces
//   wordmark-white.png  white ink, for dark surfaces
// The versions WITH the tagline exist next to them and are for large
// placements only (the link preview card). At header size the tagline
// would render around six pixels tall, which is why it is cropped off
// here.
//
// The image is sized in ems, so the callers' existing text-2xl /
// text-xl classes keep working: the artwork height follows the font
// size the caller sets, roughly matching the height the text version
// had. Two <img> tags rather than one themed source, the same pattern
// PhoneMock uses.
//
// onDark is for a surface that is navy in BOTH themes, like the
// landing hero once was. It pins the white artwork regardless of
// theme.
export default function Wordmark({
  className = "text-2xl",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const img = "h-[1.05em] w-auto align-middle";
  return (
    <span className={`inline-flex items-center ${className}`}>
      {onDark ? (
        <img src="/brand/wordmark-white.png" alt="Actuals" className={img} />
      ) : (
        <>
          <img
            src="/brand/wordmark-dark.png"
            alt="Actuals"
            className={`${img} dark:hidden`}
          />
          <img
            src="/brand/wordmark-white.png"
            alt="Actuals"
            className={`${img} hidden dark:block`}
          />
        </>
      )}
    </span>
  );
}
