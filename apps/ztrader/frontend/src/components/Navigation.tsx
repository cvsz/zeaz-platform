// ZeaZDev [Frontend Navigation Menu] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  lng: string;
}

const menuTranslations: Record<string, { dashboard: string; settings: string; login: string; admin: string }> = {
  en: { dashboard: 'Dashboard', settings: 'Settings', login: 'Login', admin: 'Admin Panel' },
  th: { dashboard: 'แดชบอร์ด', settings: 'ตั้งค่า', login: 'เข้าสู่ระบบ', admin: 'แผงผู้ดูแลระบบ' },
  zh: { dashboard: '仪表板', settings: '设置', login: '登录', admin: '管理面板' },
  ja: { dashboard: 'ダッシュボード', settings: '設定', login: 'ログイン', admin: '管理パネル' },
};

export function Navigation({ lng }: NavigationProps) {
  const pathname = usePathname();
  const labels = menuTranslations[lng] || menuTranslations.en;

  const menuItems = [
    { key: 'dashboard', href: `/${lng}/dashboard`, label: labels.dashboard },
    { key: 'settings', href: `/${lng}/settings`, label: labels.settings },
    { key: 'admin', href: `/${lng}/admin`, label: labels.admin },
    { key: 'login', href: `/${lng}/login`, label: labels.login },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 999,
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Logo/Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#3B82F6',
            boxShadow: '0 0 10px #3B82F6',
          }}></div>
          <span style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#f3f4f6',
            letterSpacing: '0.05em',
            fontFamily: "'Outfit', sans-serif"
          }}>
            z<span style={{ color: '#3B82F6' }}>trader</span>
          </span>
        </div>

        {/* Menu Items */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          {menuItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive(item.href) ? '#3B82F6' : '#9ca3af',
                backgroundColor: isActive(item.href) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                fontWeight: isActive(item.href) ? '600' : '500',
                fontSize: '15px',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.25s ease-in-out',
                border: isActive(item.href) ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.color = '#f3f4f6';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.currentTarget.style.color = '#9ca3af';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
