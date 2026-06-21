'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, isDbUnreachable } from '@/lib/api';

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

export default function AdminDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState('');

  const fetchStats = useCallback(async () => {
    if (isDbUnreachable()) return;
    try {
      const data = await apiRequest('/api/dashboard/admin', { token });
      setStats(data);
      setDbError('');
    } catch (err: any) {
      if (err.message?.includes('Database connection')) setDbError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    { icon: '🏪', label: 'Total Operators', value: stats.totalOperators, color: '#064E3B' },
    { icon: '✅', label: 'Active Operators', value: stats.activeOperators, color: '#166534' },
    { icon: '⛔', label: 'Suspended', value: stats.suspendedOperators, color: '#DC2626' },
    { icon: '👨‍🌾', label: 'Total Farmers', value: stats.totalFarmers, color: '#0369A1' },
    { icon: '📅', label: "Today's Farmers", value: stats.todayFarmers, color: '#7C3AED' },
    { icon: '⏳', label: 'Pending Verification', value: stats.pendingFarmers, color: '#D97706' },
    { icon: '💰', label: 'Total Wallet Balance', value: formatCurrency(stats.totalWalletBalance), color: '#059669' },
    { icon: '📥', label: 'Total Credits', value: formatCurrency(stats.totalCredits), color: '#0D9488' },
    { icon: '📤', label: 'Total Debits', value: formatCurrency(stats.totalDebits), color: '#E11D48' },
    { icon: '💹', label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: '#4F46E5' },
    { icon: '💎', label: 'Total Commission', value: formatCurrency(stats.totalCommission), color: '#F59E0B' },
    { icon: '🔄', label: 'Duplicate Attempts', value: stats.duplicateAttempts, color: '#EF4444' },
  ] : [];

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>Welcome back, {user.name}. Here&apos;s your overview.</p>
        </div>

        {/* DB Error */}
        {dbError && (
          <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
            ❌ {dbError}
            <button onClick={() => { setDbError(''); fetchStats(); }} style={{ marginLeft: 12, padding: '4px 12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Retry</button>
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {statCards.map((card, i) => (
              <div key={i} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</p>
                  </div>
                  <span style={{ fontSize: 28 }}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/admin/operators/add')} className="btn btn-primary">
              ➕ Add Operator
            </button>
            <button onClick={() => router.push('/admin/farmers')} className="btn btn-outline">
              👨‍🌾 View Farmers
            </button>
            <button onClick={() => router.push('/admin/payments')} className="btn btn-outline">
              💰 Manage Payments
            </button>
            <button onClick={() => router.push('/admin/market')} className="btn btn-outline">
              🏬 Market View
            </button>
            <button onClick={() => {
              apiRequest('/api/export?type=farmers', { token }).catch(console.error);
            }} className="btn btn-gold">
              📥 Export All Farmers
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
