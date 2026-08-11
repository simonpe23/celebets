import LegalPage, { Clause } from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy | Celebet",
  description: "What Celebet collects, why, and what it never does.",
};

// A FIRST DRAFT, WRITTEN FROM WHAT THE APP ACTUALLY DOES.
//
// Every claim below was checked against the code rather than copied
// from another company's policy, because a privacy policy that
// describes software you do not run is worse than none: it is a
// promise you are already breaking.
//
// What that check found, and why the wording is what it is:
//   - the only account data stored is an email, and a name if the user
//     types one or arrives through Google
//   - bets, transactions and settings live in Supabase behind row level
//     security, so one user's rows are unreachable by another
//   - the only outbound sharing is a bet slip image sent to Anthropic
//     when the user taps Paste bet slip, and email sent through Resend
//   - there is no advertising, no analytics product, no third party
//     tracker, and nothing is sold. Say so plainly, it is a real
//     difference from the rest of this category.
//
// THE OWNER MUST STILL READ THIS. It is a starting point for a lawyer
// or for his own judgement, not legal advice, and the moment account
// syncing ships this page has to change with it.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="11 August 2026">
      <p>
        Celebet is a personal betting record. It works best when you are honest
        with it, so it is only fair that we are straightforward about what we
        hold. This page explains what we collect, why, and what we do not do.
      </p>

      <Clause heading="Who we are">
        <p>
          Celebet is operated by Peak Street 6 LLC. You can reach us on
          Instagram at{" "}
          <a
            href="https://instagram.com/gocelebet"
            className="font-semibold text-neutral-900 underline dark:text-white"
          >
            @gocelebet
          </a>
          .
        </p>
      </Clause>

      <Clause heading="What we collect">
        <p>
          <strong>Your account.</strong> An email address, and a name if you
          give one or if you sign in with Google. Passwords are stored hashed by
          our authentication provider and are never visible to us.
        </p>
        <p>
          <strong>What you track.</strong> The bets, picks, amounts, dates and
          notes you enter, and any balance changes you record. This is the
          service. Without it there is nothing to show you.
        </p>
        <p>
          <strong>Your settings.</strong> Your theme choice is stored in your
          own browser, not on our servers.
        </p>
      </Clause>

      <Clause heading="What we do not collect">
        <p>
          We do not ask for your date of birth, your address, your government
          identification, or any payment details. Celebet never touches real
          money, so it never needs your bank or your card.
        </p>
        <p>
          We do not connect to your sportsbook accounts and we do not hold any
          credentials for them. If that ever changes, this page will change
          first and you will be asked before anything is connected.
        </p>
      </Clause>

      <Clause heading="Who else sees it">
        <p>
          Nobody buys your data from us, because we do not sell it. There is no
          advertising on Celebet and no third party tracking or analytics
          product embedded in it.
        </p>
        <p>Three companies necessarily handle data on our behalf:</p>
        <p>
          <strong>Supabase</strong> stores your account and your records.{" "}
          <strong>Vercel</strong> serves the website. <strong>Resend</strong>{" "}
          delivers account emails such as confirmation and password resets.
        </p>
        <p>
          One thing leaves only when you ask for it. If you use Paste bet slip
          or Upload screenshot, that single image is sent to Anthropic&apos;s API
          so it can be read into a form for you to check. It is used for that
          request and nothing else. If you never use those two buttons, no image
          ever leaves your device.
        </p>
      </Clause>

      <Clause heading="Keeping it separate">
        <p>
          Your records are protected by row level security in the database,
          which means the rules that decide who may read a row live in the
          database itself rather than in the app. Another Celebet user cannot
          reach your bets even if the app has a bug.
        </p>
      </Clause>

      <Clause heading="How long we keep it">
        <p>
          Your records stay until you delete them or ask us to close your
          account. Deleting a bet in the app removes it. Restarting your record
          in Settings deletes nothing: it draws a line and counts from there,
          and it can be undone at any time.
        </p>
      </Clause>

      <Clause heading="Your choices">
        <p>
          You can see everything we hold about you inside the app, because it is
          the app. You can correct it or delete it there. If you want your whole
          account and all its records removed, message us and we will do it.
        </p>
        <p>
          Depending on where you live you may have further rights over your
          personal data, including a copy of it and a right to object to how it
          is handled. Ask and we will help.
        </p>
      </Clause>

      <Clause heading="Children">
        <p>
          Celebet is for adults only and is not directed at anyone under 18. We
          do not knowingly hold data from anyone under 18. If you believe a
          minor has created an account, tell us and we will remove it.
        </p>
      </Clause>

      <Clause heading="Changes">
        <p>
          When this policy changes, the date at the top changes with it. If a
          change materially affects what we collect or who sees it, we will say
          so in the app rather than quietly editing this page.
        </p>
      </Clause>
    </LegalPage>
  );
}
