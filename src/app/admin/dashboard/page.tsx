'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, isDbUnreachable, resetDbErrorCount } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalOperators: number;
  activeOperators: number;
  suspendedOperators: number;
  totalFarmers: number;
  todayFarmers: number;
  pendingFarmers: number;
  totalWalletBalance: number;
  totalCredits: number;
  totalDebits: number;
  totalRevenue: number;
  totalCommission: number;
  duplicateAttempts: number;
}

const CACHE_KEY = 'dharasetu_admin_dash';

export default function AdminDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(!stats);
  const [refreshing, setRefreshing] = useState(false);
  const [dbError, setDbError] = useState('');
  const lastFetch = useRef(0);

  const fetchStats = useCallback(async (isManual = false) => {
    if (isDbUnreachable() && !isManual) return;
    if (isManual) resetDbErrorCount();

    const now = Date.now();
    if (!isManual && now - lastFetch.current < 5000) return;
    lastFetch.current = now;

    if (stats) setRefreshing(true);
    try {
      const data = await apiRequest('/api/dashboard/admin', { token });
      setStats(data);
      setDbError('');
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err: any) {
      if (err.message?.includes('Database connection')) setDbError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, stats]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
    const interval = setInterval(() => {
      if (!isDbUnreachable()) fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, isLoading, router, fetchStats]);

  if (isLoading || !user) return null;

  const statCards = stats ? [
    { icon: '🏪', label: 'Total Operators', value: stats.totalOperators, color: '#064E3B', bg: '#ECFDF5' },
    { icon: '✅', label: 'Active Operators', value: stats.activeOperators, color: '#166534', bg: '#F0FDF4' },
    { icon: '⛔', label: 'Suspended', value: stats.suspendedOperators, color: '#DC2626', bg: '#FEF2F2' },
    { icon: '👨‍🌾', label: 'Total Farmers', value: stats.totalFarmers, color: '#0369A1', bg: '#EFF6FF' },
    { icon: '📅', label: "Today's Farmers", value: stats.todayFarmers, color: '#7C3AED', bg: '#F5F3FF' },
    { icon: '⏳', label: 'Pending Verification', value: stats.pendingFarmers, color: '#D97706', bg: '#FFF7ED' },
    { icon: '💰', label: 'Total Wallet Balance', value: formatCurrency(stats.totalWalletBalance), color: '#059669', bg: '#ECFDF5' },
    { icon: '📥', label: 'Total Credits', value: formatCurrency(stats.totalCredits), color: '#0D9488', bg: '#F0FDFA' },
    { icon: '📤', label: 'Total Debits', value: formatCurrency(stats.totalDebits), color: '#E11D48', bg: '#FFF1F2' },
    { icon: '💹', label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: '#4F46E5', bg: '#EEF2FF' },
    { icon: '💎', label: 'Total Commission', value: formatCurrency(stats.totalCommission), color: '#F59E0B', bg: '#FFFBEB' },
    { icon: '🔄', label: 'Duplicate Attempts', value: stats.duplicateAttempts, color: '#EF4444', bg: '#FEF2F2' },
  ] : [];

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        {/* Header with refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>Welcome back, {user.name}. Here&apos;s your overview.</p>
          </div>
          <button onClick={() => fetchStats(true)} disabled={refreshing} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {refreshing ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* DB Error */}
        {dbError && (
          <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
            ❌ {dbError}
            <button onClick={() => { setDbError(''); fetchStats(true); }} style={{ marginLeft: 12, padding: '4px 12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Retry</button>
          </div>
        )}

        {/* Stats Grid */}
        {loading && !stats ? (
          <div>
            {/* Summary skeleton */}
            <div className="skeleton" style={{ height: 120, borderRadius: 16, marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Revenue Summary Card */}
            <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #475569 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(245,158,11,0.15)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
                <div>
                  <p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Revenue</p>
                  <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>{stats ? formatCurrency(stats.totalRevenue) : '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Farmers</p>
                  <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>{stats?.totalFarmers ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Active Centers</p>
                  <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>{stats?.activeOperators ?? '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Today&apos;s Registrations</p>
                  <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px', color: '#FDE68A' }}>{stats?.todayFarmers ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
              {statCards.map((card, i) => (
                <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 40}ms`, padding: '16px 18px', borderLeft: `4px solid ${card.color}`, background: card.bg }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>{card.icon} {card.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#374151' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {[
                  { icon: '➕', label: 'Add Operator', href: '/admin/operators/add', accent: '#064E3B' },
                  { icon: '👨‍🌾', label: 'View Farmers', href: '/admin/farmers', accent: '#0369A1' },
                  { icon: '💰', label: 'Manage Payments', href: '/admin/payments', accent: '#059669' },
                  { icon: '🏬', label: 'Market View', href: '/admin/market', accent: '#7C3AED' },
                  { icon: '🏪', label: 'Operators', href: '/admin/operators', accent: '#F59E0B' },
                  { icon: '⚙️', label: 'Settings', href: '/admin/settings', accent: '#64748B' },
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
