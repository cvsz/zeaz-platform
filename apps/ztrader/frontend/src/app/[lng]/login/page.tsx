// ZeaZDev [Frontend Login Page] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React from 'react';
import { initI18n } from '../../i18n/client';
import { useTranslation } from 'react-i18next';
import { GoogleSignIn } from '../../../components/auth/GoogleSignIn';
import { usePathname, useRouter } from 'next/navigation';

export default function LoginPage(_: { params: Promise<{ lng: string }> }) {
  const pathname = usePathname();
  const lng = pathname?.split('/')[1] || 'en';
  initI18n(lng);
  const { t } = useTranslation('translation');
  const router = useRouter();

  const handleSuccess = (user: any) => {
    console.log('Login successful:', user);
    router.push(`/${lng}/dashboard`);
  };

  const handleError = (error: string) => {
    console.error('Login error:', error);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      backgroundColor: '#0b0f19',
      color: '#f3f4f6',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        margin: '0 20px',
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '20px',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              boxShadow: '0 0 10px #3B82F6',
            }}></div>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '10px',
            letterSpacing: '0.05em',
            color: '#f3f4f6'
          }}>
            z<span style={{ color: '#3B82F6' }}>trader</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '15px' }}>
            Safety-First Algorithmic Trading Platform
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <GoogleSignIn onSuccess={handleSuccess} onError={handleError} />
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '24px' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            By signing in, you agree to our Terms of Service and Risk Disclosure Statement. Live trading involves substantial risk of loss.
          </p>
        </div>
      </div>
    </div>
  );
}
