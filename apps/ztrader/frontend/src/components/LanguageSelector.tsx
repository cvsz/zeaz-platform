// ZeaZDev [Language Selector Component] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  const currentLang = i18n.language || 'en';

  const handleLanguageChange = (langCode: string) => {
    const pathParts = pathname.split('/');
    const isLangPath = languages.some(lang => lang.code === pathParts[1]);

    let newPath;
    if (isLangPath) {
      pathParts[1] = langCode;
      newPath = pathParts.join('/');
    } else {
      newPath = `/${langCode}${pathname}`;
    }

    router.push(newPath);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        style={{
          padding: '8px 32px 8px 12px',
          fontSize: '14px',
          fontFamily: "'Outfit', sans-serif",
          fontWeight: '500',
          color: '#f3f4f6',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          backgroundColor: 'rgba(31, 41, 55, 0.6)',
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f3f4f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          backgroundSize: '14px',
          outline: 'none',
          transition: 'all 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.6)';
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} style={{ backgroundColor: '#1f2937', color: '#f3f4f6' }}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
