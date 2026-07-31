"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Disclaimer from "@/components/Disclaimer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-sm text-neutral-500">
            If an account exists for {email}, we sent a reset link. Open it on
            this phone and you can pick a new password.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block font-semibold text-[#4F7A57]"
          >
            Back to log in
          </Link>
          <Disclaimer />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Celebet
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Reset your password
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-[#4F7A57] focus:ring-2 focus:ring-[#4F7A57]/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
            className="h-12 w-full rounded-xl bg-[#4F7A57] text-base font-bold text-white active:bg-[#3F6446] disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-[#4F7A57]">
            Log in
          </Link>
        </p>

        <Disclaimer />
      </div>
    </main>
  );
}
