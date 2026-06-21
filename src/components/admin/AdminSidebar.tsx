'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useState, useEffect } from 'react';

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/admin/dashboard' },
  { icon: '🏪', label: 'CSC Operators', href: '/admin/operators' },
  { icon: '➕', label: 'Add Operator', href: '/admin/operators/add' },
  { icon: '👨‍🌾', label: 'Farmers', href: '/admin/farmers' },
  { icon: '💰', label: 'Payments', href: '/admin/payments' },
  { icon: '🏬', label: 'Market View', href: '/admin/market' },
  { icon: '💎', label: 'Commission', href: '/admin/commissions' },
  { icon: '📥', label: 'Downloads', href: '/admin/downloads' },
  { icon: '📋', label: 'Logs', href: '/admin/logs' },
  { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
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
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile header */}
      {isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(90deg, #064E3B, #166534)', zIndex: 45, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}>☰</button>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>DharaSetu Admin</span>
          <div style={{ width: 24 }} />
        </div>
      )}

      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39 }} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white' }}>
              ध
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>DharaSetu</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{user?.name || 'Admin'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'rgba(220,38,38,0.15)', cursor: 'pointer', color: '#FCA5A5' }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
