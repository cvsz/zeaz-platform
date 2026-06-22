import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zLM-CLI — z.ai zLM 1.0 Coding Terminal",
  description: "A full-stack, browser-based coding CLI powered by the z.ai zLM 1.0 model. Stream answers, debug code, and ship faster from a terminal built for developers.",
  keywords: ["z.ai", "zLM 1.0", "coding CLI", "AI terminal", "Next.js", "TypeScript", "pair programmer"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "zLM-CLI — z.ai zLM 1.0 Coding Terminal",
    description: "A full-stack browser-based coding CLI powered by z.ai zLM 1.0.",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "zLM-CLI — z.ai zLM 1.0 Coding Terminal",
    description: "A full-stack browser-based coding CLI powered by z.ai zLM 1.0.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
