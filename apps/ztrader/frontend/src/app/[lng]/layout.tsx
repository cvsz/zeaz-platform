"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { LanguageSelector } from '../../components/LanguageSelector';
import { Navigation } from '../../components/Navigation';

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lng = pathname?.split('/')[1] || 'en';

  return (
    <ThemeProvider>
      <div lang={lng}>
        <NavigationWithLang lng={lng} />
        <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}

function NavigationWithLang({ lng }: { lng: string }) {
  return (
    <>
      <Navigation lng={lng} />
      <div
        style={{
          position: 'fixed',
          top: '14px',
          right: '24px',
          zIndex: 1000,
        }}
      >
        <LanguageSelector />
      </div>
    </>
  );
}
