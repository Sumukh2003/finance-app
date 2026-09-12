import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { AppProviders } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "WalletTrack";
const DESCRIPTION =
  "Track income and expenses, set monthly budgets, and see exactly where your money goes.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Personal Finance Tracker`,
    template: `%s - ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "personal finance",
    "expense tracker",
    "budget planner",
    "money management",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Personal Finance Tracker`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Personal Finance Tracker`,
    description: DESCRIPTION,
  },
  // Financial pages are private by definition; keep them out of search indexes.
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the page background in each theme so the mobile browser chrome
  // does not sit on a mismatched strip of colour.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfc" },
    { media: "(prefers-color-scheme: dark)", color: "#14140f" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The proxy mints a per-request nonce for the Content-Security-Policy; the
  // theme script needs it or the browser refuses to run it.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AppProviders nonce={nonce}>{children}</AppProviders>
      </body>
    </html>
  );
}
