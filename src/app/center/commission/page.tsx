'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function CommissionPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [totals, setTotals] = useState({ total: 0, pending: 0, paid: 0 });

  const fetchData = useCallback(async () => {
    try {
      const [comData, dashData] = await Promise.all([
        apiRequest(`/api/commissions?page=${page}&limit=25`, { token }),
        apiRequest('/api/dashboard/center', { token }),
      ]);
      setCommissions(comData.commissions);
      setPagination(comData.pagination);
      setTotals({
        total: dashData.stats.totalCommission,
        pending: dashData.stats.pendingCommission,
        paid: dashData.stats.paidCommission,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, page]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') { router.push('/center/login'); return; }
    fetchData();
  }, [user, isLoading, router, fetchData]);

  if (isLoading || !user) return null;

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>My Commission</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div className="stat-card" style={{ padding: 16 }}><p style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>💎 Total</p><p style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>{formatCurrency(totals.total)}</p></div>
          <div className="stat-card" style={{ padding: 16 }}><p style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>⏳ Pending</p><p style={{ fontSize: 22, fontWeight: 800, color: '#D97706' }}>{formatCurrency(totals.pending)}</p></div>
          <div className="stat-card" style={{ padding: 16 }}><p style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>✅ Paid</p><p style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{formatCurrency(totals.paid)}</p></div>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Farmer ID</th><th>Package</th><th>Pkg Amt</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              commissions.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No commission records</td></tr> :
              commissions.map(c => (
                <tr key={c.commissionId}>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{c.commissionId}</td>
                  <td style={{ fontWeight: 600, color: '#064E3B' }}>{c.farmerId}</td>
                  <td style={{ fontSize: 12 }}>{c.selectedPackageName}</td>
                  <td>{formatCurrency(c.packageAmount)}</td>
                  <td style={{ fontWeight: 700, color: '#F59E0B' }}>{formatCurrency(c.commissionAmount)}</td>
                  <td><span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span></td>
                  <td style={{ fontSize: 12 }}>{formatDate(c.createdAt)}</td>
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
