import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios.config';
import useStore from '../store/useStore';

// ── Test credentials shown on the login page ──────────────────────────────
const TEST_EMAIL = 'admin@gstflowpro.in';
const TEST_PASSWORD = 'Admin@2025';

export default function Login() {
  const navigate = useNavigate();
  // ✅ Atomic selectors prevent unnecessary re-renders
  const setUser = useStore((s) => s.setUser);
  const addToast = useStore((s) => s.addToast);
  
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', gstin: '', businessName: '', state: 'Tamil Nadu',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const res = await api.post(endpoint, payload);
      setUser(res.data, res.data.token);
      addToast(`Welcome, ${res.data.name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setIsRegister(false);
    setForm((f) => ({ ...f, email: TEST_EMAIL, password: TEST_PASSWORD }));
    addToast('✅ Test credentials filled in!', 'info');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '1rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 440, padding: '2.5rem' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 1rem',
            borderRadius: '1rem', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontFamily: 'Space Mono',
          }}>₹</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>GSTFlow Pro</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* ── Test Credentials Banner ── */}
        {!isRegister && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0.875rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: '0.75rem',
              border: '1.5px solid var(--accent-amber)',
              background: 'rgba(245,158,11,0.08)',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.78rem',
            }}
          >
            <div style={{ color: 'var(--accent-amber)', fontWeight: 700, marginBottom: '0.35rem', fontFamily: 'Sora, sans-serif', letterSpacing: '0.03em' }}>
              ⚡ Test Credentials
            </div>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Email:</span>
              <span style={{ color: 'var(--text-primary)' }}>{TEST_EMAIL}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span>Password:</span>
              <span style={{ color: 'var(--text-primary)' }}>{TEST_PASSWORD}</span>
            </div>
            <motion.button
              onClick={fillTestCredentials}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                marginTop: '0.65rem', width: '100%', padding: '0.45rem',
                borderRadius: '0.5rem', border: '1px solid var(--accent-amber)',
                background: 'rgba(245,158,11,0.15)', color: 'var(--accent-amber)',
                fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Auto-fill &amp; Sign In →
            </motion.button>
          </motion.div>
        )}

        {/* Divider */}
        {!isRegister && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or enter your credentials</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <>
              <input className="input-glow" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
              <input className="input-glow" name="businessName" placeholder="Business Name" value={form.businessName} onChange={handleChange} />
              <input className="input-glow" name="gstin" placeholder="GSTIN (e.g. 33AABCS1234L1ZF)" value={form.gstin} onChange={handleChange} style={{ fontFamily: 'Space Mono', fontSize: '0.8rem' }} />
              <select className="input-glow" name="state" value={form.state} onChange={handleChange}>
                {['Tamil Nadu','Maharashtra','Gujarat','Karnataka','Delhi','West Bengal','Rajasthan','Uttar Pradesh','Kerala','Telangana'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}
          <input className="input-glow" type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
          <input className="input-glow" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center', padding: '0.875rem' }}>
            {loading ? '⏳ Please wait...' : isRegister ? '🚀 Create Account' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setIsRegister((r) => !r)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.875rem' }}>
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
