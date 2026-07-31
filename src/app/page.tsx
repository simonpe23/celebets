import Link from "next/link";
import GoogleButton from "@/components/GoogleButton";

// Short labels only. The owner writes the real copy.
const FEATURES = [
  { title: "Track", body: "Every bet, any app." },
  { title: "Analyze", body: "What pays, what leaks." },
  { title: "Improve", body: "Patterns from your own numbers." },
];

// A small copy of the real app, drawn in code so it stays sharp.
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[260px]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="rounded-[2.25rem] border-[9px] border-neutral-900 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)]">
        <div className="space-y-2.5 p-3.5">
          <div className="rounded-2xl bg-neutral-900 p-3.5 text-white">
            <p className="text-[10px] text-neutral-400">My Wallet</p>
            <p className="mt-0.5 text-[26px] font-bold leading-none tracking-tight">
              $2,657
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-emerald-400">
              Net profit +$1,361
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              ["Today", "+$142", "text-emerald-600"],
              ["Week", "+$318", "text-emerald-600"],
              ["Month", "-$64", "text-red-500"],
              ["Year", "+$1,361", "text-emerald-600"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-xl bg-neutral-100 px-2 py-1.5 text-center"
              >
                <p className="text-[9px] text-neutral-500">{label}</p>
                <p className={`text-[11px] font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white dark:bg-neutral-950 p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">
                Pending
              </span>
              <span className="text-[9px] font-medium text-neutral-400">
                Parlay
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium text-neutral-900">
              ⚽ France advances
            </p>
            <p className="mt-1 text-[11px] font-medium text-neutral-900">
              ⚽ Mbappe 1+ goals
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-1 border-t border-neutral-100 pt-2 text-center">
              {[
                ["Cost", "$100"],
                ["To Win", "$66"],
                ["Collect", "$166"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[8px] text-neutral-400">{label}</p>
                  <p className="text-[10px] font-bold text-neutral-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-white text-neutral-900">
      {/* Soft color wash so the page is not a flat white sheet. */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-sky-100/60 blur-3xl" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-5">
        <header className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">Celebet</span>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold shadow-sm active:bg-neutral-50"
          >
            Log in
          </Link>
        </header>

        <section className="flex flex-1 items-center py-6 lg:py-10">
          <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h1 className="text-[2.75rem] font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Understand
                <br />
                Your Game.
              </h1>
              <p className="mt-4 text-base font-medium text-neutral-500 sm:text-xl">
                Track Every Bet. Discover Patterns. Find Your Edge.
              </p>

              <div className="mt-6 max-w-sm space-y-3">
                <GoogleButton large />
                <Link
                  href="/signup"
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-[#72AFCC] text-base font-bold text-[#F5EDCE] shadow-lg shadow-[#72AFCC]/30 active:bg-[#5B96B3]"
                >
                  Create free account
                </Link>
                <p className="text-center text-xs text-neutral-400">
                  Free. Nothing to install.
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-5">
                {FEATURES.map(({ title, body }) => (
                  <div key={title}>
                    <p className="text-sm font-bold">{title}</p>
                    <p className="mt-1 text-xs leading-snug text-neutral-500">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 lg:mt-0">
              <PhoneMockup />
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-[10px] leading-relaxed text-neutral-400">
          <p>
            Entertainment purposes only. If you or someone you know has a
            gambling problem and wants help, call 1-800 GAMBLER. Adults only.
          </p>
          <p className="mt-1">
            Celebet&trade; is a trademark of Peak Street 6 LLC.
          </p>
        </footer>
      </div>
    </main>
  );
}
