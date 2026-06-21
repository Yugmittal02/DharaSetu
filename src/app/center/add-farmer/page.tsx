'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';
import { apiRequest, formatCurrency } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

const STEPS = ['Package', 'Basic', 'Identity', 'Farming', 'Services', 'Review'];

const FARMER_TYPES = ['Landowner farmer', 'Batai farmer', 'Tenant farmer', 'FPO member', 'Other'];
const SEASONS = ['Rabi', 'Kharif', 'Zaid'];
const LAND_UNITS = ['Bigha', 'Acre', 'Hectare'];
const SERVICES = [
  'Basic Farmer Registration', 'Complete Farmer Documentation', 'Bank/KCC Loan Assistance',
  'Warehouse Receipt Finance Assistance', 'FPO Linkage', 'Government Scheme Awareness', 'Market Linkage', 'Other'
];

export default function AddFarmerPage() {
  const { user, token, isLoading, updateWallet } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);
  const [consent, setConsent] = useState(false);
  const [idempotencyKey] = useState(uuidv4());

  const [form, setForm] = useState({
    farmerName: '', fatherOrHusbandName: '', mobile: '', alternateMobile: '',
    gender: 'Male', age: '', address: '', village: '', gramPanchayat: '', block: '',
    tehsil: '', district: '', state: 'Rajasthan', pincode: '',
    aadhaar: '', aadhaarLast4: '', pan: '', janAadhaar: '', bankAvailable: 'No',
    farmerType: 'Landowner farmer', landSize: '', landUnit: 'Bigha', cropName: '',
    cropSeason: 'Kharif', expectedQuantity: '', irrigationSource: '', landLocation: '',
    landownerName: '', landownerMobile: '', consentAvailable: 'Pending',
    fpoMember: 'No', warehouseInterest: 'No', bankLoanInterest: 'No', kccAvailable: 'No',
    currentRequirement: '', serviceRequired: [] as string[],
  });

  const fetchSettings = useCallback(async () => {
    try {
      const [settingsData, dashData] = await Promise.all([
        apiRequest('/api/settings', { token }),
        apiRequest('/api/dashboard/center', { token }),
      ]);
      setSettings(settingsData.settings);
      setWalletBalance(dashData.operator.walletBalance);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') { router.push('/center/login'); return; }
    fetchSettings();
  }, [user, isLoading, router, fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setForm(prev => ({
      ...prev,
      serviceRequired: prev.serviceRequired.includes(service)
        ? prev.serviceRequired.filter(s => s !== service)
        : [...prev.serviceRequired, service],
    }));
  };

  const pkg149 = settings?.servicePackages?.package149;
  const pkg249 = settings?.servicePackages?.package249;
  const selectedPkg = selectedPackage === 'package149' ? pkg149 : pkg249;
  const packageAmount = selectedPkg?.price || 0;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const data = await apiRequest('/api/farmers', {
        method: 'POST',
        body: {
          ...form,
          age: Number(form.age),
          selectedPackageId: selectedPackage,
          consentAccepted: consent,
          idempotencyKey,
        },
        token,
      });

      setSuccess(data);
      updateWallet(data.walletBalance);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) return null;

  // Receipt Print/Download
  const handlePrintReceipt = () => {
    const receiptEl = document.getElementById('farmer-receipt');
    if (!receiptEl) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) { alert('Please allow popups to print receipt'); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>DharaSetu - Farmer Receipt</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #111; }
        .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #064E3B; border-radius: 12px; overflow: hidden; }
        .receipt-header { background: linear-gradient(135deg, #064E3B, #166534); color: white; padding: 20px; text-align: center; }
        .receipt-header h1 { font-size: 22px; margin-bottom: 4px; }
        .receipt-header p { font-size: 12px; opacity: 0.8; }
        .receipt-id { background: #F0FDF4; padding: 16px; text-align: center; border-bottom: 2px dashed #86EFAC; }
        .receipt-id .label { font-size: 11px; color: #64748B; margin-bottom: 4px; }
        .receipt-id .value { font-size: 28px; font-weight: 900; color: #064E3B; letter-spacing: 2px; }
        .receipt-body { padding: 20px; }
        .receipt-section { margin-bottom: 16px; }
        .receipt-section h3 { font-size: 13px; font-weight: 700; color: #064E3B; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 10px; }
        .receipt-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        .receipt-row .label { color: #64748B; }
        .receipt-row .value { font-weight: 600; text-align: right; max-width: 60%; }
        .receipt-payment { background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .receipt-payment .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .receipt-payment .total { font-size: 18px; font-weight: 800; color: #064E3B; border-top: 2px solid #D97706; padding-top: 8px; margin-top: 8px; }
        .receipt-footer { background: #F8FAFC; padding: 16px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        .receipt-footer strong { color: #064E3B; }
        .stamp { display: inline-block; border: 2px solid #059669; color: #059669; padding: 4px 16px; border-radius: 4px; font-weight: 800; font-size: 14px; transform: rotate(-5deg); margin: 12px 0; }
        @media print { body { padding: 0; } .receipt { border: 1px solid #ccc; } }
      </style></head><body>${receiptEl.innerHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  const handleDownloadReceipt = () => {
    const receiptEl = document.getElementById('farmer-receipt');
    if (!receiptEl) return;
    const htmlContent = `<!DOCTYPE html><html><head><title>DharaSetu Receipt - ${success.farmer.farmerId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #111; }
        .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #064E3B; border-radius: 12px; overflow: hidden; }
        .receipt-header { background: #064E3B; color: white; padding: 20px; text-align: center; }
        .receipt-header h1 { font-size: 22px; margin-bottom: 4px; }
        .receipt-header p { font-size: 12px; opacity: 0.8; }
        .receipt-id { background: #F0FDF4; padding: 16px; text-align: center; border-bottom: 2px dashed #86EFAC; }
        .receipt-id .label { font-size: 11px; color: #64748B; margin-bottom: 4px; }
        .receipt-id .value { font-size: 28px; font-weight: 900; color: #064E3B; letter-spacing: 2px; }
        .receipt-body { padding: 20px; }
        .receipt-section { margin-bottom: 16px; }
        .receipt-section h3 { font-size: 13px; font-weight: 700; color: #064E3B; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 10px; }
        .receipt-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
        .receipt-row .label { color: #64748B; }
        .receipt-row .value { font-weight: 600; text-align: right; max-width: 60%; }
        .receipt-payment { background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .receipt-payment .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .receipt-payment .total { font-size: 18px; font-weight: 800; color: #064E3B; border-top: 2px solid #D97706; padding-top: 8px; margin-top: 8px; }
        .receipt-footer { background: #F8FAFC; padding: 16px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
        .receipt-footer strong { color: #064E3B; }
        .stamp { display: inline-block; border: 2px solid #059669; color: #059669; padding: 4px 16px; border-radius: 4px; font-weight: 800; font-size: 14px; transform: rotate(-5deg); margin: 12px 0; }
      </style></head><body>${receiptEl.innerHTML}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DharaSetu_Receipt_${success.farmer.farmerId}.html`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  // Success Screen with Receipt
  if (success) {
    const receiptDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const whatsappMsg = encodeURIComponent(`DharaSetu farmer registration submitted successfully.\n\nFarmer ID: ${success.farmer.farmerId}\nName: ${success.farmer.farmerName}\nPackage: ${success.farmer.selectedPackageName}\nAmount: ₹${success.farmer.packageAmount}\nDate: ${receiptDate}\n\nकृपया इस ID को future reference के लिए सुरक्षित रखें।`);
    return (
      <>
        <CenterSidebar />
        <div className="main-content">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Farmer Successfully Onboarded!</h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Receipt generated — give a copy to the farmer</p>

            {/* Printable Receipt */}
            <div id="farmer-receipt" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}>
              <div className="receipt" style={{ border: '2px solid #064E3B', borderRadius: 12, overflow: 'hidden' }}>
                {/* Receipt Header */}
                <div style={{ background: 'linear-gradient(135deg, #064E3B, #166534)', color: 'white', padding: 20, textAlign: 'center' }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>🌾 DharaSetu</h1>
                  <p style={{ fontSize: 12, opacity: 0.8 }}>Zameen Se Samriddhi Tak • Farmer Registration Receipt</p>
                </div>

                {/* Farmer ID */}
                <div style={{ background: '#F0FDF4', padding: 16, textAlign: 'center', borderBottom: '2px dashed #86EFAC' }}>
                  <p style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>FARMER REGISTRATION ID</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#064E3B', letterSpacing: 2 }}>{success.farmer.farmerId}</p>
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Date: {receiptDate}</p>
                </div>

                {/* Receipt Body */}
                <div style={{ padding: 20 }}>
                  {/* Farmer Details */}
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #E2E8F0', paddingBottom: 6, marginBottom: 10 }}>👤 Farmer Details</h3>
                    {[
                      ['Name', form.farmerName],
                      ['Father/Husband', form.fatherOrHusbandName],
                      ['Mobile', form.mobile],
                      ['Gender / Age', `${form.gender} / ${form.age} yrs`],
                      ['Village', form.village],
                      ['Gram Panchayat', form.gramPanchayat],
                      ['Block', form.block],
                      ['District', form.district],
                      ['State', form.state],
                      ['PIN Code', form.pincode],
                    ].map(([label, value], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                        <span style={{ color: '#64748B' }}>{label}</span>
                        <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '-'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Farming Details */}
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #E2E8F0', paddingBottom: 6, marginBottom: 10 }}>🌾 Farming Details</h3>
                    {[
                      ['Farmer Type', form.farmerType],
                      ['Land Size', form.landSize ? `${form.landSize} ${form.landUnit}` : '-'],
                      ['Crop', form.cropName || '-'],
                      ['Season', form.cropSeason],
                    ].map(([label, value], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                        <span style={{ color: '#64748B' }}>{label}</span>
                        <span style={{ fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Services */}
                  {form.serviceRequired.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #E2E8F0', paddingBottom: 6, marginBottom: 10 }}>📋 Services Selected</h3>
                      {form.serviceRequired.map((s, i) => (
                        <p key={i} style={{ fontSize: 13, padding: '3px 0' }}>✅ {s}</p>
                      ))}
                    </div>
                  )}

                  {/* Payment Details */}
                  <div style={{ background: '#FEF3C7', padding: 16, borderRadius: 8, margin: '16px 0' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>💰 Payment Details</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                      <span>Package</span><span style={{ fontWeight: 600 }}>{success.farmer.selectedPackageName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                      <span>Transaction ID</span><span style={{ fontWeight: 600 }}>{success.transactionId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#064E3B', borderTop: '2px solid #D97706', paddingTop: 8, marginTop: 8 }}>
                      <span>Amount Paid</span><span>₹{success.farmer.packageAmount}</span>
                    </div>
                  </div>

                  {/* Status Stamp */}
                  <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    <span style={{ display: 'inline-block', border: '2px solid #059669', color: '#059669', padding: '4px 16px', borderRadius: 4, fontWeight: 800, fontSize: 14, transform: 'rotate(-5deg)' }}>✓ REGISTRATION CONFIRMED</span>
                  </div>

                  {/* Operator Info */}
                  <div style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#064E3B', borderBottom: '1px solid #E2E8F0', paddingBottom: 6, marginBottom: 10 }}>🏪 DharaSetu Center</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                      <span style={{ color: '#64748B' }}>Center ID</span><span style={{ fontWeight: 600 }}>{user?.operatorId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
                      <span style={{ color: '#64748B' }}>Operator</span><span style={{ fontWeight: 600 }}>{user?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Footer */}
                <div style={{ background: '#F8FAFC', padding: 16, textAlign: 'center', fontSize: 11, color: '#94A3B8', borderTop: '1px solid #E2E8F0' }}>
                  <p>This is a computer-generated receipt • <strong style={{ color: '#064E3B' }}>DharaSetu</strong></p>
                  <p style={{ marginTop: 4 }}>कृपया इस रसीद को भविष्य के संदर्भ के लिए सुरक्षित रखें</p>
                  <p style={{ marginTop: 4 }}>For any queries, contact your DharaSetu Center operator</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <button onClick={handlePrintReceipt} className="btn btn-primary" style={{ padding: '12px 24px' }}>🖨️ Print Receipt</button>
              <button onClick={handleDownloadReceipt} className="btn btn-gold" style={{ padding: '12px 24px' }}>📥 Download Receipt</button>
              <button onClick={() => { navigator.clipboard.writeText(success.farmer.farmerId); alert('Farmer ID Copied!'); }} className="btn btn-outline">📋 Copy Farmer ID</button>
              <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" className="btn" style={{ padding: '12px 24px', background: '#25D366', color: 'white', borderRadius: 8 }}>📱 WhatsApp Share</a>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <button onClick={() => window.location.reload()} className="btn btn-gold">➕ Add Another Farmer</button>
              <button onClick={() => router.push('/center/dashboard')} className="btn btn-outline">🏠 Dashboard</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Add New Farmer</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>Wallet: {formatCurrency(walletBalance)}</p>

        {error && <div className="alert-banner alert-error" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`step ${i === step ? 'active' : i < step ? 'completed' : 'upcoming'}`}>
                {i < step ? '✓' : i + 1}. {s}
              </div>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>

        {/* Step 0: Package Selection */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Select Service Package</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {pkg149 && (
                <div className={`package-card ${selectedPackage === 'package149' ? 'selected' : ''}`} onClick={() => setSelectedPackage('package149')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{pkg149.name}</h3>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#064E3B' }}>₹{pkg149.price}</span>
                  </div>
                  <ul style={{ fontSize: 14, color: '#64748B', listStyle: 'none', padding: 0 }}>
                    {pkg149.features?.map((f: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>✅ {f}</li>)}
                  </ul>
                  {walletBalance < pkg149.price && (
                    <p style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 12 }}>⚠️ Insufficient balance</p>
                  )}
                </div>
              )}
              {pkg249 && (
                <div className={`package-card ${selectedPackage === 'package249' ? 'selected' : ''}`} onClick={() => setSelectedPackage('package249')}>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>RECOMMENDED</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{pkg249.name}</h3>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#064E3B' }}>₹{pkg249.price}</span>
                  </div>
                  <ul style={{ fontSize: 14, color: '#64748B', listStyle: 'none', padding: 0 }}>
                    {pkg249.features?.map((f: string, i: number) => <li key={i} style={{ marginBottom: 6 }}>✅ {f}</li>)}
                  </ul>
                  {walletBalance < pkg249.price && (
                    <p style={{ color: '#DC2626', fontSize: 12, fontWeight: 600, marginTop: 12 }}>⚠️ Insufficient balance</p>
                  )}
                </div>
              )}
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: '#64748B' }}>Wallet: <strong>{formatCurrency(walletBalance)}</strong></p>
              <button onClick={() => {
                if (!selectedPackage) { setError('Please select a package'); return; }
                if (walletBalance < packageAmount) { setError('Insufficient funds. Please recharge your DharaSetu Center wallet.'); return; }
                setError('');
                setStep(1);
              }} className="btn btn-primary" disabled={!selectedPackage}>
                Continue with {selectedPackage ? `₹${packageAmount}` : '...'} →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="card animate-fadeIn" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>👤 Farmer Basic Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { name: 'farmerName', label: 'Full Name *', required: true },
                { name: 'fatherOrHusbandName', label: 'Father/Husband Name *', required: true },
                { name: 'mobile', label: 'Mobile *', type: 'tel', maxLength: 10, required: true },
                { name: 'alternateMobile', label: 'Alt. Mobile', type: 'tel', maxLength: 10 },
                { name: 'age', label: 'Age *', type: 'number', required: true },
                { name: 'address', label: 'Full Address *', required: true },
                { name: 'village', label: 'Village *', required: true },
                { name: 'gramPanchayat', label: 'Gram Panchayat *', required: true },
                { name: 'block', label: 'Block/Tehsil *', required: true },
                { name: 'district', label: 'District *', required: true },
                { name: 'state', label: 'State *', required: true },
                { name: 'pincode', label: 'PIN Code *', maxLength: 6, required: true },
              ].map(f => (
                <div key={f.name}>
                  <label className="input-label">{f.label}</label>
                  <input name={f.name} type={f.type || 'text'} className="input" value={(form as any)[f.name]} onChange={handleChange} maxLength={f.maxLength} required={f.required} />
                </div>
              ))}
              <div>
                <label className="input-label">Gender *</label>
                <select name="gender" className="input" value={form.gender} onChange={handleChange}>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(0)} className="btn btn-outline">← Back</button>
              <button onClick={() => {
                const reqFields = ['farmerName', 'fatherOrHusbandName', 'mobile', 'age', 'address', 'village', 'gramPanchayat', 'block', 'district', 'state', 'pincode'];
                const missing = reqFields.find(f => !(form as any)[f]);
                if (missing) { setError('Please fill all required fields'); return; }
                setError(''); setStep(2);
              }} className="btn btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 2: Identity */}
        {step === 2 && (
          <div className="card animate-fadeIn" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🆔 Identity Details</h2>
            <div className="alert-banner alert-warning" style={{ marginBottom: 20, fontSize: 13 }}>
              ⚠️ किसान की सहमति के बिना कोई भी संवेदनशील जानकारी दर्ज न करें।
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              <div><label className="input-label">Aadhaar Number (Optional)</label><input name="aadhaar" className="input" value={form.aadhaar} onChange={handleChange} maxLength={12} placeholder="12 digit Aadhaar" /></div>
              <div><label className="input-label">Aadhaar Last 4 Digits</label><input name="aadhaarLast4" className="input" value={form.aadhaarLast4} onChange={handleChange} maxLength={4} /></div>
              <div><label className="input-label">PAN Number (Optional)</label><input name="pan" className="input" value={form.pan} onChange={handleChange} maxLength={10} style={{ textTransform: 'uppercase' }} /></div>
              <div><label className="input-label">Jan Aadhaar (Optional)</label><input name="janAadhaar" className="input" value={form.janAadhaar} onChange={handleChange} /></div>
              <div><label className="input-label">Bank Account Available</label><select name="bankAvailable" className="input" value={form.bankAvailable} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(1)} className="btn btn-outline">← Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Farming Details */}
        {step === 3 && (
          <div className="card animate-fadeIn" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>🌾 Farming Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              <div><label className="input-label">Farmer Type *</label><select name="farmerType" className="input" value={form.farmerType} onChange={handleChange}>{FARMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="input-label">Land Size</label><input name="landSize" className="input" value={form.landSize} onChange={handleChange} /></div>
              <div><label className="input-label">Land Unit</label><select name="landUnit" className="input" value={form.landUnit} onChange={handleChange}>{LAND_UNITS.map(u => <option key={u}>{u}</option>)}</select></div>
              <div><label className="input-label">Crop Name</label><input name="cropName" className="input" value={form.cropName} onChange={handleChange} /></div>
              <div><label className="input-label">Crop Season</label><select name="cropSeason" className="input" value={form.cropSeason} onChange={handleChange}>{SEASONS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="input-label">Expected Quantity</label><input name="expectedQuantity" className="input" value={form.expectedQuantity} onChange={handleChange} /></div>
              <div><label className="input-label">Irrigation Source</label><input name="irrigationSource" className="input" value={form.irrigationSource} onChange={handleChange} /></div>
              <div><label className="input-label">Land Location</label><input name="landLocation" className="input" value={form.landLocation} onChange={handleChange} /></div>
              {(form.farmerType === 'Batai farmer' || form.farmerType === 'Tenant farmer') && (
                <>
                  <div><label className="input-label">Landowner Name</label><input name="landownerName" className="input" value={form.landownerName} onChange={handleChange} /></div>
                  <div><label className="input-label">Landowner Mobile</label><input name="landownerMobile" className="input" value={form.landownerMobile} onChange={handleChange} /></div>
                  <div><label className="input-label">Landowner Consent</label><select name="consentAvailable" className="input" value={form.consentAvailable} onChange={handleChange}><option>Yes</option><option>No</option><option>Pending</option></select></div>
                </>
              )}
              <div><label className="input-label">FPO Member</label><select name="fpoMember" className="input" value={form.fpoMember} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
              <div><label className="input-label">Warehouse Interest</label><select name="warehouseInterest" className="input" value={form.warehouseInterest} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
              <div><label className="input-label">Bank Loan Interest</label><select name="bankLoanInterest" className="input" value={form.bankLoanInterest} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
              <div><label className="input-label">KCC Available</label><select name="kccAvailable" className="input" value={form.kccAvailable} onChange={handleChange}><option>Yes</option><option>No</option></select></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="input-label">Current Problem/Requirement</label><textarea name="currentRequirement" className="input" rows={2} value={form.currentRequirement} onChange={handleChange} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(2)} className="btn btn-outline">← Back</button>
              <button onClick={() => setStep(4)} className="btn btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Services */}
        {step === 4 && (
          <div className="card animate-fadeIn" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Service Required</h2>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>Select one or more services:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
              {SERVICES.map(service => (
                <label key={service} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, border: `2px solid ${form.serviceRequired.includes(service) ? '#064E3B' : '#E2E8F0'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={form.serviceRequired.includes(service)} onChange={() => handleServiceToggle(service)} />
                  <span style={{ fontSize: 14, fontWeight: form.serviceRequired.includes(service) ? 600 : 400 }}>{service}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button onClick={() => setStep(3)} className="btn btn-outline">← Back</button>
              <button onClick={() => setStep(5)} className="btn btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="card animate-fadeIn" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📝 Review & Confirm</h2>
            
            <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><p style={{ fontSize: 11, color: '#64748B' }}>Package</p><p style={{ fontWeight: 700 }}>{selectedPkg?.name}</p></div>
                <div><p style={{ fontSize: 11, color: '#64748B' }}>Price</p><p style={{ fontWeight: 700, color: '#DC2626' }}>{formatCurrency(packageAmount)}</p></div>
                <div><p style={{ fontSize: 11, color: '#64748B' }}>Wallet Balance</p><p style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(walletBalance)}</p></div>
                <div><p style={{ fontSize: 11, color: '#64748B' }}>After Deduction</p><p style={{ fontWeight: 700 }}>{formatCurrency(walletBalance - packageAmount)}</p></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 20 }}>
              {[
                ['Name', form.farmerName], ['Father/Husband', form.fatherOrHusbandName], ['Mobile', form.mobile],
                ['Village', form.village], ['Block', form.block], ['District', form.district],
                ['Farmer Type', form.farmerType], ['Crop', form.cropName || '-'], ['Season', form.cropSeason],
              ].map(([label, value], i) => (
                <div key={i}><p style={{ fontSize: 11, color: '#94A3B8' }}>{label}</p><p style={{ fontSize: 14, fontWeight: 500 }}>{value}</p></div>
              ))}
            </div>

            {form.serviceRequired.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Services</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {form.serviceRequired.map((s, i) => <span key={i} className="badge bg-emerald-100 text-emerald-800">{s}</span>)}
                </div>
              </div>
            )}

            {/* Consent */}
            <div style={{ background: '#FEF3C7', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 4 }} />
                <span style={{ fontSize: 14, color: '#92400E' }}>
                  मैं पुष्टि करता/करती हूँ कि किसान ने अपनी जानकारी DharaSetu सेवा प्रक्रिया हेतु दर्ज करने की सहमति दी है।
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(4)} className="btn btn-outline">← Back</button>
              <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={!consent || submitting}>
                {submitting ? <><div className="spinner" /> Submitting...</> : `✅ Submit Farmer & Deduct ₹${packageAmount}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
