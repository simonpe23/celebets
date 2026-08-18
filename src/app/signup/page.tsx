"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Disclaimer from "@/components/Disclaimer";
import GoogleButton from "@/components/GoogleButton";
import BackHome from "@/components/BackHome";
import Wordmark from "@/components/Wordmark";

// The landing page carries the email here in the address, so someone
// who typed it there does not have to type it twice. Nothing else about
// this page changed: a password and a confirmation link are still
// required, because both exist for good reasons.
function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is enabled in Supabase there is no session yet.
    if (!data.session) {
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  if (needsConfirmation) {
    return (
      <main className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
        <BackHome />
        <div className="mx-auto w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            We sent a confirmation link to {email}. Click it, then come back
            and log in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block font-semibold text-brand-mark"
          >
            Go to log in
          </Link>
          <Disclaimer />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <BackHome />
      <div className="mx-auto w-full max-w-sm">
        <h1 className="flex justify-center text-3xl">
          <Wordmark className="text-3xl" />
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Create your account
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
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-mark focus:ring-2 focus:ring-brand-mark/30 dark:border-white/15 dark:bg-[#161D38] dark:text-neutral-100"
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
            className="h-12 w-full rounded-xl bg-brand-top text-base font-semibold text-white active:bg-brand-bottom disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-mark">
            Log in
          </Link>
        </p>

        <Disclaimer />
      </div>
    </main>
  );
}

// useSearchParams needs a Suspense boundary or the whole route opts out
// of static rendering, which the build fails on.
export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
