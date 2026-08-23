// The three art directions for the Lab, one shared dataset, one
// shared state (Football selected). Local preview, gitignored.
//
// Brand rules obeyed in all three: words Geist, numbers font-money,
// purple only on the selected (pressable) fact via the committed
// brand classes, money green/red only for money, light page #F7F7FB,
// dark page #04081B with cards #0E1228 and hairlines, chart on the
// page in light and on a raised panel in dark.

import { answer, groups, moneyText, spark, type Fact } from "./data";

function Spark({ id, height = 72 }: { id: string; height?: number }) {
  const w = 340;
  const min = Math.min(...spark);
  const max = Math.max(...spark);
  const range = max - min || 1;
  const pts = spark
    .map(
      (v, i) =>
        `${((i / (spark.length - 1)) * w).toFixed(1)},${(
          height -
          6 -
          ((v - min) / range) * (height - 12)
        ).toFixed(1)}`
    )
    .join(" ");
  const zero = height - 6 - ((0 - min) / range) * (height - 12);
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="lab-spark"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--spark)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--spark)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1={zero}
        x2={w}
        y2={zero}
        stroke="var(--hair)"
        strokeDasharray="3 4"
      />
      <polygon
        points={`0,${height} ${pts} ${w},${height}`}
        fill={`url(#${id}-fill)`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke="var(--spark)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function moneyClass(v: number): string {
  return v >= 0 ? "lab-pos" : "lab-neg";
}

function Answer({ id }: { id: string }) {
  return (
    <section className="lab-hero">
      <div className="lab-hero-top">
        <p className="lab-hero-q">
          Your question · <b>{answer.title}</b>
        </p>
        <span className="lab-hero-clear">Clear ×</span>
      </div>
      <p className={`lab-hero-money font-money ${moneyClass(answer.profit)}`}>
        {moneyText(answer.profit)}
      </p>
      <Spark id={id} />
      <div className="lab-hero-facts">
        <span>
          <i>Record</i>
          <b className="font-money">
            {answer.wins}-{answer.losses}
          </b>
        </span>
        <span>
          <i>Hit rate</i>
          <b className="font-money">{answer.hit}%</b>
        </span>
        <span>
          <i>ROI</i>
          <b className="font-money">{answer.roi}%</b>
        </span>
        <span>
          <i>Bets</i>
          <b className="font-money">{answer.bets}</b>
        </span>
      </div>
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span className={`lab-chev ${open ? "open" : ""}`} aria-hidden="true">
      ›
    </span>
  );
}

const SHARED = `
  .labd { min-height: 100svh; padding: 24px 16px 48px;
    background: #F7F7FB; color: #171717; }
  [data-theme="dark"] .labd { background: #04081B; color: #fff; }
  .labd { --hair: rgba(23,23,23,0.12); --spark: #059669;
    --muted: #737373; --card: #fff; --ring: rgba(23,23,23,0.08);
    --inner: #F4F4F7; }
  [data-theme="dark"] .labd { --hair: rgba(255,255,255,0.14);
    --spark: #34d399; --muted: #a3a3a3; --card: #0E1228;
    --ring: rgba(255,255,255,0.07); --inner: #161D38; }
  .labd * { box-sizing: border-box; }
  .labd-max { max-width: 430px; margin: 0 auto; }
  .lab-pos { color: #059669; } .lab-neg { color: #dc2626; }
  [data-theme="dark"] .lab-pos { color: #34d399; }
  [data-theme="dark"] .lab-neg { color: #f87171; }
  .lab-tabs { display: flex; gap: 6px; margin-bottom: 18px; }
  .lab-tab { font-size: 14px; font-weight: 700; padding: 8px 16px;
    border-radius: 10px; color: var(--muted); }
  .lab-tab.on { background: var(--card); color: inherit;
    box-shadow: 0 0 0 1px var(--ring); }
  [data-theme="dark"] .lab-tab.on { background: var(--inner); }
  .lab-hero-top { display: flex; justify-content: space-between;
    align-items: baseline; }
  .lab-hero-q { font-size: 13px; color: var(--muted); margin: 0; }
  .lab-hero-q b { color: inherit; }
  .lab-hero-clear { font-size: 12px; font-weight: 600; color: var(--muted); }
  .lab-hero-money { font-size: 40px; font-weight: 500; margin: 6px 0 2px;
    letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
  .lab-spark { width: 100%; height: 72px; display: block; margin: 4px 0 10px; }
  .lab-hero-facts { display: flex; gap: 22px; }
  .lab-hero-facts i { display: block; font-style: normal; font-size: 10px;
    font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); }
  .lab-hero-facts b { font-size: 16px; font-weight: 600;
    font-variant-numeric: tabular-nums; }
  .lab-chev { display: inline-block; transform: rotate(0deg);
    transition: transform .15s; color: var(--muted); font-weight: 700; }
  .lab-chev.open { transform: rotate(90deg); }
  .lab-gtitle { display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.02em; }
  .lab-gcount { font-size: 12px; font-weight: 500; color: var(--muted); }
  .lab-all { font-size: 13px; font-weight: 600; color: var(--muted); }
  .lab-bets { display: block; width: 100%; text-align: center;
    margin-top: 18px; padding: 13px; border-radius: 14px;
    background: var(--card); box-shadow: 0 0 0 1px var(--ring);
    font-size: 14px; font-weight: 700; }
`;

/* ---------------- DIRECTION 1: TILES ---------------- */

function Tile({ f }: { f: Fact }) {
  const sel = f.selected;
  return (
    <div
      className={`t-tile ${sel ? "bg-brand-top text-white" : ""} ${
        f.muted ? "t-muted" : ""
      }`}
    >
      <span className="t-icon">{f.icon}</span>
      <span className="t-name">{f.label}</span>
      <span
        className={`t-money font-money ${sel ? "" : moneyClass(f.money)}`}
      >
        {moneyText(f.money)}
      </span>
      <span className="t-rec font-money">
        {f.wins}-{f.losses}
      </span>
    </div>
  );
}

export function Tiles() {
  return (
    <div className="labd">
      <style>{SHARED}</style>
      <style>{`
        .t-board { display: flex; flex-direction: column; gap: 14px;
          margin-top: 20px; }
        .t-group { background: var(--card); border-radius: 18px;
          box-shadow: 0 0 0 1px var(--ring); padding: 14px; }
        .t-head { display: flex; align-items: center; gap: 8px; }
        .t-head .lab-all { margin-left: auto; }
        .t-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          margin-top: 12px; }
        .t-tile { position: relative; border-radius: 14px; padding: 12px;
          display: flex; flex-direction: column; gap: 2px; }
        .t-tile:not(.bg-brand-top) { background: var(--inner); }
        .t-icon { font-size: 20px; margin-bottom: 4px; }
        .t-name { font-size: 13px; font-weight: 600; }
        .t-money { font-size: 16px; font-weight: 600;
          font-variant-numeric: tabular-nums; }
        .t-rec { position: absolute; top: 12px; right: 12px; font-size: 11px;
          color: var(--muted); font-variant-numeric: tabular-nums; }
        .t-tile.bg-brand-top .t-rec { color: rgba(255,255,255,0.7); }
        .t-muted { opacity: 0.55; }
        .t-collapsed .t-grid { display: none; }
        .t-expand { font-size: 12px; font-weight: 600; color: var(--muted);
          text-align: right; margin: 0 0 -6px; }
      `}</style>
      <div className="labd-max">
        <div className="lab-tabs">
          <span className="lab-tab">Review</span>
          <span className="lab-tab on">Lab</span>
        </div>
        <Answer id="tiles" />
        <p className="t-expand">Collapse all</p>
        <div className="t-board">
          {groups.map((g, gi) => {
            const collapsed = g.key === "risk";
            return (
              <section
                key={g.key}
                className={`t-group ${collapsed ? "t-collapsed" : ""}`}
              >
                <div className="t-head">
                  <span className="lab-gtitle">
                    <Chevron open={!collapsed} /> {g.label}
                    <span className="lab-gcount">{g.facts.length}</span>
                  </span>
                  <span className="lab-all">{g.allLabel} ›</span>
                </div>
                <div className="t-grid">
                  {g.facts.map((f) => (
                    <Tile key={f.label} f={f} />
                  ))}
                </div>
                {gi === 99 ? null : null}
              </section>
            );
          })}
        </div>
        <span className="lab-bets">See the {answer.bets} bets behind this ›</span>
      </div>
    </div>
  );
}

/* ---------------- DIRECTION 2: LEDGER ---------------- */

export function Ledger() {
  return (
    <div className="labd">
      <style>{SHARED}</style>
      <style>{`
        .l-group { margin-top: 22px; }
        .l-head { display: flex; align-items: baseline; gap: 8px;
          padding-bottom: 6px; }
        .l-head .lab-all { margin-left: auto; }
        .l-rows { border-top: 1px solid var(--hair); }
        .l-row { display: flex; align-items: center; gap: 12px;
          padding: 11px 2px; border-bottom: 1px solid var(--hair); }
        .l-ic { width: 34px; height: 34px; border-radius: 999px;
          background: var(--inner); display: flex; align-items: center;
          justify-content: center; font-size: 16px; flex: none; }
        .l-row.on .l-ic { background: rgba(255,255,255,0.2); }
        .l-name { min-width: 0; }
        .l-name b { display: block; font-size: 14px; font-weight: 600;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .l-name i { font-style: normal; font-size: 11px; color: var(--muted);
          font-variant-numeric: tabular-nums; }
        .l-money { margin-left: auto; font-size: 15px; font-weight: 700;
          font-variant-numeric: tabular-nums; }
        .l-row.on { border-radius: 14px; padding: 11px 12px; margin: 2px -12px;
          border-bottom-color: transparent; }
        .l-row.on .l-name i { color: rgba(255,255,255,0.7); }
        .l-muted { opacity: 0.55; }
      `}</style>
      <div className="labd-max">
        <div className="lab-tabs">
          <span className="lab-tab">Review</span>
          <span className="lab-tab on">Lab</span>
        </div>
        <Answer id="ledger" />
        {groups.map((g) => (
          <section key={g.key} className="l-group">
            <div className="l-head">
              <span className="lab-gtitle">
                <Chevron open /> {g.label}
                <span className="lab-gcount">{g.facts.length}</span>
              </span>
              <span className="lab-all">{g.allLabel} ›</span>
            </div>
            <div className="l-rows">
              {g.facts.map((f) => (
                <div
                  key={f.label}
                  className={`l-row ${
                    f.selected ? "on bg-brand-top text-white" : ""
                  } ${f.muted ? "l-muted" : ""}`}
                >
                  <span className="l-ic">{f.icon}</span>
                  <span className="l-name">
                    <b>{f.label}</b>
                    <i>
                      {f.wins}-{f.losses}
                    </i>
                  </span>
                  <span
                    className={`l-money font-money ${
                      f.selected ? "" : moneyClass(f.money)
                    }`}
                  >
                    {moneyText(f.money)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
        <span className="lab-bets">See the {answer.bets} bets behind this ›</span>
      </div>
    </div>
  );
}

/* ---------------- DIRECTION 3: DECK ---------------- */

export function Deck() {
  return (
    <div className="labd">
      <style>{SHARED}</style>
      <style>{`
        .d-group { margin-top: 20px; }
        .d-head { display: flex; align-items: baseline; gap: 8px;
          margin-bottom: 10px; }
        .d-head .lab-all { margin-left: auto; }
        .d-rail { display: flex; gap: 8px; overflow-x: auto;
          margin: 0 -16px; padding: 0 16px 4px;
          scrollbar-width: none; }
        .d-card { flex: none; width: 118px; border-radius: 16px;
          box-shadow: 0 0 0 1px var(--ring);
          padding: 12px; display: flex; flex-direction: column; gap: 2px; }
        .d-card:not(.bg-brand-top) { background: var(--card); }
        .d-icon { font-size: 22px; margin-bottom: 6px; }
        .d-name { font-size: 12px; font-weight: 600; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; }
        .d-money { font-size: 15px; font-weight: 700;
          font-variant-numeric: tabular-nums; }
        .d-rec { font-size: 11px; color: var(--muted);
          font-variant-numeric: tabular-nums; }
        .d-card.on .d-rec { color: rgba(255,255,255,0.7); }
        .d-all { justify-content: center; align-items: center;
          background: none; box-shadow: 0 0 0 1px var(--hair);
          border-style: dashed; color: var(--muted); font-size: 13px;
          font-weight: 600; text-align: center; }
        .d-muted { opacity: 0.55; }
      `}</style>
      <div className="labd-max">
        <div className="lab-tabs">
          <span className="lab-tab">Review</span>
          <span className="lab-tab on">Lab</span>
        </div>
        <Answer id="deck" />
        {groups.map((g) => (
          <section key={g.key} className="d-group">
            <div className="d-head">
              <span className="lab-gtitle">
                <Chevron open /> {g.label}
                <span className="lab-gcount">{g.facts.length}</span>
              </span>
            </div>
            <div className="d-rail">
              {g.facts.map((f) => (
                <div
                  key={f.label}
                  className={`d-card ${
                    f.selected ? "on bg-brand-top text-white" : ""
                  } ${f.muted ? "d-muted" : ""}`}
                >
                  <span className="d-icon">{f.icon}</span>
                  <span className="d-name">{f.label}</span>
                  <span
                    className={`d-money font-money ${
                      f.selected ? "" : moneyClass(f.money)
                    }`}
                  >
                    {moneyText(f.money)}
                  </span>
                  <span className="d-rec font-money">
                    {f.wins}-{f.losses}
                  </span>
                </div>
              ))}
              <div className="d-card d-all">{g.allLabel} ›</div>
            </div>
          </section>
        ))}
        <span className="lab-bets">See the {answer.bets} bets behind this ›</span>
      </div>
    </div>
  );
}
