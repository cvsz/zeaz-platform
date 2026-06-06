// ZeaZDev [Frontend Admin Control Panel] //
// Project: ztrader Platform //
// Version: 1.0.0 (Admin Control Panel) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { initI18n } from '../../i18n/client';
import { useTranslation } from 'react-i18next';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

interface RentalContract {
  id: string;
  user_id: string;
  user_email: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface RiskConfig {
  kill_switch_active: boolean;
  max_order_notional: number;
  allowed_symbols: string[];
}

interface SystemHealth {
  status: string;
  db_connected: boolean;
  redis_connected: boolean;
  celery_queue_depth: number;
  broker_latency_ms: Record<string, number>;
}

// ── Glassmorphism Style Helpers ──
const glassCard: React.CSSProperties = {
  background: 'rgba(17, 24, 39, 0.45)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '16px',
  padding: '28px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#f3f4f6',
  fontFamily: "'Outfit', sans-serif",
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left' as const,
  padding: '12px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  color: '#9ca3af',
  fontWeight: '600',
  fontSize: '12px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid rgba(255,255,255,0.03)',
  color: '#f3f4f6',
  verticalAlign: 'middle',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'rgba(31, 41, 55, 0.45)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  color: '#f3f4f6',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

const btnPrimary: React.CSSProperties = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: '600',
  fontSize: '14px',
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid transparent',
  cursor: 'pointer',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: '#3B82F6',
  color: 'white',
  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.35)',
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: '#EF4444',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  boxShadow: 'none',
};

const selectStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: 'rgba(31, 41, 55, 0.65)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '6px',
  color: '#f3f4f6',
  fontFamily: "'Outfit', sans-serif",
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
};

const badgeActive: React.CSSProperties = {
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  color: '#10B981',
  border: '1px solid rgba(16, 185, 129, 0.25)',
};

const badgeInactive: React.CSSProperties = {
  ...badgeActive,
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  color: '#EF4444',
  border: '1px solid rgba(239, 68, 68, 0.25)',
};

// ── Shimmer Loading Component ──
function ShimmerBlock({ width = '100%', height = '16px' }: { width?: string; height?: string }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: '6px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

// ── Inline Toast Component ──
function InlineToast({ message, type }: { message: string; type: 'success' | 'error' }) {
  const bg = type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
  const color = type === 'success' ? '#10B981' : '#EF4444';
  const border = type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: '8px',
      backgroundColor: bg,
      color,
      border: `1px solid ${border}`,
      fontSize: '13px',
      fontFamily: "'Outfit', sans-serif",
      fontWeight: '500',
      marginTop: '12px',
      animation: 'fadeIn 0.3s ease',
    }}>
      {type === 'success' ? '✓' : '✕'} {message}
    </div>
  );
}

export default function AdminPage(_: { params: Promise<{ lng: string }> }) {
  const pathname = usePathname();
  const lng = pathname?.split('/')[1] || 'en';
  initI18n(lng);
  const { t } = useTranslation('translation');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const getAdminHeaders = useCallback((headers: HeadersInit = {}) => {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('ztrader_admin_token')
      : null;
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
  }, []);

  // State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [contracts, setContracts] = useState<RentalContract[]>([]);
  const [riskConfig, setRiskConfig] = useState<RiskConfig | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState({ users: true, contracts: true, risk: true, health: true });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Risk edit state
  const [editMaxNotional, setEditMaxNotional] = useState<number>(100);
  const [editAllowedSymbols, setEditAllowedSymbols] = useState<string>('');

  // Contract creation state
  const [newContractUserId, setNewContractUserId] = useState('');
  const [newContractEndDate, setNewContractEndDate] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Data Fetching ──
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/users`, {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [backendUrl, getAdminHeaders]);

  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/contracts`, {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setContracts(data);
      }
    } catch (e) {
      console.error('Failed to fetch contracts:', e);
    } finally {
      setLoading(prev => ({ ...prev, contracts: false }));
    }
  }, [backendUrl, getAdminHeaders]);

  const fetchRiskConfig = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/risk/config`, {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data: RiskConfig = await res.json();
        setRiskConfig(data);
        setEditMaxNotional(data.max_order_notional);
        setEditAllowedSymbols(data.allowed_symbols.join(', '));
      }
    } catch (e) {
      console.error('Failed to fetch risk config:', e);
    } finally {
      setLoading(prev => ({ ...prev, risk: false }));
    }
  }, [backendUrl, getAdminHeaders]);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/system/health`, {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error('Failed to fetch health:', e);
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  }, [backendUrl, getAdminHeaders]);

  useEffect(() => {
    fetchUsers();
    fetchContracts();
    fetchRiskConfig();
    fetchHealth();

    const healthInterval = setInterval(fetchHealth, 15000);
    const dataInterval = setInterval(() => {
      fetchUsers();
      fetchContracts();
      fetchRiskConfig();
    }, 30000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(dataInterval);
    };
  }, [fetchUsers, fetchContracts, fetchRiskConfig, fetchHealth]);

  // ── Kill Switch Toggle ──
  const toggleKillSwitch = async () => {
    if (!riskConfig) return;
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/risk/config`, {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          kill_switch_active: !riskConfig.kill_switch_active,
          max_order_notional: riskConfig.max_order_notional,
          allowed_symbols: riskConfig.allowed_symbols,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRiskConfig(data);
        showToast(
          data.kill_switch_active ? 'Kill Switch activated' : 'Kill Switch deactivated',
          'success'
        );
      }
    } catch (e) {
      showToast('Failed to toggle Kill Switch', 'error');
    }
  };

  // ── User Role Update ──
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        await fetchUsers();
        showToast(`Role updated to ${newRole}`, 'success');
      }
    } catch (e) {
      showToast('Failed to update role', 'error');
    }
  };

  // ── Contract Toggle ──
  const toggleContract = async (contractId: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/contracts/${contractId}/toggle`, {
        method: 'PUT',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        await fetchContracts();
        showToast('Contract status toggled', 'success');
      }
    } catch (e) {
      showToast('Failed to toggle contract', 'error');
    }
  };

  // ── Contract Create ──
  const createContract = async () => {
    if (!newContractUserId || !newContractEndDate) {
      showToast('Please fill in User ID and End Date', 'error');
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/contracts`, {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          user_id: newContractUserId,
          end_date: new Date(newContractEndDate).toISOString(),
          is_active: true,
        }),
      });
      if (res.ok) {
        await fetchContracts();
        setNewContractUserId('');
        setNewContractEndDate('');
        showToast('Contract created successfully', 'success');
      } else {
        const err = await res.json();
        showToast(err.detail || 'Failed to create contract', 'error');
      }
    } catch (e) {
      showToast('Failed to create contract', 'error');
    }
  };

  // ── Risk Config Save ──
  const saveRiskConfig = async () => {
    if (!riskConfig) return;
    try {
      const res = await fetch(`${backendUrl}/api/v1/admin/risk/config`, {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          kill_switch_active: riskConfig.kill_switch_active,
          max_order_notional: editMaxNotional,
          allowed_symbols: editAllowedSymbols.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRiskConfig(data);
        showToast('Risk configuration saved', 'success');
      }
    } catch (e) {
      showToast('Failed to save risk config', 'error');
    }
  };

  // ── Latency Color Helper ──
  const latencyColor = (ms: number) => {
    if (ms < 50) return '#10B981';
    if (ms <= 100) return '#F59E0B';
    return '#EF4444';
  };

  const latencyGlow = (ms: number) => {
    if (ms < 50) return 'rgba(16,185,129,0.2)';
    if (ms <= 100) return 'rgba(245,158,11,0.2)';
    return 'rgba(239,68,68,0.2)';
  };

  const killActive = riskConfig?.kill_switch_active ?? false;

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* ── Shimmer Animation CSS ── */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes killPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        @keyframes safePulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
          50% { box-shadow: 0 0 35px rgba(16, 185, 129, 0.4); }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#f3f4f6',
          fontFamily: "'Outfit', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          🛡️ {t('admin.title')}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
          {t('admin.system_health')} • {new Date().toLocaleString()}
        </p>
      </div>

      {/* ── Toast ── */}
      {toast && <InlineToast message={toast.message} type={toast.type} />}

      {/* ═══ SECTION 1: GLOBAL KILL SWITCH ═══ */}
      <div style={{
        ...glassCard,
        marginBottom: '28px',
        borderColor: killActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.15)',
        animation: killActive ? 'killPulse 2s infinite ease-in-out' : 'safePulse 3s infinite ease-in-out',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={sectionTitle}>
              <span style={{ fontSize: '22px' }}>⚡</span>
              {t('risk.killswitch')}
            </div>
            <p style={{
              color: killActive ? '#EF4444' : '#10B981',
              fontWeight: '700',
              fontSize: '15px',
              letterSpacing: '0.02em',
            }}>
              {killActive ? t('admin.kill_active') : t('admin.kill_inactive')}
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleKillSwitch}
            style={{
              position: 'relative',
              width: '72px',
              height: '36px',
              borderRadius: '18px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: killActive ? '#EF4444' : '#10B981',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: killActive
                ? '0 0 24px rgba(239, 68, 68, 0.5)'
                : '0 0 24px rgba(16, 185, 129, 0.4)',
              outline: 'none',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '3px',
              left: killActive ? '39px' : '3px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Status Indicator Bar */}
        <div style={{
          marginTop: '16px',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: killActive ? '100%' : '0%',
            backgroundColor: killActive ? '#EF4444' : '#10B981',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* ═══ Two-Column Layout ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '28px',
        marginBottom: '28px',
      }}>

        {/* ═══ SECTION 2: USER MANAGEMENT ═══ */}
        <div style={{ ...glassCard, gridColumn: '1 / -1' }}>
          <div style={sectionTitle}>
            <span style={{ fontSize: '20px' }}>👥</span>
            {t('admin.users_title')}
            <span style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '400',
            }}>
              {users.length} {users.length === 1 ? 'user' : 'users'}
            </span>
          </div>

          {loading.users ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ShimmerBlock height="40px" />
              <ShimmerBlock height="40px" />
              <ShimmerBlock height="40px" />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>{t('admin.email')}</th>
                    <th style={thStyle}>{t('admin.name')}</th>
                    <th style={thStyle}>{t('admin.role')}</th>
                    <th style={thStyle}>{t('admin.created')}</th>
                    <th style={thStyle}>{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={tdStyle}>
                        <span style={{ color: '#3B82F6', fontWeight: '500' }}>{user.email}</span>
                      </td>
                      <td style={tdStyle}>{user.name || '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          ...badgeActive,
                          backgroundColor: user.role === 'admin'
                            ? 'rgba(139, 92, 246, 0.15)'
                            : user.role === 'operator'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(107, 114, 128, 0.15)',
                          color: user.role === 'admin'
                            ? '#8B5CF6'
                            : user.role === 'operator'
                              ? '#3B82F6'
                              : '#9ca3af',
                          border: `1px solid ${user.role === 'admin'
                            ? 'rgba(139, 92, 246, 0.3)'
                            : user.role === 'operator'
                              ? 'rgba(59, 130, 246, 0.3)'
                              : 'rgba(107, 114, 128, 0.2)'}`,
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280', fontSize: '13px' }}>
                        {new Date(user.created_at).toLocaleString()}
                      </td>
                      <td style={tdStyle}>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          style={selectStyle}
                        >
                          <option value="user">user</option>
                          <option value="operator">operator</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ═══ SECTION 3: RENTAL CONTRACTS ═══ */}
        <div style={{ ...glassCard, gridColumn: '1 / -1' }}>
          <div style={sectionTitle}>
            <span style={{ fontSize: '20px' }}>📋</span>
            {t('admin.contracts_title')}
            <span style={{
              marginLeft: 'auto',
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '400',
            }}>
              {contracts.length} contracts
            </span>
          </div>

          {loading.contracts ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ShimmerBlock height="40px" />
              <ShimmerBlock height="40px" />
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>{t('admin.contract_user')}</th>
                      <th style={thStyle}>{t('admin.contract_start')}</th>
                      <th style={thStyle}>{t('admin.contract_end')}</th>
                      <th style={thStyle}>{t('admin.contract_status')}</th>
                      <th style={thStyle}>{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((c) => (
                      <tr key={c.id}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={tdStyle}>
                          <span style={{ color: '#3B82F6', fontWeight: '500' }}>
                            {c.user_email || c.user_id.slice(0, 8) + '...'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: '#9ca3af' }}>
                          {new Date(c.start_date).toLocaleDateString()}
                        </td>
                        <td style={{ ...tdStyle, fontSize: '13px', color: '#9ca3af' }}>
                          {new Date(c.end_date).toLocaleDateString()}
                        </td>
                        <td style={tdStyle}>
                          <span style={c.is_active ? badgeActive : badgeInactive}>
                            {c.is_active ? t('admin.contract_active') : t('admin.contract_inactive')}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => toggleContract(c.id)}
                            style={{
                              ...btnDanger,
                              padding: '6px 14px',
                              fontSize: '12px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#EF4444';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              e.currentTarget.style.color = '#EF4444';
                            }}
                          >
                            {t('admin.contract_toggle')}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {contracts.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                          No contracts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Create Contract Form */}
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: 'rgba(31, 41, 55, 0.3)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af', marginBottom: '14px' }}>
                  ＋ {t('admin.contract_create')}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '12px',
                  alignItems: 'end',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      User ID
                    </label>
                    <input
                      type="text"
                      value={newContractUserId}
                      onChange={(e) => setNewContractUserId(e.target.value)}
                      placeholder="UUID"
                      style={inputStyle}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3B82F6';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.35)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      {t('admin.contract_end')}
                    </label>
                    <input
                      type="date"
                      value={newContractEndDate}
                      onChange={(e) => setNewContractEndDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3B82F6';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.35)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <button
                    onClick={createContract}
                    style={btnPrimary}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {t('admin.contract_create')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ Two-Column: Risk Config + System Health ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '28px',
      }}>

        {/* ═══ SECTION 4: RISK PARAMETERS ═══ */}
        <div style={glassCard}>
          <div style={sectionTitle}>
            <span style={{ fontSize: '20px' }}>⚙️</span>
            {t('risk.limits')}
          </div>

          {loading.risk ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <ShimmerBlock height="44px" />
              <ShimmerBlock height="44px" />
              <ShimmerBlock width="120px" height="40px" />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#9ca3af', marginBottom: '8px' }}>
                  {t('risk.max_notional')} (USDT)
                </label>
                <input
                  type="number"
                  value={editMaxNotional}
                  onChange={(e) => setEditMaxNotional(parseFloat(e.target.value) || 0)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.35)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#9ca3af', marginBottom: '8px' }}>
                  {t('risk.allowed_symbols')}
                </label>
                <input
                  type="text"
                  value={editAllowedSymbols}
                  onChange={(e) => setEditAllowedSymbols(e.target.value)}
                  placeholder="BTC/USDT, ETH/USDT"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3B82F6';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(59,130,246,0.35)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                onClick={saveRiskConfig}
                style={btnPrimary}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3B82F6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.35)';
                }}
              >
                💾 {t('admin.save_risk')}
              </button>
            </>
          )}
        </div>

        {/* ═══ SECTION 5: SYSTEM HEALTH MONITOR ═══ */}
        <div style={glassCard}>
          <div style={sectionTitle}>
            <span style={{ fontSize: '20px' }}>💓</span>
            {t('admin.system_health')}
          </div>

          {loading.health ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ShimmerBlock height="60px" />
              <ShimmerBlock height="60px" />
            </div>
          ) : health ? (
            <>
              {/* Service Status Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '20px',
              }}>
                {/* DB */}
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: health.db_connected
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${health.db_connected
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'}`,
                  textAlign: 'center' as const,
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: health.db_connected ? '#10B981' : '#EF4444',
                    margin: '0 auto 8px',
                    boxShadow: `0 0 8px ${health.db_connected ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }} />
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' as const }}>
                    {t('admin.db_status')}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: health.db_connected ? '#10B981' : '#EF4444',
                    marginTop: '4px',
                  }}>
                    {health.db_connected ? t('admin.connected') : t('admin.disconnected')}
                  </div>
                </div>

                {/* Redis */}
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: health.redis_connected
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${health.redis_connected
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'}`,
                  textAlign: 'center' as const,
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: health.redis_connected ? '#10B981' : '#EF4444',
                    margin: '0 auto 8px',
                    boxShadow: `0 0 8px ${health.redis_connected ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }} />
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' as const }}>
                    {t('admin.redis_status')}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: health.redis_connected ? '#10B981' : '#EF4444',
                    marginTop: '4px',
                  }}>
                    {health.redis_connected ? t('admin.connected') : t('admin.disconnected')}
                  </div>
                </div>

                {/* Celery */}
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  textAlign: 'center' as const,
                }}>
                  <div style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#3B82F6',
                    marginBottom: '4px',
                  }}>
                    {health.celery_queue_depth}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' as const }}>
                    {t('admin.celery_queue')}
                  </div>
                </div>
              </div>

              {/* Broker Latency Grid */}
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#9ca3af', marginBottom: '12px' }}>
                📡 {t('admin.broker_latency')}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}>
                {Object.entries(health.broker_latency_ms).map(([exchange, ms]) => (
                  <div key={exchange} style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(31, 41, 55, 0.4)',
                    border: `1px solid ${latencyGlow(ms)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    <span style={{ color: '#d1d5db', fontSize: '13px', fontWeight: '500' }}>
                      {exchange}
                    </span>
                    <span style={{
                      color: latencyColor(ms),
                      fontWeight: '700',
                      fontSize: '13px',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {ms}ms
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{t('admin.error')}</p>
          )}
        </div>
      </div>

      {/* ── Responsive Media Query ── */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
