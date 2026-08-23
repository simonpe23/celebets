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
    width: 384,
    padding: "32px 24px",
    borderRadius: 16,
    border: "1px solid rgba(128,128,128,0.25)",
  };
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
      }}
    >
      <div>
        <p style={label}>via Start Tracking</p>
        <div style={card}>
          <AuthCard firstVisit />
        </div>
      </div>
      <div>
        <p style={label}>via Log in</p>
        <div style={card}>
          <AuthCard />
        </div>
      </div>
      <div>
        <p style={label}>after Send code, same page</p>
        <div style={card}>
          <AuthCard demoCodeStep />
        </div>
      </div>
    </main>
  );
}
