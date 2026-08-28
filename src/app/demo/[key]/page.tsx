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
  const [failed, setFailed] = useState(false);
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
      } else {
        setFailed(true);
      }
    })();
  }, [key, router]);

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      {failed ? (
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            That link is not active.
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
