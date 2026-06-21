'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function MyFarmersPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchFarmers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const data = await apiRequest(`/api/farmers?${params}`, { token });
      setFarmers(data.farmers);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, page, search]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') { router.push('/center/login'); return; }
    fetchFarmers();
  }, [user, isLoading, router, fetchFarmers]);

  if (isLoading || !user) return null;

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div><h1 style={{ fontSize: 22, fontWeight: 800 }}>My Farmers</h1><p style={{ fontSize: 14, color: '#64748B' }}>{pagination.total} farmers</p></div>
          <button onClick={() => apiRequest('/api/export?type=farmers', { token }).catch(console.error)} className="btn btn-gold" style={{ fontSize: 13 }}>📥 Export Excel</button>
        </div>
        <input className="input" style={{ maxWidth: 300, marginBottom: 16 }} placeholder="Search by ID, name, mobile..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <div className="table-container">
          <table>
            <thead><tr><th>Farmer ID</th><th>Name</th><th>Mobile</th><th>Village</th><th>Package</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              farmers.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No farmers yet. Start onboarding!</td></tr> :
              farmers.map(f => (
                <tr key={f.farmerId}>
                  <td style={{ fontWeight: 700, color: '#064E3B' }}>{f.farmerId}</td>
                  <td style={{ fontWeight: 600 }}>{f.farmerName}</td>
                  <td>{f.mobile}</td>
                  <td>{f.village}</td>
                  <td style={{ fontSize: 12 }}>{f.selectedPackageName}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(f.packageAmount)}</td>
                  <td><span className={`badge ${getStatusColor(f.status)}`}>{f.status}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && pagination.totalPages > 1 && (
            <div className="pagination">
              <span>Page {page} of {pagination.totalPages}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <button className="pagination-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
