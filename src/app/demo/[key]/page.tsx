"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// THE DEMO LINK (August 2026). One click into the demo account:
// actuals.cc/demo/<code>, where <code> is the same permanent demo code
// the six boxes accept. The owner shares this link instead of sending
// an email address and a code separately.
//
// The page holds no secret. It forwards whatever is in the address to
// /api/demo-login, and that route does the checking, exactly as it
// does for a typed code. A wrong or stale link gets the message below
// and a way to the normal login.
//
// The code lives only in Vercel (DEMO_CODE). Changing it there kills
// every previously shared link on the next deploy, which is the whole
// revocation story, and it is enough for a demo.
export default function DemoLinkPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  // Null while trying. A wrong code and a misconfigured door used to
  // show the identical sentence, which cost an evening of guessing:
  // the owner could not tell "these six digits are wrong" from "the
  // demo account's password is wrong". They are different problems
  // with different fixes, so they now say different things.
  const [failure, setFailure] = useState<string | null>(null);
  // React mounts twice in development. One knock on the door is plenty.
  const knocked = useRef(false);

  useEffect(() => {
    if (knocked.current || !key) return;
    knocked.current = true;
    (async () => {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: decodeURIComponent(key) }),
      }).catch(() => null);
      if (res?.ok) {
        router.replace("/app");
        router.refresh();
        return;
      }
      if (!res) {
        setFailure("Could not reach the server. Check your connection.");
        return;
      }
      if (res.status === 401) {
        setFailure("That link is not active.");
        return;
      }
      // Anything else is a setup problem on our side, not a bad link.
      // Say what it actually was: these messages name a missing or
      // wrong Vercel setting, and none of them contain a secret.
      const body = await res.json().catch(() => null);
      setFailure(body?.error ?? "Something went wrong. Try again.");
    })();
  }, [key, router]);

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      {failure ? (
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {failure}
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-semibold"
          >
            Go to log in &rsaquo;
          </Link>
        </div>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Opening the demo...
        </p>
      )}
    </main>
  );
}
