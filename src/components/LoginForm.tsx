"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/GoogleButton";

// THE LOG IN FORM, IN ONE PLACE.
//
// Two things show it: the /login page, and the panel that opens over
// the landing page. It lives here so there is one form, not two. A
// second copy is a second place for a bug to hide, and the two would
// drift the first time either changed.
//
// It does not draw its own heading or card. The page and the panel
// each frame it their own way.
export default function LoginForm({
  // Where to go after a successful log in. The app in both cases
  // today, but the panel may want somewhere else later.
  next = "/app",
  // Sign up is a link on the page and a panel swap in the panel, so
  // the caller decides what that control does.
  onSignUp,
}: {
  next?: string;
  onSignUp?: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  const field =
    "mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-100";

  return (
    <>
      <div className="mt-6 empty:hidden">
        <GoogleButton />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="login-password"
              className="block text-sm font-semibold"
            >
              Password
            </label>
            {/* Forgot password stays a real page: it sends mail and
                then you leave to go read it. A panel over a marketing
                page would pretend that is quick. */}
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-brand-mark"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-brand-top text-base font-semibold text-white active:bg-brand-bottom disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No account yet?{" "}
        {onSignUp ? (
          <button
            type="button"
            onClick={onSignUp}
            className="font-semibold text-brand-mark"
          >
            Sign up
          </button>
        ) : (
          <Link href="/signup" className="font-semibold text-brand-mark">
            Sign up
          </Link>
        )}
      </p>
    </>
  );
}
