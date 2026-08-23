/* THE AUTH FLOW STORYBOARD, v2: the owner's own spec, August 2026.
   Landing carries ONE action and a log in signpost. Nothing else.
   Both doors open the same /continue page, whose greeting follows
   the door. Google or email there; email leads to a code. Preview
   only, inline styles because /preview is gitignored. */

const PURPLE = "#5525C6";
const GRAD = "linear-gradient(180deg,#5525C6,#4915AD)";

type T = {
  name: string;
  page: string;
  glow: string;
  ink: string;
  muted: string;
  faint: string;
  card: string;
  hair: string;
  field: string;
};
const LIGHT: T = {
  name: "Light",
  page: "#F7F5FC",
  glow: "rgba(124,58,237,0.14)",
  ink: "#111116",
  muted: "#52525B",
  faint: "#9CA3AF",
  card: "#FFFFFF",
  hair: "rgba(17,17,22,0.12)",
  field: "#FFFFFF",
};
const DARK: T = {
  name: "Dark",
  page: "#0A0A1A",
  glow: "rgba(154,87,252,0.16)",
  ink: "#F2F2F5",
  muted: "#A6ADBA",
  faint: "#6B7280",
  card: "#12122A",
  hair: "rgba(255,255,255,0.14)",
  field: "#101026",
};

function Word({ t, size = 22 }: { t: T; size?: number }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return (
    <img
      src={t.name === "Dark" ? "/brand/wordmark-white.png" : "/brand/wordmark-dark.png"}
      alt="Actuals"
      style={{ height: size, width: "auto", display: "block" }}
    />
  );
}

function GoogleBtn({ t }: { t: T }) {
  return (
    <div
      style={{
        height: 48,
        borderRadius: 12,
        border: `1px solid ${t.hair}`,
        background: t.card,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontWeight: 700,
        fontSize: 15,
        color: t.ink,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
        <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.6 14.7a7 7 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z" />
        <path fill="#EA4335" d="M12 4.6c1.7 0 3.2.6 4.4 1.7L19.6 3A11.5 11.5 0 0 0 1.8 7.3l3.8 3c.9-2.7 3.4-4.7 6.4-4.7Z" />
      </svg>
      Continue with Google
    </div>
  );
}

function EmailBtn({ t }: { t: T }) {
  return (
    <div
      style={{
        height: 48,
        borderRadius: 12,
        border: `1px solid ${t.hair}`,
        background: t.card,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontWeight: 700,
        fontSize: 15,
        color: t.ink,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
      Continue with email
    </div>
  );
}

function Or({ t }: { t: T }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
      <div style={{ flex: 1, height: 1, background: t.hair }} />
      <span style={{ fontSize: 12, color: t.faint, fontWeight: 600 }}>or</span>
      <div style={{ flex: 1, height: 1, background: t.hair }} />
    </div>
  );
}

function Frame({
  t,
  step,
  title,
  children,
  wide = false,
  h = 480,
}: {
  t: T;
  step: string;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
  h?: number;
}) {
  return (
    <div style={{ width: wide ? 560 : 290 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#555", margin: "0 0 6px 4px", fontFamily: "var(--font-geist-sans)" }}>
        {step} <span style={{ fontWeight: 500, color: "#777" }}>{title}</span>
      </div>
      <div
        style={{
          borderRadius: 20,
          border: `1px solid ${t.hair}`,
          background: `radial-gradient(240px 160px at 80% -30px, ${t.glow}, transparent 70%), ${t.page}`,
          color: t.ink,
          fontFamily: "var(--font-geist-sans)",
          minHeight: h,
          padding: "18px 18px 22px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Btn({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 48,
        borderRadius: 12,
        background: GRAD,
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 18px rgba(85,37,198,0.30)",
      }}
    >
      {label}
    </div>
  );
}

function Field({ t, text, filled = false }: { t: T; text: string; filled?: boolean }) {
  return (
    <div
      style={{
        height: 48,
        borderRadius: 12,
        border: `1px solid ${t.hair}`,
        background: t.field,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        fontSize: 15,
        color: filled ? t.ink : t.faint,
        fontWeight: filled ? 600 : 400,
      }}
    >
      {text}
    </div>
  );
}

function AuthTop({ t, headline, sub }: { t: T; headline: string; sub?: string }) {
  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 600, color: t.muted }}>‹ Home</div>
      <div style={{ display: "flex", justifyContent: "center", margin: "24px 0 10px" }}>
        <Word t={t} />
      </div>
      <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700 }}>{headline}</div>
      {sub && (
        <div style={{ textAlign: "center", fontSize: 13, color: t.muted, marginTop: 6, lineHeight: 1.5 }}>{sub}</div>
      )}
      <div style={{ height: 18 }} />
    </>
  );
}

function Flow({ t }: { t: T }) {
  const link = { color: t.name === "Dark" ? "#B794FF" : PURPLE, fontWeight: 700 };
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* 1 the hero: one action, one signpost */}
      <Frame t={t} step="1" title="the hero: one action">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Word t={t} size={17} />
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, border: `1px solid ${t.hair}`, borderRadius: 9, padding: "6px 10px" }}>Log in</div>
            <div style={{ fontSize: 11, fontWeight: 700, borderRadius: 9, padding: "6px 10px", background: GRAD, color: "#fff" }}>Start Tracking</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", fontWeight: 700, color: t.name === "Dark" ? "#B794FF" : PURPLE }}>
            THE SMARTER WAY TO BET
          </div>
          <div style={{ fontFamily: "var(--font-inter-tight)", fontWeight: 800, fontSize: 46, lineHeight: 1.0, marginTop: 12 }}>
            Know
            <br />
            Your <span style={{ color: t.name === "Dark" ? "#B794FF" : PURPLE }}>Game.</span>
          </div>
          <div style={{ fontSize: 13, color: t.muted, marginTop: 14, lineHeight: 1.5 }}>
            Track every bet. Discover patterns.
            <br />
            Find your edge.
          </div>
        </div>
        <div style={{ marginTop: 26 }}>
          <Btn label="Start Tracking. It's Free" />
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: t.muted }}>
            Already have an account? <span style={link}>Log in</span>
          </div>
        </div>
        <div style={{ marginTop: 34, borderTop: `1px dashed ${t.hair}`, paddingTop: 14, textAlign: "center" }}>
          <div style={{ fontSize: 10.5, color: t.faint, marginBottom: 8 }}>...and the card at the foot of the page:</div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Ready to Get an Edge?</div>
          <div style={{ marginTop: 10 }}>
            <Btn label="Start Tracking. It's Free" />
          </div>
        </div>
      </Frame>

      {/* 2 the one continue page: everything on it */}
      <Frame t={t} step="2" title="both doors open THIS page">
        <AuthTop t={t} headline="Create your account" />
        <GoogleBtn t={t} />
        <Or t={t} />
        <Field t={t} text="you@email.com" />
        <div style={{ height: 10 }} />
        <Btn label="Send code" />
        <div
          style={{
            margin: "22px -18px 0",
            borderTop: `1px dashed ${t.hair}`,
            padding: "12px 18px 0",
            fontSize: 11.5,
            color: t.faint,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          same page through Log in, only the greeting changes:
        </div>
        <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, marginTop: 8 }}>Welcome back</div>
      </Frame>

      {/* 3 the SAME page after Send code: the card swaps to code
          entry, no navigation */}
      <Frame t={t} step="3" title="same page after Send code">
        <AuthTop t={t} headline="Check your email" sub="We sent a code to simon@email.com" />
        <div style={{ display: "flex", gap: 7, justifyContent: "center", marginBottom: 16 }}>
          {["4", "7", "2", "", "", ""].map((d, i) => (
            <div
              key={i}
              style={{
                width: 36,
                height: 46,
                borderRadius: 10,
                border: `1.5px solid ${d ? PURPLE : t.hair}`,
                background: t.field,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-inter-tight)",
                fontSize: 19,
                fontWeight: 600,
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <Btn label="Continue" />
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: t.muted }}>
          Nothing arrived? <span style={{ color: t.name === "Dark" ? "#B794FF" : PURPLE, fontWeight: 700 }}>Resend code</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: t.faint, lineHeight: 1.5 }}>
          New email: account created.
          <br />
          Known email: logged straight in.
        </div>
      </Frame>
    </div>
  );
}

function WideFlow({ t }: { t: T }) {
  const link = { color: t.name === "Dark" ? "#B794FF" : PURPLE, fontWeight: 700 };
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <Frame t={t} step="1" title="actuals.cc on a laptop" wide h={380}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Word t={t} size={20} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, border: `1px solid ${t.hair}`, borderRadius: 10, padding: "8px 14px" }}>Log in</div>
            <div style={{ fontSize: 12, fontWeight: 700, borderRadius: 10, padding: "8px 14px", background: GRAD, color: "#fff" }}>Start Tracking</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 26, alignItems: "center", marginTop: 24 }}>
          <div style={{ flex: 1.1 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", fontWeight: 700, color: t.name === "Dark" ? "#B794FF" : PURPLE }}>
              THE SMARTER WAY TO BET
            </div>
            <div style={{ fontFamily: "var(--font-inter-tight)", fontWeight: 800, fontSize: 44, lineHeight: 1.0, marginTop: 10 }}>
              Know Your <span style={{ color: t.name === "Dark" ? "#B794FF" : PURPLE }}>Game.</span>
            </div>
            <div style={{ fontSize: 13, color: t.muted, marginTop: 12 }}>
              Track every bet. Discover patterns. Find your edge.
            </div>
            <div style={{ marginTop: 18, maxWidth: 290 }}>
              <Btn label="Start Tracking. It's Free" />
              <div style={{ marginTop: 12, fontSize: 13, color: t.muted }}>
                Already have an account? <span style={link}>Log in</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 0.9, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 120, height: 230, borderRadius: 22, border: `4px solid ${t.name === "Dark" ? "#2A2A44" : "#3a3a46"}`, background: t.card, display: "flex", alignItems: "center", justifyContent: "center", color: t.faint, fontSize: 11 }}>
              phones
            </div>
          </div>
        </div>
      </Frame>

      <Frame t={t} step="2" title="the continue page on a laptop" wide h={380}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.muted }}>‹ Home</div>
        <div style={{ maxWidth: 290, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", margin: "12px 0 8px" }}>
            <Word t={t} />
          </div>
          <div style={{ textAlign: "center", fontSize: 19, fontWeight: 700, marginBottom: 16 }}>Create your account</div>
          <GoogleBtn t={t} />
          <Or t={t} />
          <Field t={t} text="you@email.com" />
          <div style={{ height: 10 }} />
          <Btn label="Send code" />
        </div>
      </Frame>
    </div>
  );
}

export default function AuthFlowPreview() {
  return (
    <div style={{ minHeight: "100vh", background: "#E4E4EC", padding: "26px 24px 40px" }}>
      <div style={{ fontFamily: "var(--font-geist-sans)", maxWidth: 1180, margin: "0 0 18px 4px", color: "#333" }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>The owner&apos;s flow: one action on the landing, one page behind it</div>
        <div style={{ fontSize: 13, marginTop: 4, color: "#555", lineHeight: 1.5 }}>
          No email field, no Google button, nothing else on the landing. Start Tracking and Log in
          both open the continue page; only the greeting differs. Google users: 2 taps. Email users: type it, get a 6-digit code. No passwords anywhere.
        </div>
      </div>
      {[LIGHT, DARK].map((t) => (
        <div key={t.name} style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: "var(--font-geist-sans)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#666", margin: "0 0 8px 4px" }}>
            {t.name.toUpperCase()} · PHONE
          </div>
          <Flow t={t} />
          <div style={{ fontFamily: "var(--font-geist-sans)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#666", margin: "22px 0 8px 4px" }}>
            {t.name.toUpperCase()} · LAPTOP
          </div>
          <WideFlow t={t} />
        </div>
      ))}
    </div>
  );
}
