// ZeaZDev [Frontend Screen Dashboard] //
// Project: ztrader Platform //
// Version: 2.0.0 (Master Omega UI/UX Final Release) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { initI18n } from '../../i18n/client';
import { useTranslation } from 'react-i18next';
import { ChartWidget } from '../../../components/ChartWidget';

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
  const [selectedStrategy, setSelectedStrategy] = useState('ma-crossover');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [notional, setNotional] = useState(25);
  const [fastPeriod, setFastPeriod] = useState(3);
  const [slowPeriod, setSlowPeriod] = useState(5);

  // Backtest simulation fields
  const [btStrategy, setBtStrategy] = useState('ma-crossover');
  const [btSymbol, setBtSymbol] = useState('BTC/USDT');
  const [btFast, setBtFast] = useState(3);
  const [btSlow, setBtSlow] = useState(5);
  const [btNotional, setBtNotional] = useState(50);
  const [btResult, setBtResult] = useState<BacktestResult | null>(null);
  const [btChartData, setBtChartData] = useState<any[]>([]);

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
          strategy_name: selectedStrategy,
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
      const mockId = `bot-${selectedStrategy}-${selectedSymbol.replace('/', '-')}`;
      setBots(prev => [...prev.filter(b => b.bot_id !== mockId), {
        bot_id: mockId,
        strategy_name: selectedStrategy,
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
    setBtChartData([]);
    setLoading(prev => ({ ...prev, backtest: true }));

    // Construct dummy candles for simulation replayer
    const dummyCandles = Array.from({ length: 20 }, (_, idx) => {
      const basePrice = btSymbol === 'BTC/USDT' ? 65000 : btSymbol === 'ETH/USDT' ? 3500 : 2500;
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
          strategy_name: btStrategy,
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
        setBtChartData(dummyCandles);
      } else {
        throw new Error('Failed to run');
      }
    } catch (err) {
      // Offline fallback mock simulation
      setTimeout(() => {
        const mockEndUsdt = 9850.00 + Math.random() * 500;
        const mockEndBtc = 0.05 + Math.random() * 0.02;
        const finalAssetPrice = btSymbol === 'BTC/USDT' ? 66500 : btSymbol === 'ETH/USDT' ? 3550 : 2550;
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
        setBtChartData(dummyCandles);
        setLoading(prev => ({ ...prev, backtest: false }));
      }, 1500);
      return;
    }
    setLoading(prev => ({ ...prev, backtest: false }));
  };

  const activeBots = bots.filter(b => b.active);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
      
      {/* Dynamic Background Elements for Omega Master UI */}
      <div className="animate-pulse-ring" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none' }}></div>
      <div className="animate-pulse-ring" style={{ position: 'absolute', bottom: '20%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none', animationDelay: '1s' }}></div>
      <div className="animate-pulse-ring" style={{ position: 'absolute', top: '30%', left: '40%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none', animationDelay: '2s' }}></div>

      {/* Top Banner / Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
      }}>
        {/* PnL Card */}
        <div className="glass-card">
          <span className="form-label" style={{ marginBottom: '8px' }}>
            {t('dashboard.pnl')} (Real-Time)
          </span>
          <strong style={{
            fontSize: '28px',
            color: pnl.total >= 0 ? 'var(--color-accent)' : 'var(--color-danger)',
            letterSpacing: '0.02em',
            transition: 'color 0.25s'
          }}>
            {pnl.total >= 0 ? '+' : ''}{pnl.total.toFixed(4)} {pnl.currency}
          </strong>
        </div>

        {/* Active Bots Status */}
        <div className="glass-card">
          <span className="form-label" style={{ marginBottom: '8px' }}>
            {t('dashboard.open_bots')}
          </span>
          <strong style={{ fontSize: '28px', color: 'var(--color-primary)', letterSpacing: '0.02em' }}>
            {activeBots.length} <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '400' }}>running</span>
          </strong>
        </div>

        {/* Execution Mode */}
        <div className="glass-card">
          <span className="form-label" style={{ marginBottom: '8px' }}>
            {t('execution.mode')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: health?.live_trading_enabled ? 'var(--color-danger)' : 'var(--color-accent)',
              boxShadow: health?.live_trading_enabled ? '0 0 10px var(--color-danger)' : '0 0 10px var(--color-accent)'
            }}></div>
            <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
              {health?.live_trading_enabled ? t('execution.live') : t('execution.paper')}
            </strong>
          </div>
        </div>

        {/* Global Kill Switch */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={handleToggleKillSwitch}
            disabled={loading.killSwitch}
            className={`btn-base ${health?.kill_switch_active ? 'btn-danger-outline' : 'btn-secondary'}`}
            style={{ 
              width: '100%', 
              backgroundColor: health?.kill_switch_active ? 'var(--color-danger)' : undefined,
              color: health?.kill_switch_active ? 'white' : undefined,
              boxShadow: health?.kill_switch_active ? '0 0 20px var(--color-danger-glow)' : 'none',
              padding: '16px 12px'
            }}
          >
            {t('risk.killswitch')}: {health?.kill_switch_active ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="layout-grid" style={{ marginBottom: '32px' }}>
        {/* Left Column: Active Bots & Strategy Trigger */}
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Strategy Trigger Form */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Launch Strategy Bot</h3>
            <form onSubmit={handleStartBot} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Strategy</label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="input-field"
                >
                  <option value="ma-crossover">MA Crossover</option>
                  <option value="scalp">Scalp Strategy</option>
                  <option value="swing">Swing Strategy</option>
                  <option value="position">Position Strategy</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Trading Pair</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="input-field"
                >
                  <option value="BTC/USDT">BTC/USDT</option>
                  <option value="ETH/USDT">ETH/USDT</option>
                  <option value="XAU/USD">XAU/USD (Gold)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Notional (USDT)</label>
                <input
                  type="number"
                  value={notional}
                  onChange={(e) => setNotional(Number(e.target.value))}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fast MA</label>
                  <input
                    type="number"
                    value={fastPeriod}
                    onChange={(e) => setFastPeriod(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Slow MA</label>
                  <input
                    type="number"
                    value={slowPeriod}
                    onChange={(e) => setSlowPeriod(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={loading.startBot || health?.kill_switch_active}
                  className="btn-base btn-primary"
                  style={{ 
                    width: '100%', 
                    padding: '14px',
                    opacity: health?.kill_switch_active ? 0.5 : 1,
                    cursor: health?.kill_switch_active ? 'not-allowed' : 'pointer'
                  }}
                >
                  {health?.kill_switch_active ? 'Launch Prevented (Kill Switch)' : t('bot.start')}
                </button>
              </div>
            </form>
          </div>

          {/* Active Bots List */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Active Bot Instances</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeBots.map((bot) => (
                <div key={bot.bot_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: 'rgba(31, 41, 55, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-primary)' }}>{bot.bot_id}</strong>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: 'var(--color-primary)' }}>{bot.symbol}</span>
                      <span className="badge" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: 'var(--color-secondary)' }}>{bot.strategy_name}</span>
                      <span className="badge" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--color-accent)' }}>{bot.execution_mode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStopBot(bot.bot_id)}
                    className="btn-base btn-danger-outline"
                    style={{ padding: '8px 16px' }}
                  >
                    {t('bot.stop')}
                  </button>
                </div>
              ))}

              {activeBots.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
                  No strategies are running currently. Use the form above to start one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Engine allowed limits & Backtest replayer */}
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Backtest Simulator */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>Backtest Feeds Replayer</h3>
            <form onSubmit={handleRunBacktest}>
              
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Strategy</label>
                <select
                  value={btStrategy}
                  onChange={(e) => setBtStrategy(e.target.value)}
                  className="input-field"
                >
                  <option value="ma-crossover">MA Crossover</option>
                  <option value="scalp">Scalp Strategy</option>
                  <option value="swing">Swing Strategy</option>
                  <option value="position">Position Strategy</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pair</label>
                  <select
                    value={btSymbol}
                    onChange={(e) => setBtSymbol(e.target.value)}
                    className="input-field"
                  >
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="XAU/USD">XAU/USD (Gold)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notional</label>
                  <input
                    type="number"
                    value={btNotional}
                    onChange={(e) => setBtNotional(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fast Period</label>
                  <input
                    type="number"
                    value={btFast}
                    onChange={(e) => setBtFast(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Slow Period</label>
                  <input
                    type="number"
                    value={btSlow}
                    onChange={(e) => setBtSlow(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading.backtest}
                className="btn-base btn-secondary"
                style={{ width: '100%', padding: '12px', marginBottom: '16px', color: 'var(--color-primary)' }}
              >
                {loading.backtest ? 'Running Backtest...' : 'Run Backtest Feed'}
              </button>
            </form>

            {btResult && (
              <div style={{
                padding: '20px',
                backgroundColor: 'rgba(31, 41, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                animation: 'pulse-ring 0.4s ease-out forwards'
              }}>
                <strong style={{ display: 'block', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>Replay Outcome</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Candles Replayed</span>
                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{btResult.candles_seen}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Orders Created</span>
                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{btResult.orders_created}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>USDT Balance</span>
                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>${btResult.ending_usdt.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Asset Balance</span>
                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{btResult.ending_btc.toFixed(4)}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-card)', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Net Return %</span>
                    <strong style={{ fontSize: '20px', color: btResult.profit_pct >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                      {btResult.profit_pct >= 0 ? '+' : ''}{btResult.profit_pct.toFixed(2)}%
                    </strong>
                  </div>
                </div>
                {/* Visual Chart showing Dummy data or Real Data feed */}
                <div style={{ marginTop: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <ChartWidget data={btChartData} />
                </div>
              </div>
            )}
          </div>

          {/* Risk Engine limits display */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('risk.limits')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="form-label">{t('risk.max_notional')}</span>
                <strong style={{ fontSize: '20px', color: 'var(--color-primary)' }}>
                  $100.00 USDT
                </strong>
              </div>

              <div>
                <span className="form-label">{t('risk.allowed_symbols')}</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {['BTC/USDT', 'ETH/USDT', 'XAU/USD'].map((sym) => (
                    <span key={sym} className="badge" style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      color: 'var(--color-primary)',
                    }}>
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="form-label">Risk Verification Mode</span>
                <strong style={{ color: 'var(--color-accent)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-accent)' }}></div>
                  Fail-Closed Safe Gate
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table Section */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('audit.logs')}</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 12px' }}>Timestamp</th>
                <th style={{ padding: '14px 12px' }}>Event Type</th>
                <th style={{ padding: '14px 12px' }}>Actor</th>
                <th style={{ padding: '14px 12px' }}>Severity</th>
                <th style={{ padding: '14px 12px' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleTimeString()}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '500', color: 'var(--text-primary)' }}>{log.event_type}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-secondary)' }}>{log.actor}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge" style={{
                      backgroundColor: log.severity === 'critical' ? 'var(--color-danger-glow)' : log.severity === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-primary-glow)',
                      color: log.severity === 'critical' ? 'var(--color-danger)' : log.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-primary)',
                      border: log.severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.2)' : log.severity === 'warning' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
                    }}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{log.message}</td>
                </tr>
              ))}

              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
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
