'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function OperatorsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchOperators = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data = await apiRequest(`/api/operators?${params}`, { token });
      setOperators(data.operators);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchOperators();
  }, [user, isLoading, router, fetchOperators]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  if (isLoading || !user) return null;

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>CSC Operators</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>{pagination.total} total operators</p>
          </div>
          <button onClick={() => router.push('/admin/operators/add')} className="btn btn-primary">➕ Add Operator</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 300 }} placeholder="Search by ID, name, mobile, village..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Operator ID</th>
                <th>Name</th>
                <th>Shop</th>
                <th>Mobile</th>
                <th>Village</th>
                <th>District</th>
                <th>Wallet</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={10}><div className="skeleton" style={{ height: 20 }} /></td></tr>
                ))
              ) : operators.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No operators found</td></tr>
              ) : (
                operators.map((op) => (
                  <tr key={op.operatorId} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/operators/${op.operatorId}`)}>
                    <td style={{ fontWeight: 700, color: '#064E3B' }}>{op.operatorId}</td>
                    <td style={{ fontWeight: 600 }}>{op.operatorName}</td>
                    <td>{op.shopName}</td>
                    <td>{op.mobile}</td>
                    <td>{op.village}</td>
                    <td>{op.district}</td>
                    <td style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(op.walletBalance)}</td>
                    <td><span className={`badge ${getStatusColor(op.status)}`}>{op.status}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDate(op.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => router.push(`/admin/operators/${op.operatorId}`)} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: 12 }}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && pagination.totalPages > 1 && (
            <div className="pagination">
              <span>Page {page} of {pagination.totalPages} ({pagination.total} results)</span>
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
