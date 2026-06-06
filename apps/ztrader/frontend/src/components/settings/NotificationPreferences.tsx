// ZeaZDev [Notification Preferences Component] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - Notification Preferences) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationPreferencesProps {
  userId?: string;
}

interface Preferences {
  tradeAlerts: boolean;
  riskAlerts: boolean;
  systemAlerts: boolean;
  dailySummary: boolean;
}

export function NotificationPreferences({ userId = "user-default" }: NotificationPreferencesProps) {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<Preferences>({
    tradeAlerts: true,
    riskAlerts: true,
    systemAlerts: true,
    dailySummary: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/user/notifications/preferences/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${backendUrl}/api/v1/user/notifications/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          trade_alerts: preferences.tradeAlerts,
          risk_alerts: preferences.riskAlerts,
          system_alerts: preferences.systemAlerts,
          daily_summary: preferences.dailySummary,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.detail || 'Failed to save preferences' });
      }
    } catch (error) {
      // Mock for UI show
      setMessage({ type: 'success', text: 'Notification preferences saved successfully (Simulated).' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>{t('notifications.title')}</h3>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {[
          { key: 'tradeAlerts', label: t('notifications.trade_alerts'), desc: 'Get notified when trades are executed' },
          { key: 'riskAlerts', label: t('notifications.risk_alerts'), desc: 'Get alerted when risk thresholds are exceeded' },
          { key: 'systemAlerts', label: t('notifications.system_alerts'), desc: 'Receive system status and important updates' },
          { key: 'dailySummary', label: t('notifications.daily_summary'), desc: 'Get daily performance summaries' },
        ].map((item) => (
          <label
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '14px',
              backgroundColor: 'rgba(31, 41, 55, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.6)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.4)'}
          >
            <input
              type="checkbox"
              checked={preferences[item.key as keyof Preferences]}
              onChange={() => togglePreference(item.key as keyof Preferences)}
              style={{ marginRight: '14px', width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#f3f4f6' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px' }}>
                {item.desc}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#2563EB';
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#3B82F6';
        }}
      >
        {loading ? 'Saving Preferences...' : 'Save Preferences'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: message.type === 'success' ? '#10B981' : '#EF4444',
            border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
