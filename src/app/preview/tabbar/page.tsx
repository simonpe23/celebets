import TabBar from "@/components/TabBar";

// The bar on its own, in the flow, so its shade and height can be
// judged without scrolling a whole page. Local preview only.
export default function TabBarPreview() {
  return (
    <main style={{ minHeight: "100dvh", padding: "32px 16px" }}>
      <div style={{ margin: "0 auto", width: "100%", maxWidth: "28rem" }}>
        <TabBar activeHref="/app" inline />
      </div>
    </main>
  );
}
