import { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { useMCP } from '../hooks/useMCP';
import api from '../api/axios.config';

export default function Settings() {
  const { user, setUser, addToast } = useStore();
  const { sendGSTDueAlert } = useMCP();
  const [alerts, setAlerts] = useState({ gstr1: false, gstr3b: false });
  const [profile, setProfile] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    gstin: user?.gstin || '',
    state: user?.state || 'Tamil Nadu',
  });
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', profile);
      setUser({ ...user, ...res.data }, localStorage.getItem('gstflow_token'));
      addToast('Profile updated', 'success');
    } catch { addToast('Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  const handleAlertToggle = async (type) => {
    const newState = !alerts[type];
    setAlerts(a => ({ ...a, [type]: newState }));
    if (newState) {
      const label = type === 'gstr1' ? 'GSTR-1' : 'GSTR-3B';
      const day = type === 'gstr1' ? '11th' : '20th';
      await sendGSTDueAlert(label, day, user?.gstin || 'Your GSTIN');
    }
    addToast(`${type.toUpperCase()} alerts ${newState ? 'enabled' : 'disabled'}`, newState ? 'success' : 'info');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Settings</h2>
        <p className="section-subtitle">Profile & Notification Preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Profile */}
        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.25rem' }}>Business Profile</h3>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <input className="input-glow" placeholder="Your Name" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            <input className="input-glow" placeholder="Business Name" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} />
            <input className="input-glow" placeholder="GSTIN" value={profile.gstin} onChange={e => setProfile(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} style={{ fontFamily: 'Space Mono', fontSize: '0.8rem' }} maxLength={15} />
            <select className="input-glow" value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))}>
              {['Tamil Nadu','Maharashtra','Gujarat','Karnataka','Delhi','West Bengal','Rajasthan','Uttar Pradesh','Kerala','Telangana'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? '⏳ Saving...' : '💾 Save Profile'}</button>
          </form>
        </motion.div>

        {/* GST Alerts */}
        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.25rem' }}>📧 GST Filing Alerts</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Enable email reminders for GST filing due dates. Sent 3 days before the deadline via Gmail.
          </p>

          {[
            { key: 'gstr1', label: 'GSTR-1 Reminder', desc: 'Due every 11th — Outward supplies' },
            { key: 'gstr3b', label: 'GSTR-3B Reminder', desc: 'Due every 20th — Summary return' },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-deep)', borderRadius: '0.75rem', border: '1px solid var(--border)', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
              </div>
              <button
                onClick={() => handleAlertToggle(key)}
                style={{
                  width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: alerts[key] ? 'var(--accent-green)' : 'var(--border)',
                  transition: 'background 0.2s', position: 'relative',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: alerts[key] ? 24 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s', display: 'block',
                }} />
              </button>
            </div>
          ))}

          <div style={{ padding: '1rem', background: 'rgba(0,119,255,0.08)', borderRadius: '0.75rem', border: '1px solid rgba(0,119,255,0.2)', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', lineHeight: 1.6 }}>
              ℹ️ Alerts are sent via <strong>Gmail MCP</strong> integration. Make sure Gmail MCP is connected in your Antigravity environment.
            </div>
          </div>
        </motion.div>

        {/* Filing Calendar */}
        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1.25rem' }}>📅 GST Filing Calendar</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Key GST filing deadlines (FY 2025-26):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { label: 'GSTR-1', day: '11th of every month', color: 'var(--accent-green)' },
              { label: 'GSTR-3B', day: '20th of every month', color: 'var(--accent-blue)' },
              { label: 'GSTR-9 (Annual)', day: '31st December', color: 'var(--accent-amber)' },
            ].map(({ label, day, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-deep)', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{day}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>About GSTFlow Pro</h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <p>Version: <strong style={{ color: 'var(--text-primary)' }}>1.0.0</strong></p>
            <p>Stack: <strong style={{ color: 'var(--text-primary)' }}>React 18 + Vite 5 + Three.js r160</strong></p>
            <p>Database: <strong style={{ color: 'var(--text-primary)' }}>MongoDB Atlas</strong></p>
            <p style={{ marginTop: '0.75rem' }}>MCP Integrations:</p>
            <ul style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>📧 Gmail MCP</li>
              <li>📅 Google Calendar MCP</li>
              <li>🎨 Canva MCP</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
