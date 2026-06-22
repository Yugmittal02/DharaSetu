'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useEffect } from 'react';

export default function CenterLoginPage() {
  const [operatorId, setOperatorId] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'check' | 'login'>('check');
  const [operatorDetails, setOperatorDetails] = useState<{ operatorName: string, shopName: string } | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const credsStr = localStorage.getItem('dharasetu_center_credentials');
    if (credsStr) {
      try {
        const creds = JSON.parse(credsStr);
        if (creds.operatorId && creds.mobile) {
          setOperatorId(creds.operatorId);
          setMobile(creds.mobile);
          setOperatorDetails({ operatorName: creds.operatorName || '', shopName: creds.shopName || '' });
          setStep('login');
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { operatorId, mobile, loginType: 'operator', action: 'check' },
      });
      
      setOperatorDetails({ operatorName: data.operatorName, shopName: data.shopName });
      
      if (data.pinSet) {
        setStep('login');
      } else {
        // First login, auto logged in
        localStorage.setItem('dharasetu_center_credentials', JSON.stringify({
          operatorId,
          mobile,
          operatorName: data.operatorName,
          shopName: data.shopName
        }));
        login(data.token, data.user);
        router.push('/center/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { operatorId, mobile, password: pin, loginType: 'operator', action: 'login' },
      });
      
      login(data.token, data.user);
      localStorage.setItem('dharasetu_center_credentials', JSON.stringify({
        operatorId,
        mobile,
        operatorName: operatorDetails?.operatorName || data.user.name || '',
        shopName: operatorDetails?.shopName || data.user.shopName || ''
      }));
      router.push('/center/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPin = async (e: React.FormEvent) => {};

  return (
    <div className="login-container" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)' }}>
      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#064E3B', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
            🏪
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4 }}>DharaSetu Center</h1>
          <p style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            {step === 'check' ? 'Verify your identity to login' : 
             `Welcome back, ${operatorDetails?.operatorName}`}
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {step === 'check' && (
          <form onSubmit={handleCheck}>
            <div style={{ marginBottom: 20 }}>
              <label className="input-label" htmlFor="operatorId">DharaSetu Center ID</label>
              <input
                id="operatorId"
                type="text"
                className="input"
                placeholder="e.g. DSC-BHR-0001"
                value={operatorId}
                onChange={e => setOperatorId(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="input-label" htmlFor="mobile">Registered Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                className="input"
                placeholder="Enter registered mobile"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                maxLength={10}
                required
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: 14 }} disabled={loading}>
              {loading ? <><div className="spinner" /> Verifying...</> : 'Verify & Continue ➡️'}
            </button>
          </form>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 24 }}>
              <label className="input-label" htmlFor="pin">Enter your Login PIN</label>
              <input
                id="pin"
                type="password"
                className="input"
                placeholder="****"
                value={pin}
                onChange={e => setPin(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: 14 }} disabled={loading}>
              {loading ? <><div className="spinner" /> Logging in...</> : '🔐 Login to Center Panel'}
            </button>
            <button type="button" onClick={() => { setStep('check'); setPin(''); }} className="btn btn-outline" style={{ width: '100%', padding: 14, marginTop: 12 }}>
              Back
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
