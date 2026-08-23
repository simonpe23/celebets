import PhoneMock from "@/components/PhoneMock";

// Arrangements of the drawn phone, for the owner to pick from.
function Row({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{note}</p>
      </div>
      {children}
    </section>
  );
}

export default function Mockups() {
  return (
    <main className="space-y-16 px-6 py-10">
      <Row title="A  One phone, straight on" note="Calmest. The screen is fully readable.">
        <div className="flex justify-center rounded-3xl bg-[#04081B] py-14">
          <PhoneMock src="/shots/performance-dark.png" alt="Performance" width={250} glow priority />
        </div>
      </Row>

      <Row title="B  One phone, turned" note="Your reference angle. More product photo, slightly less readable.">
        <div className="flex justify-center rounded-3xl bg-[#04081B] py-14">
          <PhoneMock src="/shots/performance-dark.png" alt="Performance" width={250} angle={-16} glow />
        </div>
      </Row>

      <Row title="C  Three phones, centre forward" note="The arrangement in your mockup.">
        <div className="flex items-center justify-center gap-[-2rem] rounded-3xl bg-[#04081B] py-14">
          <PhoneMock src="/shots/track-dark.png" alt="Track" width={180} angle={22} lift={-10} className="-mr-8 opacity-90" />
          <PhoneMock src="/shots/performance-dark.png" alt="Performance" width={230} lift={26} glow className="z-10" />
          <PhoneMock src="/shots/research-dark.png" alt="Research" width={180} angle={-22} lift={-10} className="-ml-8 opacity-90" />
        </div>
      </Row>

      <Row title="D  Two phones, overlapped" note="Simpler than three, still shows two sides of the app.">
        <div className="flex items-center justify-center rounded-3xl bg-[#04081B] py-14">
          <PhoneMock src="/shots/track-dark.png" alt="Track" width={205} angle={14} lift={-14} className="-mr-10" />
          <PhoneMock src="/shots/performance-dark.png" alt="Performance" width={235} angle={-8} glow className="z-10" />
        </div>
      </Row>

      <Row title="E  The same, on white" note="Light mode. No glow: a coloured halo on white reads as a smudge.">
        <div className="flex items-center justify-center rounded-3xl bg-[#F7F7FB] py-14">
          <PhoneMock src="/shots/track-dark.png" srcLight="/shots/track-light.png" alt="Track" width={205} angle={14} lift={-14} className="-mr-10" />
          <PhoneMock src="/shots/performance-dark.png" srcLight="/shots/performance-light.png" alt="Performance" width={235} angle={-8} className="z-10" />
        </div>
      </Row>
    </main>
  );
}
