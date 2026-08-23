// Shared skin for the Portfolio living preview: the sampled palette
// and the components every view reuses. See PORTFOLIO-VIEWS.md.
//
// --pf-sub is the secondary-text pair: the owner rejected the thin
// grey ("i can't barely read it"), so sub-lines are weight 500 on
// this darker value, never --pf-muted.
//
// THE POLISH PASS, 22 August. Seven views had been built one per
// round, each solving its own sheet, and the seams showed: four
// different back bars, three segmented controls with two different
// active states, ten corner radii, and section gaps ranging from 4px
// to 26px with no rule behind any of them. What is shared now lives
// HERE and nowhere else:
//
//   --pf-r-card / -inner / -small   the only three radii
//   --pf-gap-section / -block       the only two vertical rhythms
//   PfTopBar                        the only back bar
//   PfSegments                      the only period control
//   .pf-chev                        the only chevron
//   :active / :focus-visible        the only feedback
//
// A value that appears in two view files is a bug. Add it here.

import { MOTION_CSS } from "./motion";

export const PF_CSS =
  MOTION_CSS +
  `
  /* Light values PIXEL-SAMPLED from v2_01_portfolio_home.png,
     22 August: purple #4506DC (score, links, chart line), green
     #04AF47, green pill #E2F4E8, soft grey #F5F5F7, lavender
     surfaces #F9F7FD, segmented active #F4F0FD, white cards with
     hairline borders. Dark derives the same roles on #090B17. */
  .pf { min-height: 100svh; background: #FEFEFE; color: #171717;
    padding: 24px 16px 96px; line-height: 1.4;
    --pf-purple: #4506DC; --pf-muted: #737373; --pf-sub: #4B4B55;
    --pf-inner: #F5F5F7; --pf-card: #FEFEFE; --pf-lav: #F9F7FD;
    --pf-seg: #F4F0FD; --pf-track: #F7F7F7;
    --pf-ring: rgba(23,23,23,0.12); --pf-tint: #F9F7FD;
    --pf-green: #069F41; --pf-red: #EF4444;
    --pf-greenbg: #E2F4E8; --pf-redbg: rgba(239,68,68,0.09);
    /* THREE RADII, and there is no fourth. Card wraps a whole
       section, inner wraps something sitting inside one, small is
       for chips and icon squares. The 16px inner is the value
       measured off v3_02, so the grid cards keep their geometry. */
    --pf-r-card: 18px; --pf-r-inner: 16px; --pf-r-small: 12px;
    /* TWO RHYTHMS. Section is the air between two ideas, block is
       the air inside one. Everything else was arbitrary. */
    --pf-gap-section: 24px; --pf-gap-block: 14px; }
  [data-theme="dark"] .pf { background: #090B17; color: #F4F4F6;
    --pf-purple: #8B5CF6; --pf-muted: #9CA3AF; --pf-sub: #C2C7D4;
    --pf-inner: #1B1D30; --pf-card: #121421; --pf-lav: #16142B;
    --pf-seg: #2A2352; --pf-track: #171A2C;
    --pf-ring: rgba(255,255,255,0.12); --pf-tint: #16142B;
    --pf-green: #4ADE80; --pf-red: #F87171;
    --pf-greenbg: rgba(74,222,128,0.16); --pf-redbg: rgba(248,113,113,0.11); }
  .pf * { box-sizing: border-box; }
  .pf-max { max-width: 430px; margin: 0 auto; }
  .pf .pos { color: var(--pf-green); }
  .pf .neg { color: var(--pf-red); }
  .pf-h1row { display: flex; justify-content: space-between;
    align-items: center; }
  .pf-h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.02em;
    margin: 0; line-height: 1.15; }
  /* A sub-line under a heading is READ, so it takes --pf-sub at 500.
     --pf-muted survives only on uppercase micro labels and chart
     axes, which are glanced at, not read. The owner's ruling: "i
     can't barely read it. so thin and gray." */
  .pf-sub { font-size: 14px; font-weight: 500; color: var(--pf-sub);
    margin: 4px 0 16px; }
  .pf-link { color: var(--pf-purple); font-size: 13px; font-weight: 600;
    text-decoration: none; background: none; border: none; padding: 0;
    font-family: inherit; cursor: pointer; }
  .pf-chev { color: var(--pf-muted); opacity: 0.55; font-size: 18px;
    font-weight: 700; line-height: 1; }
  .pf-spark { flex: none; }
  .pf-axis { font-size: 9px; fill: var(--pf-muted); }

  /* FEEDBACK, the same everywhere. Nothing in the prototype
     acknowledged a tap, which reads as broken before it reads as
     plain. Anything pressable dips; anything focused by keyboard
     shows the purple ring. */
  .pf button { transition: opacity 0.12s ease, transform 0.12s ease; }
  .pf button:active { opacity: 0.62; transform: scale(0.985); }
  .pf button:focus-visible { outline: 2px solid var(--pf-purple);
    outline-offset: 2px; border-radius: var(--pf-r-small); }

  /* THE DOOR: a full-width bordered card whose whole job is to open
     something bigger. Home's builder, What Changed's full list. It
     was three different shapes across three files. */
  .pf-door { display: flex; justify-content: space-between;
    align-items: center; width: 100%; border: 1px solid var(--pf-ring);
    background: var(--pf-card); border-radius: var(--pf-r-inner);
    padding: 15px 16px; cursor: pointer; font-family: inherit;
    color: var(--pf-purple); font-size: 14.5px; font-weight: 700;
    text-align: left; }
  .pf-door .pf-chev { color: var(--pf-purple); opacity: 1; }

  /* THE BACK BAR, one shape for every view that has one. */
  .pf-topbar { display: flex; align-items: center;
    gap: 12px; margin-bottom: 20px; min-height: 40px; }
  .pf-topbtn { width: 40px; height: 40px; flex: none;
    border-radius: var(--pf-r-small); border: 1px solid var(--pf-ring);
    background: var(--pf-card); color: inherit; display: flex;
    align-items: center; justify-content: center; cursor: pointer;
    padding: 0; }
  .pf-topbtn svg { width: 20px; height: 20px; }
  .pf-toptitle { flex: 1; min-width: 0; font-size: 17px;
    font-weight: 700; text-align: center; }
  .pf-topright { flex: none; display: flex; gap: 10px;
    align-items: center; }
  /* With no title the back button still must not stretch. */
  .pf-topbar .pf-topspacer { flex: 1; }

  /* THE PERIOD CONTROL, one implementation, one active state.
     Solid purple won over the lavender pill because a lavender fill
     on a white card is barely a state at all, and it disappears
     entirely on the dark page. */
  .pf-segs { display: flex; background: var(--pf-track);
    border-radius: 999px; padding: 3px; }
  .pf-segs.fill { width: 100%; }
  .pf-seg { border: none; background: none; color: var(--pf-sub);
    font-family: inherit; font-size: 12.5px; font-weight: 600;
    padding: 5px 4px; cursor: pointer; display: flex;
    justify-content: center; }
  .pf-segs.fill .pf-seg { flex: 1; }
  .pf-seglab { padding: 6px 14px; border-radius: 999px;
    line-height: 1.2; white-space: nowrap; }
  .pf-seglab.on { background: var(--pf-purple); color: #fff;
    font-weight: 700; }
`;

// The back bar every view shares. `right` takes whatever that view
// keeps up there (Map's list/map toggle, the Fact page's share and
// more buttons).
export function PfTopBar({
  onBack,
  title,
  right,
}: {
  onBack: () => void;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="pf-topbar">
      <button
        type="button"
        className="pf-topbtn"
        onClick={onBack}
        aria-label="Back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      {title === undefined ? (
        <span className="pf-topspacer" />
      ) : (
        <span className="pf-toptitle">{title}</span>
      )}
      {right === undefined ? (
        title === undefined ? null : (
          <span className="pf-topright" style={{ width: 40 }} />
        )
      ) : (
        <span className="pf-topright">{right}</span>
      )}
    </div>
  );
}

// The period control every chart shares. `fill` stretches it across
// the card (the Fact page and Compare); left alone it hugs its
// labels, which is what the Home hero's mockup draws.
export function PfSegments<T extends string>({
  items,
  value,
  onChange,
  fill = false,
  label = "Period",
}: {
  items: readonly T[];
  value: T;
  onChange: (v: T) => void;
  fill?: boolean;
  label?: string;
}) {
  return (
    <div className={`pf-segs ${fill ? "fill" : ""}`} role="group"
      aria-label={label}>
      {items.map((k) => (
        <button
          key={k}
          type="button"
          className="pf-seg"
          onClick={() => onChange(k)}
          aria-pressed={value === k}
        >
          <span className={`pf-seglab ${value === k ? "on" : ""}`}>{k}</span>
        </button>
      ))}
    </div>
  );
}

// The big axis chart, the 09-sheet style: dollar ticks left, dates
// under, dotted zero line, gradient fade under the line. Line color
// follows the chart rule: purple in profit, red in loss.
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function kMoney(v: number): string {
  const a = Math.abs(v);
  const body =
    a >= 1000 ? `$${(a / 1000).toFixed(a >= 10000 ? 0 : 1)}K` : `$${Math.round(a)}`;
  return v < 0 ? `-${body}` : body;
}

export function PfChart({
  series,
  height = 150,
  id,
  endDot = false,
}: {
  series: { t: number; v: number }[];
  height?: number;
  id: string;
  // The v2 fact sheet ends its line in a filled dot.
  endDot?: boolean;
}) {
  const w = 360;
  const padL = 40;
  const padB = 20;
  const padT = 8;
  if (series.length < 2) return <div style={{ height }} />;
  const minT = Math.min(...series.map((p) => p.t));
  const maxT = Math.max(...series.map((p) => p.t));
  const minV = Math.min(0, ...series.map((p) => p.v));
  const maxV = Math.max(0, ...series.map((p) => p.v));
  const rangeT = maxT - minT || 1;
  const rangeV = maxV - minV || 1;
  const x = (t: number) => padL + ((t - minT) / rangeT) * (w - padL - 6);
  const y = (v: number) =>
    padT + (1 - (v - minV) / rangeV) * (height - padT - padB);
  const xy = series.map((p) => [x(p.t), y(p.v)] as const);
  const pts = xy.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  // LEVEL B: the line draws itself left to right. Its length is
  // measured here rather than read off the DOM, so it is right on
  // the very first frame with no layout pass. `drawKey` remounts the
  // polyline when the data really changes, which is what replays the
  // animation; without it, changing the period would redraw a line
  // that never moves.
  let drawLen = 0;
  for (let i = 1; i < xy.length; i++) {
    drawLen += Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]);
  }
  const drawKey = `${series.length}:${Math.round(
    series[series.length - 1].v
  )}:${Math.round(series[0].t / 1000)}`;
  const line =
    series[series.length - 1].v >= 0 ? "var(--pf-purple)" : "var(--pf-red)";
  const dates: Date[] = [];
  for (let i = 0; i < 5; i++) dates.push(new Date(minT + (rangeT * i) / 4));
  const gid = `pfc-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={line} stopOpacity="0.24" />
          <stop offset="1" stopColor={line} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[maxV, 0, minV]
        .filter((v, i, a) => a.indexOf(v) === i)
        // A tick sitting almost on the zero line prints its label on
        // top of "$0". Drop it: the mockup's axis is always legible.
        .filter((v) => v === 0 || Math.abs(y(v) - y(0)) > 14)
        .map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={y(v)}
              x2={w - 4}
              y2={y(v)}
              stroke="var(--pf-ring)"
              strokeDasharray={v === 0 ? "3 4" : undefined}
              strokeWidth="1"
            />
            <text x={padL - 6} y={y(v) + 3} textAnchor="end" className="pf-axis">
              {kMoney(v)}
            </text>
          </g>
        ))}
      {dates.map((d, i) => (
        <text
          key={i}
          x={padL + ((w - padL - 6) * i) / 4}
          y={height - 5}
          textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
          className="pf-axis"
        >
          {`${MONTHS[d.getMonth()]} ${d.getDate()}`}
        </text>
      ))}
      <polygon
        key={`fill-${drawKey}`}
        className="pf-fill"
        points={`${x(series[0].t)},${y(minV)} ${pts} ${x(
          series[series.length - 1].t
        )},${y(minV)}`}
        fill={`url(#${gid})`}
      />
      <polyline
        key={drawKey}
        className="pf-draw"
        points={pts}
        fill="none"
        stroke={line}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={drawLen}
        strokeDashoffset={drawLen}
      />
      {endDot && (
        <circle
          cx={x(series[series.length - 1].t)}
          cy={y(series[series.length - 1].v)}
          r="4.5"
          fill={line}
        />
      )}
    </svg>
  );
}

// The row sparkline, with the mockup's soft fade under the line: a
// bare line read as dead, the owner's words.
export function PfSpark({
  data,
  color,
  id,
  w = 58,
  h = 24,
}: {
  data: number[];
  color: string;
  id: string;
  w?: number;
  h?: number;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const r = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${((i / (data.length - 1)) * w).toFixed(1)},${(
          h - 3 - ((v - min) / r) * (h - 6)
        ).toFixed(1)}`
    )
    .join(" ");
  const gid = `pfsp-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="pf-spark"
      style={{ width: w, height: h }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
