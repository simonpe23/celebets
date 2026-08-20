"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BTN, CARD, INNER } from "@/lib/ui";
import { formatMoney } from "@/lib/format";
import {
  IMPORTING_LIVE,
  KALSHI_HISTORY_FROM,
  KALSHI_HISTORY_SHORT,
} from "@/lib/sync";

// Connecting a betting platform, phase 1 of the sync project (August
// 2026): Kalshi, by the owner's ruling, with the official personal
// API key. The flow copies the shape the owner liked in Pikkit's
// BookSync: pick the platform, one honest trust screen, then the auth
// step. Ours differs only at the last step: a guided key setup
// instead of a password box, because Actuals holds no passwords and
// pays no middleman.
//
// THE LIST IS ALWAYS THE FRONT PAGE (the owner, after his first
// connection): a connected platform must not swallow the whole
// screen, because the point of the page is also the platforms you
// have NOT connected yet. Kalshi's row reports its state and opens a
// detail view; the detail view fetches the live balance every time,
// because the owner saw his balance once at connect time and then
// could never find it again.
//
// Phase 2 (same week): the sync is real. Connecting runs a first
// import on its own, Sync now re-reads Kalshi on demand, and the
// quiet history control brings in the pre-connection past for
// whoever insists. The translation itself lives in kalshiSync.ts.

type Step = "loading" | "list" | "trust" | "form" | "detail";

type Status = {
  connected_at: string;
  last_synced_at: string | null;
} | null;

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

// The same link mark the Connect tile on Track carries, same green.
function LinkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 12h6M8.5 8.5 7 10a3.4 3.4 0 0 0 0 4.8l.2.2a3.4 3.4 0 0 0 4.8 0l1-1M15.5 15.5 17 14a3.4 3.4 0 0 0 0-4.8l-.2-.2a3.4 3.4 0 0 0-4.8 0l-1 1" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const FIELD =
  "mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100 dark:placeholder:text-white/30";

function B({ children }: { children: ReactNode }) {
  return <span className="font-semibold">{children}</span>;
}

// THE KEY GUIDE, one card per step. The owner rejected the single
// long list ("it looks like a hot mess... i would close the window if
// i saw this") and drew the shape himself: soft cards, one bullet
// each, dots at the bottom, Back and Next in the corners. The copy is
// his, word for word (19 August 2026), written after he walked
// Kalshi's real screens twice. His rules: keep the Read all data vs
// Full access distinction obvious, and say "API Key ID" in every
// mention because that is Kalshi's own name for it. If Kalshi moves
// things, walk the flow again and rewrite from the screen, not from
// memory.
//
// `image` is the Kalshi screenshot for that card, a file under
// public/connect/kalshi/. Cards without one are text only, never a
// placeholder box; phase 2 fills them in as the owner captures the
// screens.
const KALSHI_GUIDE: {
  text: ReactNode;
  image?: { src: string; alt: string };
}[] = [
  {
    text: (
      <>
        Log in at kalshi.com. Open the menu, then{" "}
        <B>Account &amp; Security</B>.
        <br />
        Or go directly to <B>kalshi.com/account/profile</B>.
      </>
    ),
  },
  {
    text: (
      <>
        Find <B>API Keys</B> and click <B>Create key</B>.
      </>
    ),
  },
  {
    text: (
      <>
        Enter a name, such as <B>Actuals</B>.
      </>
    ),
  },
  {
    text: (
      <>
        Leave the <B>RSA public key</B> field empty.
      </>
    ),
  },
  {
    text: (
      <>
        Under <B>Permissions</B>, check <B>Read all data</B>.{" "}
        <B>Uncheck Full access.</B> Actuals only reads your data. It
        cannot place trades or move money.
      </>
    ),
  },
  {
    text: (
      <>
        Click <B>Create</B>. Kalshi will show your <B>API Key ID</B> and
        download your <B>Private key file</B>. Save the file. Kalshi
        will not show the private key again.
      </>
    ),
  },
  {
    text: (
      <>
        Copy your <B>API Key ID</B> and <B>Private key</B>.
      </>
    ),
  },
];

export default function ConnectAccounts({
  // /preview/connect only: open on a chosen step with nothing fetched,
  // so sitecheck and screenshots can reach every state.
  demoStep = null,
  demoConnected = false,
}: {
  demoStep?: Step | null;
  demoConnected?: boolean;
}) {
  const router = useRouter();
  const demo = demoStep !== null;
  const [step, setStep] = useState<Step>(demoStep ?? "loading");
  const [status, setStatus] = useState<Status>(
    demo && (demoConnected || demoStep === "detail")
      ? { connected_at: "2026-08-19T12:00:00Z", last_synced_at: null }
      : null
  );
  const [accessKey, setAccessKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  // Which card of the key guide is showing, 0 to KALSHI_GUIDE.length.
  // The value one past the guide is the paste card.
  const [card, setCard] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Kalshi's live balance in cents, fetched fresh whenever the detail
  // view opens.
  const [balanceCents, setBalanceCents] = useState<number | null>(
    demo && demoStep === "detail" ? 31 : null
  );
  // The first moments after connecting get the celebration: the
  // owner's point after his own first connect was that nothing said
  // what had just happened.
  const [justConnected, setJustConnected] = useState(demo && demoStep === "detail");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(
    demo && demoStep === "detail" ? "Imported 3 bets from Kalshi, 2 still pending." : null
  );
  // The full-history question, asked inline instead of a popup.
  const [askHistory, setAskHistory] = useState(false);
  // What Kalshi actually answers, for when a sync finds nothing and
  // nobody can see why. Never shown unless asked for.
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return;
    fetch("/api/connect/kalshi")
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.connected ?? null);
        setStep("list");
      })
      .catch(() => setStep("list"));
  }, [demo]);

  const retest = useCallback(async () => {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/connect/kalshi", { method: "PATCH" }).catch(
      () => null
    );
    setBusy(false);
    const body = await res?.json().catch(() => null);
    if (!res?.ok) {
      setError(body?.error ?? "Something went wrong. Try again.");
      return;
    }
    setBalanceCents(body.balanceCents ?? null);
  }, []);

  // The live balance greets you on the detail view without a tap.
  useEffect(() => {
    if (!demo && step === "detail" && balanceCents === null) retest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, demo]);

  const sync = useCallback(
    async (history: boolean) => {
      setError(null);
      setSyncing(true);

      // A deep history arrives in ROUNDS: each server round chews up
      // to 12,000 trades and answers "more" until it reaches the very
      // first bet. The running total keeps the long wait honest.
      let imported = 0;
      let updated = 0;
      let pending = 0;
      let total = 0;
      let failed: string | null = null;
      for (let round = 0; round < 20; round++) {
        const res = await fetch("/api/connect/kalshi/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history }),
        }).catch(() => null);
        const body = await res?.json().catch(() => null);
        if (!res?.ok) {
          failed = body?.error ?? "The sync did not finish. Try again.";
          break;
        }
        imported += body.imported ?? 0;
        updated += body.updated ?? 0;
        pending += body.pending ?? 0;
        total += body.total ?? 0;
        if (!history || body.more !== true) break;
        setSyncResult(
          `Imported ${imported} bets so far, fetching older history...`
        );
      }

      setSyncing(false);
      if (failed && imported === 0 && updated === 0) {
        setError(failed);
        return;
      }

      const parts: string[] = [];
      if (imported > 0)
        parts.push(
          `Imported ${imported} ${imported === 1 ? "bet" : "bets"} from Kalshi`
        );
      if (updated > 0) parts.push(`updated ${updated}`);
      if (parts.length === 0) {
        // "Up to date" is only true when there was something to be up
        // to date WITH. Finding nothing at all is a different fact and
        // the owner read the old wording as success.
        setSyncResult(
          total > 0
            ? "Everything is already up to date."
            : "No Kalshi bets found to import."
        );
      } else {
        const still = pending > 0 ? `, ${pending} still pending` : "";
        setSyncResult(`${parts.join(", ")}${still}.`);
      }
      if (failed) setError(`${failed} What arrived before it is saved.`);
      setStatus((s) =>
        s ? { ...s, last_synced_at: new Date().toISOString() } : s
      );
      // The imported bets sit on Track and Performance, which are
      // server rendered: refresh so they are there when the user
      // taps over.
      router.refresh();
    },
    [router]
  );

  async function connect() {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/connect/kalshi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessKey, privateKey }),
    }).catch(() => null);
    setBusy(false);

    const body = await res?.json().catch(() => null);
    if (!res?.ok) {
      setError(body?.error ?? "Something went wrong. Try again.");
      return;
    }
    setBalanceCents(body.balanceCents ?? null);
    setStatus({ connected_at: new Date().toISOString(), last_synced_at: null });
    setPrivateKey("");
    setAccessKey("");
    setJustConnected(true);
    setStep("detail");
    // The first sync runs on its own, so connecting ends with bets
    // on the page, not with homework.
    sync(false);
  }

  async function disconnect() {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/connect/kalshi", { method: "DELETE" }).catch(
      () => null
    );
    setBusy(false);
    if (!res?.ok) {
      setError("Could not disconnect. Try again.");
      return;
    }
    setBalanceCents(null);
    setStatus(null);
    setStep("list");
  }

  if (step === "loading") {
    return (
      <section className={`${CARD} p-4`}>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Checking your connections...
        </p>
      </section>
    );
  }

  if (step === "list") {
    return (
      <section className={`${CARD} p-4`}>
        <h2 className="text-[17px] font-bold">Connect accounts</h2>
        {/* The same honesty rule as the detail card: no promise in the
            present tense until importing works. IMPORTING_LIVE flips
            all of it at once. */}
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {IMPORTING_LIVE
            ? "Link a platform and your bets there arrive on their own. Actuals can only read, it never touches your money."
            : "Link a platform so your bets there can arrive on their own. Actuals can only read, it never touches your money. Importing the bets is being built now."}
        </p>
        <div className="mt-3 space-y-2">
          {status ? (
            <button
              type="button"
              onClick={() => setStep("detail")}
              className={`${INNER} flex w-full items-center gap-3 px-3 py-3 text-left`}
            >
              <span className="text-[#22C55E]">
                <CheckIcon />
              </span>
              <span className="min-w-0 grow">
                <span className="block text-sm font-semibold">Kalshi</span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  Connected on {shortDate(status.connected_at)}
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                Manage ›
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep("trust")}
              className={`${INNER} flex w-full items-center gap-3 px-3 py-3 text-left`}
            >
              <span className="text-[#22C55E]">
                <LinkIcon />
              </span>
              <span className="min-w-0 grow">
                <span className="block text-sm font-semibold">Kalshi</span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  kalshi.com, with your own API key
                </span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                Connect ›
              </span>
            </button>
          )}

          <div className={`${INNER} flex items-center gap-3 px-3 py-3 opacity-60`}>
            <span className="text-neutral-400">
              <LinkIcon />
            </span>
            <span className="min-w-0 grow">
              <span className="block text-sm font-semibold">Polymarket</span>
            </span>
            <span className="shrink-0 rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
              Coming Soon
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          More platforms join this list over time.
        </p>
      </section>
    );
  }

  if (step === "trust") {
    return (
      <section className={`${CARD} p-4`}>
        <h2 className="text-[17px] font-bold">Before you connect Kalshi</h2>
        <ul className="mt-3 space-y-3">
          {[
            [
              "Actuals only reads",
              "It reads your bets and your balance. It never places, changes or cancels a trade, and there is no code in Actuals that can.",
            ],
            [
              "Your key is stored locked",
              "It is encrypted before it is saved, and it is never shown again to anyone, including you.",
            ],
            [
              "Leaving is one tap",
              "Disconnect deletes the key. Your imported bets stay yours.",
            ],
          ].map(([title, body]) => (
            <li key={title}>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                {body}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setCard(0);
            setStep("form");
          }}
          className={`${BTN} mt-4 h-11 w-full`}
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => setStep("list")}
          className="mt-2 h-11 w-full rounded-xl text-sm font-bold text-neutral-500 dark:text-neutral-400"
        >
          Back
        </button>
      </section>
    );
  }

  if (step === "detail") {
    return (
      <section className={`${CARD} p-4`}>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">
            <CheckIcon />
          </span>
          <h2 className="text-[17px] font-bold">Kalshi is connected</h2>
        </div>

        {/* The boom moment, right after connecting. The owner's own
            sketch of it: "boom you've connected Kalshi... from now on
            all of your bets on Kalshi will be tracked and logged and
            filtered automatically." Shortened to his own wording on
            20 August: the sync's own line below already reports the
            first import, so this said it twice. */}
        {justConnected && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            From now on, bets you place on Kalshi are synced and
            tracked in Actuals.
          </p>
        )}

        <button
          type="button"
          onClick={() => sync(false)}
          disabled={syncing}
          className={`${BTN} mt-3 h-11 w-full`}
        >
          {syncing ? "Syncing with Kalshi..." : "Sync now"}
        </button>
        {syncResult && (
          <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {syncResult}
          </p>
        )}

        <div className={`${INNER} mt-3 px-3 py-3`}>
          <span className="block text-xs text-neutral-500 dark:text-neutral-400">
            Your Kalshi balance right now
          </span>
          <span className="mt-0.5 block font-money text-lg font-bold tabular-nums">
            {balanceCents !== null
              ? formatMoney(balanceCents / 100)
              : busy
                ? "..."
                : "-"}
          </span>
        </div>

        {/* SAYS WHAT IS TRUE TODAY, not what is planned. The first
            version read "importing arrives in the next update" and
            the owner asked whether that meant his bets were being
            tracked from now on. It did not, and a user believing
            their bets are tracked when they are not is the worst
            thing this screen could do. Never describe the build
            schedule here: describe what is happening to their money.
            This copy changes the day importing actually works. */}
        <div className={`${INNER} mt-2 px-3 py-3`}>
          <span className="block text-sm font-semibold">
            {IMPORTING_LIVE
              ? `Connected ${status ? `on ${shortDate(status.connected_at)}` : ""}`
              : "Your bets are not being imported yet"}
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            {IMPORTING_LIVE ? (
              <>
                Actuals syncs with Kalshi automatically. Earlier bets
                can be imported from {KALSHI_HISTORY_FROM}.
              </>
            ) : (
              <>
                Connecting proved Actuals can read your Kalshi account.
                Bringing the bets in is being built now, and until it
                is done nothing from Kalshi appears in Actuals. Nothing
                is lost in the meantime: Kalshi keeps your record, so
                bets you place from{" "}
                {status
                  ? shortDate(status.connected_at)
                  : "the day you connected"}{" "}
                onward can still come in when it is ready.
              </>
            )}
          </span>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={retest}
            disabled={busy}
            className="text-sm font-semibold text-neutral-600 disabled:opacity-60 dark:text-neutral-300"
          >
            {busy ? "Asking Kalshi..." : "Refresh balance ›"}
          </button>
          <button
            type="button"
            onClick={disconnect}
            disabled={busy}
            className="text-sm font-semibold text-red-600 disabled:opacity-60 dark:text-red-400"
          >
            Disconnect
          </button>
        </div>

        {/* The history import, quiet and behind a question, per the
            owner: fresh start is the standard and the app should say
            so, but the past stays reachable for whoever insists.
            It stopped saying "all" and "everything" once the June 13
            wall was measured; KALSHI_HISTORY_FROM owns the date. */}
        {askHistory ? (
          <div className={`${INNER} mt-3 px-3 py-3`}>
            <span className="block text-sm font-semibold">
              Import Kalshi bets from {KALSHI_HISTORY_FROM}?
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              Importing older bets gives you insights and results from{" "}
              {KALSHI_HISTORY_SHORT}.
            </span>
            {/* The actual ask, on its own row by the owner: both
                choices in one sentence, so the buttons under it are
                an answer rather than a guess. */}
            <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
              Do you want to import bets or keep your Actuals record
              clean and start tracking from your connect date?
            </span>
            <div className="mt-2.5 flex items-center gap-4">
              <button
                type="button"
                disabled={syncing}
                onClick={() => {
                  setAskHistory(false);
                  sync(true);
                }}
                className="text-sm font-semibold text-neutral-600 disabled:opacity-60 dark:text-neutral-300"
              >
                Import bets
              </button>
              <button
                type="button"
                onClick={() => setAskHistory(false)}
                className="text-sm font-semibold text-neutral-500 dark:text-neutral-400"
              >
                No. Skip it
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAskHistory(true)}
            className="mt-3 text-xs text-neutral-500 underline underline-offset-2 dark:text-neutral-400"
          >
            Import older Kalshi bets
          </button>
        )}

        {/* The last resort when a sync finds nothing: ask Kalshi what
            it answers and show it verbatim. Kalshi is unreachable
            from the machine this app is written on, so without this
            a failure is invisible to everyone. */}
        <button
          type="button"
          onClick={async () => {
            setDiagnosis("Asking Kalshi...");
            const res = await fetch("/api/connect/kalshi/diagnose").catch(
              () => null
            );
            const body = await res?.json().catch(() => null);
            setDiagnosis(JSON.stringify(body, null, 1));
          }}
          className="mt-2 block text-xs text-neutral-500 underline underline-offset-2 dark:text-neutral-400"
        >
          Nothing syncing? Check what Kalshi answers
        </button>
        {diagnosis && (
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-neutral-100 p-3 text-[10px] leading-relaxed dark:bg-black/40">
            {diagnosis}
          </pre>
        )}

        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("list");
          }}
          className="mt-2 h-11 w-full rounded-xl text-sm font-bold text-neutral-500 dark:text-neutral-400"
        >
          Back to all platforms
        </button>
      </section>
    );
  }

  // THE GUIDE WIZARD. One card at a time, the owner's own shape. The
  // last card, one past the guide, is the paste card.
  const onPasteCard = card >= KALSHI_GUIDE.length;
  if (!onPasteCard) {
    const guide = KALSHI_GUIDE[card];
    return (
      <section className={`${CARD} p-4`}>
        <h2 className="text-[17px] font-bold">Your Kalshi API key</h2>

        {/* THE PHONE WARNING, on the first card so nobody discovers
            it at step 5: Kalshi does not show API keys on the phone
            (the owner hit this himself, August 2026). */}
        {card === 0 && (
          <div className={`${INNER} mt-3 px-3 py-3`}>
            <span className="block text-sm font-semibold">
              You need a computer for this.
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              Kalshi does not show API keys on the phone. It takes about
              two minutes, and you only do it once.
            </span>
          </div>
        )}

        {/* min-height keeps the corners still while the text length
            changes card to card. */}
        <div className="mt-3 min-h-[96px]">
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            <span className="sr-only">Step {card + 1} of {KALSHI_GUIDE.length + 1}: </span>
            {guide.text}
          </p>
          {guide.image && (
            /* A screenshot of the Kalshi screen this card talks
               about, in a quiet frame. next/image is skipped on
               purpose: these are fixed local files shown at their
               natural size. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={guide.image.src}
              alt={guide.image.alt}
              className="mt-3 w-full rounded-xl ring-1 ring-neutral-200 dark:ring-white/10"
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (card === 0) {
                setError(null);
                setStep("trust");
              } else {
                setCard(card - 1);
              }
            }}
            className="h-10 rounded-xl px-2 text-sm font-bold text-neutral-500 dark:text-neutral-400"
          >
            Back
          </button>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {Array.from({ length: KALSHI_GUIDE.length + 1 }).map((_, i) => (
              <span
                key={i}
                className={
                  i === card
                    ? "h-1.5 w-4 rounded-full bg-brand-mark"
                    : "h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-white/20"
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCard(card + 1)}
            className={`${BTN} h-10 px-6`}
          >
            Next
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`${CARD} p-4`}>
      <h2 className="text-[17px] font-bold">Paste them here</h2>

      <label htmlFor="kalshi-key-id" className="mt-4 block text-sm font-semibold">
        API Key ID
      </label>
      <input
        id="kalshi-key-id"
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="a1b2c3d4-..."
        value={accessKey}
        onChange={(e) => setAccessKey(e.target.value)}
        className={`${FIELD} h-12`}
      />

      <label htmlFor="kalshi-pem" className="mt-3 block text-sm font-semibold">
        Private key
      </label>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
        Open the downloaded file and paste everything, including the
        BEGIN and END lines.
      </p>
      <textarea
        id="kalshi-pem"
        rows={5}
        autoComplete="off"
        spellCheck={false}
        placeholder="-----BEGIN RSA PRIVATE KEY-----"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        className={`${FIELD} py-3 font-mono text-xs leading-relaxed`}
      />

      {/* What the button DOES, right above it. The owner, after
          walking the whole form himself: "then I press connect. What
          does that mean?" Nobody should press a button holding their
          betting account's key without knowing exactly what happens
          next. */}
      <div className={`${INNER} mt-4 px-3 py-3`}>
        <span className="block text-sm font-semibold">
          What pressing Connect does
        </span>
        {/* list-outside keeps a wrapped second line aligned under the
            first word, not under the dot. */}
        <ul className="mt-1.5 list-disc list-outside space-y-1 pl-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          <li>Your current pending Kalshi bets will appear in Actuals.</li>
          <li>
            New Kalshi bets will automatically be synced and tracked in
            Actuals.
          </li>
          <li>
            Older bets won&apos;t be imported. You can bring in bets
            from {KALSHI_HISTORY_FROM} later.
          </li>
        </ul>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={connect}
        disabled={busy || accessKey.trim() === "" || privateKey.trim() === ""}
        className={`${BTN} mt-3 h-11 w-full`}
      >
        {busy ? "Checking with Kalshi..." : "Connect Kalshi"}
      </button>

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setCard(KALSHI_GUIDE.length - 1);
          }}
          className="h-10 rounded-xl px-2 text-sm font-bold text-neutral-500 dark:text-neutral-400"
        >
          Back
        </button>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: KALSHI_GUIDE.length + 1 }).map((_, i) => (
            <span
              key={i}
              className={
                i === card
                  ? "h-1.5 w-4 rounded-full bg-brand-mark"
                  : "h-1.5 w-1.5 rounded-full bg-neutral-300 dark:bg-white/20"
              }
            />
          ))}
        </div>
        {/* An empty box the Back button's size, so the dots stay
            centered on the paste card too. */}
        <span className="h-10 w-[52px]" aria-hidden="true" />
      </div>
    </section>
  );
}
