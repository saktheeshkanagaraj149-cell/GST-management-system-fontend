import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroScene from '../three/HeroScene';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Hero Scene — Full background */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <HeroScene />
      </div>

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,0.7) 70%, rgba(10,15,30,0.95) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '2rem', textAlign: 'center',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 1rem', borderRadius: '2rem',
            background: 'rgba(0,119,255,0.15)', border: '1px solid rgba(0,119,255,0.4)',
            color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600,
            marginBottom: '1.5rem', letterSpacing: '0.05em',
          }}
        >
          🇮🇳 Made for India — GST Compliant
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}
        >
          <span className="gradient-text">GSTFlow</span>
          <span style={{ color: 'var(--text-primary)' }}> Pro</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: 520, lineHeight: 1.7, marginBottom: '2rem' }}
        >
          The most powerful GST management system for Indian businesses. Invoices, GSTR-1, GSTR-3B, and real-time analytics — all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            🚀 Get Started
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            📊 View Dashboard
          </button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ display: 'flex', gap: '0.75rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {['GSTR-1 & GSTR-3B', 'ITC Management', '3D Analytics', 'Gmail Integration', 'Canva Export'].map((f) => (
            <span key={f} style={{
              padding: '0.35rem 0.875rem', borderRadius: '2rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500,
            }}>{f}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
