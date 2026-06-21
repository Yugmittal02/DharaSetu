'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #064E3B 0%, #065F46 30%, #047857 60%, #059669 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Gold accent glow */}
      <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>
            ध
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>DharaSetu</h1>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.5px' }}>Zameen Se Samriddhi Tak</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div className="animate-fadeIn">
          <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(245,158,11,0.2)', borderRadius: 24, marginBottom: 24 }}>
            <span style={{ color: '#FDE68A', fontSize: 13, fontWeight: 600 }}>🌾 India&apos;s Rural Tech Platform</span>
          </div>
          
          <h2 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1px' }}>
            Connecting Farmers<br />
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #FDE68A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              to Prosperity
            </span>
          </h2>
          
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.6 }}>
            DharaSetu empowers CSC/VLE operators to onboard farmers with seamless digital registration, real-time wallet management, and complete documentation services.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/admin/login" className="btn btn-gold" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 12 }}>
              🔐 Admin Login
            </Link>
            <Link href="/center/login" className="btn" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 12, background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              🏪 DharaSetu Center Login
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 80 }} className="animate-fadeIn">
          {[
            { icon: '🏪', label: 'CSC Centers', value: 'Pan India Network' },
            { icon: '🌾', label: 'Farmer Onboarding', value: 'Digital & Fast' },
            { icon: '💰', label: 'Wallet System', value: 'Real-time Tracking' },
            { icon: '📊', label: 'Reports', value: 'Excel/CSV Export' },
          ].map((stat, i) => (
            <div key={i} style={{ 
              background: 'rgba(255,255,255,0.08)', 
              backdropFilter: 'blur(10px)', 
              borderRadius: 16, 
              padding: 24, 
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{stat.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ marginTop: 80, textAlign: 'left' }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 40 }}>
            Platform Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { icon: '👨‍🌾', title: 'Farmer Registration', desc: 'Multi-step onboarding with ₹149 Basic and ₹249 Complete Documentation packages' },
              { icon: '💳', title: 'Wallet Management', desc: 'Real-time wallet with auto-deduction on farmer registration, instant balance updates' },
              { icon: '🆔', title: 'Unique ID System', desc: 'Auto-generated Farmer IDs (DSF-BHR-XXXXXX) and Center IDs (DSC-BHR-XXXX)' },
              { icon: '📱', title: 'Installable PWA', desc: 'Works offline, installable on mobile devices, fast and responsive' },
              { icon: '🔒', title: 'Secure & Role-based', desc: 'JWT authentication with Super Admin, Admin, and Operator roles' },
              { icon: '📈', title: 'Analytics & Export', desc: 'Real-time dashboards, market view, commission tracking, Excel/CSV exports' },
            ].map((f, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.06)', 
                borderRadius: 16, 
                padding: 24,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>{f.title}</h4>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            © 2024 DharaSetu • Zameen Se Samriddhi Tak • Built with ❤️ for Indian Farmers
          </p>
        </footer>
      </main>
    </div>
  );
}
