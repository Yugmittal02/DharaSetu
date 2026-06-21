'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function PaymentsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ operatorId: '', type: 'credit', amount: '', paymentMode: 'cash', referenceNumber: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await apiRequest(`/api/wallet?page=${page}&limit=25`, { token });
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, page]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchTransactions();
  }, [user, isLoading, router, fetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await apiRequest('/api/wallet', {
        method: 'POST',
        body: { ...form, amount: Number(form.amount) },
        token,
      });
      setSuccess(data.message);
      setModal(false);
      setForm({ operatorId: '', type: 'credit', amount: '', paymentMode: 'cash', referenceNumber: '', remarks: '' });
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) return null;

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Payments / Operator Funds</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>Manage operator wallet balances</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setModal(true)} className="btn btn-primary">💰 Add/Deduct Funds</button>
            <button onClick={() => apiRequest('/api/export?type=transactions', { token }).catch(console.error)} className="btn btn-gold">📥 Export</button>
          </div>
        </div>

        {success && <div className="alert-banner alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}

        <div className="table-container">
          <table>
            <thead>
              <tr><th>Txn ID</th><th>Operator</th><th>Type</th><th>Amount</th><th>Before</th><th>After</th><th>Mode</th><th>Reason</th><th>Date</th></tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={9}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
              ) : transactions.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No transactions</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.transactionId}>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>{t.transactionId}</td>
                    <td><span style={{ fontWeight: 600 }}>{t.operatorName}</span><br/><span style={{ fontSize: 11, color: '#64748B' }}>{t.operatorId}</span></td>
                    <td><span className={`badge ${getStatusColor(t.type)}`}>{t.type}</span></td>
                    <td style={{ fontWeight: 700, color: t.type === 'credit' ? '#059669' : '#DC2626' }}>{formatCurrency(t.amount)}</td>
                    <td style={{ fontSize: 12 }}>{formatCurrency(t.balanceBefore)}</td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{formatCurrency(t.balanceAfter)}</td>
                    <td style={{ fontSize: 12 }}>{t.paymentMode || '-'}</td>
                    <td style={{ fontSize: 12 }}>{t.reason}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(t.createdAt)}</td>
                  </tr>
                ))
              )}
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

        {/* Add Funds Modal */}
        {modal && (
          <div className="modal-overlay" onClick={() => setModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>💰 Add / Deduct Funds</h3>
              <form onSubmit={handleSubmit}>
                {error && <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label className="input-label">Operator ID *</label>
                    <input className="input" value={form.operatorId} onChange={e => setForm(f => ({ ...f, operatorId: e.target.value }))} placeholder="e.g. DSC-BHR-0001" required />
                  </div>
                  <div>
                    <label className="input-label">Transaction Type *</label>
                    <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="credit">Credit (Add Funds)</option>
                      <option value="debit">Debit (Deduct Funds)</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Amount (₹) *</label>
                    <input type="number" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="1" required />
                  </div>
                  <div>
                    <label className="input-label">Payment Mode</label>
                    <select className="input" value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Reference Number</label>
                    <input className="input" value={form.referenceNumber} onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="input-label">Remarks</label>
                    <textarea className="input" rows={2} value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button type="submit" className={`btn ${form.type === 'credit' ? 'btn-primary' : 'btn-danger'}`} disabled={submitting}>
                    {submitting ? 'Processing...' : form.type === 'credit' ? '📥 Add Funds' : '📤 Deduct Funds'}
                  </button>
                  <button type="button" onClick={() => setModal(false)} className="btn btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
