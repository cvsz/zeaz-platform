import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: "%s | ZSP AI Tool",
    default: "ZSP AI Tool | Shopee Affiliate AI Studio",
  },
  description:
    "Thai-first Shopee Affiliate AI studio for product intake, AI content generation, OCR, exports, and HyperFrames video workflows.",
  keywords: ["ZSP AI Tool", "Shopee Affiliate", "AI Studio", "HyperFrames", "OCR", "Content Generation"],
  authors: [{ name: "Zeaz Dev", url: "https://zeaz.dev" }],
  creator: "Zeaz Dev",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zeaz.dev",
    title: "ZSP AI Tool | Shopee Affiliate AI Studio",
    description:
      "Thai-first Shopee Affiliate AI studio for product intake, AI content generation, OCR, exports, and HyperFrames video workflows.",
    siteName: "ZSP AI Tool",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZSP AI Tool | Shopee Affiliate AI Studio",
    description: "Thai-first Shopee Affiliate AI studio for product intake, AI content generation, OCR, exports, and HyperFrames video workflows.",
    creator: "@zeazdev",
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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
