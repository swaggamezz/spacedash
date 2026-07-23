import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SpaceDash — Mission Control",
    template: "%s · SpaceDash",
  },
  description:
    "Live ruimtevaartdashboard met aankomende lanceringen, historische missies, raketten en livestreams.",
  applicationName: "SpaceDash",
  keywords: ["space launches", "ruimtevaart", "raketten", "launch schedule", "mission control"],
  openGraph: {
    title: "SpaceDash — Alles wat de aarde verlaat",
    description: "Launches, missies, raketten en livestreams in één automatisch dashboard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
