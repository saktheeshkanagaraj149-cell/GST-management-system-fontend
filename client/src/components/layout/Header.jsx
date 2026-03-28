import { useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', icon: '📊' },
  '/invoices': { title: 'Invoices', icon: '🧾' },
  '/parties': { title: 'Parties', icon: '🏢' },
  '/products': { title: 'Products', icon: '📦' },
  '/reports': { title: 'Reports', icon: '📈' },
  '/settings': { title: 'Settings', icon: '⚙️' },
};

export default function Header() {
  const { pathname } = useLocation();
  const toggleSidebar = useStore((s) => s.toggleSidebar); // ✅ Atomic selector
  const page = PAGE_TITLES[pathname] || { title: 'GSTFlow Pro', icon: '₹' };
  const now = new Date();

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center',
      padding: '0 1.5rem', borderBottom: '1px solid var(--border)',
      background: 'rgba(8,13,28,0.8)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 30, gap: '1rem',
    }}>
      <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', display: 'flex' }}>☰</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        <span style={{ fontSize: '1.1rem' }}>{page.icon}</span>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{page.title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
            {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)' }}>🟢 Live</div>
        </div>
      </div>
    </header>
  );
}
