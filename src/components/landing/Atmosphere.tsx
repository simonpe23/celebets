// THE TEXTURE LAYER OF THE LANDING PAGE.
//
// This file once held beam and stadium photo components too. Both are
// gone by the owner's word, August 2026: the beams drew sharp lines
// where they met a container edge ("purple beams creates an ugly sharp
// line under the phones"), so the hero now uses radial glows that fade
// to nothing before any edge, written where they are used in page.tsx.
// The stadium photo he moved on from before ever sending the file.

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
