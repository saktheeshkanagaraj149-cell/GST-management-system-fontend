// HeroScene.jsx — CSS animated hero (no Three.js)
import { motion } from 'framer-motion';

const floatAnim = {
  animate: { y: [0, -18, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
};

const Particle = ({ x, y, size, delay, color }) => (
  <motion.div
    style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: size, height: size, borderRadius: '50%',
      background: color, opacity: 0.5,
    }}
    animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

export default function HeroScene() {
  const particles = [
    { x: 10, y: 20, size: 6, delay: 0, color: 'var(--accent-blue)' },
    { x: 25, y: 70, size: 4, delay: 0.5, color: 'var(--accent-green)' },
    { x: 40, y: 35, size: 8, delay: 1, color: 'var(--accent-blue)' },
    { x: 60, y: 60, size: 5, delay: 0.3, color: 'var(--accent-green)' },
    { x: 75, y: 25, size: 7, delay: 0.8, color: '#a78bfa' },
    { x: 85, y: 75, size: 4, delay: 1.5, color: 'var(--accent-amber)' },
    { x: 55, y: 15, size: 5, delay: 0.6, color: 'var(--accent-blue)' },
    { x: 30, y: 50, size: 6, delay: 1.2, color: '#a78bfa' },
    { x: 90, y: 45, size: 4, delay: 0.4, color: 'var(--accent-green)' },
    { x: 15, y: 80, size: 5, delay: 1.8, color: 'var(--accent-amber)' },
    { x: 70, y: 85, size: 3, delay: 0.9, color: 'var(--accent-blue)' },
    { x: 48, y: 88, size: 6, delay: 1.3, color: 'var(--accent-green)' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Ambient particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Floating ₹ symbol */}
      <motion.div
        {...floatAnim}
        style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          fontSize: '7rem', fontFamily: 'Space Mono, monospace',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 40px rgba(0,119,255,0.5))',
          userSelect: 'none',
        }}
      >
        ₹
      </motion.div>

      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 300, height: 300,
          transform: 'translate(-50%, -50%)',
          border: '1.5px solid rgba(0,119,255,0.15)',
          borderRadius: '50%',
          borderTopColor: 'rgba(0,212,170,0.5)',
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 220, height: 220,
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '50%',
          borderBottomColor: 'rgba(139,92,246,0.5)',
        }}
      />
    </div>
  );
}
