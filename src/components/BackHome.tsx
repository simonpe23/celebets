import Link from "next/link";

// THE WAY BACK TO THE LANDING PAGE, for the logged-out pages.
//
// Asked for by the owner on /login. It belongs on every page a visitor
// can land on before they have an account, so it sits on login, signup,
// forgot password and reset password rather than only the one he named:
// a way out that exists on one of four doors is a trap on the other
// three.
//
// INK WITH A CHEVRON, NOT PURPLE. The colour rule is that purple means
// the thing you press to get on with why you came, and on these pages
// that is Log in or Sign up. A second purple control beside it would
// compete with the one that matters. This is the quiet exit.
//
// It is positioned rather than placed in the flow because these pages
// centre their card vertically; dropping a link into that column would
// shift the card off centre.
export default function BackHome() {
  return (
    <Link
      href="/"
      className="absolute left-3 top-3 flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-900/[0.04] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white sm:left-5 sm:top-5"
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12.5 4.5 7 10l5.5 5.5" />
      </svg>
      Home
    </Link>
  );
}
