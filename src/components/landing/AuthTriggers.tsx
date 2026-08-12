"use client";

import Link from "next/link";
import { useState } from "react";
import AuthPanel from "@/components/AuthPanel";
import LoginForm from "@/components/LoginForm";

// THE LANDING PAGE'S HEADER CONTROLS, and the panel they open.
//
// This is a client island so the landing page itself stays a server
// component: only these two buttons and the panel ship JavaScript, not
// the whole page.
//
// Phase 1 wires Log in. Start Tracking still goes to /signup as a page
// until phase 2 puts the sign up form in the same panel.
export default function AuthTriggers() {
  const [panel, setPanel] = useState<"login" | null>(null);

  return (
    <>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setPanel("login")}
          className="rounded-xl border border-neutral-900/10 px-5 py-2.5 text-[15px] font-bold text-neutral-700 transition-colors hover:bg-neutral-900/[0.04] dark:border-white/15 dark:text-white/90 dark:hover:bg-white/[0.06]"
        >
          Log in
        </button>
        <Link
          href="/signup"
          className="rounded-xl bg-gradient-to-b from-brand-top to-brand-bottom px-5 py-2.5 text-[15px] font-bold text-white shadow-lg shadow-brand-top/25 transition-opacity hover:opacity-95"
        >
          Start Tracking
        </Link>
      </div>

      <AuthPanel
        open={panel === "login"}
        title="Log in"
        onClose={() => setPanel(null)}
      >
        <LoginForm />
      </AuthPanel>
    </>
  );
}
