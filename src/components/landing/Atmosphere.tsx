// THE THINGS THAT MAKE A PAGE FEEL LIKE SOMEWHERE.
//
// The owner on the first landing page: "no feeling, no emotion, no
// design of any value... page has no life." It was flat fills and text,
// and flat fills have no light in them, so nothing cast a shadow or
// caught an edge.
//
// EVERY LAYER HERE HAS A LIGHT VERSION AND A DARK ONE. The version
// before this had a navy hero and a navy footer in both themes, and the
// owner was right about what that meant: "dark mode and light mode can
// not have sections that look the same." A light page with two black
// bands in it is not a light page, it is a dark page with a hole in the
// middle.
//
// The light versions are not the dark ones lightened. Same idea,
// opposite physics: on navy the beams ADD light, on white they have to
// deepen it, so they run violet at low opacity and read as coloured
// haze rather than as lamps. Everything is behind content, never over
// it, and all of it is aria-hidden, because none of it means anything.

// Stadium floodlights. Four beams raking down from the roofline at
// uneven angles, blurred to gas. Uneven on purpose: four evenly spaced
// beams read as a pattern, and a pattern reads as wallpaper.
//
// The colour comes from a CSS variable so one set of markup serves both
// themes. Writing it inline would need two copies of every beam.
export function Beams({ className = "" }: { className?: string }) {
  const beams = [
    { left: "8%", rotate: -14, width: 150, opacity: 0.55 },
    { left: "28%", rotate: -6, width: 110, opacity: 0.4 },
    { left: "62%", rotate: 9, width: 170, opacity: 0.5 },
    { left: "84%", rotate: 17, width: 120, opacity: 0.35 },
  ];
  return (
    <div
      aria-hidden="true"
      className={
        "pointer-events-none absolute inset-0 overflow-hidden " +
        "[--beam-a:rgba(124,58,237,0.22)] [--beam-b:rgba(85,37,198,0.08)] " +
        "dark:[--beam-a:rgba(154,87,252,0.55)] dark:[--beam-b:rgba(85,37,198,0.18)] " +
        className
      }
    >
      {beams.map((b, i) => (
        <div
          key={i}
          className="absolute -top-32 h-[130%] origin-top blur-2xl"
          style={{
            left: b.left,
            width: b.width,
            opacity: b.opacity,
            transform: `rotate(${b.rotate}deg)`,
            background:
              "linear-gradient(to bottom, var(--beam-a), var(--beam-b) 45%, transparent 78%)",
          }}
        />
      ))}
    </div>
  );
}

// Film grain. The cheapest thing that stops a large flat area looking
// like a screenshot of a colour picker. Inline SVG turbulence, so it
// costs no request and scales to any size.
//
// It is set to multiply on light and overlay on dark. Overlay on a
// pale surface turns the noise into white speckle, which reads as dirt
// on the screen rather than as texture in the page.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function Grain({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-overlay ${className}`}
      style={{ backgroundImage: GRAIN }}
    />
  );
}

// THE STADIUM. A background-image, deliberately not next/image.
//
// The owner has exactly one photograph. If the file is not there, a CSS
// background fails SILENTLY: no broken icon, no console error, and the
// gradient underneath simply shows through. An <img> in the same place
// would leave a hole in the page. So the band is designed to look
// finished with no photograph at all, and the photograph makes it
// better rather than making it work.
//
// TO ADD IT: drop the file at public/stadium.jpg. Nothing else changes.
//
// The photo is far fainter on light, and its scrim is white rather than
// navy. A night stadium at any real strength drags a pale section
// grey, and grey is the one thing a light page cannot afford.
export function StadiumBand({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative isolate overflow-hidden bg-land-wash dark:bg-[#04081B] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-[0.07] dark:opacity-[0.55]"
        style={{ backgroundImage: "url('/stadium.jpg')" }}
      />

      {/* The scrim, light. A wash of white through lavender, so the
          band has a direction and the middle of the page is where the
          colour is strongest. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(248,246,255,0.86) 45%, rgba(255,255,255,0.96) 100%), radial-gradient(110% 80% at 50% 0%, rgba(124,58,237,0.16), transparent 62%)",
        }}
      />

      {/* The scrim, dark. A photograph behind text has to lose most of
          its contrast, or the text grows a shadow, and text with a
          shadow on it is the oldest tell of an amateur page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,8,27,0.92) 0%, rgba(4,8,27,0.80) 45%, rgba(4,8,27,0.95) 100%), radial-gradient(120% 90% at 50% 0%, rgba(85,37,198,0.35), transparent 60%)",
        }}
      />

      <Grain />
      <div className="relative">{children}</div>
    </section>
  );
}
