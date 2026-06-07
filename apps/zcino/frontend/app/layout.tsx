import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { AuthProvider } from "./providers/auth-provider";
import { QueryProvider } from "./providers/query-provider";
import { ThemeProvider } from "./providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Zcino Meta Control Plane",
    template: "%s | Zcino Meta",
  },
  description:
    "Enterprise Next.js frontend for Zcino with live metrics, force-directed topology, explorer, governance, task streaming, OAuth, and wallet access.",
  keywords: ["Zcino", "network explorer", "governance", "WebSocket metrics", "Kafka", "NATS", "wallet auth"],
  openGraph: {
    title: "Zcino Meta Control Plane",
    description: "A production-grade blockchain operations dashboard built with Next.js App Router and TailwindCSS.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
