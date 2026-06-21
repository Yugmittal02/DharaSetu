'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency, isDbUnreachable, resetDbErrorCount } from '@/lib/api';
import Link from 'next/link';

const CACHE_KEY = 'dharasetu_center_dash';

export default function CenterDashboardPage() {
  const { user, token, isLoading, updateWallet } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
    }
    return null;
  });
  const [dbError, setDbError] = useState('');
  const [loading, setLoading] = useState(!data);
  const [refreshing, setRefreshing] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const lastFetch = useRef(0);

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isDbUnreachable() && !isManual) return;
    if (isManual) resetDbErrorCount();
    
    const now = Date.now();
    if (!isManual && now - lastFetch.current < 5000) return;
    lastFetch.current = now;

    if (data) setRefreshing(true);
    try {
      const result = await apiRequest('/api/dashboard/center', { token });
      setData(result);
      setDbError('');
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      if (result.operator) updateWallet(result.operator.walletBalance);
      if (result.pinSet === false) setShowPinSetup(true);
    } catch (err: any) {
      if (err.message?.includes('suspended')) {
        alert('Your DharaSetu Center account is suspended. Please contact Admin.');
        return;
      }
      if (err.message?.includes('Database connection')) setDbError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, updateWallet, data]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') { router.push('/center/login'); return; }
    fetchDashboard();
    const interval = setInterval(() => {
      if (!isDbUnreachable()) fetchDashboard();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, isLoading, router, fetchDashboard]);

  if (isLoading || !user) return null;

  const stats = data?.stats;
  const operator = data?.operator;

  const statCards = stats ? [
    { icon: '👨‍🌾', label: 'Total Farmers', value: stats.totalFarmers, color: '#0369A1', bg: '#EFF6FF' },
    { icon: '📅', label: "Today's Farmers", value: stats.todayFarmers, color: '#7C3AED', bg: '#F5F3FF' },
    { icon: '📤', label: 'Total Deducted', value: formatCurrency(stats.totalDeducted), color: '#DC2626', bg: '#FEF2F2' },
    { icon: '💎', label: 'Commission', value: formatCurrency(stats.totalCommission), color: '#F59E0B', bg: '#FFFBEB' },
    { icon: '⏳', label: 'Pending', value: stats.pendingFarmers, color: '#D97706', bg: '#FFF7ED' },
    { icon: '✅', label: 'Verified', value: stats.verifiedFarmers, color: '#059669', bg: '#ECFDF5' },
  ] : [];

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return setPinError('PIN must be at least 4 digits');
    if (pin !== confirmPin) return setPinError('PINs do not match');
    setPinError('');
    setPinLoading(true);
    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { operatorId: user.operatorId, mobile: operator.mobile, newPin: pin, loginType: 'operator', action: 'setup_pin' },
      });
      setShowPinSetup(false);
      alert('PIN setup successfully! You can now use this PIN to login next time.');
    } catch (err: any) { setPinError(err.message || 'Failed to setup PIN'); }
    finally { setPinLoading(false); }
  };

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        {/* Header with refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Welcome, {operator?.operatorName || user.name}! 👋</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>{operator?.shopName} • {operator?.operatorId}</p>
          </div>
          <button onClick={() => fetchDashboard(true)} disabled={refreshing} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {refreshing ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* PIN Setup Modal */}
        {showPinSetup && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 400 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#111827' }}>Set Login PIN 🔐</h2>
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
                Please set a secure 4-digit PIN for future logins to the DharaSetu Center panel.
              </p>
              <form onSubmit={handleSetupPin}>
                {pinError && <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>{pinError}</div>}
                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">Create PIN</label>
                  <input type="password" className="input" value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter 4-digit PIN" maxLength={4} required />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label className="input-label">Confirm PIN</label>
                  <input type="password" className="input" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirm PIN" maxLength={4} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={pinLoading}>
                  {pinLoading ? 'Setting up...' : 'Save PIN'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DB Error */}
        {dbError && (
          <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
            ❌ {dbError}
            <button onClick={() => { setDbError(''); fetchDashboard(true); }} style={{ marginLeft: 12, padding: '4px 12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Retry</button>
          </div>
        )}

        {/* Notices */}
        {data?.lowBalance && (
          <div className="alert-banner alert-warning" style={{ marginBottom: 16 }}>
            ⚠️ Your wallet balance is low. Please recharge to continue farmer onboarding.
          </div>
        )}
        {data?.appNotice && (
          <div className="alert-banner alert-success" style={{ marginBottom: 16 }}>
            📢 {data.appNotice}
          </div>
        )}

        {loading && !data ? (
          <div>
            <div className="skeleton" style={{ height: 140, borderRadius: 16, marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)}
            </div>
          </div>
        ) : (
          <>
            {/* Wallet Card — always visible */}
            <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #166534 50%, #047857 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(245,158,11,0.15)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 12, opacity: 0.7, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>Available Balance</p>
                <p style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 4, letterSpacing: '-1px' }}>{formatCurrency(operator?.walletBalance || user?.walletBalance || 0)}</p>
                <p style={{ fontSize: 11, opacity: 0.5, marginBottom: 16 }}>Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                <Link href="/center/add-farmer" className="btn btn-gold" style={{ padding: '12px 28px', fontSize: 14, fontWeight: 700 }}>
                  ➕ Add New Farmer
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12, marginBottom: 28 }}>
              {statCards.map((card, i) => (
                <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 40}ms`, padding: '14px 16px', borderLeft: `4px solid ${card.color}`, background: card.bg }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>{card.icon} {card.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#374151' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {[
                  { icon: '➕', label: 'Add Farmer', href: '/center/add-farmer', accent: '#064E3B' },
                  { icon: '👨‍🌾', label: 'My Farmers', href: '/center/my-farmers', accent: '#0369A1' },
                  { icon: '💰', label: 'Wallet', href: '/center/wallet', accent: '#059669' },
                  { icon: '💎', label: 'Commission', href: '/center/commission', accent: '#F59E0B' },
                  { icon: '📥', label: 'Downloads', href: '/center/downloads', accent: '#7C3AED' },
                  { icon: '❓', label: 'Help', href: '/center/help', accent: '#64748B' },
                ].map((action, i) => (
                  <Link key={i} href={action.href} className="card" style={{ padding: 16, textAlign: 'center', cursor: 'pointer', background: 'white', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s', borderBottom: `3px solid ${action.accent}` }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{action.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{action.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
