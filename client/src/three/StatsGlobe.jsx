// StatsGlobe.jsx — CSS animated state-wise GST chart (no Three.js)
import { motion } from 'framer-motion';

const states = [
  { name: 'TN', value: 85, color: 'var(--accent-blue)' },
  { name: 'MH', value: 95, color: 'var(--accent-green)' },
  { name: 'GJ', value: 70, color: '#a78bfa' },
  { name: 'KA', value: 80, color: 'var(--accent-amber)' },
  { name: 'DL', value: 90, color: 'var(--accent-blue)' },
  { name: 'WB', value: 60, color: 'var(--accent-green)' },
  { name: 'RJ', value: 55, color: '#a78bfa' },
  { name: 'UP', value: 75, color: 'var(--accent-amber)' },
];

export default function StatsGlobe() {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 240,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      gap: '0.5rem', padding: '1rem 0.5rem 0',
    }}>
      {/* Bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, width: '100%' }}>
        {states.map((s, i) => (
          <div key={s.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${s.value}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
              style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                background: `linear-gradient(to top, ${s.color}, ${s.color}88)`,
                boxShadow: `0 0 8px ${s.color}55`,
                minHeight: 4,
              }}
            />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Scanning line animation */}
      <div style={{ position: 'relative', height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)' }}
        />
      </div>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
        State-wise GST Collection (₹ Lakhs)
      </p>
    </div>
  );
}
