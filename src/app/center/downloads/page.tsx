'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest } from '@/lib/api';

export default function CenterDownloadsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') router.push('/center/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const exports = [
    { title: 'My Farmers', desc: 'Export all your onboarded farmers', icon: '👨‍🌾', type: 'farmers' },
    { title: 'Payment History', desc: 'Export wallet transaction history', icon: '💰', type: 'transactions' },
    { title: 'Commission Report', desc: 'Export your commission records', icon: '💎', type: 'commissions' },
  ];

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Downloads</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Export your data to Excel</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {exports.map((exp, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{exp.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{exp.title}</h3>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>{exp.desc}</p>
              <button onClick={() => apiRequest(`/api/export?type=${exp.type}`, { token }).catch(e => alert(e.message))} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>📥 Download Excel</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
