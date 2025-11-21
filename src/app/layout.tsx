import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-playful",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Forki - Your Pet, Your Progress",
  description: "Track meals in 15 seconds. Watch your adorable Forki grow. Build streaks that actually stick.",
  keywords: ["nutrition", "health", "tracking", "habits", "pet", "wellness", "forki"],
  authors: [{ name: "Forki Team" }],
  creator: "Forki",
  publisher: "Forki",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://forki.app",
    title: "Forki - Your Pet, Your Progress",
    description: "Track meals in 15 seconds. Watch your adorable Forki grow.",
    siteName: "Forki",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forki - Your Pet, Your Progress",
    description: "Track meals in 15 seconds. Watch your adorable Forki grow.",
    creator: "@forki",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Forki',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4ECDC4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Forki" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
