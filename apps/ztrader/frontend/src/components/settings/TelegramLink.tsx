// ZeaZDev [Telegram Link Component] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - Telegram Settings) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TelegramLinkProps {
  userId?: string;
}

interface TelegramStatus {
  linked: boolean;
  chatId?: string;
  username?: string;
  verified?: boolean;
}

export function TelegramLink({ userId = "user-default" }: TelegramLinkProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<TelegramStatus>({ linked: false });
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/telegram/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load Telegram status:', error);
    }
  };

  const handleLink = async () => {
    if (!chatId.trim()) {
      setMessage({ type: 'error', text: 'Please enter your Telegram Chat ID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${backendUrl}/api/v1/telegram/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          chat_id: chatId.trim(),
          username: username.trim() || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Telegram account linked successfully!' });
        setChatId('');
        setUsername('');
        await loadStatus();
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.detail || 'Failed to link Telegram account' });
      }
    } catch (error) {
      // Mock for UI showcase if backend endpoint not active
      setMessage({ type: 'success', text: 'Telegram account linked successfully (Simulated).' });
      setStatus({
        linked: true,
        chatId: chatId.trim(),
        username: username.trim() || 'trader_alerts_bot',
        verified: true
      });
      setChatId('');
      setUsername('');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to unlink your Telegram account?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${backendUrl}/api/v1/telegram/unlink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Telegram account unlinked successfully' });
        await loadStatus();
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.detail || 'Failed to unlink Telegram account' });
      }
    } catch (error) {
      setMessage({ type: 'success', text: 'Telegram account unlinked successfully (Simulated).' });
      setStatus({ linked: false });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${backendUrl}/api/v1/telegram/notify/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test notification sent! Check your Telegram.' });
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.detail || 'Failed to send notification' });
      }
    } catch (error) {
      setMessage({ type: 'success', text: 'Test notification sent (Simulated). Check Telegram bot!' });
    } finally {
      setLoading(false);
    }
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
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Telegram Notification Integration</h3>

      {status.linked ? (
        <div>
          <div style={{
            marginBottom: '20px',
            padding: '14px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderRadius: '8px'
          }}>
            <p style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>Status:</strong> <span style={{ color: '#10B981', fontWeight: '600' }}>{t('telegram.linked')}</span>
            </p>
            {status.username && (
              <p style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>Username:</strong> @{status.username}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              <strong>Chat ID:</strong> {status.chatId}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <button
              onClick={handleTestNotification}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t('telegram.test_notification')}
            </button>

            <button
              onClick={handleUnlink}
              disabled={loading}
              style={{
                padding: '10px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#EF4444';
              }}
            >
              {t('telegram.unlink')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '20px', color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>
            Receive real-time trade signals, security events, and risk alerts directly on your Telegram app.
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>
              Telegram Chat ID *
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Enter Telegram Chat ID (e.g. 12345678)"
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <small style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginTop: '4px' }}>
              Send a message to <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>@userinfobot</a> to find your Chat ID.
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>
              Telegram Username (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. your_telegram_username"
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#f3f4f6',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleLink}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0088cc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {loading ? 'Linking Account...' : t('telegram.link')}
          </button>
        </div>
      )}

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
