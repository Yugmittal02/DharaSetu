'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency } from '@/lib/api';

export default function SettingsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiRequest('/api/settings', { token });
      setSettings(data.settings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'super_admin') { router.push('/admin/login'); return; }
    fetchSettings();
  }, [user, isLoading, router, fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/api/settings', { method: 'PUT', body: settings, token });
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  if (isLoading || !user || loading) return <><AdminSidebar /><div className="main-content"><div className="skeleton" style={{ height: 400 }} /></div></>;
  if (!settings) return <><AdminSidebar /><div className="main-content"><p>Settings not found. Please seed the database first.</p></div></>;

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Settings</h1>
        {success && <div className="alert-banner alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}

        <div style={{ maxWidth: 700, display: 'grid', gap: 24 }}>
          {/* Package 149 */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064E3B', marginBottom: 16 }}>📦 Package ₹149 - {settings.servicePackages?.package149?.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="input-label">Price (₹)</label><input type="number" className="input" value={settings.servicePackages?.package149?.price || 149} onChange={e => setSettings({...settings, servicePackages: {...settings.servicePackages, package149: {...settings.servicePackages.package149, price: Number(e.target.value)}}})} /></div>
              <div><label className="input-label">Commission (₹)</label><input type="number" className="input" value={settings.servicePackages?.package149?.commission || 50} onChange={e => setSettings({...settings, servicePackages: {...settings.servicePackages, package149: {...settings.servicePackages.package149, commission: Number(e.target.value)}}})} /></div>
            </div>
          </div>

          {/* Package 249 */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064E3B', marginBottom: 16 }}>📦 Package ₹249 - {settings.servicePackages?.package249?.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label className="input-label">Price (₹)</label><input type="number" className="input" value={settings.servicePackages?.package249?.price || 249} onChange={e => setSettings({...settings, servicePackages: {...settings.servicePackages, package249: {...settings.servicePackages.package249, price: Number(e.target.value)}}})} /></div>
              <div><label className="input-label">Commission (₹)</label><input type="number" className="input" value={settings.servicePackages?.package249?.commission || 100} onChange={e => setSettings({...settings, servicePackages: {...settings.servicePackages, package249: {...settings.servicePackages.package249, commission: Number(e.target.value)}}})} /></div>
            </div>
          </div>

          {/* General */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064E3B', marginBottom: 16 }}>⚙️ General Settings</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div><label className="input-label">Min Wallet Warning (₹)</label><input type="number" className="input" value={settings.minimumWalletWarning || 300} onChange={e => setSettings({...settings, minimumWalletWarning: Number(e.target.value)})} /></div>
              <div><label className="input-label">Support Contact</label><input className="input" value={settings.supportContact || ''} onChange={e => setSettings({...settings, supportContact: e.target.value})} /></div>
              <div><label className="input-label">App Notice</label><textarea className="input" rows={2} value={settings.appNotice || ''} onChange={e => setSettings({...settings, appNotice: e.target.value})} placeholder="Show notice to operators..." /></div>
              <div><label className="input-label">Export Limit</label><input type="number" className="input" value={settings.exportLimit || 5000} onChange={e => setSettings({...settings, exportLimit: Number(e.target.value)})} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="maintenance" checked={settings.maintenanceMode || false} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} />
                <label htmlFor="maintenance" className="input-label" style={{ marginBottom: 0 }}>Maintenance Mode</label>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </>
  );
}
