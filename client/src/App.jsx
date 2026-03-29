import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from './store/useStore';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Parties from './pages/Parties';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// ── Auth Loaders — prevent redirects until state is definitive ─────────────
const AuthLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '3px solid rgba(0,119,255,0.1)',
      borderTopColor: 'var(--accent-blue)',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const token = useStore((s) => s.token);
  const isAuthReady = useStore((s) => s.isAuthReady);

  // ✅ Don't render until we know auth state
  if (!isAuthReady) {
    return <AuthLoader />;
  }

  // ✅ If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = useStore((s) => s.token);
  const isAuthReady = useStore((s) => s.isAuthReady);

  // ✅ Don't render until we know auth state
  if (!isAuthReady) {
    return <AuthLoader />;
  }

  // ✅ If token exists, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  // ✅ Initialize auth state on app mount
  useEffect(() => {
    const initAuth = async () => {
      // This will trigger the initialization in useStore
      const state = useStore.getState();
      // Just accessing the state will trigger the init
      console.log('✅ Auth initialized:', state.isAuthReady);
      console.log('Current token:', import.meta.env.VITE_API_URL, state.token ? 'Exists' : 'None');
    };
    
    initAuth();
  }, []);

  return (
    <Routes>
      {/* ── Public Routes ────────────────────────────────────────────────── */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* ── Protected Routes ─────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/parties" element={<Parties />} />
        <Route path="/products" element={<Products />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
