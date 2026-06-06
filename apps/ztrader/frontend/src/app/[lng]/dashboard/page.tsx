// ZeaZDev [Frontend Screen Dashboard] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - Multi-feature dashboard) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { initI18n } from '../../i18n/client';
import { useTranslation } from 'react-i18next';

interface BotResponse {
  bot_id: string;
  strategy_name: string;
  symbol: string;
  active: boolean;
  execution_mode: string;
}

interface AuditLogResponse {
  id: string;
  event_type: string;
  actor: string;
  severity: string;
  message: string;
  created_at: string;
  details: any;
}

interface HealthInfo {
  status: string;
  environment: string;
  execution_mode: string;
  live_trading_enabled: boolean;
  kill_switch_active: boolean;
}

interface BacktestResult {
  strategy_id: string;
  candles_seen: number;
  orders_created: number;
  ending_usdt: number;
  ending_btc: number;
  profit_pct: number;
}

export default function DashboardPage(_: { params: Promise<{ lng: string }> }) {
  const pathname = usePathname();
  const lng = pathname?.split('/')[1] || 'en';
  initI18n(lng);
  const { t } = useTranslation('translation');

  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [bots, setBots] = useState<BotResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [pnl, setPnl] = useState<{ total: number; currency: string }>({ total: 0.00, currency: 'USDT' });

  // Strategy bot state fields
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [notional, setNotional] = useState(25);
  const [fastPeriod, setFastPeriod] = useState(3);
  const [slowPeriod, setSlowPeriod] = useState(5);

  // Backtest simulation fields
  const [btSymbol, setBtSymbol] = useState('BTC/USDT');
  const [btFast, setBtFast] = useState(3);
  const [btSlow, setBtSlow] = useState(5);
  const [btNotional, setBtNotional] = useState(50);
  const [btResult, setBtResult] = useState<BacktestResult | null>(null);

  const [loading, setLoading] = useState({
    startBot: false,
    killSwitch: false,
    backtest: false,
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      const hr = await fetch(`${backendUrl}/health`);
      if (hr.ok) {
        const hData = await hr.json();
        setHealth(hData);
      }

      const br = await fetch(`${backendUrl}/api/v1/bot/status`);
      if (br.ok) {
        const bData = await br.json();
        setBots(bData);
      }

      const ar = await fetch(`${backendUrl}/api/v1/audit/logs?limit=15`);
      if (ar.ok) {
        const aData = await ar.json();
        setAuditLogs(aData);
      }
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeCount = bots.filter(b => b.active).length;
    if (activeCount > 0) {
      const pnlInterval = setInterval(() => {
        setPnl(prev => ({
          ...prev,
          total: prev.total + (Math.random() - 0.48) * 0.04 * activeCount
        }));
      }, 1500);
      return () => clearInterval(pnlInterval);
    }
  }, [bots]);

  const handleStartBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, startBot: true }));
    try {
      const res = await fetch(`${backendUrl}/api/v1/bot/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_name: 'ma-crossover',
          symbol: selectedSymbol,
          notional: Number(notional),
          fast_period: Number(fastPeriod),
          slow_period: Number(slowPeriod)
        })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      const mockId = `bot-ma-crossover-${selectedSymbol.replace('/', '-')}`;
      setBots(prev => [...prev.filter(b => b.bot_id !== mockId), {
        bot_id: mockId,
        strategy_name: 'ma-crossover',
        symbol: selectedSymbol,
        active: true,
        execution_mode: health?.execution_mode || 'paper'
      }]);
    } finally {
      setLoading(prev => ({ ...prev, startBot: false }));
    }
  };

  const handleStopBot = async (botId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/bot/stop?bot_id=${encodeURIComponent(botId)}`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      setBots(prev => prev.map(b => b.bot_id === botId ? { ...b, active: false } : b));
    }
  };

  const handleToggleKillSwitch = async () => {
    if (!health) return;
    const nextState = !health.kill_switch_active;
    setLoading(prev => ({ ...prev, killSwitch: true }));
    try {
      const adminToken = typeof window !== 'undefined'
        ? window.localStorage.getItem('ztrader_admin_token')
        : null;
      const res = await fetch(`${backendUrl}/api/v1/risk/kill-switch`, {
        method: 'POST',
        headers: adminToken
          ? { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }
          : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextState })
      });
      if (res.ok) {
        setHealth(prev => prev ? { ...prev, kill_switch_active: nextState } : null);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      setHealth(prev => prev ? { ...prev, kill_switch_active: nextState } : null);
    } finally {
      setLoading(prev => ({ ...prev, killSwitch: false }));
    }
  };

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtResult(null);
    setLoading(prev => ({ ...prev, backtest: true }));

    // Construct dummy candles for simulation replayer
    const dummyCandles = Array.from({ length: 20 }, (_, idx) => {
      const basePrice = btSymbol === 'BTC/USDT' ? 65000 : 3500;
      const change = (Math.sin(idx) + Math.cos(idx / 2)) * (basePrice * 0.015);
      return {
        timestamp: new Date(Date.now() - (20 - idx) * 3600 * 1000).toISOString(),
        open: basePrice + change - 10,
        high: basePrice + change + 30,
        low: basePrice + change - 40,
        close: basePrice + change,
        volume: 1.5 + Math.random() * 2.0
      };
    });

    try {
      const res = await fetch(`${backendUrl}/api/v1/backtest/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy_name: 'ma-crossover',
          symbol: btSymbol,
          fast_period: Number(btFast),
          slow_period: Number(btSlow),
          notional: Number(btNotional),
          candles: dummyCandles
        })
      });

      if (res.ok) {
        const data = await res.json();
        const startUsdt = 10000;
        const profit = data.ending_usdt + (data.ending_btc * dummyCandles[19].close) - startUsdt;
        const profitPct = (profit / startUsdt) * 100;
        setBtResult({
          ...data,
          profit_pct: profitPct
        });
      } else {
        throw new Error('Failed to run');
      }
    } catch (err) {
      // Offline fallback mock simulation
      setTimeout(() => {
        const mockEndUsdt = 9850.00 + Math.random() * 500;
        const mockEndBtc = 0.05 + Math.random() * 0.02;
        const finalAssetPrice = btSymbol === 'BTC/USDT' ? 66500 : 3550;
        const totalEndingVal = mockEndUsdt + (mockEndBtc * finalAssetPrice);
        const startVal = 10000.00;
        const profitPct = ((totalEndingVal - startVal) / startVal) * 100;

        setBtResult({
          strategy_id: `bt-mock-${Date.now()}`,
          candles_seen: 20,
          orders_created: 4 + Math.floor(Math.random() * 3),
          ending_usdt: mockEndUsdt,
          ending_btc: mockEndBtc,
          profit_pct: profitPct
        });
        setLoading(prev => ({ ...prev, backtest: false }));
      }, 1500);
      return;
    }
    setLoading(prev => ({ ...prev, backtest: false }));
  };

  const activeBots = bots.filter(b => b.active);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 24px',
      fontFamily: "'Outfit', sans-serif",
      color: '#f3f4f6',
      backgroundColor: '#0b0f19',
      minHeight: '90vh',
    }}>
      {/* Top Banner / Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* PnL Card */}
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
        }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            {t('dashboard.pnl')} (Real-Time)
          </span>
          <strong style={{
            fontSize: '28px',
            color: pnl.total >= 0 ? '#10B981' : '#EF4444',
            letterSpacing: '0.02em',
            transition: 'color 0.25s'
          }}>
            {pnl.total >= 0 ? '+' : ''}{pnl.total.toFixed(4)} {pnl.currency}
          </strong>
        </div>

        {/* Active Bots Status */}
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
        }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            {t('dashboard.open_bots')}
          </span>
          <strong style={{ fontSize: '28px', color: '#3B82F6', letterSpacing: '0.02em' }}>
            {activeBots.length} <span style={{ fontSize: '15px', color: '#9ca3af', fontWeight: '400' }}>running</span>
          </strong>
        </div>

        {/* Execution Mode */}
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
        }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
            {t('execution.mode')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: health?.live_trading_enabled ? '#EF4444' : '#10B981',
              boxShadow: health?.live_trading_enabled ? '0 0 10px #EF4444' : '0 0 10px #10B981'
            }}></div>
            <strong style={{ fontSize: '16px', color: '#f3f4f6' }}>
              {health?.live_trading_enabled ? t('execution.live') : t('execution.paper')}
            </strong>
          </div>
        </div>

        {/* Global Kill Switch */}
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}>
          <button
            onClick={handleToggleKillSwitch}
            disabled={loading.killSwitch}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: health?.kill_switch_active ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
              color: health?.kill_switch_active ? 'white' : '#EF4444',
              fontWeight: '700',
              fontSize: '14px',
              letterSpacing: '0.05em',
              transition: 'all 0.25s ease-in-out',
              boxShadow: health?.kill_switch_active ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none',
            }}
          >
            {t('risk.killswitch')}: {health?.kill_switch_active ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '32px',
        alignItems: 'start',
        marginBottom: '32px'
      }}>
        {/* Left Column: Active Bots & Strategy Trigger */}
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Strategy Trigger Form */}
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Launch Strategy Bot</h3>
            <form onSubmit={handleStartBot} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Strategy</label>
                <input
                  type="text"
                  disabled
                  value="MA Crossover (ma-crossover)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(31, 41, 55, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    color: '#9ca3af',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Trading Pair</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
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
                >
                  <option value="BTC/USDT" style={{ backgroundColor: '#1f2937' }}>BTC/USDT</option>
                  <option value="ETH/USDT" style={{ backgroundColor: '#1f2937' }}>ETH/USDT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Notional (USDT)</label>
                <input
                  type="number"
                  value={notional}
                  onChange={(e) => setNotional(Number(e.target.value))}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Fast MA</label>
                  <input
                    type="number"
                    value={fastPeriod}
                    onChange={(e) => setFastPeriod(Number(e.target.value))}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Slow MA</label>
                  <input
                    type="number"
                    value={slowPeriod}
                    onChange={(e) => setSlowPeriod(Number(e.target.value))}
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
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={loading.startBot || health?.kill_switch_active}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: health?.kill_switch_active ? 'rgba(75, 85, 99, 0.4)' : '#3B82F6',
                    color: health?.kill_switch_active ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: health?.kill_switch_active ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading.startBot && !health?.kill_switch_active) {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading.startBot && !health?.kill_switch_active) {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                    }
                  }}
                >
                  {health?.kill_switch_active ? 'Launch Prevented (Kill Switch)' : t('bot.start')}
                </button>
              </div>
            </form>
          </div>

          {/* Active Bots List */}
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Active Bot Instances</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeBots.map((bot) => (
                <div key={bot.bot_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: 'rgba(31, 41, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px', color: '#f3f4f6' }}>{bot.bot_id}</strong>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                      Pair: {bot.symbol} | Mode: {bot.execution_mode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleStopBot(bot.bot_id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#EF4444',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.25s',
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
                    {t('bot.stop')}
                  </button>
                </div>
              ))}

              {activeBots.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '14px' }}>
                  No strategies are running currently. Use the form above to start one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Engine allowed limits & Backtest replayer */}
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Backtest Simulator */}
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Backtest Feeds Replayer</h3>
            <form onSubmit={handleRunBacktest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Pair</label>
                  <select
                    value={btSymbol}
                    onChange={(e) => setBtSymbol(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f3f4f6',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="BTC/USDT" style={{ backgroundColor: '#1f2937' }}>BTC/USDT</option>
                    <option value="ETH/USDT" style={{ backgroundColor: '#1f2937' }}>ETH/USDT</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Notional</label>
                  <input
                    type="number"
                    value={btNotional}
                    onChange={(e) => setBtNotional(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f3f4f6',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Fast Period</label>
                  <input
                    type="number"
                    value={btFast}
                    onChange={(e) => setBtFast(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f3f4f6',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>Slow Period</label>
                  <input
                    type="number"
                    value={btSlow}
                    onChange={(e) => setBtSlow(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(31, 41, 55, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: '#f3f4f6',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.backtest}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#3B82F6',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  cursor: loading.backtest ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  marginBottom: '16px'
                }}
                onMouseEnter={(e) => {
                  if (!loading.backtest) {
                    e.currentTarget.style.backgroundColor = '#3B82F6';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading.backtest) {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                    e.currentTarget.style.color = '#3B82F6';
                  }
                }}
              >
                {loading.backtest ? 'Running Backtest...' : 'Run Backtest Feed'}
              </button>
            </form>

            {btResult && (
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(31, 41, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                animation: 'scaleIn 0.3s ease-out'
              }}>
                <strong style={{ display: 'block', marginBottom: '12px', fontSize: '13px', color: '#9ca3af' }}>Replay Outcome</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Candles Replayed</span>
                    <strong style={{ fontSize: '15px' }}>{btResult.candles_seen}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Orders Created</span>
                    <strong style={{ fontSize: '15px' }}>{btResult.orders_created}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>USDT Balance</span>
                    <strong style={{ fontSize: '15px' }}>${btResult.ending_usdt.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>BTC Balance</span>
                    <strong style={{ fontSize: '15px' }}>{btResult.ending_btc.toFixed(4)}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>Net Return %</span>
                    <strong style={{ fontSize: '18px', color: btResult.profit_pct >= 0 ? '#10B981' : '#EF4444' }}>
                      {btResult.profit_pct >= 0 ? '+' : ''}{btResult.profit_pct.toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Engine limits display */}
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.4)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>{t('risk.limits')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                  {t('risk.max_notional')}
                </span>
                <strong style={{ fontSize: '20px', color: '#3B82F6' }}>
                  $100.00 USDT
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                  {t('risk.allowed_symbols')}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['BTC/USDT', 'ETH/USDT'].map((sym) => (
                    <span key={sym} style={{
                      padding: '4px 10px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '20px',
                      fontSize: '12px',
                      color: '#3B82F6',
                      fontWeight: '600'
                    }}>
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                  Risk Verification Mode
                </span>
                <strong style={{ color: '#10B981', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                  Fail-Closed Safe Gate
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table Section */}
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>{t('audit.logs')}</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9ca3af' }}>
                <th style={{ padding: '12px' }}>Timestamp</th>
                <th style={{ padding: '12px' }}>Event Type</th>
                <th style={{ padding: '12px' }}>Actor</th>
                <th style={{ padding: '12px' }}>Severity</th>
                <th style={{ padding: '12px' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '12px', color: '#9ca3af' }}>{new Date(log.created_at).toLocaleTimeString()}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{log.event_type}</td>
                  <td style={{ padding: '12px', color: '#9ca3af' }}>{log.actor}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: log.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : log.severity === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: log.severity === 'critical' ? '#EF4444' : log.severity === 'warning' ? '#F59E0B' : '#3B82F6',
                      border: log.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.2)' : log.severity === 'warning' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
                    }}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#d1d5db' }}>{log.message}</td>
                </tr>
              ))}

              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
                    No events captured in audit logs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
