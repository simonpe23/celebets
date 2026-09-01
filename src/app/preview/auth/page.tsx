import AuthCard from "@/components/AuthCard";

// The auth screen's three states side by side, without sending any
// email: both greetings, and the code step that swaps in after Send
// code. sitecheck loads this page, so the code boxes are covered by
// the machine checks even though reaching them for real needs an email
// round trip.
//
// Layout styles here are inline: /preview is gitignored and Tailwind
// generates nothing from it. The AuthCard's own classes are fine, they
// come from src/components.
export default function AuthPreview() {
  const card: React.CSSProperties = {
    // min(), not a flat 384, since 31 August 2026. Three cards of a
    // fixed 384 dragged a 320px phone sideways, which the checker
    // only saw once phase 3 let it look below 393px. This page is a
    // harness, not a screen, but a harness that scrolls sideways
    // hides the thing it was built to show.
    width: "min(384px, 100%)",
    boxSizing: "border-box",
    padding: "32px 24px",
    borderRadius: 16,
    border: "1px solid rgba(128,128,128,0.25)",
  };
  // The flex child around each labelled card. Without a max it is
  // sized by its content, so the card's "100%" had nothing to be a
  // percentage OF and fell back to its natural 354px, which is 34px
  // more than a 320px phone has.
  const col: React.CSSProperties = { maxWidth: "100%", minWidth: 0 };
  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.6,
    marginBottom: 10,
  };
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
        // The 24px padding is outside the card's 100%, so a card that
        // is "100% of the content box" still put the box 48px past a
        // 320px screen. box-sizing on main settles it.
        boxSizing: "border-box",
      }}
    >
      <div style={col}>
        <p style={label}>via Start Tracking</p>
        <div style={card}>
          <AuthCard firstVisit />
        </div>
      </div>
      <div style={col}>
        <p style={label}>via Log in</p>
        <div style={card}>
          <AuthCard />
        </div>
      </div>
      <div style={col}>
        <p style={label}>after Send code, same page</p>
        <div style={card}>
          <AuthCard demoCodeStep />
        </div>
      </div>
    </main>
  );
}
