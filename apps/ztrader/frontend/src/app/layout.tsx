// ZeaZDev [Frontend Root Layout] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //

import React from 'react';
import './global.css';

export const metadata = {
  title: 'ztrader Unified Trading Platform',
  description: 'Safety-First Multi-Language Algorithmic Trading Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
