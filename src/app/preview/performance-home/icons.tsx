// Icons drawn to match the owner's Home mockup, 14. Chat Aug 27.png.
// Every icon is line art in its own colour, no background circle,
// exactly as the mockup draws them. The purples come from the brand
// variables per the owner's one allowed edit: the mockup's purple is
// replaced by the app's pre-defined purple.

const MARK = "var(--brand-mark)";

// Concentric target with a dart, the Moneyline row. Purple rings, red
// dart from the top right into the centre.
export function TargetIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="22" cy="26" r="16" stroke={MARK} strokeWidth="3" />
      <circle cx="22" cy="26" r="10" stroke={MARK} strokeWidth="3" />
      <circle cx="22" cy="26" r="4" fill={MARK} />
      <path
        d="M22 26 L36 12"
        stroke="#F4261E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M36 12 l8 -2 -5 -3 -1 -5 -3 5 z" fill="#F4261E" />
    </svg>
  );
}

// Purple football, the Premier League row. The mockup also draws a
// small solid green dot on its top right corner; copied as drawn.
export function FootballIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="23" cy="26" r="17" stroke={MARK} strokeWidth="3" />
      <path d="M23 17 l8 6 -3 9 h-10 l-3 -9 z" fill={MARK} />
      <path
        d="M23 17 v-8 M31 23 l8 -3 M28 32 l5 7 M18 32 l-5 7 M15 23 l-8 -3"
        stroke={MARK}
        strokeWidth="3"
      />
      <circle cx="40" cy="8" r="4" fill="#1DB954" />
    </svg>
  );
}

// Orange speedometer, the Low odds row.
export function GaugeIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="26" r="16" stroke="#F97735" strokeWidth="3" />
      <path
        d="M24 26 L31 18"
        stroke="#F97735"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="26" r="2.6" fill="#F97735" />
      <path
        d="M24 13 v3 M35 20 l-2.5 1.5 M13 20 l2.5 1.5"
        stroke="#F97735"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Two teal circles joined by a bar, the Singles row.
export function SinglesIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="12" cy="36" r="7" stroke="#23A8A1" strokeWidth="3" />
      <circle cx="34" cy="14" r="7" stroke="#23A8A1" strokeWidth="3" />
      <path
        d="M17 31 L29 19"
        stroke="#23A8A1"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Red person with small bars, the Player Props row.
export function PropsIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="18" cy="14" r="7" stroke="#F4261E" strokeWidth="3" />
      <path
        d="M6 42 v-4 a12 12 0 0 1 21 -7"
        stroke="#F4261E"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="30" y="30" width="4" height="11" rx="1" fill="#F4261E" />
      <rect x="37" y="24" width="4" height="17" rx="1" fill="#F4261E" />
    </svg>
  );
}

// The amber four point sparkle with its little dots, the insight mark.
export function SparkleIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M20 6 C21 14 24 17 32 18 C24 19 21 22 20 30 C19 22 16 19 8 18 C16 17 19 14 20 6 Z"
        stroke="#F97735"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="7" r="1.6" fill="#F97735" />
      <circle cx="7" cy="8" r="1.6" fill="#F97735" />
      <circle cx="33" cy="30" r="1.6" fill="#F97735" />
      <circle cx="8" cy="31" r="1.6" fill="#F97735" />
    </svg>
  );
}

// Four outlined squares, the heat map door. Purple and red as drawn.
export function HeatIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden>
      <rect x="4" y="4" width="12" height="12" rx="2" stroke={MARK} strokeWidth="3" />
      <rect x="21" y="4" width="12" height="12" rx="2" stroke="#F4261E" strokeWidth="3" />
      <rect x="4" y="21" width="12" height="12" rx="2" stroke={MARK} strokeWidth="3" />
      <rect x="21" y="21" width="12" height="12" rx="2" stroke="#F4261E" strokeWidth="3" />
    </svg>
  );
}

// The little rising line beside the What changed link.
export function ChangedIcon({ size = 20 }: { size?: number }) {
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

// Chevron used on both doors of the insight strip.
export function Chevron({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 2.5 L11 8 L5 13.5"
        stroke={MARK}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Three slider rows with knobs, the Lab card's mark.
export function SlidersIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M6 12 h8 M22 12 h20" stroke={MARK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="12" r="4" stroke={MARK} strokeWidth="3" />
      <path d="M6 24 h14 M30 24 h12" stroke={MARK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="26" cy="24" r="4" stroke={MARK} strokeWidth="3" />
      <path d="M6 36 h8 M22 36 h20" stroke={MARK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="36" r="4" stroke={MARK} strokeWidth="3" />
    </svg>
  );
}

// The flask on the Lab tab of the switcher.
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

// Small dark calendar on the time selector.
export function CalendarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="#3E4249" strokeWidth="2" />
      <path d="M3.5 10 h17 M8 3 v4 M16 3 v4" stroke="#3E4249" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// The four tab bar icons.
export function TrackTabIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M4 22 L11 14 L17 18 L27 7"
        stroke="#17171B"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="22" r="2.6" fill="#F8F4F3" stroke="#17171B" strokeWidth="2" />
      <circle cx="11" cy="14" r="2.6" fill="#F8F4F3" stroke="#17171B" strokeWidth="2" />
      <circle cx="17" cy="18" r="2.6" fill="#F8F4F3" stroke="#17171B" strokeWidth="2" />
      <circle cx="27" cy="7" r="2.6" fill="#F8F4F3" stroke="#17171B" strokeWidth="2" />
    </svg>
  );
}

export function PerformanceTabIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="6" y="17" width="4.6" height="9" rx="2.3" fill={MARK} />
      <rect x="13.7" y="11" width="4.6" height="15" rx="2.3" fill={MARK} />
      <rect x="21.4" y="5" width="4.6" height="21" rx="2.3" fill={MARK} />
    </svg>
  );
}

export function ResearchTabIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="8.5" stroke="#17171B" strokeWidth="2.4" />
      <path d="M20.5 20.5 L27 27" stroke="#17171B" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function ProfileTabIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="10.5" r="5.5" stroke="#17171B" strokeWidth="2.4" />
      <path
        d="M5.5 27 a10.5 8.5 0 0 1 21 0"
        stroke="#17171B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
