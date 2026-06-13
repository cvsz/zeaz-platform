"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

export function TelegramLink({
  userId = 'user-default',
}: TelegramLinkProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<TelegramStatus>({ linked: false });
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/v1/telegram/status/${userId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load Telegram status:', error);
    }
  }, [backendUrl, userId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleLink = async () => {
    if (!chatId.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter your Telegram Chat ID',
      });
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
        setMessage({
          type: 'success',
          text: 'Telegram account linked successfully!',
        });
        setChatId('');
        setUsername('');
        await loadStatus();
      } else {
        const err = await response.json();
        setMessage({
          type: 'error',
          text: err.detail || 'Failed to link Telegram account',
        });
      }
    } catch (error) {
      console.error('Telegram link error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to link Telegram account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (
      !confirm('Are you sure you want to unlink your Telegram account?')
    )
      return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(
        `${backendUrl}/api/v1/telegram/unlink`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        },
      );
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Telegram account unlinked successfully',
        });
        await loadStatus();
      } else {
        const err = await response.json();
        setMessage({
          type: 'error',
          text: err.detail || 'Failed to unlink Telegram account',
        });
      }
    } catch (error) {
      console.error('Telegram unlink error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to unlink Telegram account',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(
        `${backendUrl}/api/v1/telegram/notify/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        },
      );
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Test notification sent! Check your Telegram.',
        });
      } else {
        const err = await response.json();
        setMessage({
          type: 'error',
          text: err.detail || 'Failed to send notification',
        });
      }
    } catch (error) {
      console.error('Telegram test notification error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to send test notification',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-static animate-fade-in">
      <h3 className="h3" style={{ marginBottom: '16px' }}>
        Telegram Integration
      </h3>

      {status.linked ? (
        <div>
          <div
            style={{
              marginBottom: '20px',
              padding: '14px',
              background: 'var(--color-primary-bg)',
              border: '1px solid var(--color-primary-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>Status:</strong>{' '}
              <span className="text-accent" style={{ fontWeight: '600' }}>
                {t('telegram.linked')}
              </span>
            </p>
            {status.username && (
              <p style={{ marginBottom: '8px', fontSize: '14px' }}>
                <strong>Username:</strong> @{status.username}
              </p>
            )}
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}
            >
              <strong>Chat ID:</strong> {status.chatId}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleTestNotification}
              disabled={loading}
              className="btn-base btn-accent btn-sm"
              style={{ flex: 1 }}
            >
              {t('telegram.test_notification')}
            </button>
            <button
              onClick={handleUnlink}
              disabled={loading}
              className="btn-base btn-danger btn-sm"
            >
              {t('telegram.unlink')}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p
            className="text-secondary"
            style={{
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            Receive real-time trade signals, security events, and risk
            alerts directly on your Telegram app.
          </p>
          <div className="form-group">
            <label className="form-label">Telegram Chat ID *</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Enter Telegram Chat ID (e.g. 12345678)"
              className="input-field"
            />
            <small
              className="text-muted"
              style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}
            >
              Send a message to{' '}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                @userinfobot
              </a>{' '}
              to find your Chat ID.
            </small>
          </div>
          <div className="form-group">
            <label className="form-label">
              Telegram Username (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. your_telegram_username"
              className="input-field"
            />
          </div>
          <button
            onClick={handleLink}
            disabled={loading}
            className="btn-base btn-primary btn-full"
          >
            {loading ? 'Linking Account...' : t('telegram.link')}
          </button>
        </div>
      )}

      {message && (
        <div
          className={`badge ${message.type === 'success' ? 'badge-accent' : 'badge-danger'}`}
          style={{
            display: 'flex',
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ flexShrink: 0, marginRight: '8px' }}
          >
            {message.type === 'success' ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
