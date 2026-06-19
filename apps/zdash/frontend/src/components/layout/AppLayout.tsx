import { useState, type ReactNode } from "react";

import { useT } from "../../hooks/useT";
import SafetyBanner from "../ui/SafetyBanner";
import { getSafetyBannerText } from "../../utils/safety";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppLayoutProps = {
  children: ReactNode;
};

const showSafetyBanners =
  String(import.meta.env.VITE_SHOW_SAFETY_BANNERS ?? "true").toLowerCase() ===
  "true";

export default function AppLayout({ children }: AppLayoutProps) {
  const { t } = useT();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-accent-violet/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.05),_transparent_32%)] opacity-70" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen((previous) => !previous)} />

        {showSafetyBanners && (
          <SafetyBanner text={getSafetyBannerText()} variant="warning" />
        )}

        <div className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-6 md:px-6">
          {children}
        </div>

        <footer className="border-t border-border px-4 py-3 text-center text-xs text-text-dim">
          {t('common.footer', { version: '0.1.0' })}
        </footer>
      </main>
      </div>
    </div>
  );
}
