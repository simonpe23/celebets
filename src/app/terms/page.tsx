import LegalPage, { Clause } from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Use | Actuals",
  description: "The agreement between you and Actuals.",
};

// A FIRST DRAFT FOR THE OWNER TO REVIEW. Not legal advice.
//
// The load-bearing clauses for this particular product, and why:
//   - Actuals takes no bets and holds no money. Say it first and say it
//     plainly, because the whole category invites the opposite
//     assumption and that assumption is the one that creates liability.
//   - The numbers are computed from what the user typed. If they typed
//     it wrong, the number is wrong. That has to be stated before
//     anyone leans on a figure.
//   - Nothing here is betting advice. Insights describe the past.
//   - Adults only, and gambling help is signposted rather than buried.
//
// Deliberately absent: arbitration, class action waiver, choice of law,
// and a limitation of liability with a dollar cap. Those are real
// decisions with money attached and they need a lawyer, not a draft.
// The owner is told this in the note at the foot of the page.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="11 August 2026">
      <p>
        These terms are the agreement between you and Peak Street 6 LLC for the
        use of Actuals. By creating an account you accept them. They are written
        to be read, not to be survived.
      </p>

      <Clause heading="What Actuals is">
        <p>
          Actuals is a record keeping and analysis tool for bets you place
          somewhere else. It is a notebook that can do arithmetic.
        </p>
      </Clause>

      <Clause heading="What Actuals is not">
        <p>
          Actuals is not a sportsbook, a betting exchange, or a broker. It does
          not accept bets, place bets, settle bets, or hold, transfer or process
          money of any kind. No real money moves through this product. Balances
          shown in the app are numbers you have typed, kept so the app can do
          the sums.
        </p>
        <p>
          Actuals does not give betting advice, tips, picks or predictions.
          Insights describe what has already happened in your own record. Past
          results tell you nothing reliable about a future event.
        </p>
      </Clause>

      <Clause heading="Your account">
        <p>
          You must be at least 18, and old enough to bet legally where you live.
          One account per person. Keep your password to yourself: anything done
          through your account is treated as done by you.
        </p>
        <p>
          You are responsible for following the gambling laws that apply to you.
          Actuals does not check them for you.
        </p>
      </Clause>

      <Clause heading="Your data is yours">
        <p>
          The bets and notes you enter belong to you. We store and display them
          so the service can work, and we do not sell them or use them to
          advertise to you. What we hold and who processes it is set out in the{" "}
          <a
            href="/privacy"
            className="font-semibold text-neutral-900 underline dark:text-white"
          >
            Privacy Policy
          </a>
          .
        </p>
      </Clause>

      <Clause heading="Accuracy">
        <p>
          Every figure in Actuals is calculated from what you entered. Enter a
          stake wrongly and the profit is wrong, and the app has no way to know.
          Some figures also rest on a stated rule rather than a fact: where a
          parlay covers several sports, its stake and its result are divided
          between them by a rule the app explains on screen. Treat these numbers
          as a considered estimate of your own record, not as an audited
          account.
        </p>
        <p>
          Screenshot import uses automated reading and gets things wrong. You
          are always shown what it read and asked to confirm before anything is
          saved. Check it.
        </p>
      </Clause>

      <Clause heading="Availability">
        <p>
          Actuals is provided as it is. We do not promise it will be available
          without interruption or free of faults, and features may change or be
          withdrawn. Keep your own record of anything you cannot afford to lose.
        </p>
      </Clause>

      <Clause heading="Fair use">
        <p>
          Do not attempt to reach another user&apos;s data, break the service, scrape
          it wholesale, resell it, or use it to run a betting operation for other
          people. We may suspend an account that does.
        </p>
      </Clause>

      <Clause heading="Ending it">
        <p>
          You may stop using Actuals at any time and ask us to delete your
          account. We may close an account that breaks these terms. If we do, we
          will tell you why.
        </p>
      </Clause>

      <Clause heading="Gambling help">
        <p>
          Actuals is for entertainment. If betting has stopped being
          entertainment, call 1-800-GAMBLER, free and confidential, 24 hours a
          day. A tool that shows you your losses more clearly is not a substitute
          for help.
        </p>
      </Clause>

      <Clause heading="Changes">
        <p>
          When these terms change, the date at the top changes with them.
          Continuing to use Actuals after a change means you accept it.
        </p>
      </Clause>

      <Clause heading="Contact">
        <p>
          Peak Street 6 LLC. Reach us on Instagram at{" "}
          <a
            href="https://instagram.com/actualshq"
            className="font-semibold text-neutral-900 underline dark:text-white"
          >
            @actualshq
          </a>
          .
        </p>
      </Clause>
    </LegalPage>
  );
}
