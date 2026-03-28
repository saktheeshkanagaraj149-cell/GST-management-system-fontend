import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import api from '../api/axios.config';

function ProductForm({ product, onClose, onSaved }) {
  const addToast = useStore((s) => s.addToast);
  const addProduct = useStore((s) => s.addProduct);
  const updateProductInStore = useStore((s) => s.updateProductInStore);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(product || {
    name: '',
    hsn: '',
    unit: 'Nos',
    rate: 0,
    gstRate: 18,
    category: '',
  });

  const validUnits = ['Nos', 'Kg', 'Mtr', 'Ltr', 'Box', 'Set'];
  const validGstRates = [0, 5, 12, 18, 28];

  const validateForm = () => {
    const newErrors = {};

    if (!form.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!form.hsn?.trim()) {
      newErrors.hsn = 'HSN code is required';
    }
    if (form.rate <= 0) {
      newErrors.rate = 'Price must be greater than 0';
    }
    if (!validUnits.includes(form.unit)) {
      newErrors.unit = 'Invalid unit selected';
    }
    if (!validGstRates.includes(form.gstRate)) {
      newErrors.gstRate = 'Invalid GST rate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('❌ Please fix the errors', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        hsn: form.hsn.trim(),
        unit: form.unit,
        rate: parseFloat(form.rate),
        gstRate: parseInt(form.gstRate),
        category: form.category.trim() || '',
      };

      if (product?._id) {
        const res = await api.put(`/products/${product._id}`, payload);
        updateProductInStore(res.data);
        addToast('✅ Product updated successfully!', 'success');
      } else {
        const res = await api.post('/products', payload);
        addProduct(res.data);
        addToast('✅ Product added successfully!', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save product';
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
          {product ? '✏️ Edit Product' : '➕ Add New Product'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Product Name */}
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Product Name *
            </label>
            <input 
              className="input-glow" 
              placeholder="e.g., Portland Cement 50kg"
              value={form.name} 
              onChange={e => handleInputChange('name', e.target.value)}
              style={{ borderColor: errors.name ? '#ff6b6b' : undefined }}
            />
            {errors.name && <span style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.25rem' }}>⚠️ {errors.name}</span>}
          </div>

          {/* HSN Code & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                HSN Code *
              </label>
              <input 
                className="input-glow" 
                placeholder="e.g., 2523"
                value={form.hsn} 
                onChange={e => handleInputChange('hsn', e.target.value)}
                style={{ borderColor: errors.hsn ? '#ff6b6b' : undefined }}
              />
              {errors.hsn && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.hsn}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Category
              </label>
              <input 
                className="input-glow" 
                placeholder="e.g., Materials"
                value={form.category} 
                onChange={e => handleInputChange('category', e.target.value)}
              />
            </div>
          </div>

          {/* Price, Unit, GST Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Price ₹ *
              </label>
              <input 
                className="input-glow" 
                type="number" 
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={form.rate}
                onChange={e => handleInputChange('rate', e.target.value ? parseFloat(e.target.value) : 0)}
                style={{ borderColor: errors.rate ? '#ff6b6b' : undefined }}
              />
              {errors.rate && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.rate}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Unit *
              </label>
              <select 
                className="input-glow" 
                value={form.unit} 
                onChange={e => handleInputChange('unit', e.target.value)}
                style={{ borderColor: errors.unit ? '#ff6b6b' : undefined }}
              >
                <option value="Nos">Nos (Piece)</option>
                <option value="Kg">Kg (Kilogram)</option>
                <option value="Mtr">Mtr (Meter)</option>
                <option value="Ltr">Ltr (Liter)</option>
                <option value="Box">Box</option>
                <option value="Set">Set</option>
              </select>
              {errors.unit && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.unit}</span>}
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                GST Rate % *
              </label>
              <select 
                className="input-glow" 
                value={form.gstRate} 
                onChange={e => handleInputChange('gstRate', parseInt(e.target.value))}
                style={{ borderColor: errors.gstRate ? '#ff6b6b' : undefined }}
              >
                {validGstRates.map(rate => (
                  <option key={rate} value={rate}>{rate}%</option>
                ))}
              </select>
              {errors.gstRate && <span style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>⚠️ {errors.gstRate}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? '⏳ Saving...' : '💾 Save Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Products() {
  const products = useStore((s) => s.products);
  const productsLoading = useStore((s) => s.productsLoading);
  const fetchProducts = useStore((s) => s.fetchProducts);
  const removeProduct = useStore((s) => s.removeProduct);
  const addToast = useStore((s) => s.addToast);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      removeProduct(id);
      addToast('✅ Product deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      addToast('❌ Failed to delete product', 'error');
    }
  };

  const handleAddNew = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="section-title">📦 Products</h2>
          <p className="section-subtitle">Manage your inventory and pricing</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          ➕ Add Product
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {productsLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            📭 No products found yet.
            <br />
            <button className="btn btn-primary" onClick={handleAddNew} style={{ marginTop: '1rem' }}>
              ➕ Add your first product
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>HSN</th>
                <th>Price</th>
                <th>Unit</th>
                <th>GST %</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="mono">{p.hsn || '—'}</td>
                  <td className="mono">₹{parseFloat(p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{p.unit}</td>
                  <td><span className="badge badge-blue">{p.gstRate}%</span></td>
                  <td>{p.category || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => handleEdit(p)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ color: '#ff6b6b' }}
                        onClick={() => handleDelete(p._id)}
                        title="Delete"
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
          <ProductForm 
            product={editProduct} 
            onClose={() => {
              setShowForm(false);
              setEditProduct(null);
            }} 
            onSaved={() => fetchProducts()} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
