"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MicroLabel from "@/components/MicroLabel";
import TabBar from "@/components/TabBar";
import { formatMoney, parseMoney } from "@/lib/format";
import {
  BTN,
  CARD,
  CARD_LINK,
  COLUMN,
  INNER,
  PAGE,
  PAGE_TITLE,
  SECTION_HEAD,
} from "@/lib/ui";

// Settings, reached by tapping the avatar. Not a tab: the owner ruled
// three tabs and only three, and settings is not a place you live in.
//
// Log out used to be the avatar itself, which meant one stray tap
// ended your session. It lives down here now, under everything else.
//
// TWO CONTROLS AT THE FOOT, AND THEY ARE NOT THE SAME THING. Keeping
// them straight is the whole design of this page's bottom half.
//
// RESTART MY RECORD deletes nothing. It draws a line and starts the
// stats from it. I once built a delete-everything button in its place
// and the owner rejected it: he had asked to reset the tracking
// balance so a user could start over, and deleting their bets is not
// that. "i think data is still valuable despite wanting a fresh reset
// of your tracking."
//
// DELETE MY ACCOUNT is the real thing, added August 2026 because both
// app stores require it to exist inside the app (Apple 5.1.1(v),
// Google Play's data deletion policy) and a restart does not count.
// It is permanent and it says so first, which is the exact opposite
// of the restart sheet's "Nothing is deleted" opening. Neither may
// ever borrow the other's wording.
//
// The two exports sit above both, so the way out is met before the
// door that cannot be reopened.
//
// He then rejected my first replacement too, for the right reason:
// "too much risk... there must be an option to regret the start fresh.
// i don't want people to accidentally loose all their data." So the
// wording leads with what is kept, and Undo has no time limit.
//
// Starting a new record draws a line. See sinceLine in src/lib/stats.ts.

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

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
  balance,
  trackingSince,
  recordStartedAt,
  trackingResetTx,
}: {
  email: string;
  name: string | null;
  userId: string;
  // Prefilled into Start fresh, so the sheet opens on what you have
  // rather than an empty box.
  balance: number;
  trackingSince: string | null;
  // When the current record began: normally the first thing the user
  // ever tracked, or the restart date if they have restarted. Shown as
  // a plain fact, because for almost everyone it is one.
  recordStartedAt: string | null;
  // The balance transaction that starting the record created, so Undo
  // can remove exactly that row and nothing else.
  trackingResetTx: string | null;
}) {
  const router = useRouter();

  // Read after mount. localStorage does not exist on the server, and
  // rendering a guess would light the wrong chip for a moment.
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    // The key was "celebet-theme" before the rename. Read the old one
    // when the new one is missing and carry the choice over, or every
    // existing user silently falls back to System. The raw script in
    // layout.tsx does the same thing before first paint, and the two
    // must stay in step.
    let saved = localStorage.getItem("actuals-theme") as Theme | null;
    if (!saved) {
      const old = localStorage.getItem("celebet-theme") as Theme | null;
      if (old) {
        localStorage.setItem("actuals-theme", old);
        localStorage.removeItem("celebet-theme");
        saved = old;
      }
    }
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
    localStorage.setItem("actuals-theme", next);
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

  // START A NEW RECORD, and it is fully reversible.
  //
  // The owner rejected a delete, then rejected the first version of
  // this: "too much risk in the start fresh button. there must be an
  // option to regret the start fresh. i don't want people to
  // accidentally loose all their data."
  //
  // Nothing is deleted here, and nothing ever was. Two things happen:
  // a date goes into the user's metadata, and the balance moves by one
  // transaction. Undo reverses both, so a mistap costs one tap to fix
  // and there is no time limit on it.
  //
  // The transaction's id is stored beside the date so Undo can remove
  // exactly the row this created, and nothing else the user has done
  // to their balance since.
  const [freshOpen, setFreshOpen] = useState(false);
  const [freshAmount, setFreshAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [undoing, setUndoing] = useState(false);

  async function startNewRecord() {
    const value = parseMoney(freshAmount);
    if (value === null) {
      setError("Enter a starting balance above 0, for example 1000.");
      return;
    }
    setError(null);
    setSaving(true);
    const supabase = createClient();

    // The balance moves the same way the Set balance sheet moves it: a
    // transaction for the difference, so the history stays honest about
    // what happened and when.
    const delta = value - balance;
    let txId: string | null = null;
    if (delta !== 0) {
      const { data, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          type: delta > 0 ? "deposit" : "withdrawal",
          amount: Math.abs(delta),
        })
        .select("id")
        .single();
      if (txError) {
        setSaving(false);
        setError(txError.message);
        return;
      }
      txId = data?.id ?? null;
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        tracking_since: new Date().toISOString(),
        tracking_reset_tx: txId,
      },
    });
    setSaving(false);
    if (metaError) {
      setError(metaError.message);
      return;
    }
    setFreshOpen(false);
    setFreshAmount("");
    router.push("/app");
    router.refresh();
  }

  async function undoNewRecord() {
    setError(null);
    setUndoing(true);
    const supabase = createClient();

    // The balance change goes back first. If this fails there is no
    // point clearing the date: the user would be left with a balance
    // they did not choose and no way to see why.
    if (trackingResetTx) {
      const { error: txError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", trackingResetTx);
      if (txError) {
        setUndoing(false);
        setError(txError.message);
        return;
      }
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { tracking_since: null, tracking_reset_tx: null },
    });
    setUndoing(false);
    if (metaError) {
      setError(metaError.message);
      return;
    }
    router.push("/app");
    router.refresh();
  }

  const chip = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
      active
        ? "bg-brand-top text-white"
        : "text-neutral-600 dark:text-neutral-300"
    }`;

  // EXPORT, as CSV. The owner tried the first version, a JSON file,
  // and called it "pretty useless for most ppl that dont read code
  // right." He was right, so it is a spreadsheet now: bets and
  // balance history are two separate downloads rather than one
  // file, because a bet leg and a deposit do not share columns.
  //
  // Both share this one fetch-and-save helper. The browser is told
  // to save the response, so the file lands wherever downloads
  // land; it is fetched rather than linked so a failure can say
  // something instead of opening a blank tab.
  const [exportingBets, setExportingBets] = useState(false);
  const [exportingTx, setExportingTx] = useState(false);

  async function download(
    url: string,
    filename: string,
    setBusy: (b: boolean) => void
  ) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Could not build your file. Please try again.");
    }
    setBusy(false);
  }

  function exportBets() {
    const stamp = new Date().toISOString().slice(0, 10);
    download(
      "/api/account/export/bets",
      `actuals-bets-${stamp}.csv`,
      setExportingBets
    );
  }

  function exportTransactions() {
    const stamp = new Date().toISOString().slice(0, 10);
    download(
      "/api/account/export/transactions",
      `actuals-balance-history-${stamp}.csv`,
      setExportingTx
    );
  }

  // DELETE. Required by both app stores. The confirmation asks the
  // user to TYPE the word, because this is the one action in Actuals
  // with no undo, and the owner's rule for Restart my record was
  // that a control should say what it does. This one has to prove
  // you meant it as well.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteWord, setDeleteWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const confirmed = deleteWord.trim().toUpperCase() === "DELETE";

  async function deleteAccount() {
    if (!confirmed) return;
    setError(null);
    setDeleting(true);
    let res: Response;
    try {
      res = await fetch("/api/account/delete", { method: "POST" });
    } catch {
      setDeleting(false);
      setError("Could not reach the server. Please try again.");
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteWord("");
      setError(body.error ?? "Could not delete the account.");
      return;
    }
    // The account is gone, so there is nothing to come back to. A
    // hard navigation rather than a router push, to throw away every
    // cached page belonging to the account that just stopped
    // existing.
    window.location.href = "/";
  }

  return (
    <main className={PAGE}>
      <div className={COLUMN}>
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
          <h1 className={PAGE_TITLE}>Settings</h1>
        </header>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <section className={`${CARD} p-4`}>
          <h2 className={SECTION_HEAD}>Your account</h2>

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
          <h2 className={SECTION_HEAD}>Appearance</h2>
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
          <h2 className={SECTION_HEAD}>Your data</h2>
          <div className="mt-3 space-y-2">
            <Link
              href="/connect"
              className={`${INNER} flex items-center justify-between gap-3 px-3 py-3`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Connect accounts
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  Link Kalshi so your bets can arrive on their own.
                </span>
              </span>
              <span className={CARD_LINK}>Connect ›</span>
            </Link>

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

            {/* Two exports, not one, deliberately placed BEFORE the
                record fact and well above the delete control:
                someone about to delete in a bad moment should meet
                the way out first. Bets and balance history are
                separate files because a bet leg and a balance
                change do not share columns; see csv.ts. */}
            <button
              type="button"
              onClick={exportBets}
              disabled={exportingBets}
              className={`${INNER} flex w-full items-center justify-between gap-3 px-3 py-3 text-left disabled:opacity-60`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Export my bets
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  Every bet and pick as a spreadsheet file.
                </span>
              </span>
              <span className={CARD_LINK}>
                {exportingBets ? "Building..." : "Download ›"}
              </span>
            </button>

            <button
              type="button"
              onClick={exportTransactions}
              disabled={exportingTx}
              className={`${INNER} flex w-full items-center justify-between gap-3 px-3 py-3 text-left disabled:opacity-60`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  Export my balance history
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  Every change to your balance as a spreadsheet file.
                </span>
              </span>
              <span className={CARD_LINK}>
                {exportingTx ? "Building..." : "Download ›"}
              </span>
            </button>

            {/* A plain fact, not a control. No Undo button here: the
                owner cut it. "a restart is uncommon. to undo a restart
                is even more unique. we can't have a big button that
                talks about such a minor part of the app." Undo lives
                beside the restart, at the same tiny weight. */}
            {recordStartedAt && (
              <div className={`${INNER} px-3 py-3`}>
                <span className="block text-sm font-semibold">
                  Your record started on {shortDate(recordStartedAt)}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {trackingSince
                    ? "You restarted your record on this date. Everything you tracked before it is still saved, and Performance has an All time switch to see it."
                    : "Everything you have tracked counts toward your stats."}
                </span>
              </div>
            )}
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

        {/* Deliberately the quietest thing on the page: below log out,
            no card, no button, muted text. Ruled by the owner: "a
            restart is just a what if. most users will not restart...
            it can trick them into a false reality of being profitable
            when maybe not." So it is available, honest about the risk,
            and not sold.

            Undo sits here too, at the same tiny weight, and it says
            what it does rather than saying "undo". Undoing a restart is
            rarer than restarting, so it cannot be louder. */}
        <div className="pt-2 pb-2 text-center">
          <button
            type="button"
            onClick={() => {
              setFreshAmount(String(balance));
              setFreshOpen(true);
            }}
            className="text-xs text-neutral-500 underline underline-offset-4 dark:text-neutral-400"
          >
            Restart my record
          </button>
          <p className="mx-auto mt-1.5 max-w-[19rem] text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Starts your stats at zero from today. Most people never need
            this, and hiding past results can make you look more
            profitable than you are.
          </p>

          {trackingSince && (
            <button
              type="button"
              disabled={undoing}
              onClick={undoNewRecord}
              className="mt-3 text-xs text-neutral-500 underline underline-offset-4 disabled:opacity-50 dark:text-neutral-400"
            >
              {undoing
                ? "Putting it back..."
                : "Count all my bets again, from the start"}
            </button>
          )}
        </div>

        {/* DELETE MY ACCOUNT. Last thing on the page, under the
            restart, which is where the rarest and heaviest action
            belongs.

            THE OPPOSITE DESIGN TO RESTART, on purpose. Restart leads
            with "Nothing is deleted" in green, because the owner's
            fear there was a user believing their bets were gone.
            Here they ARE gone, so the red line comes first and the
            reassurance is only that the file is still yours to take.
            Same page, opposite promise, and neither may borrow the
            other's wording.

            Both stores require this to exist inside the app: Apple
            5.1.1(v) and Google Play's data deletion policy. */}
        <div className="pt-1 pb-3 text-center">
          <button
            type="button"
            onClick={() => {
              setDeleteWord("");
              setDeleteOpen(true);
            }}
            className="text-xs text-red-600 underline underline-offset-4 dark:text-red-400"
          >
            Delete my account
          </button>
          <p className="mx-auto mt-1.5 max-w-[19rem] text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Permanently removes your account and every bet you have
            tracked. This cannot be undone.
          </p>
        </div>

        {deleteOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#161D38]">
              <h3 className="text-lg font-bold">Delete my account</h3>

              <div className="mt-3 rounded-xl bg-red-50 px-3 py-3 dark:bg-red-950/40">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  This is permanent. There is no undo.
                </p>
                <p className="mt-1 text-sm leading-relaxed text-red-700/90 dark:text-red-300/90">
                  Unlike restarting your record, nothing is kept and
                  nothing can be brought back.
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold">What is deleted</p>
              <ul className="mt-1 space-y-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                <li>Your account and your login.</li>
                <li>Every bet, pick and result you have tracked.</li>
                <li>Your balance and its whole history.</li>
                <li>Any connected account, and its stored keys.</li>
              </ul>

              <p className="mt-3 text-sm leading-relaxed">
                Want a copy first? Close this and tap{" "}
                <span className="font-semibold">Export my bets</span> or{" "}
                <span className="font-semibold">Export my balance history</span>{" "}
                above.
              </p>

              <label
                htmlFor="deleteword"
                className="mt-4 block text-sm font-semibold"
              >
                Type DELETE to confirm
              </label>
              <input
                id="deleteword"
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="DELETE"
                value={deleteWord}
                onChange={(e) => setDeleteWord(e.target.value)}
                className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteWord("");
                  }}
                  className="h-11 rounded-md border border-neutral-300 text-sm font-bold dark:border-white/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!confirmed || deleting}
                  onClick={deleteAccount}
                  className="h-11 rounded-md bg-red-600 text-sm font-bold text-white disabled:opacity-40 dark:bg-red-600"
                >
                  {deleting ? "Deleting..." : "Delete forever"}
                </button>
              </div>
            </div>
          </div>
        )}

        {freshOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-6 dark:bg-[#161D38]">
              <h3 className="text-lg font-bold">Restart my record</h3>

              {/* The honest caution first. The owner's point, and he is
                  right: hiding a losing run makes you look profitable
                  when you are not, and a bet tracker that helps you lie
                  to yourself is worse than no tracker. */}
              <p className="mt-3 text-sm leading-relaxed">
                Only do this if you are genuinely starting a new budget.
                Hiding a losing run can make you look more profitable
                than you really are, which is the opposite of what
                Actuals is for.
              </p>

              <div className={`${INNER} mt-3 px-3 py-3`}>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Nothing is deleted.
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  Every bet you have tracked stays exactly where it is.
                  This only changes which ones your stats count.
                </p>
              </div>

              <p className="mt-3 text-sm font-semibold">What changes</p>
              <ul className="mt-1 space-y-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                <li>Net profit, ROI, win rate and the charts start at zero.</li>
                <li>They count bets from today onwards.</li>
                <li>Your balance becomes the figure you set below.</li>
              </ul>

              <p className="mt-3 text-sm font-semibold">What does not</p>
              <ul className="mt-1 space-y-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                <li>Every bet, pick and result is kept.</li>
                <li>Bets still running carry over to the new record.</li>
                <li>
                  Performance keeps an All time switch, so the old record
                  is one tap away.
                </li>
                <li>You can undo this at any time, from this page.</li>
              </ul>

              <label
                htmlFor="fresh"
                className="mt-4 block text-sm font-semibold"
              >
                Starting balance
              </label>
              <input
                id="fresh"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={freshAmount}
                onChange={(e) => setFreshAmount(e.target.value)}
                className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Your balance today is {formatMoney(balance)}.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFreshOpen(false);
                    setFreshAmount("");
                  }}
                  className="h-11 rounded-md border border-neutral-300 text-sm font-bold dark:border-white/15"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={startNewRecord}
                  className={`${BTN} h-11`}
                >
                  {saving ? "Restarting..." : "Restart my record"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {/* PROFILE, not Track. Settings IS Profile, his ruling of 26
          August 2026, and until the fourth tab existed this page had
          to light something, so it lit the tab you usually arrived
          from. Corrected 31 August 2026. */}
      <TabBar activeHref="/settings" />
    </main>
  );
}
