'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatDate, getStatusColor } from '@/lib/api';

export default function LogsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);
      const data = await apiRequest(`/api/logs?${params}`, { token });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, page, actionFilter]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchLogs();
  }, [user, isLoading, router, fetchLogs]);

  if (isLoading || !user) return null;

  const actions = ['login', 'operator_created', 'operator_suspended', 'operator_reactivated', 'farmer_submitted', 'farmer_status_changed', 'wallet_credited', 'wallet_debited', 'duplicate_attempt'];

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Activity Logs</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>{pagination.total} total logs</p>
        <select className="input" style={{ maxWidth: 240, marginBottom: 20 }} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <div className="table-container">
          <table>
            <thead><tr><th>Action</th><th>Description</th><th>Operator</th><th>Role</th><th>Time</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              logs.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No logs</td></tr> :
              logs.map((log, i) => (
                <tr key={i}>
                  <td><span className={`badge ${log.action.includes('error') || log.action.includes('duplicate') || log.action.includes('suspend') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{log.action}</span></td>
                  <td style={{ maxWidth: 400, whiteSpace: 'normal', fontSize: 13 }}>{log.description}</td>
                  <td style={{ fontSize: 12, color: '#64748B' }}>{log.operatorId || '-'}</td>
                  <td style={{ fontSize: 12 }}>{log.role}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(log.createdAt)}</td>
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
