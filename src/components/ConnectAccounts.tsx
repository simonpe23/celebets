"use client";

import { useEffect, useState } from "react";
import { BTN, CARD, INNER } from "@/lib/ui";
import { formatMoney } from "@/lib/format";

// Connecting a betting platform, phase 1 (August 2026): Kalshi, by
// the owner's ruling, with the official personal API key. The flow
// copies the shape the owner liked in Pikkit's BookSync: pick the
// platform, one honest trust screen, then the auth step. Ours differs
// only at the last step: a guided key setup instead of a password
// box, because Actuals holds no passwords and pays no middleman.
//
// Nothing imports yet. This phase proves the connection and stores
// the key encrypted; syncing is the next phase, and the screen says
// so rather than pretending.

type Step = "loading" | "list" | "trust" | "form" | "connected";

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

const FIELD =
  "mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#0E1228] dark:text-neutral-100 dark:placeholder:text-white/30";

export default function ConnectAccounts({
  // /preview/connect only: open on a chosen step with nothing fetched,
  // so sitecheck and screenshots can reach every state.
  demoStep = null,
}: {
  demoStep?: Step | null;
}) {
  const [step, setStep] = useState<Step>(demoStep ?? "loading");
  const [status, setStatus] = useState<Status>(
    demoStep === "connected"
      ? { connected_at: "2026-08-19T12:00:00Z", last_synced_at: null }
      : null
  );
  const [accessKey, setAccessKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Kalshi's balance in cents, straight from the successful test. The
  // proof the connection is real, shown once.
  const [balanceCents, setBalanceCents] = useState<number | null>(null);

  useEffect(() => {
    if (demoStep) return;
    fetch("/api/connect/kalshi")
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.connected ?? null);
        setStep(d.connected ? "connected" : "list");
      })
      .catch(() => setStep("list"));
  }, [demoStep]);

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
    setStep("connected");
  }

  async function retest() {
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
        <h2 className="text-[17px] font-bold">Connect a platform</h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Your bets there appear here on their own. Actuals can only
          read, it never touches your money.
        </p>
        <div className="mt-3 space-y-2">
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
              "It imports your bets and balance. It never places, changes or cancels a trade, and there is no code in Actuals that can.",
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
          onClick={() => setStep("form")}
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

  if (step === "connected") {
    return (
      <section className={`${CARD} p-4`}>
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <h2 className="text-[17px] font-bold">Kalshi is connected</h2>
        </div>

        {balanceCents !== null && (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Kalshi answered with your balance:{" "}
            <span className="font-money font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatMoney(balanceCents / 100)}
            </span>
            . The connection works.
          </p>
        )}

        <div className={`${INNER} mt-3 px-3 py-3`}>
          <span className="block text-sm font-semibold">
            Connected {status ? `on ${shortDate(status.connected_at)}` : ""}
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
            Importing your bets arrives in the next update. Connecting
            now means you are ready the day it does.
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
            {busy ? "Testing..." : "Test connection ›"}
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
      </section>
    );
  }

  return (
    <section className={`${CARD} p-4`}>
      <h2 className="text-[17px] font-bold">Your Kalshi API key</h2>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
        Two minutes, one time. Easiest on a computer.
      </p>

      {/* These steps are the owner's own walk through Kalshi's real
          screens (19 August 2026), replacing a vaguer version written
          from their docs. If Kalshi moves things, walk the flow again
          and rewrite from the screen, not from memory. */}
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-neutral-600 dark:text-neutral-300">
        <li>
          Log in at kalshi.com, open the menu, then Account &amp;
          Security. Or go straight to kalshi.com/account/profile.
        </li>
        <li>Scroll down to the API Keys section and press Create key.</li>
        <li>Name it anything. &quot;Actuals&quot; works.</li>
        <li>Leave the optional RSA public key box empty.</li>
        <li>
          Permissions: tick Read all data. Leave Full access OFF. A
          key without it cannot trade or move money, ever, which is
          exactly right: Actuals only reads.
        </li>
        <li>
          Press Create. Kalshi shows a Key ID and downloads the
          private key file. Keep that file: Kalshi never shows it
          again.
        </li>
        <li>Paste the Key ID and the file&apos;s contents below.</li>
      </ol>

      <label htmlFor="kalshi-key-id" className="mt-4 block text-sm font-semibold">
        Key ID
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

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={connect}
        disabled={busy || accessKey.trim() === "" || privateKey.trim() === ""}
        className={`${BTN} mt-4 h-11 w-full`}
      >
        {busy ? "Checking with Kalshi..." : "Connect Kalshi"}
      </button>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setStep("trust");
        }}
        className="mt-2 h-11 w-full rounded-xl text-sm font-bold text-neutral-500 dark:text-neutral-400"
      >
        Back
      </button>
    </section>
  );
}
