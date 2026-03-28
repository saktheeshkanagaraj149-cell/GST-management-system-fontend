import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useStore from '../store/useStore';
import { formatCurrency, formatDate, statusBadgeClass, typeBadgeClass, monthName } from '../utils/formatters';
import StatsGlobe from '../three/StatsGlobe';
import api from '../api/axios.config';

// Animated Counter
function AnimCounter({ value, prefix = '₹', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let raf;
    const duration = 1200;
    const start = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) raf = requestAnimationFrame(start);
    };
    startRef.current = null;
    raf = requestAnimationFrame(start);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('en-IN');

  return <span>{prefix}{formatted}</span>;
}

const STAT_CARDS = (stats) => [
  { label: 'Sales This Month', value: stats.salesTotal, icon: '💹', color: 'var(--accent-green)', sub: `${stats.salesCount} invoices` },
  { label: 'Purchases This Month', value: stats.purchasesTotal, icon: '🛒', color: 'var(--accent-amber)', sub: `${stats.purchasesCount} invoices` },
  { label: 'Output GST', value: stats.salesGST, icon: '📤', color: 'var(--accent-blue)', sub: 'Total GST collected' },
  { label: 'Net GST Payable', value: Math.abs(stats.netGSTPayable), icon: stats.netGSTPayable > 0 ? '💰' : '✅', color: stats.netGSTPayable > 0 ? 'var(--accent-red)' : 'var(--accent-green)', sub: stats.netGSTPayable > 0 ? 'Amount to pay' : 'ITC Credit available' },
];

export default function Dashboard() {
  // ✅ Stable selectors — primitive values, no function refs in deps
  const dashboardStats = useStore((s) => s.dashboardStats);
  const statsLoading = useStore((s) => s.statsLoading);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // ✅ Call API directly — avoids unstable Zustand function refs causing re-renders
    let cancelled = false;
    useStore.setState({ statsLoading: true });

    const load = async () => {
      try {
        const [statsRes, monthlyRes] = await Promise.all([
          api.get('/reports/dashboard').catch(() => ({ data: {} })),
          api.get('/reports/monthly').catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        useStore.setState({ dashboardStats: statsRes.data, statsLoading: false });
        const byMonth = {};
        (monthlyRes.data || []).forEach((d) => {
          const m = monthName(d._id.month);
          if (!byMonth[m]) byMonth[m] = { month: m, sales: 0, purchases: 0 };
          if (d._id.type === 'sales') byMonth[m].sales = d.total;
          else byMonth[m].purchases = d.total;
        });
        setMonthlyData(Object.values(byMonth));
      } catch (_) {
        if (!cancelled) useStore.setState({ statsLoading: false });
      }
    };

    load();
    return () => { cancelled = true; }; // ✅ cleanup on unmount
  }, []); // ✅ runs ONCE only

  const stats = dashboardStats || {};
  const cards = STAT_CARDS({
    salesTotal: stats.salesTotal || 0,
    salesCount: stats.salesCount || 0,
    purchasesTotal: stats.purchasesTotal || 0,
    purchasesCount: stats.purchasesCount || 0,
    salesGST: stats.salesGST || 0,
    netGSTPayable: stats.netGSTPayable || 0,
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Dashboard</h2>
        <p className="section-subtitle">GST overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '1.8rem', opacity: 0.15 }}>{card.icon}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, fontFamily: 'Space Mono', marginBottom: '0.25rem' }}>
              {statsLoading ? <div className="skeleton" style={{ height: 28, width: 120 }} /> : <AnimCounter value={card.value} />}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.sub}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: card.color, opacity: 0.4 }} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1rem', marginBottom: '1rem' }}>
        {/* Monthly Chart */}
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Monthly Sales vs Purchases</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPurchase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: 12 }} />
              <Area type="monotone" dataKey="sales" stroke="#00d4aa" strokeWidth={2} fill="url(#gradSales)" name="Sales" />
              <Area type="monotone" dataKey="purchases" stroke="#f59e0b" strokeWidth={2} fill="url(#gradPurchase)" name="Purchases" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* State chart */}
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>State-wise GST</h3>
          <div style={{ height: 280 }}>
            <StatsGlobe />
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Invoices</h3>
        {statsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Invoice No</th><th>Party</th><th>Type</th><th>Date</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(stats.recentInvoices || []).map((inv) => (
                <tr key={inv._id}>
                  <td className="mono" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}>{inv.invoiceNo}</td>
                  <td>{inv.party?.name}</td>
                  <td><span className={`badge ${typeBadgeClass(inv.type)}`}>{inv.type}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(inv.date)}</td>
                  <td className="mono" style={{ fontWeight: 700 }}>{formatCurrency(inv.total)}</td>
                  <td><span className={`badge ${statusBadgeClass(inv.status)}`}>{inv.status}</span></td>
                </tr>
              ))}
              {(!stats.recentInvoices || stats.recentInvoices.length === 0) && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No invoices yet. Create your first invoice!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
