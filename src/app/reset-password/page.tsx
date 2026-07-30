"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Disclaimer from "@/components/Disclaimer";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Opening the emailed link signs the user in temporarily, which is
  // what allows setting a new password here.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(session !== null);
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

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Celebet
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Pick a new password
        </p>

        {!ready ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500">
              This page only works when opened from the reset link in your
              email. The link may also have expired.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-block font-semibold text-emerald-600"
            >
              Send a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
              <p className="mt-1 text-xs text-neutral-500">
                At least 6 characters
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
              className="h-12 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white active:bg-emerald-700 disabled:opacity-60"
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
