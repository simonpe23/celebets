"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// PHASE 4 OF THE SYNC PROJECT: the sync runs itself. Opening the app
// asks Kalshi for anything new, so "your bets appear on their own"
// stops depending on anyone remembering a button in Settings, which
// no real user was ever going to press.
//
// Renders nothing until an automatic sync actually changes something,
// then shows one quiet line above the tab bar and refreshes the
// server-rendered page under it, so the new bets are simply there.
// The 3 minute throttle lives in the sync route, on the server, so
// tab-hopping and reopening cannot hammer Kalshi. Failures are
// silent by design: this is a background convenience, and the manual
// Sync now button on the connect page is where errors get faces.
export default function KalshiAutoSync({
  connected,
  // /preview only: show the line without syncing anything, so it can
  // be screenshotted and design-checked.
  demoNote = null,
}: {
  connected: boolean;
  demoNote?: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState<string | null>(demoNote);

  useEffect(() => {
    if (!connected) return;
    let alive = true;

    fetch("/api/connect/kalshi/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auto: true }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!alive || !body) return;
        const changed = (body.imported ?? 0) + (body.updated ?? 0);
        if (changed === 0) return;
        setNote(
          `Synced with Kalshi: ${changed} ${changed === 1 ? "bet" : "bets"} updated`
        );
        router.refresh();
        setTimeout(() => {
          if (alive) setNote(null);
        }, 4000);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [connected, router]);

  if (!note) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center">
      <p className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-lg ring-1 ring-neutral-900/[0.08] dark:bg-[#161D38] dark:ring-white/[0.1]">
        {note}
      </p>
    </div>
  );
}
