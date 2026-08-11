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
  { title: "Track", body: "Every bet, any app." },
  { title: "Analyze", body: "What pays, what leaks." },
  { title: "Improve", body: "Patterns from your own numbers." },
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

// Track, Analyze, Improve. One mark each, in the lifted brand purple,
// because these three ARE the product and the hero has to say so in the
// first two seconds.
//
// The four generic labels that used to sit here are gone. One of them,
// "Powerful Analytics", wrapped onto two lines and the owner asked for
// it in one; the honest fix was not a narrower column but noticing that
// Track All Bets, Powerful Analytics, Find Patterns and Improve Results
// say nothing that Track, Analyze and Improve do not say better.
// "Powerful Analytics" survives as the eyebrow further down the page,
// where it introduces the section it names.
function PillarIcon({ title }: { title: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
    "aria-hidden": true,
  };
  if (title === "Track")
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8.5 9h7M8.5 13h7M8.5 17h4" />
      </svg>
    );
  if (title === "Analyze")
    return (
      <svg {...common}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M3 16l5-6 4 4 4-7 5 5" />
      <circle cx="8" cy="10" r="1.4" />
      <circle cx="16" cy="7" r="1.4" />
    </svg>
  );
}

const DISPLAY = "font-display font-extrabold tracking-[-0.03em]";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-land-page text-neutral-900 dark:bg-[#04081B] dark:text-white">
      {/* ================= ONE. THE HERO =================
          CENTRED, NOT SPLIT. The owner on the split version: "it's the
          same template and design... composition and page is utterly
          ugly", plus the centre phone was cut off at the top.

          Both had one cause. A two column hero gives the phones half a
          screen, so they were squeezed, lifted out of their own section
          to fit, and crowded by the text beside them. Centring the
          words and putting the phones underneath at full size gives
          them the whole width, which is the only thing that was ever
          going to fix the cramping.

          The section that used to sit below this one, three cards
          repeating Track, Analyze and Improve, is gone. The owner:
          "hideous. it's not needed." Those three are now symbols in the
          hero, where they tell a stranger what this is before they
          scroll at all. */}
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

          <div className="flex flex-col items-center pt-16 text-center sm:pt-20 lg:pt-24">
            <h1
              className={`${DISPLAY} text-[3.25rem] leading-[0.88] text-white sm:text-[4.75rem] lg:text-[6rem]`}
            >
              Know Your{" "}
              {/* One gradient word, so the headline has a place for the
                  eye to land. The brand colour earns its keep here
                  because nothing on this band is a control. */}
              <span className="bg-gradient-to-r from-brand-lift via-brand-glow to-brand-top bg-clip-text text-transparent">
                Game.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg font-semibold leading-snug text-white/75 sm:text-xl">
              Track Every Bet. Discover Patterns. Find Your Edge.
            </p>

            {/* Small, centred, and under the promise rather than above
                it. As a three line block in its own section it was, in
                the owner's words, "an ugly block of text no one wants
                to read". It is the sentence you read second. */}
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/45 sm:text-[15px]">
              Celebet is the sports betting companion that helps you track your
              bets, uncover patterns, and improve your results.
            </p>

            <div className="mt-9 flex w-full justify-center">
              <StartTracking onDark />
            </div>

            {/* The three pillars, in one row on every size above a
                phone. No wrapping: each title is one word. */}
            <ul className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3 sm:gap-6">
              {PILLARS.map(({ title, body }) => (
                <li key={title} className="flex flex-col items-center gap-3">
                  <span className="text-brand-glow">
                    <PillarIcon title={title} />
                  </span>
                  <span className="text-base font-bold text-white">{title}</span>
                  <span className="-mt-1.5 text-sm text-white/55">{body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* THE PHONES, FULL WIDTH AND UNDERNEATH.
            They keep their own row so nothing crops them. The old
            version lifted the centre phone 26px to stagger it, which
            pushed it straight out through the top of the section: the
            owner sent a screenshot of it sliced off. The stagger is
            done by dropping the OUTER two now, never by raising the
            middle one, so the tallest thing in the group always sits
            inside its own box. */}
        {/* pb, not a bleed. Running the phones off the bottom edge only
            works when the cut lands somewhere meaningless; here it
            sliced the left phone through the middle of a card and read
            as a mistake rather than as a crop. */}
        <div className="relative mx-auto mt-16 w-full max-w-6xl px-5 pb-20 sm:mt-20 sm:px-8 sm:pb-24">
          <div className="relative flex justify-center">
            <div className="flex origin-bottom scale-[0.66] items-end justify-center sm:scale-90 lg:scale-100">
              <PhoneMock
                src="/shots/track-dark.png"
                alt="The Track page, showing a tracking balance and the ways to log a bet"
                width={218}
                angle={20}
                lift={-34}
                className="-mr-10 opacity-85"
              />
              <PhoneMock
                src="/shots/performance-dark.png"
                alt="The Performance page, showing profit over time"
                width={276}
                glow
                priority
                className="z-10"
              />
              <PhoneMock
                src="/shots/research-dark.png"
                alt="The Research page"
                width={218}
                angle={-20}
                lift={-34}
                className="-ml-10 opacity-85"
              />
            </div>

            <InsightChip
              className="absolute bottom-16 left-0 z-20 hidden w-[225px] xl:block"
              label="Biggest strength"
              headline="Football is your best sport this month."
              value="+$757.00"
            />
            <InsightChip
              className="absolute bottom-16 right-0 z-20 hidden w-[225px] xl:block"
              label="Biggest leak"
              headline="Basketball player props keep costing you."
              value="-$440.00"
              tone="down"
            />
          </div>
        </div>
      </StadiumBand>

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
