import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/invoices', icon: '🧾', label: 'Invoices' },
  { to: '/parties', icon: '🏢', label: 'Parties' },
  { to: '/products', icon: '📦', label: 'Products' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar() {
  // ✅ Use atomic selectors to prevent unnecessary re-renders
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'closed'}`} style={{ width: 240 }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '0.6rem',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, fontFamily: 'Space Mono',
          }}>₹</div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>GSTFlow</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 600, letterSpacing: '0.1em' }}>PRO</div>
          </div>
        </div>
        {user?.businessName && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Business</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.businessName}</div>
            {user.gstin && <div style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontFamily: 'Space Mono', marginTop: 2 }}>{user.gstin}</div>}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
                  background: isActive ? 'rgba(0,119,255,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,119,255,0.3)' : '1px solid transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  transition: 'all 0.2s', fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                <span>{label}</span>
                {isActive && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }} />}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: 'white',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user?.role || 'admin'}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '0.5rem' }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
