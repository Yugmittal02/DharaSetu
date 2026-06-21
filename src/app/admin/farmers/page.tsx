'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function AdminFarmersPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchFarmers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (packageFilter) params.set('packageId', packageFilter);
      const data = await apiRequest(`/api/farmers?${params}`, { token });
      setFarmers(data.farmers);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, packageFilter]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchFarmers();
  }, [user, isLoading, router, fetchFarmers]);

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, packageFilter]);

  if (isLoading || !user) return null;

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Farmers</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>{pagination.total} total farmers</p>
          </div>
          <button onClick={() => apiRequest('/api/export?type=farmers', { token }).catch(console.error)} className="btn btn-gold">📥 Export Excel</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 300 }} placeholder="Search by ID, name, mobile..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input" style={{ maxWidth: 160 }} value={packageFilter} onChange={e => setPackageFilter(e.target.value)}>
            <option value="">All Packages</option>
            <option value="package149">₹149 Basic</option>
            <option value="package249">₹249 Complete</option>
          </select>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Farmer ID</th><th>Name</th><th>Mobile</th><th>Village</th><th>Type</th>
                <th>Operator</th><th>Package</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={10}><div className="skeleton" style={{ height: 20 }} /></td></tr>
                ))
              ) : farmers.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No farmers found</td></tr>
              ) : (
                farmers.map((f) => (
                  <tr key={f.farmerId} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/farmers/${f.farmerId}`)}>
                    <td style={{ fontWeight: 700, color: '#064E3B' }}>{f.farmerId}</td>
                    <td style={{ fontWeight: 600 }}>{f.farmerName}</td>
                    <td>{f.mobile}</td>
                    <td>{f.village}</td>
                    <td style={{ fontSize: 12 }}>{f.farmerType}</td>
                    <td style={{ fontSize: 12, color: '#64748B' }}>{f.addedByOperatorId}</td>
                    <td style={{ fontSize: 12 }}>{f.selectedPackageName}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(f.packageAmount)}</td>
                    <td><span className={`badge ${getStatusColor(f.status)}`}>{f.status}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDate(f.createdAt)}</td>
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
