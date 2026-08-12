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
// It follows the theme in CSS, not by a prop, for the same reason the
// insight card does: the hero is light on a light theme now, so no call
// site can know which band it is standing on.
export default function StartTracking({
  label = "Start Tracking",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-md">
      {/* The heights are classes, not flex tricks. The first mobile
          build put flex-1 on the input: in the stacked column that is
          the VERTICAL axis, so it silently overrode the input's height
          and the owner got a thin input under a fat button. flex-1 now
          exists only from sm up, where the axis is horizontal and it
          means width. On a phone both controls are the same 54px. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/signup?email=${encodeURIComponent(email.trim())}`);
        }}
        className="flex flex-col gap-2.5 sm:flex-row sm:gap-2"
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
          className="h-[54px] w-full min-w-0 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-top dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40 dark:focus:border-brand-mark sm:h-[52px] sm:flex-1"
        />
        <button
          type="submit"
          className="h-[54px] w-full shrink-0 rounded-xl bg-gradient-to-b from-brand-top to-brand-bottom px-6 text-base font-bold text-white shadow-lg shadow-brand-top/25 active:from-brand-bottom active:to-brand-press sm:h-[52px] sm:w-auto"
        >
          {label}
        </button>
      </form>

      <div className="mt-3 empty:hidden">
        <GoogleButton large />
      </div>
    </div>
  );
}
