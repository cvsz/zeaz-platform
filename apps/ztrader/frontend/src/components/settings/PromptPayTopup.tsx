// ZeaZDev [PromptPay Topup Component] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - PromptPay Integration) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function PromptPayTopup() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(500);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'waiting' | 'success'>('idle');
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentStatus === 'waiting' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && paymentStatus === 'waiting') {
      setPaymentStatus('idle');
      setShowQR(false);
    }
    return () => clearTimeout(timer);
  }, [paymentStatus, countdown]);

  useEffect(() => {
    // Simulate transaction auto-completion for demonstration purposes after 8 seconds of scanning
    let checkTimer: NodeJS.Timeout;
    if (paymentStatus === 'waiting') {
      checkTimer = setTimeout(() => {
        setPaymentStatus('success');
      }, 8000);
    }
    return () => clearTimeout(checkTimer);
  }, [paymentStatus]);

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setShowQR(true);
    setPaymentStatus('waiting');
    setCountdown(120);
  };

  const handleReset = () => {
    setPaymentStatus('idle');
    setShowQR(false);
    setAmount(500);
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
      fontFamily: "'Outfit', sans-serif",
      textAlign: 'center',
    }}>
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', textAlign: 'left' }}>
        {t('topup.action')}
      </h3>

      {paymentStatus === 'idle' && (
        <form onSubmit={handleGenerateQR} style={{ textAlign: 'left' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
            Renew or top-up your ztrader bot rental subscription securely via PromptPay instant transfer.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: '#9ca3af' }}>
              Select Top-up Amount (THB)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
              {[300, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  style={{
                    padding: '10px',
                    backgroundColor: amount === val ? '#3B82F6' : 'rgba(31, 41, 55, 0.5)',
                    color: amount === val ? 'white' : '#9ca3af',
                    border: amount === val ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  ฿{val}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Or enter custom amount"
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
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
          >
            Generate PromptPay QR
          </button>
        </form>
      )}

      {paymentStatus === 'waiting' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            marginBottom: '16px',
            display: 'inline-block',
            position: 'relative'
          }}>
            {/* Mock PromptPay Header Header */}
            <div style={{
              backgroundColor: '#003764',
              color: 'white',
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 8px',
              borderRadius: '4px',
              marginBottom: '8px',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}>
              PromptPay
            </div>

            {/* Mock QR Code Pattern with Scanning Lines Overlay */}
            <div style={{
              width: '200px',
              height: '200px',
              background: 'repeating-linear-gradient(45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)',
              border: '2px dashed #003764',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Scan sweep line */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '3px',
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981',
                animation: 'sweep 2s linear infinite',
                top: 0
              }}></div>

              {/* Inner details mockup */}
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#003764',
                color: 'white',
                fontSize: '9px',
                fontWeight: '700',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                ฿{amount}
              </div>
            </div>
          </div>

          <strong style={{ fontSize: '20px', color: '#f3f4f6', marginBottom: '4px' }}>
            ฿{amount.toFixed(2)} THB
          </strong>
          <span style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              animation: 'pulse 1.5s infinite'
            }}></div>
            Waiting for payment verification ({countdown}s)
          </span>

          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
            fontSize: '32px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            ✓
          </div>

          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#10B981', marginBottom: '8px' }}>
            Payment Successful!
          </h4>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
            ฿{amount.toFixed(2)} THB has been credited. Your ztrader bot rental subscription has been renewed.
          </p>

          <button
            onClick={handleReset}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
          >
            Done
          </button>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes sweep {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
