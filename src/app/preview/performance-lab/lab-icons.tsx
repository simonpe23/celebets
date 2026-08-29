// Lab's chip icons, drawn in the accepted Home's icon language:
// hand drawn inline SVG, fill none, stroke #3614F0 (the sampled
// indigo), width 1.6 to 1.8 at viewBox 20, round caps and joins.
// Home's own icons (DollarIcon, BallIcon, LayersIcon, TrendTileIcon)
// are imported by the page for the facts they already cover, so one
// fact never wears two icons across the two pages.

const MARK = "#3614F0";

type P = { size?: number };

export function BasketballIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.2" stroke={MARK} strokeWidth="1.7" />
      <path d="M10 2.8v14.4M2.8 10h14.4" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.9 4.9c2.9 2.8 2.9 7.4 0 10.2M15.1 4.9c-2.9 2.8-2.9 7.4 0 10.2" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function BaseballIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.2" stroke={MARK} strokeWidth="1.7" />
      <path d="M5.2 4.4c1.6 3.4 1.6 7.8 0 11.2M14.8 4.4c-1.6 3.4-1.6 7.8 0 11.2" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.6 7.4l1.6.7M4.6 12.6l1.6-.7M15.4 7.4l-1.6.7M15.4 12.6l-1.6-.7" stroke={MARK} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function TennisIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.2" stroke={MARK} strokeWidth="1.7" />
      <path d="M3.4 7.2c3.2 1 5.2 4.2 4.6 9.7M16.6 12.8c-3.2-1-5.2-4.2-4.6-9.7" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function HockeyIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4.2 3.2l5 9.2c.6 1.1 1.7 1.8 3 1.8h3.2" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.4 3.6l-3.1 5.6" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="5.6" cy="16.2" rx="2.6" ry="1.4" stroke={MARK} strokeWidth="1.5" />
    </svg>
  );
}

export function AmFootballIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3.4 12.6c-.5 2 .3 3.6 1 4 .7.5 2.4.8 4.4 0 4.5-1.7 7.6-5.9 7.8-9.2.1-2-.3-3.6-1-4-.7-.5-2.4-.8-4.4 0C6.7 5.1 3.9 9 3.4 12.6Z" stroke={MARK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.4 12.6l5.2-5.2M8.2 13.4l1.2-1.2M11.4 10.2l1.2-1.2" stroke={MARK} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CoinIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <ellipse cx="10" cy="6.4" rx="6.2" ry="2.9" stroke={MARK} strokeWidth="1.6" />
      <path d="M3.8 6.4v7.2c0 1.6 2.8 2.9 6.2 2.9s6.2-1.3 6.2-2.9V6.4" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.8 10c0 1.6 2.8 2.9 6.2 2.9s6.2-1.3 6.2-2.9" stroke={MARK} strokeWidth="1.4" opacity="0.55" />
    </svg>
  );
}

export function SpreadIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M12.2 3.6h4.2v4.2M16.4 3.6l-5.6 5.6" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.8 16.4H3.6v-4.2M3.6 16.4l5.6-5.6" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TotalsIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6.2 8.2L10 4.4l3.8 3.8M10 4.6v4.6" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 13.4l3.8 3.8 3.8-3.8M10 17v-4.6" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export function TargetIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke={MARK} strokeWidth="1.6" />
      <circle cx="10" cy="10" r="3.6" stroke={MARK} strokeWidth="1.6" />
      <circle cx="10" cy="10" r="0.9" fill={MARK} />
    </svg>
  );
}

export function WhistleIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="7.6" cy="11.8" r="4.4" stroke={MARK} strokeWidth="1.6" />
      <path d="M10.9 8.9l5.7-3.3M12 11.4l4.6-1.1" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.6" cy="11.8" r="1" fill={MARK} />
    </svg>
  );
}

export function GoalIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 16V5.4h14V16" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8.6h14M6.5 5.4V16M10 5.4V16M13.5 5.4V16" stroke={MARK} strokeWidth="1.2" opacity="0.55" />
      <circle cx="10" cy="15" r="2" stroke={MARK} strokeWidth="1.5" fill="#FBFBFC" />
    </svg>
  );
}

export function FlagIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5.4 17V3.4" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5.4 4.2c3-1.6 6 1.6 9.2 0v6c-3.2 1.6-6.2-1.6-9.2 0" stroke={MARK} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function TrophyIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6.2 3.6h7.6v4.2a3.8 3.8 0 0 1-7.6 0V3.6Z" stroke={MARK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.2 5H3.6v1.4a2.8 2.8 0 0 0 2.8 2.8M13.8 5h2.6v1.4a2.8 2.8 0 0 1-2.8 2.8" stroke={MARK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 11.6v2.6m-2.8 2.2c.7-1.5 1.6-2.2 2.8-2.2s2.1.7 2.8 2.2H7.2Z" stroke={MARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ size = 20, half = false }: P & { half?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke={MARK} strokeWidth="1.6" />
      {half ? (
        <path d="M10 5.4A4.6 4.6 0 0 1 10 14.6Z" fill={MARK} opacity="0.28" />
      ) : null}
      <path d="M10 6.4V10l2.6 1.8" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChainIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M8.6 11.4 11.4 8.6" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.2 9.4 5.4 11.2a3 3 0 0 0 4.2 4.2l1.8-1.8" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.8 10.6l1.8-1.8a3 3 0 0 0-4.2-4.2L8.6 6.4" stroke={MARK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The risk gauge. The needle position tells low, medium and high
// apart; the colour never does, because green and red mean money
// moved and nothing else.
export function GaugeIcon({ size = 20, level = 0 }: P & { level?: 0 | 1 | 2 }) {
  const angle = [-52, 0, 52][level];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3.4 13.6a7 7 0 0 1 13.2 0" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" />
      <g transform={`rotate(${angle} 10 13.4)`}>
        <path d="M10 13.4V8.8" stroke={MARK} strokeWidth="1.7" strokeLinecap="round" />
      </g>
      <circle cx="10" cy="13.4" r="1.2" fill={MARK} />
    </svg>
  );
}

export function CompareIcon({ size = 20, color = MARK }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3.4" y="8.4" width="5" height="8" rx="1.4" stroke={color} strokeWidth="1.6" />
      <rect x="11.6" y="4.4" width="5" height="12" rx="1.4" stroke={color} strokeWidth="1.6" opacity="0.6" />
    </svg>
  );
}

export function PlusIcon({ size = 20, color = "#6B6E7A" }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M10 4.6v10.8M4.6 10h10.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 12, color = "#6B6E7A" }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5.4 5.4l9.2 9.2M14.6 5.4l-9.2 9.2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
