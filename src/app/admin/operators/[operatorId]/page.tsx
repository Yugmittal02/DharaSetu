'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function OperatorDetailPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = use(params);
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [opData, farmData, logData] = await Promise.all([
        apiRequest(`/api/operators/${operatorId}`, { token }),
        apiRequest(`/api/farmers?operatorId=${operatorId}&limit=50`, { token }),
        apiRequest(`/api/logs?operatorId=${operatorId}&limit=20`, { token }),
      ]);
      setOperator(opData.operator);
      setStats(opData.stats);
      setFarmers(farmData.farmers);
      setLogs(logData.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [operatorId, token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchData();
  }, [user, isLoading, router, fetchData]);

  const handleStatusChange = async () => {
    try {
      await apiRequest(`/api/operators/${operatorId}`, {
        method: 'PUT',
        body: { status: newStatus },
        token,
      });
      setStatusModal(false);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (isLoading || !user || loading) return <><AdminSidebar /><div className="main-content"><div className="skeleton" style={{ height: 400 }} /></div></>;

  if (!operator) return <><AdminSidebar /><div className="main-content"><p>Operator not found</p></div></>;

  const tabs = ['overview', 'farmers', 'logs'];

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>{operator.operatorName}</h1>
              <span className={`badge ${getStatusColor(operator.status)}`}>{operator.status}</span>
            </div>
            <p style={{ fontSize: 14, color: '#64748B' }}>{operator.operatorId} • {operator.shopName} • {operator.village}, {operator.district}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setNewStatus(operator.status === 'active' ? 'suspended' : 'active'); setStatusModal(true); }} className={`btn ${operator.status === 'active' ? 'btn-danger' : 'btn-primary'}`} style={{ padding: '8px 16px', fontSize: 13 }}>
              {operator.status === 'active' ? '⛔ Suspend' : '✅ Reactivate'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #E2E8F0' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', border: 'none', background: activeTab === tab ? '#064E3B' : 'transparent', color: activeTab === tab ? 'white' : '#64748B', borderRadius: '8px 8px 0 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Wallet Balance', value: formatCurrency(operator.walletBalance), icon: '💰' },
                { label: 'Total Farmers', value: stats?.totalFarmers || 0, icon: '👨‍🌾' },
                { label: "Today's Farmers", value: stats?.todayFarmers || 0, icon: '📅' },
                { label: 'This Month', value: stats?.monthFarmers || 0, icon: '📆' },
                { label: '₹149 Pkg Count', value: stats?.package149Count || 0, icon: '📦' },
                { label: '₹249 Pkg Count', value: stats?.package249Count || 0, icon: '📦' },
                { label: 'Verified', value: stats?.verifiedFarmers || 0, icon: '✅' },
                { label: 'Pending', value: stats?.pendingFarmers || 0, icon: '⏳' },
                { label: 'Rejected', value: stats?.rejectedFarmers || 0, icon: '❌' },
                { label: 'Total Credits', value: formatCurrency(stats?.totalCredits || 0), icon: '📥' },
                { label: 'Total Debits', value: formatCurrency(stats?.totalDebits || 0), icon: '📤' },
                { label: 'Total Commission', value: formatCurrency(stats?.totalCommission || 0), icon: '💎' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ padding: 16 }}>
                  <p style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>{s.icon} {s.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Profile Details */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Profile Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                {[
                  ['Mobile', operator.mobile],
                  ['Alternate Mobile', operator.alternateMobile || '-'],
                  ['CSC/VLE ID', operator.cscId || '-'],
                  ['Village', operator.village],
                  ['Gram Panchayat', operator.gramPanchayat],
                  ['Block', operator.block],
                  ['District', operator.district],
                  ['State', operator.state],
                  ['Address', operator.address],
                  ['Bank', `${operator.bankName} - ${operator.accountNumber}`],
                  ['IFSC', operator.ifsc],
                  ['App Opens', operator.appOpenCount],
                  ['Last Login', operator.lastLoginAt ? formatDate(operator.lastLoginAt) : 'Never'],
                  ['Created', formatDate(operator.createdAt)],
                ].map(([label, value], i) => (
                  <div key={i} style={{ padding: 8 }}>
                    <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'farmers' && (
          <div className="table-container animate-fadeIn">
            <table>
              <thead>
                <tr>
                  <th>Farmer ID</th><th>Name</th><th>Mobile</th><th>Village</th><th>Type</th>
                  <th>Package</th><th>Amount</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {farmers.length === 0 ? (
                  <tr><td colSpan={9} className="empty-state">No farmers onboarded yet</td></tr>
                ) : farmers.map(f => (
                  <tr key={f.farmerId} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/farmers/${f.farmerId}`)}>
                    <td style={{ fontWeight: 700, color: '#064E3B' }}>{f.farmerId}</td>
                    <td style={{ fontWeight: 600 }}>{f.farmerName}</td>
                    <td>{f.mobile}</td>
                    <td>{f.village}</td>
                    <td>{f.farmerType}</td>
                    <td>{f.selectedPackageName}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(f.packageAmount)}</td>
                    <td><span className={`badge ${getStatusColor(f.status)}`}>{f.status}</span></td>
                    <td style={{ fontSize: 12 }}>{formatDate(f.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="table-container animate-fadeIn">
            <table>
              <thead><tr><th>Action</th><th>Description</th><th>Time</th></tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={3} className="empty-state">No logs</td></tr>
                ) : logs.map((log, i) => (
                  <tr key={i}>
                    <td><span className={`badge ${getStatusColor(log.action.includes('suspend') ? 'suspended' : log.action.includes('credit') ? 'credit' : 'active')}`}>{log.action}</span></td>
                    <td style={{ maxWidth: 400, whiteSpace: 'normal' }}>{log.description}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Status Modal */}
        {statusModal && (
          <div className="modal-overlay" onClick={() => setStatusModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                {newStatus === 'suspended' ? '⛔ Suspend Operator' : '✅ Reactivate Operator'}
              </h3>
              <p style={{ marginBottom: 20, color: '#64748B' }}>
                Are you sure you want to {newStatus === 'suspended' ? 'suspend' : 'reactivate'} <strong>{operator.operatorName}</strong>?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleStatusChange} className={newStatus === 'suspended' ? 'btn btn-danger' : 'btn btn-primary'}>
                  Confirm
                </button>
                <button onClick={() => setStatusModal(false)} className="btn btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
