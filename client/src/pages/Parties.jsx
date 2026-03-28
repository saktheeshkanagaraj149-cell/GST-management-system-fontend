import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import api from '../api/axios.config';

function PartyForm({ party, onClose, onSaved }) {
  const addToast = useStore((s) => s.addToast);
  const addParty = useStore((s) => s.addParty);
  const updatePartyInStore = useStore((s) => s.updatePartyInStore);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState(party || {
    name: '',
    type: 'customer',
    gstin: '',
    state: 'Tamil Nadu',
    phone: '',
    email: '',
    address: '',
  });

  // ✅ GSTIN Regex from backend model
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    
    // Name is required
    if (!form.name?.trim()) {
      newErrors.name = 'Party name is required';
    }
    
    // Type is required
    if (!form.type || !['customer', 'vendor'].includes(form.type)) {
      newErrors.type = 'Valid party type is required';
    }
    
    // GSTIN validation - only if provided
    if (form.gstin && form.gstin.trim()) {
      if (!gstinRegex.test(form.gstin.trim())) {
        newErrors.gstin = 'Invalid GSTIN format. Example: 33AABCS1234L1ZF';
      }
    }
    
    // Email validation - only if provided
    if (form.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validate
    if (!validateForm()) {
      addToast('❌ Please fix the errors', 'error');
      console.error('❌ Validation errors:', errors);
      return;
    }

    setLoading(true);
    try {
      // ✅ Prepare payload - match backend schema exactly
      const payload = {
        name: form.name.trim(),
        type: form.type,
        gstin: form.gstin.trim() || '', // Empty string if not provided
        state: form.state || '',
        phone: form.phone.trim() || '',
        email: form.email.trim() || '',
        address: form.address.trim() || '',
      };

      console.log('📤 Sending party payload:', payload);

      if (party?._id) {
        // ✅ UPDATE
        const res = await api.put(`/parties/${party._id}`, payload);
        console.log('✅ Party updated:', res.data);
        updatePartyInStore(res.data);
        addToast('✅ Party updated successfully!', 'success');
      } else {
        // ✅ CREATE
        const res = await api.post('/parties', payload);
        console.log('✅ Party created:', res.data);
        addParty(res.data);
        addToast('✅ Party added successfully!', 'success');
      }
      
      onSaved();
      onClose();
    } catch (err) {
      console.error('❌ API Error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        fullError: err.response?.data
      });
      
      // Handle specific error messages
      let errorMsg = 'Failed to save party';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMsg = 'Party with this GSTIN already exists';
      } else if (err.response?.status === 400) {
        errorMsg = 'Invalid data. Check GSTIN format if provided.';
      }
      
      addToast(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div 
        className="modal-box" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 20 }}
        style={{ maxWidth: 500 }}
      >
        <h3 style={{ marginBottom: '1.5rem' }}>
          {party ? '✏️ Edit Party' : '➕ Add New Party'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Name & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Party Name *
              </label>
              <input 
                className="input-glow" 
                placeholder="e.g., ABC Enterprises"
                value={form.name} 
                onChange={e => handleInputChange('name', e.target.value)}
                style={{ borderColor: errors.name ? '#ff6b6b' : undefined }}
              />
              {errors.name && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.name}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Type *
              </label>
              <select 
                className="input-glow" 
                value={form.type} 
                onChange={e => handleInputChange('type', e.target.value)}
                style={{ borderColor: errors.type ? '#ff6b6b' : undefined }}
              >
                <option value="customer">👤 Customer</option>
                <option value="vendor">🏭 Vendor</option>
              </select>
              {errors.type && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.type}</span>}
            </div>
          </div>

          {/* GSTIN */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              GSTIN (Optional)
            </label>
            <input 
              className="input-glow" 
              placeholder="e.g., 33AABCS1234L1ZF"
              value={form.gstin} 
              onChange={e => handleInputChange('gstin', e.target.value.toUpperCase())}
              style={{ 
                fontFamily: 'monospace',
                borderColor: errors.gstin ? '#ff6b6b' : undefined 
              }}
            />
            {errors.gstin && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.gstin}</span>}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Format: 2 digits + 5 letters + 4 digits + 1 letter + 1-9/A-Z + Z + 1 alphanumeric
            </div>
          </div>

          {/* Email & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Email
              </label>
              <input 
                className="input-glow" 
                type="email"
                placeholder="contact@example.com"
                value={form.email} 
                onChange={e => handleInputChange('email', e.target.value)}
                style={{ borderColor: errors.email ? '#ff6b6b' : undefined }}
              />
              {errors.email && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.email}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Phone
              </label>
              <input 
                className="input-glow" 
                placeholder="+91 XXXXX XXXXX"
                value={form.phone} 
                onChange={e => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* State */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              State
            </label>
            <select 
              className="input-glow" 
              value={form.state} 
              onChange={e => handleInputChange('state', e.target.value)}
            >
              {[
                'Tamil Nadu', 'Maharashtra', 'Gujarat', 'Karnataka', 'Delhi',
                'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Kerala', 'Telangana',
                'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar', 'Jharkhand',
                'Odisha', 'Assam', 'Himachal Pradesh', 'Uttarakhand', 'Chhattisgarh',
                'Goa', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura', 'Ladakh'
              ].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Address
            </label>
            <textarea 
              className="input-glow" 
              placeholder="Street, City, PIN Code"
              rows={2} 
              value={form.address} 
              onChange={e => handleInputChange('address', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Saving...' : '💾 Save Party'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Parties() {
  const parties = useStore((s) => s.parties);
  const partiesLoading = useStore((s) => s.partiesLoading);
  const fetchParties = useStore((s) => s.fetchParties);
  const removeParty = useStore((s) => s.removeParty);
  const addToast = useStore((s) => s.addToast);

  const [showForm, setShowForm] = useState(false);
  const [editParty, setEditParty] = useState(null);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this party?')) return;
    try {
      await api.delete(`/parties/${id}`);
      removeParty(id);
      addToast('✅ Party deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      addToast('❌ Failed to delete party', 'error');
    }
  };

  const handleAddNew = () => {
    setEditParty(null);
    setShowForm(true);
  };

  const handleEdit = (party) => {
    setEditParty(party);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title">👥 Parties</h2>
          <p className="section-subtitle">Manage your customers and vendors</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          ➕ Add Party
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {partiesLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Loading parties...
          </div>
        ) : parties.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            📭 No parties found yet.
            <br />
            <button className="btn btn-primary" onClick={handleAddNew} style={{ marginTop: '1rem' }}>
              ➕ Add your first party
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>GSTIN</th>
                <th>State</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parties.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span className={`badge ${p.type === 'vendor' ? 'badge-amber' : 'badge-blue'}`}>
                      {p.type === 'vendor' ? '🏭 Vendor' : '👤 Customer'}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: '0.85rem' }}>{p.gstin || '—'}</td>
                  <td>{p.state || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {p.email && <div>📧 {p.email}</div>}
                    {p.phone && <div>📱 {p.phone}</div>}
                    {!p.email && !p.phone && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => handleEdit(p)}
                        title="Edit party"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ color: '#ff6b6b' }}
                        onClick={() => handleDelete(p._id)}
                        title="Delete party"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <PartyForm 
            party={editParty} 
            onClose={() => {
              setShowForm(false);
              setEditParty(null);
            }} 
            onSaved={() => {
              fetchParties();
              setShowForm(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
