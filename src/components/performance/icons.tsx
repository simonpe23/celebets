// Icons for the new Home, drawn from "0. Chat Aug 28.png", the combined
// master mockup. Line art, each in its sampled colour. The indigo is the
// mockup's own, sampled at #3614F0 (fills #3708E4): the owner's final
// ruling of 28 August 2026, "pick the purple color from the mockup",
// which replaces the earlier "keep apps purple".
//
// Colours come from the shared dial, `../performance-ui`, since 30
// August 2026. The values did not change; they simply stopped being
// private to this folder. Never write a hex here again: add a token to
// that file and import it.

import {
  CHEV,
  FACT_GLYPH,
  GLYPH,
  INDIGO,
  ON_BRAND,
  ORANGE,
  SELECTOR_CHEV,
  SUBGREEN,
  TARGET_RED,
  WASH_DOT,
  WASH_LINE,
} from "./ui";

const MARK = INDIGO;
const SLATE = FACT_GLYPH;

// The small circled i beside the Net profit label.
export function InfoDot({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke={GLYPH} strokeWidth="1.6" />
      <path d="M10 9 v4.4" stroke={GLYPH} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="6.1" r="1.05" fill={GLYPH} />
    </svg>
  );
}

// The chevron on the This month selector.
export function ChevDown({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 5.5 L8 10.5 L13 5.5"
        stroke={SELECTOR_CHEV}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The small green rise beside the ROI figure under the number.
export function MiniTrend({ size = 12, color = SUBGREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2.5 14 l5 -5 3 2.5 6.5 -6.5"
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.5 5 h4.5 v4.5" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The four grey marks on the fact strip.
export function FactNote({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" stroke={SLATE} strokeWidth="2.2" />
      <path d="M8.5 8.5 h7 M8.5 12 h7 M8.5 15.5 h4" stroke={SLATE} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function FactTarget({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke={SLATE} strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.5" stroke={SLATE} strokeWidth="2.2" />
      <circle cx="12" cy="12" r="1.4" fill={SLATE} />
    </svg>
  );
}

export function FactTrend({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 17.5 l5.5 -5.5 3.5 3 7.5 -7.5"
        stroke={SLATE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 7.5 h5.5 v5.5" stroke={SLATE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FactWave({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 15.5 l4.5 -4.5 3.5 3 5 -5 4.5 2"
        stroke={SLATE}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 19.5 h18" stroke={SLATE} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// The orange sparkle inside the Actuals noticed card, mockup 0.
export function GoldSparkle({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 2 C17.2 11 20.5 14.5 29 16 C20.5 17.5 17.2 21 16 30 C14.8 21 11.5 17.5 3 16 C11.5 14.5 14.8 11 16 2 Z"
        fill={ORANGE}
      />
    </svg>
  );
}

// One chevron, any colour.
export function Chev({ size = 10, color = CHEV }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 2.5 L11 8 L5 13.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The four dots on the Heat Map pill.
export function HeatDots({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="3" width="5.5" height="5.5" rx="1.6" fill={MARK} />
      <rect x="12" y="4.5" width="4" height="4" rx="1.4" fill={MARK} />
      <rect x="4.5" y="12" width="4" height="4" rx="1.4" fill={MARK} />
      <rect x="11.5" y="11.5" width="5" height="5" rx="1.6" fill={MARK} />
    </svg>
  );
}

// The rising line that sat beside "What changed?". NOTHING DRAWS IT
// ANY MORE: he deleted that pill on 31 August 2026, "i don't think
// it's that needed." Kept because this is an icon library and the
// shape may be wanted again.
export function ChangedMark({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="M3 19 l6 -6 4 3 9 -9"
        stroke={MARK}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 7 h6 v6" stroke={MARK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The row tiles: dollar, ball, trend, layers, and the red target.
export function DollarIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={MARK} strokeWidth="1.8" />
      <path
        d="M14.6 9.2 c-0.4 -1 -1.4 -1.6 -2.6 -1.6 -1.5 0 -2.6 0.9 -2.6 2.1 0 1.1 0.8 1.7 2.6 2.1 1.9 0.4 2.8 1 2.8 2.2 0 1.3 -1.2 2.2 -2.8 2.2 -1.3 0 -2.4 -0.7 -2.8 -1.7 M12 6 v1.6 M12 16.2 v1.8"
        stroke={MARK}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BallIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={MARK} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" stroke={MARK} strokeWidth="1.6" />
      <circle cx="12" cy="6.4" r="1.1" fill={MARK} />
      <circle cx="17.3" cy="10.2" r="1.1" fill={MARK} />
      <circle cx="15.3" cy="16.4" r="1.1" fill={MARK} />
      <circle cx="8.7" cy="16.4" r="1.1" fill={MARK} />
      <circle cx="6.7" cy="10.2" r="1.1" fill={MARK} />
    </svg>
  );
}

export function TrendTileIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 17.5 l5.5 -5.5 3.5 3 7 -7"
        stroke={MARK}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.8 8 h5.2 v5.2" stroke={MARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.2" cy="8" r="1" fill={MARK} />
    </svg>
  );
}

export function LayersIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5 L21 8 12 12.5 3 8 Z" stroke={MARK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M4.5 12.2 L12 16 19.5 12.2" stroke={MARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.2 L12 20 19.5 16.2" stroke={MARK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RedTarget({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke={TARGET_RED} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" stroke={TARGET_RED} strokeWidth="1.8" />
      <path d="M12 2.5 v3 M12 18.5 v3 M2.5 12 h3 M18.5 12 h3" stroke={TARGET_RED} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// The white stacked layers inside the Lab card's purple orb.
export function OrbLayers({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4 L20 8.2 12 12.4 4 8.2 Z" fill={ON_BRAND} />
      <path d="M12 12 L20 11.5 12 16.6 4 11.5 Z" fill={ON_BRAND} opacity="0.72" />
      <path d="M12 16 L20 14.8 12 20 4 14.8 Z" fill={ON_BRAND} opacity="0.45" />
    </svg>
  );
}

// THE FOUR TAB BAR MARKS ARE GONE, 31 August 2026. A target for
// Track, a rising arrow for Performance, a magnifier and a person,
// drawn from the top list sheet for this area's own tab bar. That bar
// was deleted: every page draws the app's own `TabBar.tsx` now, and it
// brings its own icons. Nothing else imported these four.

// The faint contour lines and dot grid living inside the wash. Round
// 2 note from the owner: subtle, and behind the chart. Kept close to
// invisible on purpose.
export function WashTexture() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 390 372"
      fill="none"
      aria-hidden
    >
      {[0, 16, 32, 48, 64].map((o) => (
        <path
          key={o}
          d={`M-20 ${268 + o * 0.8} C 70 ${240 + o} 150 ${310 - o * 0.4} 250 ${288 + o * 0.5} S 380 ${252 + o} 410 ${272 + o}`}
          stroke={WASH_LINE}
          strokeWidth="0.7"
          opacity="0.15"
        />
      ))}
      {Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 11 }, (_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={210 + c * 17}
            cy={200 + r * 17}
            r="0.8"
            fill={WASH_DOT}
            opacity="0.12"
          />
        ))
      )}
    </svg>
  );
}
