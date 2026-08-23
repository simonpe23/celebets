import Settings from "@/components/Settings";

// Mirrors src/app/settings/page.tsx. The userId is fake: Start fresh
// talks to Supabase, which the preview has no session for, so it fails
// safely rather than writing anything.
// ?since=2026-08-01 shows the state after a restart, so the Undo can
// be seen without a database.
export default async function SettingsPreview({
  searchParams,
}: {
  searchParams: Promise<{ since?: string }>;
}) {
  const { since } = await searchParams;
  return (
    <Settings
      email="simon@example.com"
      name="Simon"
      userId="preview"
      balance={1714.26}
      trackingSince={since ?? null}
      recordStartedAt={since ?? "2026-06-14T00:00:00Z"}
      trackingResetTx={null}
    />
  );
}
