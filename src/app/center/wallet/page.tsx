'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor, isDbUnreachable } from '@/lib/api';

export default function WalletPage() {
  const { user, token, isLoading, updateWallet } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [dbError, setDbError] = useState('');

  const fetchData = useCallback(async () => {
    if (isDbUnreachable()) return;
    try {
      const [txnData, dashData] = await Promise.all([
        apiRequest(`/api/wallet?page=${page}&limit=25`, { token }),
        apiRequest('/api/dashboard/center', { token }),
      ]);
      setTransactions(txnData.transactions);
      setPagination(txnData.pagination);
      setBalance(dashData.operator.walletBalance);
      updateWallet(dashData.operator.walletBalance);
      setDbError('');
    } catch (err: any) {
      if (err.message?.includes('Database connection')) setDbError(err.message);
      console.error(err);
    }
    finally { setLoading(false); }
  }, [token, page, updateWallet]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') { router.push('/center/login'); return; }
    fetchData();
    const interval = setInterval(() => {
      if (!isDbUnreachable()) fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, isLoading, router, fetchData]);

  if (isLoading || !user) return null;

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Wallet & Funds</h1>

        {dbError && (
          <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
            ❌ {dbError}
            <button onClick={() => { setDbError(''); fetchData(); }} style={{ marginLeft: 12, padding: '4px 12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Retry</button>
          </div>
        )}

        <div style={{ background: 'linear-gradient(135deg, #064E3B, #166534)', borderRadius: 16, padding: 24, marginBottom: 24, color: 'white' }}>
          <p style={{ fontSize: 13, opacity: 0.8 }}>Available Balance</p>
          <p style={{ fontSize: 40, fontWeight: 900 }}>{formatCurrency(balance)}</p>
          <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Contact Admin to add funds to your wallet</p>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Transaction History</h2>
        <div className="table-container">
          <table>
            <thead><tr><th>Txn ID</th><th>Type</th><th>Amount</th><th>Before</th><th>After</th><th>Reason</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 20 }} /></td></tr>) :
              transactions.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No transactions yet</td></tr> :
              transactions.map(t => (
                <tr key={t.transactionId}>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{t.transactionId}</td>
                  <td><span className={`badge ${getStatusColor(t.type)}`}>{t.type}</span></td>
                  <td style={{ fontWeight: 700, color: t.type === 'credit' ? '#059669' : '#DC2626' }}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                  <td style={{ fontSize: 12 }}>{formatCurrency(t.balanceBefore)}</td>
                  <td style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(t.balanceAfter)}</td>
                  <td style={{ fontSize: 12 }}>{t.reason} {t.relatedFarmerId ? `(${t.relatedFarmerId})` : ''}</td>
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
