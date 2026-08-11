import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
  Inter_Tight,
  Poppins,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The brand wordmark font. Poppins stands in for Circular Std, which
// is a paid font. Swap this out if a Circular licence is bought.
const brand = Poppins({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Candidates for the big money number. Only one will survive.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// THE DISPLAY FACE, AND IT IS FOR THE LANDING PAGE ONLY.
//
// The owner on the first landing page: "font is ugly". He was right,
// and it was not the typeface, it was that there was only one. A poster
// needs a voice louder than its body text, and Geist Bold at 60px is
// still just Geist. Archivo at 800 is a tight grotesk that goes heavy
// without going novelty, which is the register of his reference.
//
// THE APP IS UNTOUCHED. Words are still Geist, numbers are still Inter
// Tight, and design-check rule 8 still fails the build if either moves.
// This variable is used by src/app/page.tsx and nothing else.
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Celebet",
  description: "Track your sports bets and see exactly how you perform",
  appleWebApp: {
    title: "Celebet",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // ONE theme-color tag, not a light and a dark one. A media query
  // pair cannot be overridden, and the settings page lets the user
  // choose a theme their phone disagrees with. The script in the head
  // rewrites this tag whenever the theme changes.
  themeColor: "#F7F7FB",
};

// Runs before the first paint, so the page never flashes the wrong
// theme. It has to be a raw string in the head: a React effect runs
// after paint, which is exactly the flash we are avoiding.
//
// "system" is the default and stores nothing, so a user who never opens
// settings keeps following their phone forever.
const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("celebet-theme");
    var dark =
      saved === "dark" ||
      ((!saved || saved === "system") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    // The phone paints its status bar from this. Without it, choosing
    // Light on a dark phone leaves a navy bar above a white page.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#04081B" : "#F7F7FB");
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brand.variable} ${interTight.variable} ${plex.variable} ${instrument.variable} ${display.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
