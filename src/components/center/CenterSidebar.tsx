'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/api';

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/center/dashboard' },
  { icon: '➕', label: 'Add Farmer', href: '/center/add-farmer' },
  { icon: '👨‍🌾', label: 'My Farmers', href: '/center/my-farmers' },
  { icon: '💰', label: 'Wallet', href: '/center/wallet' },
  { icon: '💎', label: 'Commission', href: '/center/commission' },
  { icon: '📋', label: 'Payment History', href: '/center/payment-history' },
  { icon: '📥', label: 'Downloads', href: '/center/downloads' },
  { icon: '👤', label: 'Profile', href: '/center/profile' },
  { icon: '❓', label: 'Help', href: '/center/help' },
];

export default function CenterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/center/login');
  };

  return (
    <>
      {/* Mobile header */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(90deg, #064E3B, #166534)', zIndex: 45, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}>☰</button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>DharaSetu Center</span>
            <br />
            <span style={{ color: '#FDE68A', fontSize: 11, fontWeight: 600 }}>💰 {formatCurrency(user?.walletBalance || 0)}</span>
          </div>
          <div style={{ width: 24 }} />
        </div>
      )}

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39 }} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>🏪</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>DharaSetu Center</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{user?.operatorId}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#FDE68A', fontWeight: 700 }}>💰 {formatCurrency(user?.walletBalance || 0)}</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'rgba(220,38,38,0.15)', cursor: 'pointer', color: '#FCA5A5' }}>
            <span style={{ fontSize: 18 }}>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Bottom mobile nav */}
      <div className="mobile-nav">
        {[
          { icon: '📊', label: 'Home', href: '/center/dashboard' },
          { icon: '➕', label: 'Add', href: '/center/add-farmer' },
          { icon: '👨‍🌾', label: 'Farmers', href: '/center/my-farmers' },
          { icon: '💰', label: 'Wallet', href: '/center/wallet' },
          { icon: '👤', label: 'Profile', href: '/center/profile' },
        ].map(item => (
          <Link key={item.href} href={item.href} className={`mobile-nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
