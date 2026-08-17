import LegalPage, { Clause } from "@/components/LegalPage";

export const metadata = {
  title: "About | Actuals",
  description: "Why Actuals exists, what it does, and what it is not.",
};

// THE ABOUT PAGE. Third link in the landing page footer, beside Terms
// and Privacy.
//
// It shares the LegalPage frame on purpose. The three footer pages are
// one shelf, and a bespoke About page would read as a second landing
// page written by somebody else.
//
// Every claim is one the app can back:
//   - three areas, named as the tab bar names them (Track, Performance,
//     Research)
//   - insights come from the user's own record, not from a tipster
//   - no money moves through the product, which is the same sentence
//     the Terms open with
//   - Research is honestly described as unfinished, because the app
//     itself shows Soon badges there
// Nothing here promises a feature with a date. The moment account
// connecting ships, this page changes with it.
export default function AboutPage() {
  return (
    <LegalPage title="About Actuals">
      <p>
        Actuals is a betting record that tells you the truth. You log what you
        bet, and it shows you what that betting has actually done, in numbers
        you can check.
      </p>

      <Clause heading="Why it exists">
        <p>
          Sportsbooks show you a balance. A balance is not a record. It cannot
          tell you which sport pays you, which bet type quietly drains you, or
          whether last month was skill or luck, because it was never built to.
        </p>
        <p>
          Most bettors have a rough idea of how they are doing, and the rough
          idea is usually kinder than the arithmetic. Actuals does the
          arithmetic. It was built for people who would rather know.
        </p>
      </Clause>

      <Clause heading="What it does">
        <p>
          <strong>Track.</strong> Log a bet in seconds. Paste a bet slip or
          upload a screenshot and it is read for you, then you check it and save
          it. Singles and parlays, any sportsbook, all in one place.
        </p>
        <p>
          <strong>Performance.</strong> Profit over time, ROI, hit rate, your
          record by sport, by odds range, singles against parlays. Alongside the
          charts are insights: things Actuals noticed in your own record and
          brought to you, such as which odds range you win in or where your
          losses are concentrated.
        </p>
        <p>
          <strong>Research.</strong> The part you use before a bet rather than
          after one. It is still being built, and the app says so instead of
          pretending otherwise.
        </p>
      </Clause>

      <Clause heading="What it is not">
        <p>
          Actuals is not a sportsbook. It does not accept bets, place bets or
          settle them, and no real money passes through it. The balance in the
          app is a number you typed so the app can do the sums.
        </p>
        <p>
          It does not sell tips, picks or predictions, and it never will. Every
          insight looks backwards at bets you already placed. Your record cannot
          tell you what happens tonight.
        </p>
        <p>
          There are no adverts in it, and your record is not for sale. The{" "}
          <a
            href="/privacy"
            className="font-semibold text-neutral-900 underline dark:text-white"
          >
            Privacy Policy
          </a>{" "}
          sets out exactly what is stored and who handles it.
        </p>
      </Clause>

      <Clause heading="Who builds it">
        <p>
          Actuals is made by Peak Street 6 LLC, a small team, and it is early. If
          something is wrong, missing or annoying, we would rather hear it than
          not. Find us on Instagram at{" "}
          <a
            href="https://instagram.com/actualshq"
            className="font-semibold text-neutral-900 underline dark:text-white"
          >
            @actualshq
          </a>
          .
        </p>
      </Clause>

      <Clause heading="One honest note">
        <p>
          Actuals is for entertainment, and a clearer view of your betting is
          not a strategy for winning at it. Seeing your real numbers can be
          uncomfortable, and that is rather the point. If betting has stopped
          being entertainment, call 1-800-GAMBLER. It is free, confidential and
          open 24 hours a day.
        </p>
      </Clause>
    </LegalPage>
  );
}
