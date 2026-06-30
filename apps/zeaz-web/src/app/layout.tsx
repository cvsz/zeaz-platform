import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://zeaz.dev";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-zeaz-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-zeaz-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "ZEAZDEV Platform",
  title: {
    default: "ZEAZDEV Company Limited — Production AI, Cloud, and Software Systems",
    template: "%s — ZEAZDEV Company Limited",
  },
  description:
    "ZEAZDEV Company Limited builds production-ready AI automation, Cloudflare-first edge operations, SaaS products, and developer platforms for zeaz.dev.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ZEAZDEV Company Limited",
    title: "ZEAZDEV Company Limited — Production AI, Cloud, and Software Systems",
    description:
      "Secure AI automation, Cloudflare-first edge operations, SaaS products, and developer platforms for zeaz.dev.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZEAZDEV Company Limited",
    description:
      "Production-ready AI automation, edge operations, SaaS products, and developer platforms.",
  },
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
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} dark`}>
      <body
        className="min-h-screen bg-black font-sans text-foreground antialiased"
      >
        {children}
      </body>
    </html>
  );
}

