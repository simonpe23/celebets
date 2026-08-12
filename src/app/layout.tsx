import type { Metadata, Viewport } from "next";
import {
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

// The app's numeral face, and since v6 of the landing page also its
// display face: the landing headlines are Inter Tight at 800, mapped
// through --font-display in globals.css. One family, two jobs. The
// owner compared v5's Archivo against his mockup and called the font
// wrong, and the mockup's headline is a tight grotesk, which is what
// Inter Tight is. The app's text face (Geist) and the money face
// (Inter Tight at 500) are untouched, design-check rule 8 still
// guards both.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${brand.variable} ${interTight.variable} ${plex.variable} ${instrument.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
