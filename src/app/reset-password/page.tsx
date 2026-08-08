"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Disclaimer from "@/components/Disclaimer";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The emailed link can arrive in several shapes depending on the
  // Supabase settings: a code to exchange, tokens in the address bar,
  // or a token hash. Accept all of them, then fall back to an
  // existing session.
  useEffect(() => {
    const supabase = createClient();

    async function prepare() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) return true;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return true;
      }

      const tokenHash = url.searchParams.get("token_hash");
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (!error) return true;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session !== null;
    }

    prepare()
      .then((ok) => {
        setReady(ok);
        setChecking(false);
        // Clean the one-time values out of the address bar.
        window.history.replaceState({}, "", "/reset-password");
      })
      .catch(() => {
        setReady(false);
        setChecking(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Celebet
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Pick a new password
        </p>

        {checking ? (
          <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Checking your link...
          </p>
        ) : !ready ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              This page only works when opened from the reset link in your
              email. The link may also have expired, or it was opened in a
              different browser than the one that asked for it.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-block font-semibold text-[#7C3AED]"
            >
              Send a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-100"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                At least 8 characters
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-[#4C1D95] text-base font-semibold text-white active:bg-[#3B1578] disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}

        <Disclaimer />
      </div>
    </main>
  );
}
