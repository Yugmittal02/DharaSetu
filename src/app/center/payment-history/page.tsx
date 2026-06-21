'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function PaymentHistoryPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchData = useCallback(async () => {
    try {
      const data = await apiRequest(`/api/wallet?page=${page}&limit=25`, { token });
      setTransactions(data.transactions);
      setPagination(data.pagination);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Payment History</h1>
          <button onClick={() => apiRequest('/api/export?type=transactions', { token }).catch(console.error)} className="btn btn-gold" style={{ fontSize: 13 }}>📥 Export</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Txn ID</th><th>Type</th><th>Amount</th><th>Balance After</th><th>Reason</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              transactions.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No transactions</td></tr> :
              transactions.map(t => (
                <tr key={t.transactionId}>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{t.transactionId}</td>
                  <td><span className={`badge ${getStatusColor(t.type)}`}>{t.type}</span></td>
                  <td style={{ fontWeight: 700, color: t.type === 'credit' ? '#059669' : '#DC2626' }}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(t.balanceAfter)}</td>
                  <td style={{ fontSize: 12 }}>{t.reason}{t.remarks ? ` - ${t.remarks}` : ''}</td>
                  <td style={{ fontSize: 12 }}>{formatDate(t.createdAt)}</td>
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
