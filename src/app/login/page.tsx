"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import BackHome from "@/components/BackHome";
import Disclaimer from "@/components/Disclaimer";

// THE ONLY AUTH PAGE. /signup, /forgot-password and /reset-password
// all redirect here (next.config.ts): there are no passwords any more,
// so there is nothing to forget or reset. Both landing doors open this
// page and only the greeting differs. See AuthCard for the flow.
function LoginInner() {
  const params = useSearchParams();

  // Old emailed links whose token has already been spent land here via
  // /auth/confirm. One plain line, then the normal flow: a fresh code
  // fixes it.
  const notice =
    params.get("expired") === "1"
      ? "That link has expired. Log in below and we will send a fresh code."
      : params.get("error") === "signin"
        ? "Google sign in did not complete. Try again."
        : null;

  return (
    <AuthCard firstVisit={params.get("new") === "1"} notice={notice} />
  );
}

// useSearchParams needs a Suspense boundary or the whole route opts out
// of static rendering, which the build fails on.
export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <BackHome />
      <div className="mx-auto w-full max-w-sm">
        <Suspense>
          <LoginInner />
        </Suspense>
        <Disclaimer />
      </div>
    </main>
  );
}
