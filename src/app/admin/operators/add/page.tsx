'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest } from '@/lib/api';

export default function AddOperatorPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ operatorId: string } | null>(null);

  const [form, setForm] = useState({
    operatorName: '', mobile: '', alternateMobile: '', shopName: '', cscId: '',
    village: '', gramPanchayat: '', block: '', tehsil: '', district: '', state: 'Rajasthan',
    address: '', aadhaarLast4: '', pan: '', bankAccountHolder: '', bankName: '',
    accountNumber: '', ifsc: '', commission149: 50, commission249: 100,
    status: 'active', notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/api/operators', {
        method: 'POST',
        body: { ...form, commission149: Number(form.commission149), commission249: Number(form.commission249) },
        token,
      });
      setSuccess({ operatorId: data.operatorId });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create operator');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) return null;

  if (success) {
    return (
      <>
        <AdminSidebar />
        <div className="main-content">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Operator Created Successfully!</h2>
            <p style={{ fontSize: 16, color: '#64748B', marginBottom: 24 }}>DharaSetu Center ID has been generated</p>
            <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 12, padding: 24, display: 'inline-block', marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: '#064E3B', marginBottom: 8 }}>Operator ID</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#064E3B', letterSpacing: 2 }}>{success.operatorId}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { navigator.clipboard.writeText(success.operatorId); alert('Copied!'); }} className="btn btn-primary">📋 Copy ID</button>
              <button onClick={() => router.push('/admin/operators')} className="btn btn-outline">View All Operators</button>
              <button onClick={() => { setSuccess(null); setForm({ operatorName: '', mobile: '', alternateMobile: '', shopName: '', cscId: '', village: '', gramPanchayat: '', block: '', tehsil: '', district: '', state: 'Rajasthan', address: '', aadhaarLast4: '', pan: '', bankAccountHolder: '', bankName: '', accountNumber: '', ifsc: '', commission149: 50, commission249: 100, status: 'active', notes: '' }); }} className="btn btn-gold">➕ Add Another</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const fields = [
    { section: 'Basic Information', items: [
      { name: 'operatorName', label: 'Operator Name *', type: 'text', required: true },
      { name: 'mobile', label: 'Mobile Number *', type: 'tel', required: true, maxLength: 10 },
      { name: 'alternateMobile', label: 'Alternate Mobile', type: 'tel', maxLength: 10 },
      { name: 'shopName', label: 'Shop Name *', type: 'text', required: true },
      { name: 'cscId', label: 'CSC/VLE ID', type: 'text' },
    ]},
    { section: 'Location', items: [
      { name: 'village', label: 'Village *', type: 'text', required: true },
      { name: 'gramPanchayat', label: 'Gram Panchayat *', type: 'text', required: true },
      { name: 'block', label: 'Block/Tehsil *', type: 'text', required: true },
      { name: 'district', label: 'District *', type: 'text', required: true },
      { name: 'state', label: 'State *', type: 'text', required: true },
      { name: 'address', label: 'Full Shop Address *', type: 'text', required: true },
    ]},
    { section: 'Identity', items: [
      { name: 'aadhaarLast4', label: 'Aadhaar Last 4 Digits', type: 'text', maxLength: 4 },
      { name: 'pan', label: 'PAN Number', type: 'text', maxLength: 10 },
    ]},
    { section: 'Bank Details', items: [
      { name: 'bankAccountHolder', label: 'Account Holder Name *', type: 'text', required: true },
      { name: 'bankName', label: 'Bank Name *', type: 'text', required: true },
      { name: 'accountNumber', label: 'Account Number *', type: 'text', required: true },
      { name: 'ifsc', label: 'IFSC Code *', type: 'text', required: true },
    ]},
    { section: 'Commission Config', items: [
      { name: 'commission149', label: '₹149 Package Commission (₹)', type: 'number' },
      { name: 'commission249', label: '₹249 Package Commission (₹)', type: 'number' },
    ]},
  ];

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Add CSC Operator</h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>Create a new DharaSetu Center operator</p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: 24, maxWidth: 800 }}>
          {error && <div className="alert-banner alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

          {fields.map((section) => (
            <div key={section.section} style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064E3B', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #D1FAE5' }}>
                {section.section}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {section.items.map((field) => (
                  <div key={field.name}>
                    <label className="input-label" htmlFor={field.name}>{field.label}</label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      className="input"
                      value={(form as Record<string, string | number>)[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      maxLength={field.maxLength}
                      placeholder={field.label.replace(' *', '')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064E3B', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #D1FAE5' }}>Other</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label className="input-label" htmlFor="status">Status</label>
                <select id="status" name="status" className="input" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="input-label" htmlFor="notes">Notes</label>
                <textarea id="notes" name="notes" className="input" rows={2} value={form.notes} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={loading}>
            {loading ? <><div className="spinner" /> Creating...</> : '✅ Create DharaSetu Center'}
          </button>
        </form>
      </div>
    </>
  );
}
