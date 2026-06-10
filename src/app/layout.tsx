import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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

export const metadata: Metadata = {
  title: {
    default: "SubtitleAI — AI-Powered Subtitle Platform",
    template: "%s | SubtitleAI",
  },
  description:
    "Generate, edit, translate, and export professional subtitles with AI. The fastest subtitle workflow for creators and studios.",
  keywords: ["subtitles", "AI transcription", "captions", "video editing", "Whisper", "translation"],
  authors: [{ name: "SubtitleAI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SubtitleAI — AI-Powered Subtitle Platform",
    description: "Generate, edit, translate, and export professional subtitles with AI.",
    siteName: "SubtitleAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubtitleAI — AI-Powered Subtitle Platform",
    description: "Generate, edit, translate, and export professional subtitles with AI.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080810",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="bg-background text-foreground antialiased min-h-dvh">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
