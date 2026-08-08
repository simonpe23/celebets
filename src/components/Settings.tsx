"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MicroLabel from "@/components/MicroLabel";
import TabBar from "@/components/TabBar";
import { BTN, CARD, CARD_LINK, INNER } from "@/lib/ui";

// Settings, reached by tapping the avatar. Not a tab: the owner ruled
// three tabs and only three, and settings is not a place you live in.
//
// Log out used to be the avatar itself, which meant one stray tap
// ended your session. It lives down here now, under everything else.

type Theme = "system" | "light" | "dark";

const THEMES: { key: Theme; label: string }[] = [
  { key: "system", label: "System" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

// One place that knows how a choice becomes an attribute. The layout's
// pre-paint script does the same thing in raw JS, and the two must
// agree or the page flashes.
function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#04081B" : "#F7F7FB");
}

export default function Settings({
  email,
  name,
  userId,
}: {
  email: string;
  name: string | null;
  userId: string;
}) {
  const router = useRouter();

  // Read after mount. localStorage does not exist on the server, and
  // rendering a guess would light the wrong chip for a moment.
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("celebet-theme") as Theme | null;
    setTheme(saved ?? "system");
  }, []);

  // The phone can change its mind while the app is open. Only "system"
  // should care.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  function chooseTheme(next: Theme) {
    setTheme(next);
    localStorage.setItem("celebet-theme", next);
    apply(next);
  }

  const [displayName, setDisplayName] = useState(name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveName() {
    setError(null);
    setSavingName(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });
    setSavingName(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setNameSaved(true);
    router.refresh();
  }

  // Reset. Typed confirmation, because there is no undo and no backup.
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  async function reset() {
    setError(null);
    setResetting(true);
    const supabase = createClient();
    // Legs and buys hang off bets with on delete cascade, so deleting
    // the bets takes them with it. Only these two tables hold data.
    const { error: betError } = await supabase
      .from("bets")
      .delete()
      .eq("user_id", userId);
    const { error: txError } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);
    setResetting(false);
    if (betError || txError) {
      setError((betError ?? txError)?.message ?? "Could not reset.");
      return;
    }
    setResetOpen(false);
    setConfirmText("");
    router.push("/app");
    router.refresh();
  }

  const chip = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
      active
        ? "bg-brand-top text-white"
        : "text-neutral-600 dark:text-neutral-300"
    }`;

  return (
    <main className="min-h-dvh px-4 pt-6 pb-32 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="flex items-center gap-3">
          <Link
            href="/app"
            aria-label="Back to Track"
            className="text-neutral-600 dark:text-neutral-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-[22px] font-bold tracking-tight">Settings</h1>
        </header>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <section className={`${CARD} p-4`}>
          <h2 className="text-[17px] font-bold">Your account</h2>

          <label htmlFor="name" className="mt-3 block text-sm font-semibold">
            Name
          </label>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Used to greet you on the Track page.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              id="name"
              type="text"
              value={displayName}
              placeholder="Leave empty for no name"
              onChange={(e) => {
                setDisplayName(e.target.value);
                setNameSaved(false);
              }}
              className="h-11 min-w-0 grow rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={saveName}
              disabled={savingName || displayName.trim() === (name ?? "")}
              className={`${BTN} h-11 shrink-0 px-4`}
            >
              {nameSaved ? "Saved" : "Save"}
            </button>
          </div>

          <div className={`${INNER} mt-3 px-3 py-3`}>
            <MicroLabel>Signed in as</MicroLabel>
            <p className="mt-0.5 truncate text-sm font-semibold">{email}</p>
          </div>
        </section>

        <section className={`${CARD} p-4`}>
          <h2 className="text-[17px] font-bold">Appearance</h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            System follows your phone. Light and Dark override it on this
            device.
          </p>
          {/* Rendered blank until the saved choice is read, so no chip
              is ever lit wrongly for a frame. */}
          <div className="mt-3 flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-white/[0.04]">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => chooseTheme(t.key)}
                className={chip(theme === t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className={`${CARD} p-4`}>
          <h2 className="text-[17px] font-bold">Your data</h2>
          <div className="mt-3 space-y-2">
            <Link
              href="/transactions"
              className={`${INNER} flex items-center justify-between gap-3 px-3 py-3`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Balance history
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  Every change you have made to your tracking balance.
                </span>
              </span>
              <span className={CARD_LINK}>Open ›</span>
            </Link>

            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className={`${INNER} flex w-full items-center justify-between gap-3 px-3 py-3 text-left`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-red-600 dark:text-red-400">
                  Reset all data
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  Deletes every bet and every balance change. Cannot be
                  undone.
                </span>
              </span>
              <span className={CARD_LINK}>›</span>
            </button>
          </div>
        </section>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="h-11 w-full rounded-md border border-neutral-300 text-sm font-bold text-neutral-600 dark:border-white/15 dark:text-neutral-300"
          >
            Log out
          </button>
        </form>

        {resetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#161D38]">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                Reset all data
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                This deletes every bet, every pick and every change you have
                made to your tracking balance. There is no undo and no
                backup. Your account and your login stay.
              </p>

              <label
                htmlFor="confirm"
                className="mt-4 block text-sm font-semibold"
              >
                Type RESET to confirm
              </label>
              <input
                id="confirm"
                type="text"
                autoComplete="off"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setResetOpen(false);
                    setConfirmText("");
                  }}
                  className="h-11 rounded-md border border-neutral-300 text-sm font-bold dark:border-white/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmText !== "RESET" || resetting}
                  onClick={reset}
                  className="h-11 rounded-md bg-red-600 text-sm font-bold text-white active:bg-red-700 disabled:opacity-40"
                >
                  {resetting ? "Deleting..." : "Delete everything"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <TabBar activeHref="/app" />
    </main>
  );
}
