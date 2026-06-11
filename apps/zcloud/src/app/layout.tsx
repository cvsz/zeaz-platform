import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "zcloud | Master Meta Final Release",
  description: "CloudPanel v2 master meta full advanced professional UI/UX final release with GODMODE navigation, i18n, and command controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
