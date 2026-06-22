'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import CenterSidebar from '@/components/center/CenterSidebar';

export default function HelpPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'operator') router.push('/center/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  const faqs = [
    { q: 'How do I add a farmer?', a: 'Go to Dashboard → Click "Add Farmer" → Select a package (₹149 or ₹249) → Fill the form → Submit. The package amount will be deducted from your wallet.' },
    { q: 'What is the difference between ₹149 and ₹249 packages?', a: '₹149 is Basic Registration (farmer profile + crop details). ₹249 is Complete Documentation (includes bank/FPO/warehouse details and documentation readiness).' },
    { q: 'What if my wallet balance is low?', a: 'Contact your Admin to add funds to your wallet. You cannot onboard farmers without sufficient wallet balance.' },
    { q: 'How is my commission calculated?', a: 'Commission is auto-generated after each farmer onboarding. Default: ₹50 for ₹149 package, ₹100 for ₹249 package. Your Admin may configure different rates.' },
    { q: 'Can I edit a farmer after submission?', a: 'No. Once submitted, farmer data can only be modified by Admin. Contact Admin for any corrections.' },
    { q: 'What does "Duplicate Farmer" error mean?', a: 'The system detected a farmer with the same mobile number or matching name+village combination. Contact Admin to resolve.' },
    { q: 'How do I export my data?', a: 'Go to Downloads → Click the export button for Farmers, Transactions, or Commission reports.' },
    { q: 'My account is suspended. What should I do?', a: 'Contact your Admin immediately. Only Admin can reactivate your DharaSetu Center account.' },
    { q: 'How do I share Farmer ID with the farmer?', a: 'After successful submission, you can copy the Farmer ID or share it via WhatsApp using the buttons shown.' },
  ];

  return (
    <>
      <CenterSidebar />
      <div className="main-content">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Help & Support</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>Frequently asked questions and support information</p>

        {/* Support Contact */}
        <div style={{ background: 'linear-gradient(135deg, #064E3B, #166534)', borderRadius: 16, padding: 24, marginBottom: 24, color: 'white' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📞 Need Help?</h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>Contact DharaSetu Admin for support</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+918619152422" className="btn btn-gold" style={{ padding: '10px 20px', fontSize: 14 }}>📱 Call Support</a>
            <a href="https://wa.me/918619152422?text=DharaSetu%20Center%20Support%20Request" target="_blank" className="btn" style={{ padding: '10px 20px', fontSize: 14, background: '#25D366', color: 'white', borderRadius: 8 }}>💬 WhatsApp</a>
          </div>
        </div>

        {/* FAQs */}
        <div style={{ display: 'grid', gap: 12 }}>
          {faqs.map((faq, i) => (
            <details key={i} className="card" style={{ padding: 0, cursor: 'pointer' }}>
              <summary style={{ padding: '16px 20px', fontSize: 15, fontWeight: 600, color: '#111827', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>❓ {faq.q}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>▼</span>
              </summary>
              <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#64748B', lineHeight: 1.6, borderTop: '1px solid #F1F5F9' }}>
                <p style={{ paddingTop: 12 }}>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        {/* App Info */}
        <div style={{ marginTop: 32, textAlign: 'center', padding: 24, background: '#F8FAFC', borderRadius: 12 }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#064E3B', marginBottom: 4 }}>DharaSetu</p>
          <p style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600, marginBottom: 8 }}>Zameen Se Samriddhi Tak</p>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>Version 1.0.0 • Built for Indian Farmers</p>
        </div>
      </div>
    </>
  );
}
