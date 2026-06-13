"use client";

import React, { useEffect } from 'react';
import { initI18n } from '../../i18n/client';
import { useTranslation } from 'react-i18next';
import { GoogleSignIn } from '../../../components/auth/GoogleSignIn';
import { usePathname, useRouter } from 'next/navigation';

export default function LoginPage() {
  const pathname = usePathname();
  const lng = pathname?.split('/')[1] || 'en';
  initI18n(lng);
  const { t } = useTranslation('translation');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : '',
    );
    const token = params.get('token');
    const error = params.get('error');
    if (token) {
      localStorage.setItem('ztrader_admin_token', token);
      const clean = pathname.replace(/\?.*$/, '');
      router.replace(clean);
      router.push(`/${lng}/dashboard`);
    } else if (error) {
      console.error('OAuth error:', error);
    }
  }, [lng, pathname, router]);

  const handleSuccess = (user: unknown) => {
    console.log('Login successful:', user);
    router.push(`/${lng}/dashboard`);
  };

  const handleError = (error: string) => {
    console.error('Login error:', error);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '700px',
          height: '700px',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card-static animate-fade-in"
        style={{
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          padding: '48px 36px',
          margin: '0 20px',
          position: 'relative',
        }}
      >
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'var(--color-primary-bg)',
              border: '1px solid var(--color-primary-border)',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-glow-primary)',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                boxShadow: '0 0 12px var(--color-primary)',
              }}
            />
          </div>
          <h1
            className="h1"
            style={{ marginBottom: '8px', letterSpacing: '-0.02em' }}
          >
            z<span className="text-primary-color">trader</span>
          </h1>
          <p className="text-secondary" style={{ fontSize: '15px' }}>
            {t('login.subtitle')}
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <GoogleSignIn onSuccess={handleSuccess} onError={handleError} />
        </div>

        <div className="divider" />
        <p
          className="text-muted"
          style={{ fontSize: '13px', lineHeight: '1.6', marginTop: '20px' }}
        >
          {t('login.disclaimer')}
        </p>
      </div>
    </div>
  );
}
