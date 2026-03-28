import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { useInvoices } from '../hooks/useInvoices';
import { useMCP } from '../hooks/useMCP';
import { formatCurrency, formatDate, statusBadgeClass, typeBadgeClass } from '../utils/formatters';
import { processItems, GST_RATES } from '../utils/gstCalculator';
import InvoiceParticles from '../three/InvoiceParticles';

// ── Invoice Form Modal ─────────────────────────────────────────
function InvoiceForm({ invoice, parties, products, onClose, onSaved }) {
  const { createInvoice, updateInvoice } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(invoice || {
    type: 'sales', party: { name: '', gstin: '', state: 'Tamil Nadu' }, items: [
      { desc: '', hsn: '', qty: 1, rate: 0, gstRate: 18, amount: 0 }
    ], status: 'confirmed',
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setParty = (k, v) => setForm(f => ({ ...f, party: { ...f.party, [k]: v } }));
  const setItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    setForm(f => ({ ...f, items }));
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { desc: '', hsn: '', qty: 1, rate: 0, gstRate: 18, amount: 0 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const computed = processItems(form.items, form.party.state);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, ...computed };
      if (invoice?._id) await updateInvoice(invoice._id, payload);
      else await createInvoice(payload);
      onSaved();
    } catch (err) {} finally { setLoading(false); }
  };

  const selectParty = (p) => setForm(f => ({ ...f, party: { partyId: p._id, name: p.name, gstin: p.gstin || '', state: p.state || 'Tamil Nadu' } }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-box" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{invoice ? 'Edit Invoice' : 'New Invoice'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
              <select className="input-glow" value={form.type} onChange={e => setField('type', e.target.value)}>
                <option value="sales">Sales</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
              <select className="input-glow" value={form.status} onChange={e => setField('status', e.target.value)}>
                <option value="confirmed">Confirmed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Party */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Party</label>
            <select className="input-glow" style={{ marginBottom: '0.5rem' }} onChange={e => { const p = parties.find(x => x._id === e.target.value); if (p) selectParty(p); }}>
              <option value="">— Select Party —</option>
              {parties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <input className="input-glow" placeholder="Party Name" value={form.party.name} onChange={e => setParty('name', e.target.value)} required />
              <input className="input-glow" placeholder="GSTIN" value={form.party.gstin} onChange={e => setParty('gstin', e.target.value)} style={{ fontFamily: 'Space Mono', fontSize: '0.75rem' }} />
              <input className="input-glow" placeholder="State" value={form.party.state} onChange={e => setParty('state', e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Line Items</label>
              <button type="button" onClick={addItem} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>+ Add Item</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 28px', gap: '0.4rem', alignItems: 'center' }}>
                  <input className="input-glow" placeholder="Description" value={item.desc} onChange={e => setItem(i, 'desc', e.target.value)} required />
                  <input className="input-glow" placeholder="HSN" value={item.hsn} onChange={e => setItem(i, 'hsn', e.target.value)} />
                  <input className="input-glow" type="number" placeholder="Qty" min="0" value={item.qty} onChange={e => setItem(i, 'qty', parseFloat(e.target.value) || 0)} />
                  <input className="input-glow" type="number" placeholder="Rate ₹" min="0" value={item.rate} onChange={e => setItem(i, 'rate', parseFloat(e.target.value) || 0)} />
                  <select className="input-glow" value={item.gstRate} onChange={e => setItem(i, 'gstRate', parseInt(e.target.value))}>
                    {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                  <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '1.1rem', padding: '0.2rem' }}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{ background: 'var(--bg-deep)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Taxable', value: computed.taxable },
              ...(computed.cgst > 0 ? [{ label: 'CGST', value: computed.cgst }, { label: 'SGST', value: computed.sgst }] : [{ label: 'IGST', value: computed.igst }]),
              { label: 'Total', value: computed.total, big: true },
            ].map(f => (
              <div key={f.label} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: f.big ? '1.1rem' : '0.9rem', fontWeight: f.big ? 800 : 600, fontFamily: 'Space Mono', color: f.big ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                  {formatCurrency(f.value)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Saving...' : invoice ? '💾 Update Invoice' : '✅ Create Invoice'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Invoices Page ─────────────────────────────────────────
export default function Invoices() {
  // ✅ useInvoices hooks already use atomic selectors internally where possible
  const { invoices, invoicesLoading, fetchInvoices, deleteInvoice } = useInvoices();
  
  // ✅ Convert useStore to atomic selectors
  const parties = useStore((s) => s.parties);
  const fetchParties = useStore((s) => s.fetchParties);
  const products = useStore((s) => s.products);
  const fetchProducts = useStore((s) => s.fetchProducts);
  
  const { sendInvoiceEmail, generateInvoiceDesign, createInvoiceFollowUp } = useMCP();
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [filter, setFilter] = useState({ type: '', status: '' });
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    fetchInvoices(filter);
    fetchParties();
    fetchProducts();
  }, [filter]); // fetchInvoices/Parties/Products refs are stable enough here, but filter is the main trigger

  const handleSaved = () => {
    setShowForm(false);
    setEditInvoice(null);
    setBurst(true);
    setTimeout(() => setBurst(false), 3000);
    fetchInvoices(filter);
  };

  return (
    <div>
      <InvoiceParticles trigger={burst} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h2 className="section-title">Invoices</h2>
          <p className="section-subtitle">Manage sales & purchase invoices</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditInvoice(null); setShowForm(true); }}>
          + New Invoice
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <select className="input-glow" style={{ width: 'auto' }} value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          <option value="sales">Sales</option>
          <option value="purchase">Purchase</option>
        </select>
        <select className="input-glow" style={{ width: 'auto' }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {invoicesLoading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Invoice No</th><th>Type</th><th>Party</th><th>Date</th><th>Taxable</th><th>GST</th><th>Total</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td className="mono" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}>{inv.invoiceNo}</td>
                  <td><span className={`badge ${typeBadgeClass(inv.type)}`}>{inv.type}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.party?.name}</div>
                    {inv.party?.gstin && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{inv.party.gstin}</div>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(inv.date)}</td>
                  <td className="mono">{formatCurrency(inv.taxable)}</td>
                  <td className="mono" style={{ color: 'var(--accent-amber)' }}>
                    {formatCurrency(inv.cgst + inv.sgst + inv.igst)}
                  </td>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{formatCurrency(inv.total)}</td>
                  <td><span className={`badge ${statusBadgeClass(inv.status)}`}>{inv.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => { setEditInvoice(inv); setShowForm(true); }}>✏️</button>
                      <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} title="Send via Gmail" onClick={() => sendInvoiceEmail(inv, inv.party?.email || '')} >📧</button>
                      <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} title="Canva Design" onClick={() => generateInvoiceDesign(inv)}>🎨</button>
                      <button className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} title="Follow-up Reminder" onClick={() => createInvoiceFollowUp(inv)}>📅</button>
                      <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => deleteInvoice(inv._id)}>🗑️</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No invoices found. Create your first invoice!</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <InvoiceForm
            invoice={editInvoice}
            parties={parties}
            products={products}
            onClose={() => { setShowForm(false); setEditInvoice(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
