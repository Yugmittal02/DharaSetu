'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest } from '@/lib/api';

export default function DownloadsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) router.push('/admin/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const exports = [
    { title: 'All Farmers', desc: 'Export all farmers with complete details', icon: '👨‍🌾', type: 'farmers', params: '' },
    { title: '₹149 Package Farmers', desc: 'Farmers registered under Basic package', icon: '📦', type: 'farmers', params: '&packageId=package149' },
    { title: '₹249 Package Farmers', desc: 'Farmers registered under Complete package', icon: '📦', type: 'farmers', params: '&packageId=package249' },
    { title: 'Pending Farmers', desc: 'Farmers awaiting verification', icon: '⏳', type: 'farmers', params: '&status=pending' },
    { title: 'Verified Farmers', desc: 'Verified farmer records', icon: '✅', type: 'farmers', params: '&status=verified' },
    { title: 'All Transactions', desc: 'Complete wallet transaction history', icon: '💰', type: 'transactions', params: '' },
    { title: 'Commission Report', desc: 'All commission records', icon: '💎', type: 'commissions', params: '' },
  ];

  const handleExport = async (type: string, params: string) => {
    try {
      await apiRequest(`/api/export?type=${type}${params}`, { token });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Downloads & Exports</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Export data to Excel/CSV format</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {exports.map((exp, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{exp.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{exp.title}</h3>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>{exp.desc}</p>
              <button onClick={() => handleExport(exp.type, exp.params)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                📥 Download Excel
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
