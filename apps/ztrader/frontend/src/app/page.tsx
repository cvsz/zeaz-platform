// ZeaZDev [Frontend Root Page Redirect] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/en/dashboard');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0b0f19',
      color: '#f3f4f6',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <p style={{ fontSize: '18px', letterSpacing: '0.05em' }}>Redirecting to dashboard...</p>
    </div>
  );
}
