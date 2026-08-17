/* THE TRACK PAGE, draft v9. Preview only, August 2026.

   THE RESET. The owner, after v8: "The original design is still the
   best version I have seen so far. v1 to v8 are all worse... I want
   the original design plus the best improvements from the redesign.
   When I see V9 my reaction should be: this is clearly the original
   product, but significantly better."

   So v9 is built FROM the live page's own design language, taken
   from src/lib/ui.ts and the live components, not from v8:
   - CARD: rounded-2xl, white, hairline ring, whisper shadow.
     Dark: #0E1228 with a white/[0.07] ring. Page #F7F7FB / #04081B.
   - Card headings INSIDE the card: 17px bold, sentence case. No
     uppercase band heads: that was v8's "form" feeling.
   - Chips are pills, tiles are rounded-xl neutral fills, links are
     ink plus a chevron.

   Layered on top, and only these, the redesign's genuine wins:
   - the A mark header, no emoji, no bell (owner kept this every round)
   - the wider chart, bleeding to the card's edges, with the period
     strip under it, and Set balance top right
   - bigger, tabular Inter Tight numbers
   - the four-across snapshot WITHOUT sparklines or emoji
   - a restrained premium insight: the live card's single soft halo
     (not v8's orb), an amber hairline ring, the amber stat
   - a whisper of the landing's purple at the very top

   THE HIERARCHY FIX the owner ordered: Connect your accounts is THE
   primary action of Track a bet: full width, the product's own BTN
   gradient, 52px tall like every primary in the app, left-aligned
   with its icon so it reads designed rather than generic CTA. The
   three manual doors sit under it as quiet equals. How it works is
   tertiary in the card header.

   Permanent rules untouched: fonts, purple = something you press,
   capture icon colours, green up red down, amber = insight only.

   Inline styles throughout: /preview is gitignored and Tailwind v4
   generates nothing from gitignored files. font-money exists in the
   app bundle. */

const IT = "var(--font-inter-tight)";

type Theme = {
  name: string;
  page: string;
  glow: string;
  ink: string;
  muted: string;
  faint: string;
  card: string;
  ring: string;
  cardShadow: string;
  hairSoft: string;
  inner: string;
  innerRing: string;
  purple: string;
  green: string;
  red: string;
  amber: string;
  amberRing: string;
  bar: string;
};

const LIGHT: Theme = {
  name: "Light",
  page: "#F7F7FB",
  glow: "rgba(124,58,237,0.10)",
  ink: "#111116",
  muted: "#525862",
  faint: "#9CA3AF",
  card: "#FFFFFF",
  ring: "rgba(16,16,26,0.06)",
  cardShadow: "0 1px 2px rgba(16,16,26,0.04)",
  hairSoft: "rgba(16,16,26,0.07)",
  inner: "#FAFAFA",
  innerRing: "rgba(16,16,26,0.05)",
  purple: "#5525C6",
  green: "#059669",
  red: "#DC2626",
  amber: "#B45309",
  amberRing: "rgba(180,83,9,0.26)",
  bar: "#ECECF3",
};

const DARK: Theme = {
  name: "Dark",
  page: "#04081B",
  glow: "rgba(154,87,252,0.14)",
  ink: "#F2F2F5",
  muted: "#A6ADBA",
  faint: "#6B7280",
  card: "#0E1228",
  ring: "rgba(255,255,255,0.07)",
  cardShadow: "none",
  hairSoft: "rgba(255,255,255,0.07)",
  inner: "rgba(255,255,255,0.03)",
  innerRing: "rgba(255,255,255,0.06)",
  purple: "#9A57FC",
  green: "#34D399",
  red: "#F87171",
  amber: "#FBBF24",
  amberRing: "rgba(251,191,36,0.30)",
  bar: "#0C1125",
};

/* The owner's A mark, from brand/actuals/symbol.svg, gradient ids
   prefixed so the two frames on this sheet cannot collide. */
function Mark({ id, h = 26 }: { id: string; h?: number }) {
  const w = Math.round(h * (675 / 623));
  return (
    <svg viewBox="306 330 675 623" width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`${id}f`} x1="626" y1="350" x2="905" y2="895" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F56EFC" />
          <stop offset="0.28" stopColor="#DF51FC" />
          <stop offset="0.52" stopColor="#A640FA" />
          <stop offset="0.78" stopColor="#3A4AFA" />
          <stop offset="1" stopColor="#0B70FC" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="618" y1="385" x2="450" y2="690" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9A1FF6" />
          <stop offset="1" stopColor="#6C1BF3" />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="340" y1="750" x2="490" y2="905" gradientUnits="userSpaceOnUse">
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

/* the live page's own sparkle, amber, solid */
function SparkleIcon({ c, s = 16 }: { c: string; s?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill={c} style={{ display: "block", flexShrink: 0 }}>
      <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2Z" />
    </svg>
  );
}

/* The trophy exactly as the live InsightCard draws it: ONE soft halo,
   a lit radial disc, an inset highlight. 48px. v8's double halo and
   62px disc are gone: "subtle premium highlight, not a glowing orb." */
function Trophy({ size = 48 }: { size?: number }) {
  return (
    <span style={{ position: "relative", flexShrink: 0, display: "block", width: size, height: size }}>
      <span
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: 999,
          background: "rgba(251,191,36,0.14)",
          filter: "blur(11px)",
        }}
      />
      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          borderRadius: 999,
          background: "radial-gradient(circle at 30% 25%, #FCD34D, #F59E0B 58%, #D97706)",
          boxShadow: "inset 0 1.5px 1.5px rgba(255,255,255,0.55)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.5}
          height={size * 0.5}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H4a1 1 0 0 0-1 1c0 2 1.5 3.5 4 4M17 6h3a1 1 0 0 1 1 1c0 2-1.5 3.5-4 4" />
        </svg>
      </span>
    </span>
  );
}

/* the original card heading: 17px bold, sentence case, INSIDE the card */
function Heading({ t, children }: { t: Theme; children: React.ReactNode }) {
  return <h2 style={{ fontSize: 17, fontWeight: 700, color: t.ink, margin: 0 }}>{children}</h2>;
}

/* a link inside a card: ink plus a chevron, the live CARD_LINK */
function CardLink({ t, children }: { t: Theme; children: React.ReactNode }) {
  return (
    <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: t.muted, whiteSpace: "nowrap" }}>
      {children} ›
    </span>
  );
}

function Micro({ t, children }: { t: Theme; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: t.faint,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Money({
  t,
  v,
  size,
  weight = 600,
  color,
}: {
  t: Theme;
  v: string;
  size: number;
  weight?: number;
  color?: string;
}) {
  return (
    <span
      className="font-money"
      style={{
        fontFamily: IT,
        fontSize: size,
        fontWeight: weight,
        fontVariantNumeric: "tabular-nums",
        color: color ?? t.ink,
        letterSpacing: "-0.01em",
      }}
    >
      {v}
    </span>
  );
}

/* the wide chart: bleeds to the card's own edges */
function Spark({ t, id }: { t: Theme; id: string }) {
  const pts =
    "0,44 22,40 44,46 66,34 88,38 110,28 132,31 154,22 176,26 198,16 220,19 242,10 264,14 286,6 308,9 330,4";
  return (
    <svg width="100%" height="80" viewBox="0 0 330 56" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`${id}fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.green} stopOpacity="0.26" />
          <stop offset="1" stopColor={t.green} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} 330,56 0,56`} fill={`url(#${id}fill)`} />
      <line x1="0" y1="46" x2="330" y2="46" stroke={t.hairSoft} strokeWidth="1" strokeDasharray="1 4" />
      <polyline points={pts} fill="none" stroke={t.green} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Icon({ d, c, box = 24, s = 20, w = 1.9 }: { d: string; c: string; box?: number; s?: number; w?: number }) {
  return (
    <svg viewBox={`0 0 ${box} ${box}`} width={s} height={s} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Phone({ t }: { t: Theme }) {
  // The live CARD, verbatim: rounded-2xl, hairline ring, whisper shadow.
  // margin, not container padding: the balance band above these has
  // to reach the phone's edges, so the cards carry their own inset
  const card: React.CSSProperties = {
    background: t.card,
    boxShadow: `0 0 0 1px ${t.ring}${t.cardShadow === "none" ? "" : `, ${t.cardShadow}`}`,
    borderRadius: 16,
    margin: "0 16px",
  };
  // The live INNER row.
  const inner: React.CSSProperties = {
    background: t.inner,
    boxShadow: `0 0 0 1px ${t.innerRing}`,
    borderRadius: 12,
  };

  return (
    <div
      style={{
        width: 393,
        border: `1px solid ${t.ring}`,
        borderRadius: 22,
        overflow: "hidden",
        background: t.page,
        fontFamily: "var(--font-geist-sans)",
        color: t.ink,
        position: "relative",
      }}
    >
      {/* a whisper of the landing at the very top, nothing more */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(360px 200px at 80% -60px, ${t.glow}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", padding: "18px 0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* header: kept from the redesign, the one piece the owner
            kept every round. No emoji, no bell. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
          <Mark id={`m${t.name}`} h={26} />
          <div style={{ fontSize: 22, fontWeight: 700, flex: 1, letterSpacing: "-0.01em" }}>Good evening, Simon</div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              boxShadow: `0 0 0 1px ${t.ring}`,
              background: t.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: t.muted,
            }}
          >
            S
          </div>
        </div>

        {/* TRACKING BALANCE: full bleed to the phone's edges, the one
            v8 idea the owner asked back for. A band, not a card: a
            hairline above and below, and the chart touching both
            sides. Everything below it stays a card. */}
        <section
          style={{
            background: t.card,
            borderTop: `1px solid ${t.ring}`,
            borderBottom: `1px solid ${t.ring}`,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Micro t={t}>Tracking balance</Micro>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  background: "linear-gradient(180deg,#5525C6,#4915AD)",
                  padding: "6px 11px",
                  borderRadius: 6,
                }}
              >
                Set balance
              </span>
            </div>
            <div style={{ marginTop: 6 }}>
              <Money t={t} v="$3,851.00" size={40} weight={500} />
            </div>
            <div style={{ marginTop: 3, display: "flex", alignItems: "baseline", gap: 7 }}>
              <span style={{ color: t.green, fontSize: 14, fontWeight: 600 }}>
                ▲ <span className="font-money" style={{ fontFamily: IT, fontVariantNumeric: "tabular-nums" }}>+$2,387.00</span>
              </span>
              <span style={{ fontSize: 11.5, color: t.faint, fontWeight: 500 }}>net profit, all time</span>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <Spark t={t} id={`sp${t.name}`} />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              borderTop: `1px solid ${t.hairSoft}`,
            }}
          >
            {[
              ["Today", "+$0", t.muted],
              ["Week", "+$120", t.green],
              ["Month", "+$610", t.green],
              ["Year", "+$2,387", t.green],
            ].map(([label, v, c], i) => (
              <div
                key={label as string}
                style={{
                  padding: "10px 0 13px",
                  paddingLeft: i === 0 ? 16 : 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  borderLeft: i ? `1px solid ${t.hairSoft}` : "none",
                }}
              >
                <Micro t={t}>{label}</Micro>
                <Money t={t} v={v as string} size={14} color={c as string} />
              </div>
            ))}
          </div>
        </section>

        {/* INSIGHT OF THE DAY: the live card's composition on the
            plain card ring. The owner cut the amber ring ("ugly
            yellow color around it") and asked for brighter, crisper
            golds instead of the brown-leaning amber. */}
        <section
          style={{
            ...card,
            padding: "15px 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SparkleIcon c={t.name === "Dark" ? "#FBBF24" : "#F59E0B"} s={16} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Insight of the day</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
              You have won <span style={{ color: t.name === "Dark" ? "#FBBF24" : "#D97706" }}>7 of your last 9</span> Tennis picks.
            </div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: t.muted }}>View performance ›</div>
          </div>
          <Trophy size={48} />
        </section>

        {/* TRACK A BET: the original's one cohesive card, with the
            hierarchy the owner ordered. Connect is the primary: the
            product's own BTN gradient at the product's own 52px, left
            aligned so it reads designed, not generic. The three doors
            are the original's quiet tiles beneath it. */}
        <section style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <Heading t={t}>Track a bet</Heading>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: t.muted }}>
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path d="M10 9l5 3-5 3V9Z" fill="currentColor" stroke="none" />
              </svg>
              How it works
            </span>
          </div>

          {/* the live page's own Connect row, put back by the owner
              after seeing it purple: "too much purple with the purple
              bg. green nice symbol, green nice coming soon logo." */}
          <div
            style={{
              marginTop: 14,
              height: 56,
              borderRadius: 12,
              border: `1px solid ${t.hairSoft}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Icon c="#22C55E" s={20} w={2} d="M9 12h6M8.5 8.5 7 10a3.4 3.4 0 0 0 0 4.8l.2.2a3.4 3.4 0 0 0 4.8 0l1-1M15.5 15.5 17 14a3.4 3.4 0 0 0 0-4.8l-.2-.2a3.4 3.4 0 0 0-4.8 0l-1 1" />
            <span style={{ fontSize: 14, fontWeight: 600, color: t.faint }}>Connect your accounts</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#22C55E",
                background: "rgba(34,197,94,0.15)",
                borderRadius: 999,
                padding: "4px 9px",
              }}
            >
              Coming Soon
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
            {[
              { label: "Paste bet slip", c: "#7C3AED", d: "M9 5h6v3H9zM7 5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1M9 12h6M9 15.5h4" },
              { label: "Upload image", c: "#3B82F6", d: "M5 8h2l1.5-2h7L17 8h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm7 8.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z" },
              { label: "Manually enter", c: "#F97316", d: "M16.8 4.7a2 2 0 0 1 2.8 2.8L9 18.1l-3.8 1 1-3.8L16.8 4.7Z" },
            ].map((x) => (
              <div
                key={x.label}
                style={{
                  ...inner,
                  padding: "16px 4px 17px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                <Icon c={x.c} s={22} w={2} d={x.d} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{x.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PERFORMANCE SNAPSHOT: the original card and heading, the
            redesign's simplification: four values, no sparklines. */}
        <section style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <Heading t={t}>Performance Snapshot</Heading>
            <CardLink t={t}>View all</CardLink>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", marginTop: 13 }}>
            {[
              { label: "Net Profit", v: <Money t={t} v="+$2,387" size={17} weight={700} color={t.green} /> },
              { label: "ROI", v: <Money t={t} v="+22.7%" size={17} weight={700} color={t.green} /> },
              { label: "Win Rate", v: <Money t={t} v="57%" size={17} weight={700} color={t.ink} /> },
              {
                label: "Best Sport",
                v: (
                  <span style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>Football</span>
                    <Money t={t} v="+$757" size={12} weight={600} color={t.green} />
                  </span>
                ),
              },
            ].map((x, i) => (
              <div
                key={x.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  paddingLeft: i ? 10 : 0,
                  paddingRight: i === 3 ? 0 : 6,
                  borderLeft: i ? `1px solid ${t.hairSoft}` : "none",
                }}
              >
                <span style={{ fontSize: 11.5, color: t.faint, fontWeight: 500 }}>{x.label}</span>
                {x.v}
              </div>
            ))}
          </div>
        </section>

        {/* PENDING BETS: the original card holding INNER rows */}
        <section style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <Heading t={t}>Pending bets</Heading>
            <CardLink t={t}>View all</CardLink>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {[
              { d: "Man City & Arsenal to win", meta: "PARLAY · 2 legs · Football · Sat 19:00", stake: "$50.00", col: "$173.00" },
              { d: "Alcaraz to win Cincinnati", meta: "SINGLE · Tennis · Sun 21:00", stake: "$120.00", col: "$214.80" },
              { d: "Dodgers moneyline", meta: "SINGLE · Baseball · Tonight 01:10", stake: "$80.00", col: "$149.60" },
            ].map((b) => (
              <div
                key={b.d}
                style={{
                  ...inner,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 13px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.d}
                  </div>
                  <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", color: t.faint }}>
                    {b.meta}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Money t={t} v={b.col} size={14} weight={700} />
                  <div style={{ fontSize: 10.5, color: t.faint }}>
                    stake <span className="font-money" style={{ fontFamily: IT, fontVariantNumeric: "tabular-nums" }}>{b.stake}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* TAB BAR: kept from the redesign */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: `1px solid ${t.ring}`,
          background: t.bar,
          padding: "8px 0 10px",
          position: "relative",
        }}
      >
        {[
          { label: "Track", active: true, d: "M4 11.5 12 5l8 6.5M6.5 10v8.2a.8.8 0 0 0 .8.8h9.4a.8.8 0 0 0 .8-.8V10" },
          { label: "Performance", active: false, d: "M5 19V12M10 19V6M15 19v-4.5M20 19V9" },
          { label: "Research", active: false, d: "M10.5 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM19 19l-4.2-4.2" },
        ].map((x) => (
          <div key={x.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Icon c={x.active ? t.purple : t.faint} d={x.d} s={24} w={1.8} />
            <span style={{ fontSize: 10, fontWeight: x.active ? 700 : 600, color: x.active ? t.purple : t.faint }}>
              {x.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrackSharpPreview() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#E2E2EA",
        display: "flex",
        gap: 28,
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "28px 20px 40px",
        flexWrap: "wrap",
      }}
    >
      {[LIGHT, DARK].map((t) => (
        <div key={t.name}>
          <div
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#666",
              margin: "0 0 8px 4px",
            }}
          >
            {t.name}
          </div>
          <Phone t={t} />
        </div>
      ))}
    </div>
  );
}
