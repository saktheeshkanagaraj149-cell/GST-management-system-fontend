import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import api from '../api/axios.config';
import { formatCurrency } from '../utils/formatters';
import TaxFlowRiver from '../three/TaxFlowRiver';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Current Month');
  const addToast = useStore((s) => s.addToast); // ✅ Atomic selector

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reports/dashboard'); // Use dashboard stats for overview
        setReports(res.data);
      } catch (err) {
        addToast('Failed to load reports', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = reports || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title">GST Reports</h2>
          <p className="section-subtitle">GSTR-1 & GSTR-3B Summary</p>
        </div>
        <select className="input-glow" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
          <option>Current Month</option>
          <option>Last Quarter</option>
          <option>Financial Year 2024-25</option>
        </select>
      </div>

      {/* Tax Flow Visualization */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', minHeight: 400 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>GST Flow Visualization</h3>
        <div style={{ height: 320 }}>
          <TaxFlowRiver />
        </div>
      </div>

      {/* GSTR Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* GSTR-1 View */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-blue)' }}>GSTR-1 Summary</h3>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>📥 Export JSON</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'B2B Invoices', value: stats.salesTotal || 0, count: stats.salesCount || 0 },
              { label: 'B2C Invoices (Others)', value: 0, count: 0 },
              { label: 'Credit/Debit Notes', value: 0, count: 0 },
              { label: 'Export Invoices', value: 0, count: 0 },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-deep)', borderRadius: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{f.count} Documents</div>
                </div>
                <div className="mono" style={{ fontWeight: 700 }}>{formatCurrency(f.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GSTR-3B View */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-green)' }}>GSTR-3B Summary</h3>
            <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>📥 Export PDF</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-deep)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Eligible ITC</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)' }}>{formatCurrency(stats.purchasesGST || 0)}</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-deep)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Outward Taxable Supply</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{formatCurrency(stats.salesGST || 0)}</div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-red)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Net Tax Payable</div>
              <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                {formatCurrency(Math.max(0, (stats.salesGST || 0) - (stats.purchasesGST || 0)))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
