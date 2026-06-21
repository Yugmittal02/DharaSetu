'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency, formatDate } from '@/lib/api';

export default function ProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [operator, setOperator] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiRequest(`/api/operators/${user?.operatorId}`, { token });
      setOperator(data.operator);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.operatorId, token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') { router.push('/center/login'); return; }
    fetchProfile();
  }, [user, isLoading, router, fetchProfile]);

  if (isLoading || !user) return null;

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>My Profile</h1>
        {loading ? <div className="skeleton" style={{ height: 300 }} /> : operator ? (
          <div className="card" style={{ padding: 24, maxWidth: 600 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #064E3B, #166534)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', marginBottom: 12 }}>🏪</div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{operator.operatorName}</h2>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#064E3B' }}>{operator.operatorId}</p>
              <p style={{ fontSize: 14, color: '#64748B' }}>{operator.shopName}</p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['Mobile', operator.mobile],
                ['Village', operator.village],
                ['Gram Panchayat', operator.gramPanchayat],
                ['Block', operator.block],
                ['District', operator.district],
                ['State', operator.state],
                ['Address', operator.address],
                ['Wallet Balance', formatCurrency(operator.walletBalance)],
                ['Status', operator.status],
                ['Member Since', formatDate(operator.createdAt)],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p>Profile not found</p>}
      </div>
    </>
  );
}
