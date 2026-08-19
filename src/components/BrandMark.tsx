import { useId } from "react";

// The A mark alone, from the owner's symbol artwork, for places where
// the full wordmark is too wide: the Track header puts it beside the
// greeting (v9.3, August 2026). Inline SVG rather than a PNG because
// the mark must render crisply at 26px on any screen, and the artwork
// PNGs are wordmarks with the letters attached.
//
// Gradient ids go through useId: two marks on one page would otherwise
// define the same id and the second silently paints with the first's
// gradient, which is exactly the chart-id bug the rename fixed.
export default function BrandMark({ size = 26 }: { size?: number }) {
  const id = useId();
  const w = Math.round(size * (675 / 623));
  return (
    <svg
      viewBox="306 330 675 623"
      width={w}
      height={size}
      className="block shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}f`}
          x1="626"
          y1="350"
          x2="905"
          y2="895"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F56EFC" />
          <stop offset="0.28" stopColor="#DF51FC" />
          <stop offset="0.52" stopColor="#A640FA" />
          <stop offset="0.78" stopColor="#3A4AFA" />
          <stop offset="1" stopColor="#0B70FC" />
        </linearGradient>
        <linearGradient
          id={`${id}b`}
          x1="618"
          y1="385"
          x2="450"
          y2="690"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#9A1FF6" />
          <stop offset="1" stopColor="#6C1BF3" />
        </linearGradient>
        <linearGradient
          id={`${id}d`}
          x1="340"
          y1="750"
          x2="490"
          y2="905"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#C932FC" />
          <stop offset="1" stopColor="#5A22FA" />
        </linearGradient>
      </defs>
      <path
        d="M576.3 399.6 L627.7 428.4 L492.7 669.4 L441.3 640.6 Z"
        fill={`url(#${id}b)`}
        stroke={`url(#${id}b)`}
        strokeWidth="80"
        strokeLinejoin="round"
      />
      <circle cx="414" cy="827" r="95" fill={`url(#${id}d)`} />
      <path
        d="M601.4 403.2 L650.6 376.8 L914.6 866.8 L865.4 893.2 Z"
        fill={`url(#${id}f)`}
        stroke={`url(#${id}f)`}
        strokeWidth="100"
        strokeLinejoin="round"
      />
    </svg>
  );
}
