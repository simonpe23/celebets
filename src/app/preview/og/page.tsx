import PhoneMock from "@/components/PhoneMock";

// THE SOCIAL PREVIEW CARD, 1200 by 630. ogshot.mjs screenshots the
// fixed-size stage below and writes public/og.png, which is what shows
// when the site's address is pasted into a chat or a feed.
//
// This page is gitignored like the rest of /preview, and Tailwind
// skips gitignored files, so every NEW style here is inline. Classes
// are only allowed on the imported components (PhoneMock, Wordmark),
// whose classes are generated from their own files.
export default function OgPreview() {
  return (
    <div
      id="og-stage"
      style={{
        position: "relative",
        width: 1200,
        height: 630,
        overflow: "hidden",
        background:
          "radial-gradient(900px 620px at 78% -140px, rgba(124,58,237,0.16), rgba(124,58,237,0.05) 50%, rgba(124,58,237,0) 72%), radial-gradient(600px 420px at 8% 120%, rgba(85,37,198,0.06), rgba(85,37,198,0) 70%), #FFFFFF",
        fontFamily: "var(--font-geist-sans)",
        color: "#171717",
      }}
    >
      {/* The words, left */}
      <div style={{ position: "absolute", left: 84, top: 78 }}>
        {/* The tagline version of the lockup, per the owner: this card
            is the ONE large placement where the tagline earns its
            space. eslint-disable for the same reason PhoneMock uses
            img: a fixed pixel stage, screenshotted, never responsive. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/wordmark-tagline-dark.png"
          alt="Actuals. Track. Analyze. Improve."
          style={{ height: 104, width: "auto" }}
        />

        <h1
          style={{
            margin: 0,
            marginTop: 58,
            fontFamily: "var(--font-inter-tight)",
            fontWeight: 800,
            fontSize: 108,
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
            color: "#171717",
          }}
        >
          Know
          <br />
          Your <span style={{ color: "#5525C6" }}>Game.</span>
        </h1>

        <p
          style={{
            margin: 0,
            marginTop: 30,
            fontSize: 20,
            fontWeight: 700,
            // Lowercase, by the owner's instruction, but the wide
            // tracking stays at 0.08em. I tightened it to 0.01em when
            // dropping the capitals and he said it looked better
            // before, so the spacing was never the problem.
            letterSpacing: "0.08em",
            color: "#5525C6",
          }}
        >
          actuals.cc
        </p>
      </div>

      {/* The phone, right, running off the bottom edge like the CTA
          panel's. The card crops it, which reads as depth. */}
      <div
        style={{
          position: "absolute",
          right: 88,
          top: 64,
          transform: "rotate(7deg)",
        }}
      >
        <PhoneMock
          src="/shots/performance-dark.png"
          srcLight="/shots/performance-light.png"
          alt=""
          width={300}
        />
      </div>
    </div>
  );
}
