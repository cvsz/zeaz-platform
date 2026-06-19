// apps/zcloud/src/app/layout.tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">
        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
