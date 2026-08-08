"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Disclaimer from "@/components/Disclaimer";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
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
          Log in to your account
        </p>

        <div className="mt-8">
          <GoogleButton />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold">
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
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 dark:border-white/15 dark:bg-[#1A1A24] dark:text-neutral-100"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-[#7C3AED]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 dark:border-white/15 dark:bg-[#1A1A24] dark:text-neutral-100"
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
            className="h-12 w-full rounded-xl bg-[#4C1D95] text-base font-semibold text-white active:bg-[#3B1578] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          No account yet?{" "}
          <Link href="/signup" className="font-semibold text-[#7C3AED]">
            Sign up
          </Link>
        </p>

        <Disclaimer />
      </div>
    </main>
  );
}
