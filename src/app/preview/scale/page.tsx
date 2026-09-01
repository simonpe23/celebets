"use client";

// THE SIZE DECISION, phase 2 of the size and layout job.
//
// His words, 31 August 2026: "my honest opinion is. Track feels too
// zoomed in and Performance feels too zoomed out... show me both
// options... plus show me something in between".
//
// One page, three scales, the same two blocks drawn in each. The top
// block is a Track card, the bottom is a slice of Performance Home.
// Both halves of his app at once, so the choice is not made by
// remembering what the other page looked like.
//
// THIS PAGE IS FOR THE DECISION AND NOTHING ELSE. It carries no live
// data and nothing imports from it. Delete it once he has chosen.
//
// The numbers in it are his real ones from 31 August 2026, so the
// figures are the length they will actually be.

import { useState } from "react";

// A SCALE IS A LIST OF ALLOWED TEXT SIZES, and nothing else. What
// changes between the three is how small the smallest is and how big
// the biggest is; the jobs stay the same.
//
// A and C are what the app runs today, measured, not invented. B is
// CLAUDE's proposal: Track's shape, about 13 percent smaller, with its
// floor at 11px because that is Apple's own minimum and Performance
// today goes down to 7.6px, which nobody can read.
type Scale = {
  key: "A" | "B" | "C";
  name: string;
  note: string;
  list: string;
  hero: number;
  title: number;
  head: number;
  figure: number;
  body: number;
  label: number;
  caption: number;
  micro: number;
};

const SCALES: Scale[] = [
  {
    key: "A",
    name: "Track's",
    note: "What Track, Settings and Research run today.",
    list: "12 · 14 · 16 · 18 · 20 · 24 · 30, hero 40",
    hero: 40,
    title: 22,
    head: 17,
    figure: 17,
    body: 14,
    label: 12,
    caption: 12,
    micro: 11,
  },
  {
    key: "B",
    name: "In between",
    note: "Proposed. Track's shape, 13% smaller, floor at 11px.",
    list: "11 · 12 · 13 · 15 · 17 · 20 · 26, hero 34",
    hero: 34,
    title: 20,
    head: 15,
    figure: 15,
    body: 13,
    label: 12,
    caption: 11,
    micro: 11,
  },
  {
    key: "C",
    name: "Performance's",
    note: "What the six Performance pages run today.",
    list: "7.6 · 8 · 8.5 · 9 · 9.5 · 10 · 10.5 · 11 · 11.5 · 15, hero 45",
    hero: 45,
    title: 15,
    head: 11,
    figure: 12.5,
    body: 10,
    label: 9.5,
    caption: 8.5,
    micro: 7.6,
  },
];

const INK = "#16161A";
const MUTED = "#757B87";
const FAINT = "#9AA0AC";
const RED = "#E8352B";
const GREEN = "#12A150";
const INDIGO = "#3708E4";
const PAGE = "#F7F7FB";
const CARD = "#FFFFFF";
const LINE = "#EDEDF1";
const PILL = "#ECECF3";

export default function ScalePreview() {
  const [pick, setPick] = useState<Scale>(SCALES[1]);
  const s = pick;

  return (
    <div className="min-h-svh pb-16" style={{ background: PAGE, color: INK }}>
      <div className="mx-auto w-full max-w-[430px] px-4 pt-5">
        <h1 className="text-[19px] font-bold">Pick a size scale</h1>
        <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
          The same two blocks, drawn three ways. Tap to swap. Nothing here
          is live and nothing is decided until you say so.
        </p>

        {/* The switcher. */}
        <div
          className="mt-4 flex gap-1 rounded-full p-1"
          style={{ background: PILL }}
        >
          {SCALES.map((o) => (
            <button
              key={o.key}
              onClick={() => setPick(o)}
              className="flex-1 rounded-full py-2 text-[13px] font-semibold"
              style={
                o.key === s.key
                  ? { background: INDIGO, color: "#FFFFFF" }
                  : { color: MUTED }
              }
            >
              {o.name}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[12px] font-semibold" style={{ color: INK }}>
          {s.list}
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: MUTED }}>
          {s.note}
        </p>

        {/* ------------------------------------------------------- */}
        {/* A TRACK CARD. His words: Track feels too zoomed in.      */}
        <p
          className="mt-6 mb-2 font-semibold uppercase tracking-wide"
          style={{ fontSize: 11, color: FAINT }}
        >
          Track
        </p>
        <div
          className="rounded-2xl p-4"
          style={{ background: CARD, boxShadow: `inset 0 0 0 1px ${LINE}` }}
        >
          <div className="flex items-start justify-between">
            <span
              className="font-semibold uppercase tracking-wide"
              style={{ fontSize: s.label, color: FAINT }}
            >
              Tracking balance
            </span>
            <span
              className="rounded-md px-3 py-1.5 font-semibold text-white"
              style={{ fontSize: s.label, background: INDIGO }}
            >
              Set balance
            </span>
          </div>
          <p
            className="mt-1 font-bold tabular-nums leading-none"
            style={{ fontSize: s.hero }}
          >
            $1,743.82
          </p>
          <p className="mt-2" style={{ fontSize: s.body }}>
            <span className="font-semibold" style={{ color: RED }}>
              -$3,256.18
            </span>
            <span style={{ color: MUTED }}> net profit, all time</span>
          </p>
          <div
            className="mt-4 flex"
            style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12 }}
          >
            {[
              ["Today", "$0", INK],
              ["Week", "$0", INK],
              ["Month", "-$4,854", RED],
              ["Year", "-$3,256", RED],
            ].map(([k, v, c], i) => (
              <div
                key={k}
                className="flex-1"
                style={{ borderLeft: i ? `1px solid ${LINE}` : undefined, paddingLeft: i ? 10 : 0 }}
              >
                <p
                  className="font-semibold uppercase tracking-wide"
                  style={{ fontSize: s.micro, color: FAINT }}
                >
                  {k}
                </p>
                <p
                  className="mt-1 font-bold tabular-nums"
                  style={{ fontSize: s.figure, color: c }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* PERFORMANCE. His words: Performance feels too zoomed out. */}
        <p
          className="mt-7 mb-2 font-semibold uppercase tracking-wide"
          style={{ fontSize: 11, color: FAINT }}
        >
          Performance
        </p>
        <div
          className="rounded-2xl p-4"
          style={{ background: CARD, boxShadow: `inset 0 0 0 1px ${LINE}` }}
        >
          <div className="flex items-start justify-between">
            <span style={{ fontSize: s.label, color: MUTED }}>Net profit</span>
            <span
              className="rounded-full px-3 py-1 font-semibold"
              style={{ fontSize: s.caption, background: PILL, color: INK }}
            >
              All time
            </span>
          </div>
          <p
            className="mt-1 font-bold tabular-nums leading-none"
            style={{ fontSize: s.hero, color: RED }}
          >
            -$3,256
          </p>

          <div
            className="mt-4 flex"
            style={{ borderTop: `1px solid ${LINE}`, paddingTop: 12 }}
          >
            {[
              ["Bets", "700"],
              ["Record", "348–352"],
              ["Hit rate", "50%"],
              ["ROI", "-6.1%"],
            ].map(([k, v], i) => (
              <div
                key={k}
                className="flex-1"
                style={{ borderLeft: i ? `1px solid ${LINE}` : undefined, paddingLeft: i ? 10 : 0 }}
              >
                <p className="font-bold tabular-nums" style={{ fontSize: s.figure }}>
                  {v}
                </p>
                <p className="mt-0.5" style={{ fontSize: s.micro, color: MUTED }}>
                  {k}
                </p>
              </div>
            ))}
          </div>

          <p
            className="mt-5 font-bold"
            style={{ fontSize: s.head }}
          >
            What drives your result
          </p>
          <p style={{ fontSize: s.caption, color: MUTED }}>
            Ranked by contribution to net profit
          </p>

          {[
            ["1", "World Cup", "149–133", "53% hit rate", "+$1,261", "ROI +8%"],
            ["2", "Spread / Handicap", "18–13", "58% hit rate", "+$928", "ROI +31%"],
            ["3", "Player Props", "20–35", "36% hit rate", "-$1,204", "ROI -19%"],
          ].map(([n, name, rec, hit, money, roi], i) => (
            <div
              key={name}
              className="flex items-center gap-3 py-2.5"
              style={{ borderTop: i ? `1px solid ${LINE}` : `1px solid ${LINE}`, marginTop: i ? 0 : 8 }}
            >
              <span
                className="flex shrink-0 items-center justify-center rounded-full font-bold"
                style={{
                  width: s.figure * 1.6,
                  height: s.figure * 1.6,
                  fontSize: s.micro,
                  background: i === 0 ? INDIGO : PILL,
                  color: i === 0 ? "#FFFFFF" : MUTED,
                }}
              >
                {n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold" style={{ fontSize: s.body }}>
                  {name}
                </span>
                <span className="block" style={{ fontSize: s.caption, color: MUTED }}>
                  {rec} · {hit}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span
                  className="block font-bold tabular-nums"
                  style={{ fontSize: s.figure, color: money.startsWith("-") ? RED : GREEN }}
                >
                  {money}
                </span>
                <span
                  className="block tabular-nums"
                  style={{ fontSize: s.micro, color: money.startsWith("-") ? RED : GREEN }}
                >
                  {roi}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px]" style={{ color: MUTED }}>
          Whichever you pick becomes the app&apos;s one list. Performance is
          still allowed to look denser than Track by using the small end of
          it. Nothing about fonts or colours changes here.
        </p>
      </div>
    </div>
  );
}
