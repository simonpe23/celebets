"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GoogleButton from "@/components/GoogleButton";

// THE SIGN UP FIELD ON THE LANDING PAGE.
//
// The owner: "i want users to be able to sign up with 1 click on the
// landing page... i rather want a signup field right away."
//
// So the first thing on the page is a box you type into, not a button
// that takes you to a page with a box on it. Typing an email and
// pressing the button carries it to /signup, which fills it in, so the
// only thing left there is a password.
//
// This is NOT one click, and pretending otherwise would be the same
// mistake as the fake star rating: email sign up needs a password and a
// confirmation link, both of which exist for good reasons. The genuine
// one click is the Google button underneath, which is already wired up.
// Apple is deliberately absent until the owner has a developer account.
export default function StartTracking({
  onDark = false,
}: {
  onDark?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/signup?email=${encodeURIComponent(email.trim())}`);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="landing-email" className="sr-only">
          Email address
        </label>
        <input
          id="landing-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`min-w-0 flex-1 rounded-xl border px-4 text-base outline-none transition-colors ${
            onDark
              ? "border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-brand-mark"
              : "border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-brand-top"
          }`}
          style={{ height: 52 }}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-gradient-to-b from-brand-top to-brand-bottom px-6 text-base font-bold text-white shadow-lg shadow-brand-top/25 active:from-brand-bottom active:to-brand-press"
          style={{ height: 52 }}
        >
          Start Tracking
        </button>
      </form>

      <div className="mt-3">
        <GoogleButton large />
      </div>
    </div>
  );
}
