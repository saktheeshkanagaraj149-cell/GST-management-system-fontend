// BackgroundMesh.jsx — CSS animated gradient background (no Three.js)
import { useEffect, useRef } from 'react';

export default function BackgroundMesh() {
  return (
    <>
      <style>{`
        @keyframes bgPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes bgPulse2 {
          0%, 100% { opacity: 0.4; transform: scale(1.05); }
          50% { opacity: 0.7; transform: scale(1); }
        }
        .bg-orb-1 {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,119,255,0.12) 0%, transparent 70%);
          top: -150px; left: -150px;
          animation: bgPulse 8s ease-in-out infinite;
        }
        .bg-orb-2 {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,170,0.10) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: bgPulse2 10s ease-in-out infinite;
        }
        .bg-orb-3 {
          position: absolute;
          width: 350px; height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
          top: 40%; left: 50%;
          transform: translate(-50%, -50%);
          animation: bgPulse 12s ease-in-out infinite;
        }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
        <div className="bg-orb-3" />
      </div>
    </>
  );
}
