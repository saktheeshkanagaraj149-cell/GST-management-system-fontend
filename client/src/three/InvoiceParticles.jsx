// InvoiceParticles.jsx — CSS burst animation (no Three.js)
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['var(--accent-blue)', 'var(--accent-green)', 'var(--accent-amber)', '#a78bfa', '#f472b6'];

const Particle = ({ angle, distance, color, size }) => {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
        marginLeft: -size / 2, marginTop: -size / 2,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  );
};

export default function InvoiceParticles({ active }) {
  if (!active) return null;

  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * Math.PI * 2,
    distance: 40 + Math.random() * 60,
    color: COLORS[i % COLORS.length],
    size: 4 + Math.random() * 6,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999,
        }}>
          {particles.map((p, i) => <Particle key={i} {...p} />)}

          {/* ₹ flash */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute', fontSize: '2rem',
              fontFamily: 'Space Mono',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            ₹
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
