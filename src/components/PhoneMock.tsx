import Image from "next/image";

// The two status bar glyphs. Drawn rather than an emoji or a font, so
// they scale with the phone and take its text colour.
function SignalIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 18 12" style={{ height: size }} fill="currentColor" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
    </svg>
  );
}

function BatteryIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 26 12" style={{ height: size }} aria-hidden="true">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <rect x="2.5" y="2.5" width="14" height="7" rx="1.5" fill="currentColor" />
      <path d="M23.5 4.2v3.6a2.2 2.2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

// A PHONE, DRAWN IN CODE.
//
// The owner has tried fifteen mockup tools and none of them took his
// screenshots. This replaces all of them. It is not a photo of a phone:
// it is a rounded rectangle with a metal edge, a glass highlight and a
// real screenshot inside, so it costs nothing, never goes stale, and
// the picture inside is regenerated from the live app by makeshots.mjs.
//
// What a 3D render still does better: reflections that bend around the
// body, and a camera with real depth of field. What this does better:
// it is always the current app.
//
// The anatomy, outside in:
//   shell      the metal band, a gradient so one edge catches light
//   glass      a hairline of white inside the shell, the polished edge
//   screen     the screenshot, clipped to the inner radius
//   sheen      one soft diagonal wash across the glass
//   island     the pill cut out at the top
//
// Every radius is in step: an inner corner has to be tighter than the
// one outside it or the band looks like it changes width at the
// corners, which is the single thing that makes a drawn phone look
// drawn.
export default function PhoneMock({
  src,
  alt,
  width = 260,
  // Degrees of turn. 0 is straight on. Positive turns the phone so its
  // right edge goes away from you, which is the angle in the owner's
  // reference.
  angle = 0,
  // Lifts the phone up the page. Used to stagger a row of three.
  lift = 0,
  // The screen glow, for a dark section. Off on a light one, where a
  // coloured halo behind a phone reads as a smudge.
  glow = false,
  // The colour of the app page behind the status bar. It has to match
  // the screenshot or the phone gets a stripe across the top.
  chrome = "#04081B",
  onDark = true,
  priority = false,
  className = "",
  // Only ever the negative margin that overlaps a neighbour. Kept as a
  // style rather than a class because the overlap is a fraction of the
  // width, and Tailwind cannot generate a class from a number.
  style,
}: {
  src: string;
  alt: string;
  width?: number;
  angle?: number;
  lift?: number;
  glow?: boolean;
  chrome?: string;
  onDark?: boolean;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  // An iPhone is 19.5 by 9, and every measurement below is a fraction
  // of the width, so one number scales the whole thing.
  const height = Math.round((width * 852) / 393);
  const radius = width * 0.145;
  const band = Math.max(2, width * 0.035);
  const innerRadius = radius - band;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        width,
        transform: `perspective(1600px) rotateY(${angle}deg) translateY(${-lift}px)`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 -z-10 rounded-[50%] bg-brand-mark/25 blur-3xl"
        />
      )}

      {/* The shell. The gradient runs across the phone rather than down
          it, so the left edge reads as lit and the right as turning
          away, which is what sells the angle. */}
      <div
        className="relative bg-gradient-to-r from-[#4a4a55] via-[#20202a] to-[#3a3a46] shadow-[0_40px_80px_-30px_rgba(6,8,20,0.75)]"
        style={{ borderRadius: radius, padding: band, height }}
      >
        {/* The polished edge: one hairline of light just inside the
            band. Without it the shell and the screen meet in a dead
            join and the whole thing flattens. */}
        <div
          className="relative h-full w-full overflow-hidden ring-1 ring-white/20"
          style={{ borderRadius: innerRadius }}
        >
          {/* A STATUS BAR, because the screenshot has none.
              The screenshot is of a web page, so it starts at the
              page's own top padding. Drop an iPhone's island straight
              onto that and it lands on the page title: the first draft
              had a black pill through the word Performance. This strip
              gives the island somewhere to live, and painting it the
              app's own page colour is what keeps it from reading as a
              band across the top. */}
          <div
            className="relative flex items-center justify-between px-[7%] font-semibold"
            style={{
              background: chrome,
              height: width * 0.135,
              fontSize: width * 0.052,
              color: onDark ? "#F2F2F5" : "#14141A",
            }}
          >
            <span>9:41</span>
            <span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
              style={{ width: width * 0.3, height: width * 0.085 }}
            />
            <span className="flex items-center" style={{ gap: width * 0.018 }}>
              <SignalIcon size={width * 0.055} />
              <BatteryIcon size={width * 0.055} />
            </span>
          </div>

          <Image
            src={src}
            alt={alt}
            width={786}
            height={1704}
            priority={priority}
            className="w-full object-cover object-top"
            style={{ height: `calc(100% - ${width * 0.135}px)` }}
          />

          {/* One diagonal wash of light across the glass. Kept faint on
              purpose: this is the difference between a screen behind
              glass and a screenshot with a stripe on it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent"
          />

        </div>
      </div>
    </div>
  );
}
