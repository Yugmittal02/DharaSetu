'use client';

import Link from 'next/link';
import Image from 'next/image';

const LIVE_SERVICES = [
  { icon: '🆔', title: 'Verified Kisan ID', desc: 'Farmer profile verified via land record + Aadhaar OTP + Sarpanch witness. Foundation for every other service.' },
  { icon: '📊', title: 'Input Demand Aggregation', desc: 'Village-wise seed/fertilizer demand collected pre-season for dealers and FPOs to plan stock accurately.' },
  { icon: '🌾', title: 'Crop & Scheme Advisory', desc: 'Soil-test awareness, crop calendar reminders, government scheme eligibility check (PM-KISAN, PMFBY, KCC).' },
];

const FUTURE_SERVICES = [
  { title: 'Crop Loan (KCC) & JLG Facilitation', phase: 'Phase 2' },
  { title: 'Warehouse & Cold Storage Financing', phase: 'Phase 2' },
  { title: 'Crop Insurance (PMFBY)', phase: 'Phase 2' },
  { title: 'Market Linkage to FPOs & Traders', phase: 'Phase 2' },
  { title: 'Farm Equipment Matchmaking', phase: 'Phase 3' },
  { title: 'Weather & Price Alerts (SMS/WhatsApp)', phase: 'Phase 3' },
  { title: 'Land & Tenancy (Batai) Matchmaking', phase: 'Future' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Become a DharaSetu Center', desc: 'Register as CSC/VLE operator with one-time ₹249 activation. Get your unique Center ID instantly.' },
  { step: '02', title: 'Onboard Farmers Digitally', desc: 'Register farmers in 2 minutes with ₹149 Basic or ₹249 Complete package. All data verified & secure.' },
  { step: '03', title: 'Earn Commission Instantly', desc: 'Earn ₹50–₹100 commission per farmer. Track earnings in real-time on your dashboard.' },
];

export default function HomePage() {
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #064E3B, #166534)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#F59E0B' }}>ध</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#064E3B', lineHeight: 1.1 }}>DharaSetu</h1>
              <p style={{ fontSize: 9, color: '#64748B', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Zameen Se Samriddhi Tak</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/center/login" style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #064E3B, #166534)', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
              DharaSetu Center Login →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: '50%', height: '80%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-fadeIn">
            <div style={{ display: 'inline-flex', padding: '6px 14px', background: 'rgba(245,158,11,0.2)', borderRadius: 20, marginBottom: 20 }}>
              <span style={{ color: '#FDE68A', fontSize: 12, fontWeight: 600 }}>🎯 Target: 10,000 Farmers — Bharatpur District, Rajasthan</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-1px' }}>
              India&apos;s Rural<br />
              <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Agri-Tech Platform
              </span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              DharaSetu empowers CSC/VLE operators to digitally onboard and serve farmers — from verified Kisan ID to crop loans, insurance, and market linkage. Building India&apos;s largest farmer database, one village at a time.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/center/login" style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.4)' }}>
                🏪 Become a DharaSetu Center
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
              {[
                { val: '₹249', label: 'One-time Center Activation' },
                { val: '2 min', label: 'Farmer Registration' },
                { val: '₹100', label: 'Commission per Farmer' },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#FDE68A' }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <Image src="/hero-banner.png" alt="DharaSetu - Connecting farmers to prosperity" width={600} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} priority />
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {['🏛️ CSC/VLE Network Partner', '🔒 Aadhaar-verified Kisan IDs', '📍 Bharatpur, Rajasthan', '🇮🇳 Made in India'].map((t, i) => (
            <span key={i} style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Simple Process</p>
          <h3 style={{ fontSize: 32, fontWeight: 900, color: '#111827' }}>How DharaSetu Works</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #E2E8F0', position: 'relative', transition: 'all 0.3s' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #064E3B, #059669)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 900, marginBottom: 20 }}>{item.step}</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{item.title}</h4>
              <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Services */}
      <section style={{ background: '#064E3B' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(245,158,11,0.2)', borderRadius: 20, marginBottom: 12 }}>
              <span style={{ color: '#FDE68A', fontSize: 12, fontWeight: 700 }}>PHASE 1 — LIVE NOW</span>
            </div>
            <h3 style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>Current Services</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: 15 }}>Available now through every DharaSetu Center</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {LIVE_SERVICES.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{s.desc}</p>
                <span style={{ display: 'inline-block', marginTop: 12, padding: '4px 10px', background: '#059669', color: 'white', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>✓ LIVE</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Services Roadmap */}
      <section style={{ background: '#1E293B' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Coming Soon</p>
              <h3 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 16 }}>Service Roadmap</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
                DharaSetu is building a full-stack farmer service ecosystem. Once we verify 10,000 farmers in Bharatpur, these services unlock — powered by the verified Kisan ID database.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FUTURE_SERVICES.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{s.title}</span>
                    <span style={{ padding: '3px 10px', background: s.phase === 'Phase 2' ? 'rgba(59,130,246,0.2)' : s.phase === 'Phase 3' ? 'rgba(168,85,247,0.2)' : 'rgba(245,158,11,0.2)', color: s.phase === 'Phase 2' ? '#93C5FD' : s.phase === 'Phase 3' ? '#C4B5FD' : '#FDE68A', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{s.phase}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: 20, overflow: 'hidden' }}>
              <Image src="/future-services.png" alt="DharaSetu Future Services Roadmap" width={600} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* For Farmers & Operators */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* For Farmers */}
          <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)', borderRadius: 20, padding: 36, border: '1px solid #A7F3D0' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 8 }}>For Farmers</p>
            <h4 style={{ fontSize: 22, fontWeight: 800, color: '#064E3B', marginBottom: 16 }}>What Farmers Get</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Verified Kisan ID — accepted by banks & FPOs', 'Government scheme eligibility alerts', 'Crop & land documentation on record', 'Future access to loans, insurance, market linkage', 'SMS/WhatsApp price & weather alerts', 'Complete data privacy & consent-based'].map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#374151' }}>
                  <span style={{ color: '#059669', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          {/* For Operators */}
          <div style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderRadius: 20, padding: 36, border: '1px solid #FDE68A' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: 8 }}>For CSC/VLE Operators</p>
            <h4 style={{ fontSize: 22, fontWeight: 800, color: '#92400E', marginBottom: 16 }}>What Operators Earn</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['₹50–₹100 commission per farmer registration', 'Real-time wallet with instant balance tracking', 'Professional dashboard with analytics', 'Receipt generation for farmer records', 'Excel/CSV export of all farmer data', 'One-time ₹249 activation — no recurring fee'].map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#374151' }}>
                  <span style={{ color: '#D97706', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, #064E3B, #047857)', padding: '60px 24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 12 }}>Ready to Become a DharaSetu Center?</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 28 }}>One-time ₹249 activation. Start earning commission from day one.</p>
        <Link href="/center/login" style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 14px rgba(245,158,11,0.4)', display: 'inline-block' }}>
          🏪 Get Started as DharaSetu Center
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', padding: '40px 24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: '#064E3B', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>ध</div>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>DharaSetu</span>
              </div>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>Zameen Se Samriddhi Tak<br />Building India&apos;s largest verified farmer database.</p>
            </div>
            <div>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>Platform</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Link href="/center/login" style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'none' }}>DharaSetu Center Login</Link>
                <span style={{ fontSize: 13, color: '#64748B' }}>Farmer Registration</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>Wallet Management</span>
              </div>
            </div>
            <div>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>Company</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>About Us</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>Contact: +91 8619152422</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>Bharatpur, Rajasthan</span>
              </div>
            </div>
            <div>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>Legal</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Privacy Policy</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>Terms of Service</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#64748B' }}>© 2024 DharaSetu. All rights reserved.</p>
            <Link href="/admin/login" style={{ fontSize: 11, color: '#475569', textDecoration: 'none' }}>Admin</Link>
          </div>
        </div>
      </footer>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
