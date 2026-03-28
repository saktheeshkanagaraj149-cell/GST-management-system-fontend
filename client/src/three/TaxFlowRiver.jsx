// TaxFlowRiver.jsx — CSS animated flow visualization (no Three.js)
import { motion } from 'framer-motion';

const Wave = ({ delay, color, opacity, yOffset }) => (
  <motion.svg
    viewBox="0 0 400 80"
    preserveAspectRatio="none"
    style={{
      position: 'absolute', bottom: yOffset, left: 0,
      width: '100%', height: 80, opacity,
    }}
  >
    <motion.path
      d="M0 40 Q50 10 100 40 Q150 70 200 40 Q250 10 300 40 Q350 70 400 40"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      animate={{
        d: [
          'M0 40 Q50 10 100 40 Q150 70 200 40 Q250 10 300 40 Q350 70 400 40',
          'M0 40 Q50 70 100 40 Q150 10 200 40 Q250 70 300 40 Q350 10 400 40',
          'M0 40 Q50 10 100 40 Q150 70 200 40 Q250 10 300 40 Q350 70 400 40',
        ],
      }}
      transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  </motion.svg>
);

const labels = [
  { label: 'Input Tax', x: '15%', color: 'var(--accent-blue)' },
  { label: 'ITC Credit', x: '50%', color: 'var(--accent-green)' },
  { label: 'Output Tax', x: '82%', color: '#a78bfa' },
];

export default function TaxFlowRiver() {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', minHeight: 200,
      overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      {/* Animated waves */}
      <Wave delay={0}   color="var(--accent-blue)"  opacity={0.9} yOffset={40} />
      <Wave delay={0.5} color="var(--accent-green)" opacity={0.6} yOffset={60} />
      <Wave delay={1}   color="#a78bfa"             opacity={0.4} yOffset={20} />

      {/* Moving dots on the wave */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 10, height: 10, borderRadius: '50%',
            background: i === 0 ? 'var(--accent-blue)' : i === 1 ? 'var(--accent-green)' : '#a78bfa',
            boxShadow: `0 0 10px ${i === 0 ? 'var(--accent-blue)' : i === 1 ? 'var(--accent-green)' : '#a78bfa'}`,
            top: '50%',
          }}
          animate={{ x: ['0px', '380px'] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 1, ease: 'linear' }}
        />
      ))}

      {/* Labels */}
      <div style={{ position: 'absolute', bottom: 8, width: '100%', display: 'flex' }}>
        {labels.map(({ label, x, color }) => (
          <span
            key={label}
            style={{
              position: 'absolute', left: x, transform: 'translateX(-50%)',
              fontSize: '0.7rem', color, fontFamily: 'Space Mono', whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
