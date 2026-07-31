import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";
import Disclaimer from "@/components/Disclaimer";

const FEATURES = [
  {
    title: "Track",
    body: "Log every bet you place, on any app. Stake, payout, picks, and the exact amount when you cash out early. Your wallet and profit update themselves.",
  },
  {
    title: "Analyze",
    body: "See profit and record per sport, singles against parlays, favorites against long shots, and which kinds of picks actually pay. Filter by any period you like.",
  },
  {
    title: "Improve",
    body: "Read plain observations pulled from your own history, like how your singles compare to your parlays. No tipsters, no guesswork, just your numbers.",
  },
];

// A small copy of the real app, drawn in code so it stays sharp.
function PhoneMockup() {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2.5rem] border-[10px] border-neutral-900 bg-white shadow-2xl">
      <div className="space-y-3 p-4">
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-[11px] text-neutral-500">My Wallet</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight text-neutral-900">
            $2,657.39
          </p>
          <p className="mt-0.5 text-xs font-semibold text-emerald-600">
            Net profit +$1,361.39
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["Today", "+$142.03", "text-emerald-600"],
            ["This week", "+$318.50", "text-emerald-600"],
            ["This month", "-$64.00", "text-red-600"],
            ["This year", "+$1,361.39", "text-emerald-600"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 p-2 text-center"
            >
              <p className="text-[10px] text-neutral-500">{label}</p>
              <p className={`mt-0.5 text-[11px] font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              Pending
            </span>
            <span className="text-[10px] font-medium text-neutral-500">
              Parlay, 2 legs
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-neutral-900">
            ⚽ France advances
          </p>
          <p className="mt-1 text-[11px] font-medium text-neutral-900">
            ⚽ Mbappe 1+ goals
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1 border-t border-neutral-100 pt-2 text-center">
            {[
              ["Cost", "$100.00"],
              ["To Win", "$66.00"],
              ["To Collect", "$166.00"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[9px] text-neutral-500">{label}</p>
                <p className="mt-0.5 text-[10px] font-bold text-neutral-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-6">
        <header className="flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Celebet</span>
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-600"
          >
            Log in
          </Link>
        </header>

        <section className="mt-12 grid items-center gap-12 sm:mt-20 sm:grid-cols-2 sm:gap-8">
          <div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Understand
              <br />
              Your Game.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-600">
              Track Every Bet. Discover Patterns. Find Your Edge.
            </p>

            <div className="mt-8 space-y-3 sm:max-w-sm">
              <GoogleButton large />
              <Link
                href="/signup"
                className="flex h-14 w-full items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
              >
                Create free account
              </Link>
              <p className="text-center text-xs text-neutral-500">
                Free. Works in your browser, nothing to install.
              </p>
            </div>
          </div>

          <div className="order-first sm:order-last">
            <PhoneMockup />
          </div>
        </section>

        <section className="mt-20 grid gap-10 sm:mt-28 sm:grid-cols-3 sm:gap-8">
          {FEATURES.map(({ title, body }) => (
            <div key={title}>
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              <p className="mt-2 leading-relaxed text-neutral-600">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-3xl bg-neutral-50 px-6 py-12 text-center sm:mt-28">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Know where you really stand.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-600">
            Your betting apps show a balance. Celebet shows the whole
            picture, across all of them.
          </p>
          <div className="mx-auto mt-8 max-w-sm space-y-3">
            <GoogleButton large />
            <Link
              href="/signup"
              className="flex h-14 w-full items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white active:bg-emerald-700"
            >
              Create free account
            </Link>
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
