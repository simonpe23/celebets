import ConnectAccounts from "@/components/ConnectAccounts";

// Every state of the connect flow, without a database or a Kalshi
// key: the list in both its shapes, the trust screen, the key form,
// and the connected detail with its balance. sitecheck loads this
// page, so all of them stay under the machine checks. Wrapper styles
// inline: /preview is gitignored and Tailwind generates nothing from
// it; ConnectAccounts' own classes come from src/components.
export default function ConnectPreview() {
  const col: React.CSSProperties = { width: 384 };
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
      <div style={col}>
        <p style={label}>the list, nothing connected</p>
        <ConnectAccounts demoStep="list" />
      </div>
      <div style={col}>
        <p style={label}>the list, Kalshi connected</p>
        <ConnectAccounts demoStep="list" demoConnected />
      </div>
      <div style={col}>
        <p style={label}>the trust screen</p>
        <ConnectAccounts demoStep="trust" />
      </div>
      <div style={col}>
        <p style={label}>the key form</p>
        <ConnectAccounts demoStep="form" />
      </div>
      <div style={col}>
        <p style={label}>connected detail, live balance</p>
        <ConnectAccounts demoStep="detail" />
      </div>
    </main>
  );
}
