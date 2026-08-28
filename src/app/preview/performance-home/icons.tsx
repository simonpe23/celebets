// Icons drawn to match the owner's four area mockups, shared in chat
// 28 August 2026. Line art, each in its own colour, as the sheets draw
// them. The purples come from the brand variables per the standing
// edit: the mockup's purple is replaced by the app's pre-defined
// purple.

const MARK = "var(--brand-mark)";

// The flask on the Lab tab of the switcher, kept from the first sheet.
export function FlaskIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3 h6 M10 3 v6 L4.5 19 a1.6 1.6 0 0 0 1.5 2.2 h12 a1.6 1.6 0 0 0 1.5 -2.2 L14 9 V3"
        stroke={MARK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.4 15 h9.2" stroke={MARK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// The small circled i beside the Net profit label.
export function InfoDot({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="#8A8C93" strokeWidth="1.7" />
      <path d="M10 9 v4.4" stroke="#8A8C93" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="6.1" r="1.1" fill="#8A8C93" />
    </svg>
  );
}

// The chevron on the This month selector.
export function ChevDown({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 5.5 L8 10.5 L13 5.5"
        stroke="#26262B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The little green rise beside the ROI figure under the number.
export function MiniTrend({ size = 14, color = "#16A34A" }: { size?: number; color?: string }) {
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

// The four grey marks on the facts strip.
export function FactNote({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" stroke="#55575E" strokeWidth="1.8" />
      <path d="M8.5 8.5 h7 M8.5 12 h7 M8.5 15.5 h4" stroke="#55575E" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function FactTarget({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="#55575E" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="#55575E" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.4" fill="#55575E" />
    </svg>
  );
}

export function FactTrend({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 17.5 l5.5 -5.5 3.5 3 7.5 -7.5"
        stroke="#55575E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 7.5 h5.5 v5.5" stroke="#55575E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FactWave({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 16 c2.5 0 2.5 -6 5 -6 s2.5 8 5 8 2.5 -10 5 -10 2 4 3.5 4"
        stroke="#55575E"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// The gold sparkle inside the Actuals noticed card.
export function GoldSparkle({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 3 C17 11 20 14 28 16 C20 18 17 21 16 29 C15 21 12 18 4 16 C12 14 15 11 16 3 Z"
        fill="#CE9231"
      />
    </svg>
  );
}

// One chevron, any colour.
export function Chev({ size = 14, color = "#C6C7CC" }: { size?: number; color?: string }) {
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
export function HeatDots({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="3" width="5.5" height="5.5" rx="1.6" fill={MARK} />
      <rect x="12" y="4.5" width="4" height="4" rx="1.4" fill={MARK} />
      <rect x="4.5" y="12" width="4" height="4" rx="1.4" fill={MARK} />
      <rect x="11.5" y="11.5" width="5" height="5" rx="1.6" fill={MARK} />
    </svg>
  );
}

// The rising line beside What changed?
export function ChangedIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="M3 19 l6 -6 4 3 9 -9"
        stroke={MARK}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 7 h6 v6" stroke={MARK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The row tiles: dollar, ball, trend, layers, and the red target.
export function DollarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={MARK} strokeWidth="1.9" />
      <path
        d="M14.6 9.2 c-0.4 -1 -1.4 -1.6 -2.6 -1.6 -1.5 0 -2.6 0.9 -2.6 2.1 0 1.1 0.8 1.7 2.6 2.1 1.9 0.4 2.8 1 2.8 2.2 0 1.3 -1.2 2.2 -2.8 2.2 -1.3 0 -2.4 -0.7 -2.8 -1.7 M12 6 v1.6 M12 16.2 v1.8"
        stroke={MARK}
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BallIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke={MARK} strokeWidth="1.9" />
      <path d="M12 8.4 l3.4 2.5 -1.3 4 h-4.2 l-1.3 -4 z" stroke={MARK} strokeWidth="1.7" strokeLinejoin="round" />
      <path
        d="M12 8.4 V4.6 M15.4 10.9 l3.6 -1.2 M14.1 14.9 l2.2 3.1 M9.9 14.9 l-2.2 3.1 M8.6 10.9 L5 9.7"
        stroke={MARK}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrendTileIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 17.5 l5.5 -5.5 3.5 3 7 -7"
        stroke={MARK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.8 8 h5.2 v5.2" stroke={MARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="17.5" r="1.2" fill={MARK} />
    </svg>
  );
}

export function LayersIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5 L21 8 12 12.5 3 8 Z" stroke={MARK} strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M4.5 12.2 L12 16 19.5 12.2" stroke={MARK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 16.2 L12 20 19.5 16.2" stroke={MARK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RedTarget({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="#E5484D" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.6" stroke="#E5484D" strokeWidth="1.9" />
      <path d="M12 2.5 v3 M12 18.5 v3 M2.5 12 h3 M18.5 12 h3" stroke="#E5484D" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

// The white stacked layers inside the Lab card's purple orb.
export function OrbLayers({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4 L20 8.2 12 12.4 4 8.2 Z" fill="#FFFFFF" />
      <path d="M12 12 L20 11.5 12 16.6 4 11.5 Z" fill="#FFFFFF" opacity="0.75" />
      <path d="M12 16 L20 14.8 12 20 4 14.8 Z" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

// The small arrow inside the Explore Lab button.
export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 10 h12 M11 4.5 L16.5 10 11 15.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The four tab bar icons from the list sheet: a target for Track, a
// rising arrow for Performance, the magnifier, the person.
export function TrackTabIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="11" stroke="#26262B" strokeWidth="2.3" />
      <circle cx="16" cy="16" r="4" stroke="#26262B" strokeWidth="2.3" />
    </svg>
  );
}

export function PerformanceTabIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M4 23 l8 -8 4.5 4 11 -11"
        stroke={MARK}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 8 h7.5 v7.5" stroke={MARK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ResearchTabIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="8.5" stroke="#26262B" strokeWidth="2.3" />
      <path d="M20.5 20.5 L27 27" stroke="#26262B" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

export function ProfileTabIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="10.5" r="5.5" stroke="#26262B" strokeWidth="2.3" />
      <path
        d="M5.5 27 a10.5 8.5 0 0 1 21 0"
        stroke="#26262B"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
