// Lab's chip icons, rebuilt 29 August 2026 after the owner rejected
// the round 1 set ("i particularly hate your icons. they all look
// the same"). The mockup's rule, which he prefers: concrete things
// (sports, leagues) wear full colour identity icons, the platform's
// own emoji, exactly what his mockup designer used; abstract
// dimensions (Category, When, Bet Type, Risk) wear quiet outline
// glyphs, slate at rest and indigo when selected.

import { GLYPH, INDIGO, MENU_IDLE } from "./ui";

const SLATE = GLYPH;

type P = { size?: number; color?: string };

// The colour icon: one emoji, sized to sit in a chip. On the phone
// this renders the platform's own glossy set, which is what the
// mockup shows.
export function Emoji({ e, size = 18 }: { e: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="shrink-0 leading-none"
      style={{ fontSize: `${size}px` }}
    >
      {e}
    </span>
  );
}

export function MoneyIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.4" stroke={color} strokeWidth="1.5" />
      <path
        d="M10 5.8v1m0 6.4v1m2-6c-.35-.7-1.1-1.05-2-1.05-1.15 0-2.1.7-2.1 1.65 0 2.2 4.2 1.15 4.2 3.35 0 .95-.95 1.65-2.1 1.65-.9 0-1.65-.35-2-1.05"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SpreadIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M12.2 3.6h4.2v4.2M16.4 3.6l-5.6 5.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.8 16.4H3.6v-4.2M3.6 16.4l5.6-5.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TotalsIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6.2 8.2L10 4.4l3.8 3.8M10 4.6v4.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 13.4l3.8 3.8 3.8-3.8M10 17v-4.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export function TargetIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.6" stroke={color} strokeWidth="1.5" />
      <circle cx="10" cy="10" r="0.9" fill={color} />
    </svg>
  );
}

export function WhistleIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="7.6" cy="11.8" r="4.4" stroke={color} strokeWidth="1.5" />
      <path d="M10.9 8.9l5.7-3.3M12 11.4l4.6-1.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7.6" cy="11.8" r="1" fill={color} />
    </svg>
  );
}

export function TrendLineIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3.4 14.6l4.2-4.2 2.8 2.8 6.2-6.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.6 6.6h4v4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ size = 16, color = SLATE, half = false }: P & { half?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.5" />
      {half ? (
        <path d="M10 5.4A4.6 4.6 0 0 1 10 14.6Z" fill={color} opacity="0.28" />
      ) : null}
      <path d="M10 6.4V10l2.6 1.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StackIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 3.6 3.4 7.2 10 10.8l6.6-3.6L10 3.6Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3.4 10.8 10 14.4l6.6-3.6M3.4 14 10 17.6 16.6 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

export function ChainIcon({ size = 16, color = SLATE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M8.6 11.4 11.4 8.6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.2 9.4 5.4 11.2a3 3 0 0 0 4.2 4.2l1.8-1.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.8 10.6l1.8-1.8a3 3 0 0 0-4.2-4.2L8.6 6.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The risk gauge. The needle position tells low, medium and high
// apart; the colour never does, because green and red mean money
// moved and nothing else.
export function GaugeIcon({ size = 16, color = SLATE, level = 0 }: P & { level?: 0 | 1 | 2 }) {
  const angle = [-52, 0, 52][level];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3.4 13.6a7 7 0 0 1 13.2 0" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <g transform={`rotate(${angle} 10 13.4)`}>
        <path d="M10 13.4V8.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <circle cx="10" cy="13.4" r="1.2" fill={color} />
    </svg>
  );
}

export function CompareIcon({ size = 20, color = INDIGO }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3.4" y="8.4" width="5" height="8" rx="1.4" stroke={color} strokeWidth="1.6" />
      <rect x="11.6" y="4.4" width="5" height="12" rx="1.4" stroke={color} strokeWidth="1.6" opacity="0.6" />
    </svg>
  );
}

export function PlusIcon({ size = 20, color = MENU_IDLE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 4.6v10.8M4.6 10h10.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 12, color = MENU_IDLE }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5.4 5.4l9.2 9.2M14.6 5.4l-9.2 9.2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
