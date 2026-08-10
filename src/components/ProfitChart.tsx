"use client";

import { useEffect, useRef, useState } from "react";
import { betProfitFor } from "@/lib/stats";
import type { BetWithLegs, Sport } from "@/lib/types";

interface Props {
  // Already filtered by period and sport by the stats page.
  bets: BetWithLegs[];
  sport: Sport | null;
  // Start and end of the chosen period. Null means open ended.
  from: Date | null;
  to: Date | null;
  // Fires while a finger or the mouse is held on the chart, so the
  // headline above can show that moment instead of today.
  onScrub?: (point: { value: number; date: Date } | null) => void;
}

// The drawing grid. The chart stretches to the panel's width, so these
// are just internal coordinates, not pixels on screen.
const W = 300;
const H = 150;

// The chart's colors come from CSS variables the panel sets, because
// the panel can now be dark or light and an SVG attribute cannot carry
// a Tailwind dark: variant. ProfitPanel owns the values; see SURFACES
// there. Bright and glowing on the dark panel, the app's ordinary
// money colors on a light one.
const GREEN = "var(--chart-up)";
const RED = "var(--chart-down)";

function shortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ProfitChart({
  bets,
  sport,
  from,
  to,
  onScrub,
}: Props) {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // The right hand edge of the chart is "now", which cannot be read
  // during render: the server reads its clock, the browser reads its
  // own milliseconds later, every x coordinate comes out different and
  // React reports a hydration mismatch. It also means the server's
  // timezone decided where today ended, not the phone's.
  //
  // So the clock is read once after mount, and until then the chart
  // draws nothing. It sits inside a panel of a fixed height, so there
  // is no layout jump.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  // Touch is handled by hand rather than through React, because the
  // browser only lets you cancel a scroll from a non-passive listener.
  //
  // The chart owns every touch inside it. Nothing scrolls here, so a
  // finger down starts scrubbing at once. You scroll the page from
  // anywhere outside the chart.
  const scrubRef = useRef<(clientX: number) => void>(() => {});
  const endRef = useRef<() => void>(() => {});
  const lockedRef = useRef(false);

  // `plotNode` exists as well as `plotRef` because a ref does not tell
  // React when it gets filled in, and this chart does not render on the
  // first pass: it waits for the clock to be read after mount. With a
  // plain ref the listener effect ran once against a null element,
  // bailed, and never ran again, so press and hold scrubbing silently
  // stopped working. Holding the node in state re-runs the effect the
  // moment the element appears.
  const [plotNode, setPlotNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = plotNode;
    if (!el) return;

    const lock = (x: number) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      // A short buzz on Android. iPhone has no vibration API in any
      // browser, and the switch trick did not fire either, so iPhone
      // simply gets no haptic.
      navigator.vibrate?.(12);
      scrubRef.current(x);
    };

    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      lock(touch.clientX);
    };

    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      if (lockedRef.current) {
        // Locked in, so the page must not move underneath.
        e.preventDefault();
        scrubRef.current(touch.clientX);
        return;
      }

      e.preventDefault();
      lock(touch.clientX);
    };

    const onEnd = () => {
      if (lockedRef.current) {
        lockedRef.current = false;
        endRef.current();
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [plotNode]);

  const settled = bets
    .filter((b) => b.settled_at !== null)
    .sort(
      (a, b) =>
        new Date(a.settled_at as string).getTime() -
        new Date(b.settled_at as string).getTime()
    );

  if (settled.length === 0) return null;
  if (now === null) return null;

  // The line always starts at zero, so every period stands on its own.
  const firstSettled = new Date(settled[0].settled_at as string);
  const startX = from ?? new Date(firstSettled.getTime() - 60 * 60 * 1000);
  const lastSettled = new Date(
    settled[settled.length - 1].settled_at as string
  );
  let endX = to !== null && to < now ? to : now;
  if (endX < lastSettled) endX = lastSettled;

  const spanMs = Math.max(endX.getTime() - startX.getTime(), 60 * 60 * 1000);

  // Running profit, one step per settled bet.
  let running = 0;
  const points: { t: number; value: number; date: Date }[] = [
    { t: 0, value: 0, date: startX },
  ];
  for (const bet of settled) {
    running += betProfitFor(bet, sport);
    const when = new Date(bet.settled_at as string);
    const t = (when.getTime() - startX.getTime()) / spanMs;
    points.push({
      t: Math.min(Math.max(t, 0), 1),
      value: running,
      date: when,
    });
  }
  // Hold the last value flat up to the end of the period.
  if (points[points.length - 1].t < 1) {
    points.push({ t: 1, value: running, date: endX });
  }

  const values = points.map((p) => p.value);
  const rawMax = Math.max(...values, 0);
  const rawMin = Math.min(...values, 0);
  const pad = Math.max((rawMax - rawMin) * 0.18, 1);
  const max = rawMax + pad;
  const min = rawMin - pad;

  const x = (t: number) => t * W;
  const y = (value: number) => H - ((value - min) / (max - min)) * H;

  const zeroY = y(0);
  const zeroFraction = zeroY / H;

  const line = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${x(p.t).toFixed(2)},${y(p.value).toFixed(2)}`
    )
    .join(" ");

  // The shaded band sits between the line and the zero line, so gains
  // shade upward and losses shade downward.
  const area =
    `M${x(points[0].t).toFixed(2)},${zeroY.toFixed(2)} ` +
    points
      .map((p) => `L${x(p.t).toFixed(2)},${y(p.value).toFixed(2)}`)
      .join(" ") +
    ` L${x(points[points.length - 1].t).toFixed(2)},${zeroY.toFixed(2)} Z`;

  const last = points[points.length - 1];

  const active = activeIndex === null ? null : points[activeIndex];
  // The dot follows the value under your finger, so it turns red the
  // moment you scrub into a losing stretch.
  const dotColor = (active ?? last).value >= 0 ? GREEN : RED;

  // Snaps a finger or cursor position to the nearest settled bet.
  function pointAt(clientX: number) {
    const box = plotRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return null;
    const fraction = Math.min(
      Math.max((clientX - box.left) / box.width, 0),
      1
    );
    let best = 0;
    let bestGap = Infinity;
    points.forEach((p, i) => {
      const gap = Math.abs(p.t - fraction);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    });
    return best;
  }

  function scrubTo(clientX: number) {
    const index = pointAt(clientX);
    if (index === null) return;
    setActiveIndex(index);
    onScrub?.({ value: points[index].value, date: points[index].date });
  }

  function endScrub() {
    setActiveIndex(null);
    onScrub?.(null);
  }

  // Keep the touch listeners pointed at the current data.
  scrubRef.current = scrubTo;
  endRef.current = endScrub;

  return (
    <div>
      {/* No negative margin. It existed to let the line reach the
          edges of a padded panel; with no panel in light mode it just
          pushed the axis labels past the page margin and clipped
          them. */}
      {/* THE CHART OWNS THE FIRST SCREEN, so its height is measured
          from the screen rather than picked.
          The owner: the chart is the hero of the page, and the top
          third was reading as empty. It was 200px.

          Why a formula and not a number. The tab bar is fixed to the
          bottom of the VIEWPORT, so where the sport filter row lands
          against it depends on how tall the phone is, not on how long
          the page is. I shipped 260px because it looked clear in a
          393x852 screenshot, and it was still half behind the bar on
          his phone: a browser with a URL bar and a toolbar leaves
          about 664 points, not 852. Then 340px fixed his phone and
          broke a Pro Max. There is no single number that works.

          314px is everything on the panel that is not the chart: the
          page title, the period chips, the headline, the record row,
          the date axis, and the margin that clears the bar. Take that
          off the screen height and the panel ends exactly at the fold,
          so the filter row always starts just below it. Verified from
          an iPhone SE to a Pro Max, in a browser and full screen.
          Re-measure that sweep if anything above the chart changes
          height, because 314 is the sum of those pieces. */}
      <div className="relative mt-4 h-[clamp(220px,calc(100dvh-314px),640px)] select-none">
        <div
          ref={(el) => {
            plotRef.current = el;
            setPlotNode(el);
          }}
          className="absolute inset-0"
          style={{
            // Nothing scrolls inside the chart. Every touch here is
            // a scrub.
            touchAction: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
            WebkitTouchCallout: "none",
          }}
          onContextMenu={(e) => e.preventDefault()}
          // Mouse only. Touch runs through the listeners above.
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") return;
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            scrubTo(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            if (activeIndex !== null) scrubTo(e.clientX);
          }}
          onPointerUp={(e) => {
            if (e.pointerType === "mouse") endScrub();
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") endScrub();
          }}
        >

          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Your running profit over the chosen period"
          >
            <defs>
              <linearGradient
                id="celebet-line"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={H}
              >
                <stop offset="0" stopColor={GREEN} />
                <stop offset={zeroFraction} stopColor={GREEN} />
                <stop offset={zeroFraction} stopColor={RED} />
                <stop offset="1" stopColor={RED} />
              </linearGradient>

              <linearGradient
                id="celebet-area"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={H}
              >
                <stop offset="0" stopColor={GREEN} stopOpacity="0.5" />
                <stop
                  offset={zeroFraction}
                  stopColor={GREEN}
                  stopOpacity="0.02"
                />
                <stop offset={zeroFraction} stopColor={RED} stopOpacity="0.02" />
                <stop offset="1" stopColor={RED} stopOpacity="0.45" />
              </linearGradient>

              {/* Two blurs: a wide bloom and a tight one, which is what
                  makes the line read as lit rather than drawn. */}
              <filter
                id="celebet-bloom"
                x="-25%"
                y="-50%"
                width="150%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter
                id="celebet-glow"
                x="-25%"
                y="-50%"
                width="150%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            <path d={area} fill="url(#celebet-area)" />

            <line
              x1="0"
              y1={zeroY}
              x2={W}
              y2={zeroY}
              stroke="var(--chart-rule)"
              strokeWidth="1"
              strokeDasharray="2 5"
              vectorEffect="non-scaling-stroke"
            />

            {/* The two glow passes. A glow needs darkness, so on a light
                panel the group is simply switched off rather than left
                to turn the line muddy. */}
            <g style={{ opacity: "var(--chart-glow)" }}>
              <path
                d={line}
                fill="none"
                stroke="url(#celebet-line)"
                strokeWidth="8"
                strokeOpacity="0.45"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                filter="url(#celebet-bloom)"
              />
              <path
                d={line}
                fill="none"
                stroke="url(#celebet-line)"
                strokeWidth="4"
                strokeOpacity="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                filter="url(#celebet-glow)"
              />
            </g>
            <path
              d={line}
              fill="none"
              stroke="url(#celebet-line)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {/* The line that follows your finger. */}
            {active !== null && (
              <line
                x1={x(active.t)}
                y1="0"
                x2={x(active.t)}
                y2={H}
                stroke="var(--chart-rule)"
                strokeOpacity="0.9"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* The dot marks today, or the moment you are holding. It
              grows while you hold so it stays visible under a thumb. */}
          <span
            className={`pointer-events-none absolute block -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 transition-[height,width] ${
              active ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
            }`}
            style={{
              left: `${(active ?? last).t * 100}%`,
              top: `${(y((active ?? last).value) / H) * 100}%`,
              backgroundColor: dotColor,
              boxShadow: `0 0 calc(14px * var(--chart-glow)) 2px ${dotColor}`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--tw-ring-color" as any]: `${dotColor}40`,
            }}
          />
        </div>
      </div>

      {/* px-1 because the panel clips its overflow, and a glyph paints
          a hair outside its layout box: the J of "Jul" and the 9 of
          "Aug 9" were losing a sliver at the page edges. Measured at
          4x, not guessed. */}
      <div
        className="mt-3 flex justify-between px-1 text-[10px]"
        style={{ color: "var(--chart-muted)" }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <span key={f}>
            {shortDate(new Date(startX.getTime() + spanMs * f))}
          </span>
        ))}
      </div>
    </div>
  );
}
