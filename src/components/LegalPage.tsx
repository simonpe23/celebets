import Link from "next/link";
import Wordmark from "@/components/Wordmark";

// The frame the footer pages share (Terms, Privacy, About). One
// column, ordinary reading type, and a way back. Nothing to design
// here: the job is that a person can read it and a reviewer can find
// a clause.
//
// `updated` is optional. A legal page has to say when it last changed,
// because the reader is agreeing to a version. About is not a version
// of anything, and a date on it would only ever look stale.
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-svh px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="inline-block">
          <Wordmark className="text-xl" />
        </Link>

        <h1 className="mt-8 text-2xl font-bold tracking-tight">{title}</h1>
        {updated ? (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Last updated {updated}
          </p>
        ) : null}

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {children}
        </div>

        <p className="mt-12 text-sm">
          <Link href="/" className="font-semibold text-neutral-600 dark:text-neutral-300">
            ‹ Back to Actuals
          </Link>
        </p>
      </div>
    </main>
  );
}

// A heading inside a legal page. Kept here so the two pages cannot
// drift apart.
export function Clause({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-neutral-900 dark:text-white">
        {heading}
      </h2>
      {children}
    </section>
  );
}
