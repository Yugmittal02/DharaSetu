'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function CommissionsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchCommissions = useCallback(async () => {
    try {
      const data = await apiRequest(`/api/commissions?page=${page}&limit=25`, { token });
      setCommissions(data.commissions);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, page]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchCommissions();
  }, [user, isLoading, router, fetchCommissions]);

  if (isLoading || !user) return null;

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div><h1 style={{ fontSize: 24, fontWeight: 800 }}>Commission Reports</h1><p style={{ fontSize: 14, color: '#64748B' }}>{pagination.total} total records</p></div>
          <button onClick={() => apiRequest('/api/export?type=commissions', { token }).catch(console.error)} className="btn btn-gold">📥 Export</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Operator</th><th>Farmer ID</th><th>Package</th><th>Pkg Amt</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={8}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              commissions.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No commissions</td></tr> :
              commissions.map(c => (
                <tr key={c.commissionId}>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{c.commissionId}</td>
                  <td><span style={{ fontWeight: 600 }}>{c.operatorName}</span><br/><span style={{ fontSize: 11, color: '#64748B' }}>{c.operatorId}</span></td>
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
                <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
                <button className="pagination-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
