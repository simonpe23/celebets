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
  themeColor: [
    // The phone paints its status bar with this, so it has to be the
    // page color or a seam shows above the header.
    { media: "(prefers-color-scheme: light)", color: "#F7F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#04081B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brand.variable} ${interTight.variable} ${plex.variable} ${instrument.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
