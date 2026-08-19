import Link from "next/link";

// THE PRIMARY DOOR ON THE LANDING PAGE. One button, no email field, no
// Google button next to it (the owner's ruling, August 2026: "remove
// email field... remove Google button from landing page"). Everything
// else happens on the one auth page behind it, where a six-digit
// emailed code replaces passwords entirely.
//
// It links to /login?new=1, which is the same page the Log in door
// opens: only the greeting differs ("Create your account" here,
// "Welcome back" there). This used to be an email field that carried
// the address to /signup; that page no longer exists.
export default function StartTracking({
  label = "Start Tracking",
}: {
  label?: string;
}) {
  return (
    <Link
      href="/login?new=1"
      className="inline-flex h-[54px] w-full max-w-md items-center justify-center rounded-xl bg-gradient-to-b from-brand-top to-brand-bottom px-8 text-base font-bold text-white shadow-lg shadow-brand-top/25 active:from-brand-bottom active:to-brand-press sm:h-[52px] sm:w-auto"
    >
      {label}
    </Link>
  );
}
