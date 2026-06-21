'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiRequest, formatCurrency, formatDate, getStatusColor } from '@/lib/api';

export default function FarmerDetailPage({ params }: { params: Promise<{ farmerId: string }> }) {
  const { farmerId } = use(params);
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchFarmer = useCallback(async () => {
    try {
      const data = await apiRequest(`/api/farmers/${farmerId}`, { token });
      setFarmer(data.farmer);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [farmerId, token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || !['super_admin', 'admin'].includes(user.role)) { router.push('/admin/login'); return; }
    fetchFarmer();
  }, [user, isLoading, router, fetchFarmer]);

  const handleStatusUpdate = async () => {
    try {
      await apiRequest(`/api/farmers/${farmerId}`, { method: 'PUT', body: { status: newStatus, adminRemarks: remarks }, token });
      setStatusModal(false);
      fetchFarmer();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (isLoading || !user || loading) return <><AdminSidebar /><div className="main-content"><div className="skeleton" style={{ height: 400 }} /></div></>;
  if (!farmer) return <><AdminSidebar /><div className="main-content"><p>Farmer not found</p></div></>;

  const sections = [
    { title: '👤 Basic Details', fields: [
      ['Farmer ID', farmer.farmerId], ['Name', farmer.farmerName], ['Father/Husband', farmer.fatherOrHusbandName],
      ['Mobile', farmer.mobile], ['Alt. Mobile', farmer.alternateMobile || '-'], ['Gender', farmer.gender],
      ['Age', farmer.age], ['Address', farmer.address], ['Village', farmer.village],
      ['Gram Panchayat', farmer.gramPanchayat], ['Block', farmer.block], ['District', farmer.district],
      ['State', farmer.state], ['PIN Code', farmer.pincode],
    ]},
    { title: '🆔 Identity', fields: [
      ['Aadhaar', farmer.aadhaarMasked || '-'], ['PAN', farmer.panMasked || '-'], ['Jan Aadhaar', farmer.janAadhaar || '-'],
      ['Bank Available', farmer.bankAvailable],
    ]},
    { title: '🌾 Farming Details', fields: [
      ['Farmer Type', farmer.farmerType], ['Land Size', `${farmer.landSize || '-'} ${farmer.landUnit || ''}`],
      ['Crop', farmer.cropName || '-'], ['Season', farmer.cropSeason || '-'], ['Expected Qty', farmer.expectedQuantity || '-'],
      ['Irrigation', farmer.irrigationSource || '-'], ['Land Location', farmer.landLocation || '-'],
      ['Landowner', farmer.landownerName || '-'], ['Landowner Mobile', farmer.landownerMobile || '-'],
      ['Consent', farmer.consentAvailable || '-'], ['FPO Member', farmer.fpoMember || '-'],
      ['Warehouse Interest', farmer.warehouseInterest || '-'], ['Bank Loan Interest', farmer.bankLoanInterest || '-'],
      ['KCC Available', farmer.kccAvailable || '-'],
    ]},
    { title: '📦 Package & Operator', fields: [
      ['Package', farmer.selectedPackageName], ['Amount', formatCurrency(farmer.packageAmount)],
      ['Commission', formatCurrency(farmer.operatorCommission)], ['Company Share', formatCurrency(farmer.companyShare)],
      ['Operator ID', farmer.addedByOperatorId], ['Operator Name', farmer.addedByOperatorName],
      ['Operator Serial #', farmer.operatorFarmerSerial],
    ]},
  ];

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{farmer.farmerName}</h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#064E3B' }}>{farmer.farmerId}</span>
              <span className={`badge ${getStatusColor(farmer.status)}`}>{farmer.status}</span>
            </div>
          </div>
          <button onClick={() => { setNewStatus(farmer.status); setRemarks(farmer.adminRemarks || ''); setStatusModal(true); }} className="btn btn-primary" style={{ fontSize: 13 }}>
            📝 Update Status
          </button>
        </div>

        {farmer.adminRemarks && (
          <div className="alert-banner alert-warning" style={{ marginBottom: 20 }}>
            💬 Admin Remarks: {farmer.adminRemarks}
          </div>
        )}

        <div style={{ display: 'grid', gap: 20 }}>
          {sections.map((section, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#064E3B' }}>{section.title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {section.fields.map(([label, value], j) => (
                  <div key={j}>
                    <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {farmer.serviceRequired?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#064E3B' }}>📋 Services Required</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {farmer.serviceRequired.map((s: string, i: number) => (
                  <span key={i} className="badge bg-emerald-100 text-emerald-800" style={{ padding: '6px 12px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: '#94A3B8' }}>
          Created: {formatDate(farmer.createdAt)} • Updated: {formatDate(farmer.updatedAt)}
        </p>

        {/* Status Modal */}
        {statusModal && (
          <div className="modal-overlay" onClick={() => setStatusModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Update Farmer Status</h3>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Status</label>
                <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="under_review">Under Review</option>
                  <option value="submitted_to_bank">Submitted to Bank</option>
                  <option value="submitted_to_warehouse">Submitted to Warehouse</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="input-label">Remarks *</label>
                <textarea className="input" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter remarks..." required />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleStatusUpdate} className="btn btn-primary">Update</button>
                <button onClick={() => setStatusModal(false)} className="btn btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
