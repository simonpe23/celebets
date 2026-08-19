"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/GoogleButton";
import Wordmark from "@/components/Wordmark";

// THE ONE AUTH SCREEN (August 2026, the owner's flow). There are no
// passwords anywhere in Actuals: you continue with Google, or you type
// your email and a six-digit code arrives. The same screen serves both
// doors on the landing page, and only the headline changes:
//   Start Tracking  ->  /login?new=1   "Create your account"
//   Log in          ->  /login         "Welcome back"
// The button under the headline never changes, the headline does. That
// is the owner's rule, learned from Asana's login screen, and it is
// also why nothing here is labelled "Sign up".
//
// The code is one email for everyone: a known email logs straight in,
// a new email creates the account. So the screen never has to know
// which kind of visitor it is talking to, and it can never leak
// whether an email has an account, which matters on a betting app.
//
// SEND CODE DOES NOT NAVIGATE. The owner asked exactly this question:
// "what happens when i click send code... does it take me to a new
// page?" No. The email field and the button are replaced, in place, by
// the six boxes, and the cursor is already in the first one. The sixth
// digit submits on its own, there is no Continue button. He approved
// that trade by name.

// Supabase's error strings are written for developers. The user gets
// plain words, and the raw message only when we have nothing better.
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("invalid"))
    return "That code did not match. Check the newest email, or resend.";
  if (m.includes("security purposes") || m.includes("rate limit"))
    return "Too many emails too quickly. Wait a minute, then try again.";
  if (m.includes("valid email")) return "That does not look like an email address.";
  return message;
}

// The demo account's email. Typing it skips the email round trip
// entirely: no code is sent, and the six boxes check the permanent
// demo code through /api/demo-login instead. Empty when the demo door
// is not configured, and then nothing here behaves differently.
const DEMO_EMAIL = (process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "").toLowerCase();

const FIELD =
  "block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-100 dark:placeholder:text-white/40";

const PRIMARY =
  "h-12 w-full rounded-xl bg-gradient-to-b from-brand-top to-brand-bottom text-base font-bold text-white shadow-lg shadow-brand-top/25 active:from-brand-bottom active:to-brand-press disabled:opacity-60";

export default function AuthCard({
  firstVisit = false,
  notice = null,
  demoCodeStep = false,
}: {
  // Which door was used. Start Tracking sets it, Log in does not.
  firstVisit?: boolean;
  // A one-line message from a redirect, like an expired old link.
  notice?: string | null;
  // /preview/auth only: render the code step without sending anything,
  // so the second state can be screenshotted and design-checked.
  demoCodeStep?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">(
    demoCodeStep ? "code" : "email"
  );
  const [email, setEmail] = useState(demoCodeStep ? "simon@email.com" : "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  // Seconds until Resend wakes up. Supabase refuses a second email
  // inside 60 seconds anyway, so the button tells the truth about it.
  const [cooldown, setCooldown] = useState(0);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // The code boxes are a display. The real input sits invisibly on top
  // of them, so focus, paste, backspace and the phone's own
  // fill-from-email suggestion all keep working natively.
  useEffect(() => {
    if (step === "code") codeInput.current?.focus();
  }, [step]);

  const isDemo =
    DEMO_EMAIL !== "" && email.trim().toLowerCase() === DEMO_EMAIL;

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    // The demo account has a permanent code, so there is no email to
    // send. Straight to the boxes.
    if (isDemo) {
      setCode("");
      setCooldown(60);
      setStep("code");
      return;
    }

    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    setSending(false);
    if (error) {
      setError(friendly(error.message));
      return;
    }
    setCode("");
    setCooldown(60);
    setStep("code");
  }

  async function verify(token: string) {
    setError(null);
    setChecking(true);

    let failure: string | null = null;
    if (isDemo) {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: token }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        failure = friendly(body?.error ?? "Something went wrong. Try again.");
      }
    } else {
      // TWO TYPES, ONE CODE. Supabase decides which email template to
      // send by whether the address already has a confirmed account,
      // and the token it puts in each verifies under a DIFFERENT type:
      //   returning address  -> Magic link template   -> type "email"
      //   brand new address  -> Confirm sign up       -> type "signup"
      // Asking for the wrong one answers "Token has expired or is
      // invalid", which is indistinguishable from a wrong code. This
      // shipped as exactly that bug: every first-time address was told
      // its correct code did not match. The page cannot know which
      // kind of visitor it has (that is the whole point of the code
      // flow), so it tries the common one and falls back.
      const supabase = createClient();
      const attempt = (type: "email" | "signup") =>
        supabase.auth.verifyOtp({ email: email.trim(), token, type });

      const first = await attempt("email");
      if (first.error) {
        const second = await attempt("signup");
        if (second.error) failure = friendly(first.error.message);
      }
    }

    if (failure) {
      setChecking(false);
      setCode("");
      setError(failure);
      codeInput.current?.focus();
      return;
    }

    router.push("/app");
    router.refresh();
  }

  // The sixth digit submits on its own. The owner asked for exactly
  // this: "auto-submit as soon as the 6th digit lands... i want that."
  function onCodeChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !checking) verify(digits);
  }

  if (step === "code") {
    return (
      <div>
        <h1 className="flex justify-center text-3xl">
          <Wordmark className="text-3xl" />
        </h1>
        <h2 className="mt-6 text-center text-xl font-bold">
          {isDemo ? "Enter the demo code" : "Check your email"}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {isDemo
            ? "Type the six-digit code you were given."
            : `We sent a code to ${email.trim()}`}
        </p>

        <div
          className="relative mt-6"
          onClick={() => codeInput.current?.focus()}
        >
          <input
            ref={codeInput}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Six-digit code"
            disabled={checking}
            // Invisible but real: 16px text so iOS does not zoom on
            // focus, full-size so a tap anywhere on the boxes lands in
            // it.
            className="absolute inset-0 z-10 w-full text-base opacity-0"
          />
          <div aria-hidden="true" className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex h-14 w-11 items-center justify-center rounded-xl border bg-white text-2xl font-semibold text-neutral-900 dark:bg-[#161D38] dark:text-neutral-100 ${
                  i === code.length && !checking
                    ? "border-brand-mark ring-2 ring-brand-mark/30"
                    : "border-neutral-300 dark:border-white/15"
                }`}
              >
                {code[i] ?? ""}
              </div>
            ))}
          </div>
        </div>

        {checking && (
          <p className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Checking...
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {/* No email was sent to the demo account, so there is nothing
            to resend. */}
        {!isDemo && (
          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Nothing arrived?{" "}
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={sending}
                className="font-semibold text-brand-mark disabled:opacity-60"
              >
                {sending ? "Sending..." : "Resend code"}
              </button>
            )}
          </p>
        )}
        <p className={`${isDemo ? "mt-6" : "mt-2"} text-center text-sm`}>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="font-semibold text-brand-mark"
          >
            Change email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="flex justify-center text-3xl">
        <Wordmark className="text-3xl" />
      </h1>
      <h2 className="mt-6 text-center text-xl font-bold">
        {firstVisit ? "Create your account" : "Welcome back"}
      </h2>

      {notice && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {notice}
        </p>
      )}

      {/* The divider only exists to separate Google from email, so it
          follows the button: when NEXT_PUBLIC_GOOGLE_ENABLED is off the
          button renders nothing and an "or" above nothing is a bug. */}
      {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
        <>
          <div className="mt-8">
            <GoogleButton />
          </div>
          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
            <span className="text-xs text-neutral-400">or</span>
            <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
          </div>
        </>
      )}

      <form
        onSubmit={sendCode}
        className={`space-y-3 ${
          process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" ? "" : "mt-8"
        }`}
      >
        <label htmlFor="auth-email" className="sr-only">
          Email address
        </label>
        <input
          id="auth-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD}
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={sending} className={PRIMARY}>
          {sending ? "Sending..." : "Send code"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        No passwords. We email you a six-digit code:
        <br />
        new email creates your account, known email logs you in.
      </p>
    </div>
  );
}
