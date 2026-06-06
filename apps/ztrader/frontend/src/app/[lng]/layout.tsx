// ZeaZDev [Frontend Language Layout] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - Lang Layout) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { Navigation } from '../../components/Navigation';

export default function LangLayout({
  children,
}: {
  children: React.ReactNode
  params: Promise<{ lng: string }>
}) {
  const pathname = usePathname();
  const lng = pathname?.split('/')[1] || 'en';

  return (
    <ThemeProvider>
      <div lang={lng}>
        <Navigation lng={lng} />
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 1000,
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <LanguageSelector />
        </div>
        <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
}
