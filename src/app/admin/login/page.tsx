'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiRequest } from '@/lib/api';

export default function AdminLoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { mobile, password, loginType: 'admin' },
      });
      login(data.token, data.user);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #064E3B, #166534)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#F59E0B', marginBottom: 16 }}>
            ध
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>DharaSetu Admin</h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label className="input-label" htmlFor="admin-mobile">Mobile Number</label>
            <input id="admin-mobile" type="tel" className="input" placeholder="Enter mobile number" value={mobile} onChange={e => setMobile(e.target.value)} maxLength={10} required />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="input-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" className="input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>
            {loading ? <><div className="spinner" /> Logging in...</> : '🔐 Login to Admin Panel'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 20, textAlign: 'center' }}>
          This area is restricted to DharaSetu administrators only.
        </p>
      </div>
    </div>
  );
}
