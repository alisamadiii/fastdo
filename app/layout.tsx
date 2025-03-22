import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryClientProviders from "@/providers/react-query";
import PlausibleProvider from "next-plausible";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Base URL for canonical links and absolute URLs
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.fastdo.app/";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "FastDo - Developer Productivity Tools",
    template: "%s | FastDo",
  },
  description:
    "Speed up your workflow with our collection of developer tools. Download GitHub directories, process images, and more - all in one place.",
  keywords: [
    "developer tools",
    "GitHub directory downloader",
    "image processing",
    "web development",
    "productivity tools",
    "code tools",
    "batch image processing",
    "developer workflow",
  ],
  authors: [{ name: "FastDo Team" }],
  creator: "FastDo",
  publisher: "FastDo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "technology",

  // Open Graph metadata
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "Fast Tools - Developer Productivity Tools",
    description:
      "Speed up your workflow with our collection of developer tools. Download GitHub directories, process images, and more - all in one place.",
    siteName: "FastDo",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "FastDo - Developer Productivity Tools",
      },
    ],
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: "Fast Tools - Developer Productivity Tools",
    description:
      "Speed up your workflow with our collection of developer tools. Download GitHub directories, process images, and more - all in one place.",
    images: [`${baseUrl}/twitter-image.png`],
    creator: "@fasttools",
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification for search consoles
  verification: {
    // Add your verification tokens when you have them
    google: "google-site-verification-token",
    // yandex: 'yandex-verification-token',
    // bing: 'bing-verification-token',
  },

  // Alternate languages if you have them
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-US": `${baseUrl}/en-US`,
      // Add other languages when you support them
    },
  },

  // App information if applicable
  applicationName: "Fast Tools",
  appleWebApp: {
    capable: true,
    title: "Fast Tools",
    statusBarStyle: "black-translucent",
  },

  // Manifest for PWA
  manifest: `${baseUrl}/manifest.json`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProviders>
          <PlausibleProvider domain="fastdo.app">{children}</PlausibleProvider>
          <ReactQueryDevtools />
        </QueryClientProviders>
      </body>
    </html>
  );
}
