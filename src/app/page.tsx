import Link from "next/link";
import MicroLabel from "@/components/MicroLabel";
import PhoneMock from "@/components/PhoneMock";
import StartTracking from "@/components/StartTracking";
import Wordmark from "@/components/Wordmark";
import { Beams, Grain, StadiumBand } from "@/components/landing/Atmosphere";
import InsightChip from "@/components/landing/InsightChip";

// THE LANDING PAGE, REBUILT. Copy is the owner's, word for word.
//
// The first version was a wireframe and he said so: "overall ugly.
// sparse. no feeling. no emotion... the big white blocks are beyond
// ugly." Four things were actually wrong, and each one is fixed here:
//
// 1. NO LIGHT. Flat fills cast no shadow and catch no edge, so nothing
//    on the page had any depth. There are floodlight beams, a grain
//    layer and gradient scrims now. See Atmosphere.tsx.
// 2. ONE TYPEFACE. Geist Bold at 60px is still Geist. Headlines are
//    Archivo 800 through font-display, landing page only.
// 3. NOTHING TO LOOK AT. The insight cards floating beside the phone
//    are the product's own card at a size a stranger can read.
// 4. WHITE BLOCKS. Every light surface is a tinted gradient with a
//    hairline, never #FFFFFF on #F7F7FB.
//
// THE PAGE IS DARK AT BOTH ENDS IN BOTH THEMES, on purpose. A landing
// page is a poster, not a tool: it does not owe the reader their theme
// preference, and the hero is the one place the product gets to look
// like an evening game. The middle is the part that follows the theme.

const PILLARS = [
  {
    title: "Track",
    body: "Every bet, any app.",
    detail: "Paste a slip, upload a screenshot, or type it in a few seconds.",
  },
  {
    title: "Analyze",
    body: "What pays, what leaks.",
    detail: "Profit and ROI by sport, by odds, by singles against parlays.",
  },
  {
    title: "Improve",
    body: "Patterns from your own numbers.",
    detail: "Your strongest sport and your worst habit, found for you.",
  },
];

const TRUTHS = [
  {
    title: "Paste a bet slip",
    body: "Celebet reads the screenshot and fills the form in. Check it and it is tracked.",
  },
  {
    title: "Singles and parlays",
    body: "Nine sports, with every leg counted where it belongs.",
  },
  {
    title: "Numbers that keep up",
    body: "Profit, ROI, hit rate and your best and worst sports, updated as bets settle.",
  },
];

// The four key features. Line marks, ink weight, because a coloured
// icon set on a landing page competes with the one button that matters.
function KeyIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[22px] w-[22px]",
    "aria-hidden": true,
  };
  if (name === "Track All Bets")
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
      </svg>
    );
  if (name === "Powerful Analytics")
    return (
      <svg {...common}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    );
  if (name === "Find Patterns")
    return (
      <svg {...common}>
        <path d="M3 16l5-6 4 4 4-7 5 5" />
        <circle cx="8" cy="10" r="1.4" />
        <circle cx="16" cy="7" r="1.4" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 20V7M12 7l-5 5M12 7l5 5" />
      <path d="M4 4h16" />
    </svg>
  );
}

const KEYS = [
  "Track All Bets",
  "Powerful Analytics",
  "Find Patterns",
  "Improve Results",
];

const DISPLAY = "font-display font-extrabold tracking-[-0.03em]";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-land-page text-neutral-900 dark:bg-[#04081B] dark:text-white">
      {/* ================= ONE. THE HERO ================= */}
      <StadiumBand>
        <Beams />

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
          <header className="flex items-center justify-between">
            <Wordmark className="text-xl" onDark />
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
            >
              Log in
            </Link>
          </header>

          <div className="grid items-center gap-12 pt-14 pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-6 lg:pt-20 lg:pb-28">
            <div className="min-w-0 text-white">
              <h1
                className={`${DISPLAY} text-[3.5rem] leading-[0.88] sm:text-[4.5rem] lg:text-[5.25rem]`}
              >
                Know Your
                <br />
                {/* One gradient word. The headline needs a place for the
                    eye to land, and the brand colour earns its keep here
                    because nothing on this band is a control. */}
                <span className="bg-gradient-to-r from-brand-lift via-brand-glow to-brand-top bg-clip-text text-transparent">
                  Game.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg font-semibold leading-snug text-white/70 sm:text-xl">
                Track Every Bet. Discover Patterns. Find Your Edge.
              </p>

              <div className="mt-9">
                <StartTracking onDark />
              </div>

              <ul className="mt-11 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4 lg:gap-x-4">
                {KEYS.map((name) => (
                  <li key={name} className="flex flex-col gap-2.5">
                    <span className="text-brand-glow">
                      <KeyIcon name={name} />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-white/85">
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The phones, with two of the app's own insight cards
                floating off them. The cards are the reason to look:
                they say what the product is for at a size you can
                actually read. Hidden below lg, where they would land on
                top of the phones. */}
            {/* min-w-0 is load bearing. A grid column's minimum width
                is auto, meaning "as wide as my contents", and the phone
                cluster is 439px intrinsically. Without this the column
                grew to fit it, the grid grew with the column, and the
                headline in the OTHER column ran off the screen. The
                page's overflow-x-hidden then clipped the evidence, so
                measuring document scrollWidth said everything was fine
                while the sub headline read "Find You". */}
            <div className="relative w-full min-w-0">
              <div className="w-full overflow-hidden">
                <div className="flex origin-center scale-[0.72] items-center justify-center sm:scale-90 lg:scale-[0.92] lg:justify-end xl:scale-100">
                  <PhoneMock
                    src="/shots/track-dark.png"
                    alt="The Track page, showing a tracking balance and the ways to log a bet"
                    width={175}
                    angle={22}
                    lift={-16}
                    className="-mr-8 opacity-85"
                  />
                  <PhoneMock
                    src="/shots/performance-dark.png"
                    alt="The Performance page, showing profit over time"
                    width={232}
                    lift={26}
                    glow
                    priority
                    className="z-10"
                  />
                  <PhoneMock
                    src="/shots/research-dark.png"
                    alt="The Research page"
                    width={175}
                    angle={-22}
                    lift={-16}
                    className="-ml-8 opacity-85"
                  />
                </div>
              </div>

              {/* ONE card, not two. Two of them in this space covered
                  the phones they were pointing at, which is the whole
                  failure mode of a floating callout. It sits low and
                  left, over the dimmed outer phone, so the centre
                  screen stays completely readable. */}
              <InsightChip
                className="absolute -left-4 bottom-2 hidden w-[220px] lg:block"
                label="Biggest strength"
                headline="Football is your best sport this month."
                value="+$757.00"
              />
            </div>
          </div>
        </div>
      </StadiumBand>

      {/* ================= TWO. WHAT IT IS =================
          The tone the owner asked for. Light mode is a tinted gradient
          with a hairline, never white on off-white, which is what made
          the first version read as blank blocks. */}
      <section className="relative border-y border-neutral-900/[0.07] bg-gradient-to-b from-white to-land-tint dark:border-white/[0.07] dark:from-land-deep dark:to-[#04081B]">
        <div className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p
            className={`${DISPLAY} max-w-3xl text-[1.75rem] leading-[1.15] sm:text-[2.5rem]`}
          >
            Celebet is the sports betting companion that helps you track your
            bets, uncover patterns, and improve your results.
          </p>

          <div className="mt-14 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {PILLARS.map(({ title, body, detail }, i) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-900/[0.08] bg-white p-6 shadow-[0_16px_40px_-28px_rgba(16,19,34,0.55)] dark:border-white/[0.08] dark:bg-white/[0.035]"
              >
                {/* A brand glow in the corner, fading out. One per card,
                    strongest on the first, so the row has a direction
                    rather than being three identical boxes. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-top/10 blur-2xl dark:bg-brand-mark/20"
                  style={{ opacity: 1 - i * 0.25 }}
                />
                <p className="relative font-money text-[13px] font-semibold tabular-nums text-neutral-400 dark:text-white/35">
                  0{i + 1}
                </p>
                <p className={`relative mt-4 text-2xl ${DISPLAY}`}>{title}</p>
                <p className="relative mt-2 text-sm font-semibold text-neutral-700 dark:text-white/80">
                  {body}
                </p>
                <p className="relative mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THREE. THE PROOF ================= */}
      <section className="relative overflow-hidden bg-land-page dark:bg-[#04081B]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-1/4 h-[420px] w-[520px] rounded-[50%] bg-brand-top/[0.06] blur-3xl dark:bg-brand-mark/[0.13]"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="inline-block rounded-full border border-brand-top/20 bg-brand-top/[0.07] px-3 py-1 dark:border-brand-mark/25 dark:bg-brand-mark/10">
                <MicroLabel className="!text-brand-top dark:!text-brand-mark">
                  Powerful Analytics
                </MicroLabel>
              </span>
              <h2
                className={`${DISPLAY} mt-5 text-[2.5rem] leading-[0.95] sm:text-[3.5rem]`}
              >
                See What
                <br />
                Others Miss.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
                Celebet turns your betting history into actionable insights so
                you can make smarter decisions and protect your bankroll.
              </p>

              <dl className="mt-10 space-y-px overflow-hidden rounded-2xl border border-neutral-900/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.035]">
                {TRUTHS.map(({ title, body }) => (
                  <div
                    key={title}
                    className="border-b border-neutral-900/[0.06] p-5 last:border-b-0 dark:border-white/[0.06]"
                  >
                    <dt className="text-sm font-bold">{title}</dt>
                    <dd className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <PhoneMock
                src="/shots/performance-light.png"
                alt="Profit over time, with staked, returned and ROI"
                width={268}
                angle={-10}
                chrome="#F7F7FB"
                onDark={false}
                className="dark:hidden"
              />
              <PhoneMock
                src="/shots/performance-dark.png"
                alt="Profit over time, with staked, returned and ROI"
                width={268}
                angle={-10}
                glow
                className="hidden dark:block"
              />
              <InsightChip
                className="absolute -left-6 bottom-10 hidden dark:hidden sm:block"
                onDark={false}
                label="Trending"
                headline="Three weeks in a row of better results."
                value="+$2,119"
              />
              <InsightChip
                className="absolute -left-6 bottom-10 hidden dark:sm:block"
                label="Trending"
                headline="Three weeks in a row of better results."
                value="+$2,119"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOUR. COMING SOON =================
          Kept at the owner's request and labelled, because the Connect
          tile in the app does nothing yet. A promise marked as a promise
          is fine. The same sentence unlabelled would be a lie. */}
      <section className="relative mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-900/[0.08] bg-gradient-to-br from-white via-white to-land-lilac px-6 py-12 text-center dark:border-white/[0.08] dark:from-[#0E1228] dark:via-[#0C1125] dark:to-land-plum sm:px-12 sm:py-16">
          <Grain opacity={0.05} />
          <div className="relative">
            <span className="inline-block rounded-full bg-[#22C55E]/15 px-3 py-1">
              <MicroLabel className="!text-[#22C55E]">Coming soon</MicroLabel>
            </span>
            <p
              className={`${DISPLAY} mx-auto mt-6 max-w-2xl text-[1.75rem] leading-[1.05] sm:text-[2.75rem]`}
            >
              Sync from 30+ sportsbooks and daily fantasy sites.
            </p>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
              Connect your accounts and your bets arrive on their own. Until
              then, paste a bet slip or add one by hand in a few seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FIVE. THE CLOSE ================= */}
      <StadiumBand>
        <Beams className="opacity-70" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
          <h2
            className={`${DISPLAY} text-[2.75rem] leading-[0.92] text-white sm:text-[4rem]`}
          >
            Know Your{" "}
            <span className="bg-gradient-to-r from-brand-lift to-brand-glow bg-clip-text text-transparent">
              Game.
            </span>
          </h2>
          <p className="mt-5 max-w-md text-base font-semibold text-white/65 sm:text-lg">
            Track Every Bet. Discover Patterns. Find Your Edge.
          </p>
          <div className="mt-9 flex w-full justify-center">
            <StartTracking onDark />
          </div>
        </div>
      </StadiumBand>

      <footer className="bg-[#04081B] px-5 pb-10 pt-12 text-white sm:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col items-center gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:justify-between">
            <Wordmark className="text-base" onDark />
            <nav className="flex items-center gap-7 text-sm font-semibold text-white/60">
              <Link href="/terms" className="transition-colors hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-white">
                Privacy
              </Link>
              <a
                href="https://instagram.com/gocelebet"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                @gocelebet
              </a>
            </nav>
          </div>

          <div className="mt-8 space-y-2 text-center text-xs leading-relaxed text-white/40">
            <p>
              This platform is meant for entertainment purposes only. If you or
              someone you know has a gambling problem and wants help, call 1-800
              GAMBLER. Celebet is intended for adult use only.
            </p>
            <p>Celebet&trade; is a trademark of Peak Street 6 LLC.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
