// ZeaZDev [Theme Customizer Component] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - Theme Settings) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeCustomizer() {
  const { t } = useTranslation();
  const {
    theme,
    setTheme,
    primaryColor,
    secondaryColor,
    accentColor,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
  } = useTheme();

  const [tempPrimaryColor, setTempPrimaryColor] = useState(primaryColor);
  const [tempSecondaryColor, setTempSecondaryColor] = useState(secondaryColor);
  const [tempAccentColor, setTempAccentColor] = useState(accentColor);

  const handleApplyColors = () => {
    setPrimaryColor(tempPrimaryColor || '#3B82F6');
    setSecondaryColor(tempSecondaryColor || '#8B5CF6');
    setAccentColor(tempAccentColor || '#10B981');
  };

  const handleResetColors = () => {
    const defaultPrimary = '#3B82F6';
    const defaultSecondary = '#8B5CF6';
    const defaultAccent = '#10B981';

    setTempPrimaryColor(defaultPrimary);
    setTempSecondaryColor(defaultSecondary);
    setTempAccentColor(defaultAccent);
    setPrimaryColor(defaultPrimary);
    setSecondaryColor(defaultSecondary);
    setAccentColor(defaultAccent);
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
      <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>{t('theme.customize')}</h3>

      {/* Theme Mode Selection */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500', color: '#9ca3af' }}>
          Theme Mode
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(['light', 'dark', 'auto'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: theme === mode ? '#3B82F6' : 'rgba(31, 41, 55, 0.5)',
                color: theme === mode ? 'white' : '#9ca3af',
                border: theme === mode ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                if (theme !== mode) {
                  e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
                  e.currentTarget.style.color = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (theme !== mode) {
                  e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.5)';
                  e.currentTarget.style.color = '#9ca3af';
                }
              }}
            >
              {mode === 'light' ? '☀️ ' : mode === 'dark' ? '🌙 ' : '🔄 '}
              {t(`theme.${mode}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600', color: '#f3f4f6' }}>Custom Accent Colors</h4>

        {[
          { label: 'Primary Color', state: tempPrimaryColor, setState: setTempPrimaryColor },
          { label: 'Secondary Color', state: tempSecondaryColor, setState: setTempSecondaryColor },
          { label: 'Accent Color', state: tempAccentColor, setState: setTempAccentColor },
        ].map((item, idx) => (
          <div key={idx} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>
              {item.label}
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={item.state}
                onChange={(e) => item.setState(e.target.value)}
                style={{ width: '48px', height: '38px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }}
              />
              <input
                type="text"
                value={item.state}
                onChange={(e) => item.setState(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: 'rgba(31, 41, 55, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={handleApplyColors}
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Apply Colors
          </button>
          <button
            onClick={handleResetColors}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(75, 85, 99, 0.5)',
              color: '#f3f4f6',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.5)'}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(31, 41, 55, 0.3)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <h4 style={{ marginBottom: '12px', fontSize: '14px', color: '#9ca3af' }}>Theme Preview</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Primary', color: tempPrimaryColor },
            { label: 'Secondary', color: tempSecondaryColor },
            { label: 'Accent', color: tempAccentColor },
          ].map((c, idx) => (
            <div
              key={idx}
              style={{
                width: '74px',
                height: '74px',
                backgroundColor: c.color,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
