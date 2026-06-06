// ZeaZDev [TradingView Config Component] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - TradingView Webhook) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TVAlert {
  id: string;
  ticker: string;
  exchange: string;
  action: string;
  price?: number;
  strategy?: string;
  interval?: string;
  volume?: number;
  received_at: string;
}

export function TradingViewConfig() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<TVAlert[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:8000/api/v1/tradingview/webhook');
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/tradingview/alerts?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to load TradingView alerts:', err);
    }
  };

  useEffect(() => {
    // Set proper API URL if configured
    setWebhookUrl(`${backendUrl}/api/v1/tradingview/webhook`);
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: 'rgba(17, 24, 39, 0.4)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      color: '#f3f4f6',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>TradingView Webhook Integration</h3>

      <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
        Connect TradingView indicators or strategy alerts directly to ztrader execution gates.
      </p>

      {/* Webhook Configuration Details */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Webhook URL</label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(31, 41, 55, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '8px 12px',
          }}>
            <code style={{ fontSize: '13px', color: '#3B82F6', overflowX: 'auto', flex: 1, whiteSpace: 'nowrap' }}>{webhookUrl}</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                alert('Copied Webhook URL!');
              }}
              style={{
                marginLeft: '10px',
                padding: '4px 8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '4px',
                color: '#3B82F6',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{
          padding: '14px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#F59E0B'
        }}>
          <strong>Required Custom Header:</strong>
          <code style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px', marginTop: '6px', color: '#f3f4f6' }}>
            X-Webhook-Secret: &lt;your-webhook-secret-token&gt;
          </code>
        </div>
      </div>

      {/* Webhook Alerts Log */}
      <div>
        <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>Recent Webhook Signals</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
          {alerts.map((al) => (
            <div key={al.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'rgba(31, 41, 55, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              <div>
                <strong style={{
                  color: al.action === 'BUY' ? '#10B981' : al.action === 'SELL' ? '#EF4444' : '#9ca3af',
                  marginRight: '8px'
                }}>
                  {al.action}
                </strong>
                <span style={{ fontWeight: '600' }}>{al.ticker}</span>
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>({al.strategy})</span>
              </div>
              <span style={{ color: '#9ca3af' }}>
                {al.price ? `$${al.price.toFixed(2)}` : 'Market'}
              </span>
            </div>
          ))}

          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280', fontSize: '13px' }}>
              No webhook alerts captured yet. Configure your indicator on TradingView.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
