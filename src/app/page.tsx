import Link from "next/link";
import PhoneMock from "@/components/PhoneMock";
import StartTracking from "@/components/StartTracking";
import Wordmark from "@/components/Wordmark";
import { Grain } from "@/components/landing/Atmosphere";
import AuthTriggers from "@/components/landing/AuthTriggers";
import { CheckItem, DotGrid, Eyebrow, TrustRow } from "@/components/landing/Bits";
import InsightChip from "@/components/landing/InsightChip";
import { BookRow, BookTiles } from "@/components/landing/Sportsbooks";

// THE LANDING PAGE, BUILT TO THE OWNER'S MOCKUP. This is v6.
//
// He sent a full page design and asked for it back to the pixel, then
// reviewed v5 against it and sent a list. The v6 corrections, all his:
//   bigger type everywhere      v5 ran a step small across the page,
//                               which he read as weakness, not economy
//   the mockup's own headline   the display face is Inter Tight 800 now
//   taller phones, thin bezels  the band factor came down in PhoneMock
//   no sharp gradient lines     the beams are gone; every glow is a
//                               radial that fades to zero alpha before
//                               any edge, and the hero glow starts at
//                               the very top of the page, behind the
//                               header, so nothing can draw a seam
//   no pill labels              Eyebrow is bare uppercase text
//   squarer floating cards      InsightChip stacks taller
//   centred, bigger features    60px icon tiles, 20px titles
//   the mockup's trusted strip  two-line purple label, logo-scale names
//   a wider, shorter CTA panel
//
// LIGHT IS THE PAGE. Dark mode still works, because the app has a theme
// switch and a visitor may arrive with one set, but every value below
// was chosen for the light version, which is the one he designed.

const FEATURES = [
  {
    title: "Track Every Bet",
    body: "Log bets across all sportsbooks and never lose track.",
  },
  {
    title: "Analyze & Discover",
    body: "Powerful analytics reveal patterns, leaks, and opportunities.",
  },
  {
    title: "Improve Results",
    body: "Use insights to make smarter decisions and protect your bankroll.",
  },
];

const CHECKS = [
  { title: "Paste a bet slip", body: "We'll read it and fill in the details." },
  { title: "Singles and parlays", body: "Track every bet type with ease." },
  { title: "Track key stats", body: "Profit, ROI, hit rate, and more." },
  { title: "Spot patterns", body: "Find what works, what doesn't, and why." },
];

const TRUST = ["Free to start", "No credit card", "Sync in seconds"];

// The three feature marks, in tinted tiles like the mockup's.
function FeatureIcon({ title }: { title: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-8 w-8",
    "aria-hidden": true,
  };
  if (title === "Track Every Bet")
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 8.5h5M8 12h5" />
        <path d="M8 15.6l1.4 1.4L12 14.4" />
      </svg>
    );
  if (title === "Analyze & Discover")
    return (
      <svg {...common}>
        <path d="M4 20V11M10 20V4M16 20v-6.5M22 20H2" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M3 17.5 9 11l4 4 8-8.5" />
      <path d="M15 6.5h6v6" />
    </svg>
  );
}

// The three phones of the hero. Sized rather than transform scaled: a
// transform leaves the original box in the layout, which left 200px of
// dead air above the group on a phone.
function PhoneTrio({ base, priority = false }: { base: number; priority?: boolean }) {
  const outer = Math.round(base * 0.8);
  const overlap = Math.round(base * 0.16);
  const drop = Math.round(base * 0.1);
  return (
    <div className="flex items-end justify-center">
      <PhoneMock
        src="/shots/track-dark.png"
        srcLight="/shots/track-light.png"
        alt="The Track page, showing a tracking balance and the ways to log a bet"
        width={outer}
        angle={14}
        lift={-drop}
        style={{ marginRight: -overlap }}
      />
      <PhoneMock
        src="/shots/performance-dark.png"
        srcLight="/shots/performance-light.png"
        alt="The Performance page, showing profit over time"
        width={base}
        priority={priority}
        className="z-10"
      />
      <PhoneMock
        src="/shots/research-dark.png"
        srcLight="/shots/research-light.png"
        alt="The Research page"
        width={outer}
        angle={-14}
        lift={-drop}
        style={{ marginLeft: -overlap }}
      />
    </div>
  );
}

const DISPLAY = "font-display font-extrabold tracking-[-0.025em]";

// THE CONTAINER IS THE MOCKUP'S, NOT TAILWIND'S. v7's audit found the
// single biggest gap between the mockup and v6 was not any one
// element: the mockup's content spans about 90 percent of a 1440
// screen (roughly 70px margins) while max-w-6xl spans 76 percent
// (176px margins). Every element inside was therefore a step smaller
// and every section had a quarter more empty page around it, which is
// exactly the owner's complaint: too small, too much dead white space,
// less serious. Widening the frame is what makes the rest read at the
// mockup's weight.
const SHELL = "mx-auto w-full max-w-[1300px] px-5 sm:px-10";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden bg-white text-neutral-900 dark:bg-[#04081B] dark:text-white">
      {/* The header and the hero share one wrapper so the glow behind
          them is one unbroken surface. When the glow lived on the hero
          alone it stopped dead at the section's top edge and drew a
          line under the menu, which the owner called out. A radial that
          starts above the viewport and fades to zero alpha cannot draw
          an edge anywhere. */}
      <div className="relative isolate">
        {/* Lighter than v6, on the mockup's evidence: its hero reads as
            a WHITE page with lavender pooling around the phones, while
            v6 tinted the whole top of the page including the corner
            behind the wordmark. The wash now centres on the phone side
            and the far left stays close to paper. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
          style={{
            background:
              "radial-gradient(1000px 700px at 74% -160px, rgba(124,58,237,0.14), rgba(124,58,237,0.05) 50%, rgba(124,58,237,0) 70%), radial-gradient(700px 500px at 10% -260px, rgba(85,37,198,0.04), rgba(85,37,198,0) 68%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
          style={{
            background:
              "radial-gradient(1150px 780px at 70% -140px, rgba(154,87,252,0.20), rgba(154,87,252,0.07) 50%, rgba(154,87,252,0) 72%), radial-gradient(760px 560px at 14% -200px, rgba(85,37,198,0.16), rgba(85,37,198,0) 70%)",
          }}
        />
        <Grain />

        {/* ================= HEADER =================
            No menu. The owner cut Features, How It Works, Pricing and
            About: there is nothing behind any of them, and four dead
            links at the top of a page is the fastest way to look
            unfinished. */}
        <header className={`${SHELL} relative flex items-center justify-between py-5`}>
          <Wordmark className="text-[24px]" />
          <AuthTriggers />
        </header>

        {/* ================= HERO ================= */}
        <section className="relative">
          <div className={`${SHELL} relative`}>
            {/* The column gap and the bottom padding are the owner's:
                "space between know your game and the phones is too
                tight... space between the phone and the trusted by
                block is too tight." */}
            <div className="grid items-center gap-12 pb-14 pt-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:pb-36 lg:pt-8">
              <div className="min-w-0 text-center lg:text-left">
                <Eyebrow>The smarter way to bet</Eyebrow>

                <h1
                  className={`${DISPLAY} mt-5 text-[3.4rem] leading-[0.98] sm:text-[4.3rem] lg:text-[5.2rem] xl:text-[6rem]`}
                >
                  Know
                  <br />
                  Your{" "}
                  <span className="text-brand-top dark:text-brand-mark">
                    Game.
                  </span>
                </h1>

                <p className="mt-7 text-[21px] font-bold leading-[1.3] text-neutral-800 dark:text-neutral-100 sm:text-[26px]">
                  Track every bet. Discover patterns.
                  <br className="hidden sm:block" /> Find your edge.
                </p>

                <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-[18px] lg:mx-0">
                  Actuals is the sports betting companion that helps you track
                  your bets, uncover patterns, and improve your results.
                </p>

                <div className="mt-8 flex justify-center lg:justify-start">
                  <StartTracking label="Start Tracking. It's Free" />
                </div>

                <div className="mt-5 flex justify-center lg:justify-start">
                  <TrustRow items={TRUST} />
                </div>
              </div>

              {/* The cluster runs a step past the content margin on the
                  right, as the mockup's does: its right phone stops
                  about 40px short of the SCREEN edge, not the content
                  edge. That bleed is part of why the mockup's hero
                  feels big. */}
              <div className="relative w-full min-w-0 xl:-mr-24">
                {/* The light pooling behind the phones. A blurred disc,
                    not a beam: it has no edge to catch a container. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-top/[0.09] blur-[90px] dark:bg-brand-mark/[0.18]"
                />
                <div className="sm:hidden">
                  <PhoneTrio base={165} priority />
                </div>
                <div className="hidden sm:block lg:hidden">
                  <PhoneTrio base={225} />
                </div>
                <div className="hidden lg:block xl:hidden">
                  <PhoneTrio base={250} />
                </div>
                <div className="hidden xl:block">
                  <PhoneTrio base={310} priority />
                </div>

                <InsightChip
                  className="absolute -right-2 bottom-16 z-30 hidden w-[230px] xl:block"
                  label="Biggest loss"
                  headline="Basketball 3-legger keeps costing you."
                  value="-$440.00"
                  tone="down"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= THE BOOKS =================
          The strip sits midway between the phones above it and the
          feature row below it, by the owner's ruling. The paddings
          here and the hero's pb were measured to land its centre
          there, so change them as a pair or not at all. */}
      <section className={`${SHELL} pb-12 pt-0`}>
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:gap-14">
          <p className="shrink-0 text-center text-[12px] font-bold uppercase leading-[1.9] tracking-[0.15em] text-brand-top dark:text-brand-mark sm:text-left">
            Trusted by bettors
            <br className="hidden sm:block" /> from 30+ sportsbooks
          </p>
          <BookRow />
        </div>
      </section>

      {/* ================= THREE FEATURES ================= */}
      <section className={`${SHELL} border-t border-neutral-900/[0.07] py-16 dark:border-white/[0.07]`}>
        {/* THE ROW IS ONE OBJECT AND IT IS CENTRED ON THE PAGE.
            The owner, twice: "if the entire row was a clock, in my
            mockup it's centered", then "why gap to the right? why track
            every bet all the way to the left?"

            Measured, he was right both times, and my earlier answer had
            been solving the wrong problem. Every other section on this
            page runs its ink from 176 to 1264. The feature row ran 176
            to 1248, because the third block's sentence is shorter than
            the first's, so its last line stopped short. Left edge
            touching, right edge not: the definition of left-shifted.
            Worse, the two sections holding phones run out to about 1300,
            so scrolling past, the feature row looked narrower than its
            neighbours and pinned to the left.

            The cure: the row sits in its own centred band, inset from
            the page margin on BOTH sides, with each block centred in
            its column. So the first icon is no longer flush against the
            page's left edge and the right hand gap has a matching left
            hand one.

            THE TWO WIDTHS BELOW ARE MEASURED, NOT CHOSEN. Every
            combination of row width and block width was rendered and
            the ink either side of the row measured; the pair below is
            the one that lands the two gaps equal at v7's wider frame
            and type. If the copy in FEATURES changes, re-run sweep.mjs
            rather than nudging by eye: the balance depends on where
            the third sentence breaks. */}
        <div className="mx-auto grid max-w-[1100px] gap-12 sm:grid-cols-3 sm:gap-8">
          {FEATURES.map(({ title, body }) => (
            <div key={title} className="mx-auto flex w-full max-w-[350px] gap-4">
              <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-2xl bg-brand-top/[0.08] text-brand-top dark:bg-brand-mark/[0.14] dark:text-brand-mark">
                <FeatureIcon title={title} />
              </span>
              <div className="min-w-0">
                <span className="block text-[21px] font-bold leading-snug">
                  {title}
                </span>
                <p className="mt-2 text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= POWERFUL ANALYTICS ================= */}
      <section className={`${SHELL} border-t border-neutral-900/[0.07] py-16 dark:border-white/[0.07] sm:py-20`}>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Powerful Analytics</Eyebrow>
            <h2
              className={`${DISPLAY} mt-5 text-[2.8rem] leading-[1] sm:text-[4.1rem]`}
            >
              See What
              <br />
              Others{" "}
              <span className="text-brand-top dark:text-brand-mark">Miss.</span>
            </h2>
            <p className="mt-5 max-w-[500px] text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-[18px]">
              Turn your betting history into actionable insights and make better
              decisions.
            </p>

            <ul className="mt-10 space-y-7">
              {CHECKS.map((c) => (
                <CheckItem key={c.title} {...c} />
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center">
            <DotGrid className="-left-2 top-2 hidden h-[190px] w-[160px] sm:block" />
            {/* The purple shadow behind the phone, from the mockup. The
                owner: "copy that but without creating sharp lines." A
                blurred disc again, for the same reason as the hero's. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-top/[0.14] blur-[110px] dark:bg-brand-mark/20"
            />
            <div className="relative sm:hidden">
              <PhoneMock
                src="/shots/performance-dark.png"
                srcLight="/shots/performance-light.png"
                alt="Profit over time, with staked, returned and ROI"
                width={272}
              />
            </div>
            <div className="relative hidden sm:block">
              <PhoneMock
                src="/shots/performance-dark.png"
                srcLight="/shots/performance-light.png"
                alt="Profit over time, with staked, returned and ROI"
                width={344}
              />
            </div>
            <InsightChip
              className="absolute -right-4 bottom-28 z-30 hidden w-[230px] lg:block"
              label="Trending"
              headline="3 weeks in a row of better results."
              value="+$2,119"
            />
          </div>
        </div>
      </section>

      {/* ================= COMING SOON =================
          Labelled, because the Connect tile in the app does nothing
          yet. A promise marked as a promise is fine. */}
      <section className={`${SHELL} border-t border-neutral-900/[0.07] py-16 dark:border-white/[0.07]`}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow tone="soon">Coming soon</Eyebrow>
            <h2
              className={`${DISPLAY} mt-5 text-[2.2rem] leading-[1.08] sm:text-[3rem]`}
            >
              Sync from 30+ sportsbooks and daily fantasy sites.
            </h2>
            <p className="mt-5 max-w-[500px] text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-[18px]">
              Connect your accounts and your bets arrive on their own. Until
              then, paste a bet slip or add one by hand in a few seconds.
            </p>
          </div>

          <div className="flex flex-col items-center gap-5">
            <BookTiles />
            <p className="text-[15px] font-semibold text-neutral-500 dark:text-neutral-400">
              More coming soon
            </p>
          </div>
        </div>
      </section>

      {/* ================= THE CLOSE ================= */}
      <section className={`${SHELL} pb-16 pt-2`}>
        {/* Wider and shorter than v5, by the owner's ruling: "less
            height, more width." The right column shrank and the
            vertical padding came down, so the panel reads as a wide
            band rather than a tall block. */}
        <div className="relative overflow-hidden rounded-[28px] border border-brand-top/10 bg-gradient-to-br from-cta-1 via-cta-2 to-cta-3 px-7 py-11 dark:border-white/[0.08] dark:from-cta-dark-1 dark:via-cta-dark-2 dark:to-cta-dark-3 sm:px-16 sm:py-12 lg:px-24">
          <Grain />
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.5fr)]">
            <div className="text-center lg:text-left">
              <h2
                className={`${DISPLAY} text-[2.5rem] leading-[1.02] sm:text-[3.25rem]`}
              >
                Ready to Get an{" "}
                <span className="text-brand-top dark:text-brand-mark">
                  Edge?
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-[17px] lg:mx-0">
                Join thousands of bettors who track smarter, win more, and
                protect their bankroll.
              </p>
              <div className="mt-7 flex justify-center lg:justify-start">
                <StartTracking label="Start Tracking. It's Free" />
              </div>
              <div className="mt-5 flex justify-center lg:justify-start">
                <TrustRow items={TRUST} />
              </div>
            </div>

            {/* The angled phone, bleeding out of the panel's lower right
                exactly as in the mockup. Hidden below lg, where there is
                no room for it to bleed into. */}
            <div className="relative hidden h-[300px] lg:block">
              <div className="absolute -bottom-[84px] -right-10 rotate-[9deg]">
                <PhoneMock
                  src="/shots/performance-dark.png"
                  srcLight="/shots/performance-light.png"
                  alt="Profit over time"
                  width={232}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className={`${SHELL} border-t border-neutral-900/[0.07] pb-10 pt-10 dark:border-white/[0.07]`}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Wordmark className="text-[24px]" />

          <nav className="flex items-center gap-8 text-[16px] font-semibold text-neutral-500 dark:text-neutral-400">
            <Link href="/terms" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
              Privacy
            </Link>
          </nav>

          <a
            href="https://instagram.com/gocelebet"
            target="_blank"
            rel="noreferrer"
            aria-label="Actuals on Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-900/[0.05] hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>

        <div className="mt-9 space-y-2 border-t border-neutral-900/[0.07] pt-6 text-center text-[13px] leading-relaxed text-neutral-500 dark:border-white/[0.07] dark:text-neutral-400">
          <p>
            This platform is meant for entertainment purposes only. If you or
            someone you know has a gambling problem and wants help, call 1-800
            GAMBLER. Actuals is intended for adult use only.
          </p>
          <p>Actuals is a part of Peak Street 6 LLC.</p>
        </div>
      </footer>
    </main>
  );
}
