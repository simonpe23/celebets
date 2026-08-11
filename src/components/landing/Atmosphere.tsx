// THE THINGS THAT MAKE A PAGE FEEL LIKE SOMEWHERE.
//
// The owner on the first landing page: "no feeling, no emotion, no
// design of any value... page has no life." He was right. It was flat
// fills and text, and flat fills have no light in them, so nothing on
// the page cast a shadow or caught an edge.
//
// Everything here is one job: put light in the room. They are stacked
// behind content, never over it, and every one is pointer-events-none
// and aria-hidden, because none of it means anything.

// Stadium floodlights. Four beams raking down from the roofline at
// slightly different angles, blurred to gas. The angles are uneven on
// purpose: four evenly spaced beams read as a pattern, and a pattern
// reads as wallpaper rather than as light.
export function Beams({ className = "" }: { className?: string }) {
  const beams = [
    { left: "8%", rotate: -14, width: 150, opacity: 0.5 },
    { left: "28%", rotate: -6, width: 110, opacity: 0.35 },
    { left: "62%", rotate: 9, width: 170, opacity: 0.45 },
    { left: "84%", rotate: 17, width: 120, opacity: 0.3 },
  ];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
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
              "linear-gradient(to bottom, rgba(154,87,252,0.55), rgba(85,37,198,0.18) 45%, transparent 78%)",
          }}
        />
      ))}
    </div>
  );
}

// Film grain. The single cheapest thing that stops a large flat area
// looking like a screenshot of a colour picker. It is an inline SVG
// turbulence, so it costs no request and scales to any size.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function Grain({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{ backgroundImage: GRAIN, opacity }}
    />
  );
}

// THE STADIUM. A background-image, deliberately not next/image.
//
// The owner has exactly one photograph. If the file is not there, a CSS
// background fails SILENTLY: no broken icon, no console error, and the
// gradient underneath simply shows through. An <img> in the same place
// would leave a hole in the page. So the band below is designed to look
// finished with no photograph at all, and the photograph makes it
// better rather than making it work.
//
// TO ADD IT: drop the file at public/stadium.jpg. Nothing else changes.
export function StadiumBand({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-[#04081B] ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-[0.55]"
        style={{ backgroundImage: "url('/stadium.jpg')" }}
      />
      {/* The scrim. A photograph behind text needs to lose most of its
          contrast or the text has to grow a shadow, and text with a
          shadow on it is the oldest tell of an amateur page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(4,8,27,0.96) 0%, rgba(4,8,27,0.82) 42%, rgba(4,8,27,0.55) 100%), radial-gradient(120% 90% at 50% 0%, rgba(85,37,198,0.35), transparent 60%)",
        }}
      />
      <Grain opacity={0.05} />
      <div className="relative">{children}</div>
    </section>
  );
}
