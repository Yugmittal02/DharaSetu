'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function MarketViewPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMarket = useCallback(async () => {
    try {
      const data = await apiRequest('/api/market', { token });
      setOperators(data.operators);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchMarket();
    const interval = setInterval(fetchMarket, 10000);
    return () => clearInterval(interval);
  }, [user, isLoading, router, fetchMarket]);

  const filtered = operators.filter(op =>
    !search || op.operatorName.toLowerCase().includes(search.toLowerCase()) ||
    op.operatorId.toLowerCase().includes(search.toLowerCase()) ||
    op.village.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || !user) return null;

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Market View</h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>All DharaSetu Centers at a glance</p>
        </div>

        <input className="input" style={{ maxWidth: 400, marginBottom: 24 }} placeholder="Search operator..." value={search} onChange={e => setSearch(e.target.value)} />

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map(op => (
              <div key={op.operatorId} className="card animate-fadeIn" style={{ padding: 20, cursor: 'pointer' }} onClick={() => router.push(`/admin/operators/${op.operatorId}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{op.operatorName}</h3>
                    <p style={{ fontSize: 12, color: '#64748B' }}>{op.operatorId} • {op.shopName}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8' }}>📍 {op.village}, {op.block}</p>
                  </div>
                  <span className={`badge ${getStatusColor(op.status)}`} style={{ alignSelf: 'flex-start' }}>{op.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Wallet', value: formatCurrency(op.walletBalance), color: '#059669' },
                    { label: 'Farmers', value: op.totalFarmers, color: '#0369A1' },
                    { label: 'Today', value: op.todayFarmers, color: '#7C3AED' },
                    { label: '₹149 Pkg', value: op.package149Count, color: '#D97706' },
                    { label: '₹249 Pkg', value: op.package249Count, color: '#4F46E5' },
                    { label: 'Revenue', value: formatCurrency(op.totalRevenue), color: '#064E3B' },
                  ].map((stat, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: 8, background: '#F8FAFC', borderRadius: 8 }}>
                      <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{stat.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8' }}>
                  <span>📱 App opens: {op.appOpenCount}</span>
                  <span>🕐 {op.lastLoginAt ? formatDate(op.lastLoginAt) : 'Never'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
