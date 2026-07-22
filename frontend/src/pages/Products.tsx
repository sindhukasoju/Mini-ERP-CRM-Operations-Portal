import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, X, Search, Package, Activity, Edit2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location?: string;
}

interface StockMovement {
  id: number;
  quantity: number;
  type: string;
  reason: string;
  timestamp: string;
  user: { name: string };
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockMovement[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '10', location: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setFormData({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '10', location: '' });
    setIsEditMode(false);
    setSelectedProductId(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice.toString(),
      currentStock: product.currentStock.toString(),
      minStockAlert: product.minStockAlert.toString(),
      location: product.location || ''
    });
    setIsEditMode(true);
    setSelectedProductId(product.id);
    setIsProductModalOpen(true);
  };

  const openLogsModal = async (productId: number) => {
    setIsLogModalOpen(true);
    setLogLoading(true);
    try {
      const res = await api.get(`/products/${productId}/movements`);
      setStockLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLogLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock, 10),
        minStockAlert: parseInt(formData.minStockAlert, 10)
      };

      if (isEditMode && selectedProductId) {
        await api.put(`/products/${selectedProductId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Inventory Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage products, warehouses, and stock movements</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openAddModal}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className="input-field" 
            style={{ marginBottom: 0, paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Product Details</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Category & Location</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Unit Price</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Stock Level</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading Inventory...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No products found</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={18} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.sku}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div>{product.category}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.location || 'No Location'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>${product.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: product.currentStock <= product.minStockAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: product.currentStock <= product.minStockAlert ? 'var(--danger)' : 'var(--success)'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                      {product.currentStock} units
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => openLogsModal(product.id)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Activity size={14} /> Logs
                      </button>
                      <button onClick={() => openEditModal(product)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Product Name" className="input-field" style={{ marginBottom: 0 }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required type="text" placeholder="SKU (e.g., PROD-001)" className="input-field" style={{ marginBottom: 0 }} value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                <input required type="text" placeholder="Category" className="input-field" style={{ marginBottom: 0 }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Unit Price ($)</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="input-field" style={{ marginBottom: 0 }} value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Location / Warehouse</label>
                  <input type="text" placeholder="e.g., Warehouse A" className="input-field" style={{ marginBottom: 0 }} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Current Stock</label>
                  <input required type="number" className="input-field" style={{ marginBottom: 0 }} value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} disabled={isEditMode} title={isEditMode ? "Stock can only be modified via Movements or Challans" : ""} />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Min Alert Qty</label>
                  <input required type="number" className="input-field" style={{ marginBottom: 0 }} value={formData.minStockAlert} onChange={e => setFormData({...formData, minStockAlert: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancel</button>
                <button type="submit" className="btn-primary">{isEditMode ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movements Log Modal */}
      {isLogModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '2rem', background: 'var(--bg-secondary)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Stock Movement Logs</h3>
              <button onClick={() => setIsLogModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Reason</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>User</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logLoading ? (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading logs...</td></tr>
                  ) : stockLogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No movements recorded for this product yet.</td></tr>
                  ) : (
                    stockLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ 
                            padding: '0.15rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: log.type === 'IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: log.type === 'IN' ? 'var(--success)' : 'var(--danger)'
                          }}>{log.type}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{log.type === 'IN' ? '+' : '-'}{log.quantity}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{log.reason}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>{log.user.name}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
