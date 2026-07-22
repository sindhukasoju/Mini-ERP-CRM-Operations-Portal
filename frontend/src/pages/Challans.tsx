import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, X, Search, FileText, CheckCircle, Trash2 } from 'lucide-react';

interface Challan {
  id: number;
  challanNumber: string;
  customer: { name: string, businessName: string };
  user: { name: string };
  totalQuantity: number;
  status: string;
  createdAt: string;
}

interface Customer {
  id: number;
  name: string;
  businessName: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<{ productId: string, quantity: number }[]>([]);

  const fetchChallans = async () => {
    try {
      const res = await api.get('/challans');
      setChallans(res.data);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const custRes = await api.get('/customers');
      const prodRes = await api.get('/products');
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      console.error('Failed to fetch dependencies', error);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchDependencies();
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleConfirm = async (id: number) => {
    if (!window.confirm('Are you sure you want to confirm this challan? This will deduct stock.')) return;
    try {
      await api.post(`/challans/${id}/confirm`);
      fetchChallans();
      alert('Challan confirmed successfully!');
    } catch (error: any) {
      console.error('Failed to confirm challan', error);
      alert(error.response?.data?.error || 'Failed to confirm challan due to insufficient stock.');
    }
  };

  const handleSubmitChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return alert('Please select a customer');
    if (items.length === 0) return alert('Please add at least one product');
    if (items.some(i => !i.productId || i.quantity <= 0)) return alert('Please fill all item details correctly');

    try {
      await api.post('/challans', {
        customerId: Number(selectedCustomerId),
        items: items.map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) }))
      });
      setIsModalOpen(false);
      setSelectedCustomerId('');
      setItems([]);
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create challan');
    }
  };

  const filteredChallans = challans.filter(c => 
    c.challanNumber.toLowerCase().includes(search.toLowerCase()) || 
    c.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Sales Challans</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage dispatches and stock releases</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleOpenModal}>
          <Plus size={18} /> New Challan
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by challan number or customer..." 
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
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Challan No.</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Items Qty</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Created By</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : filteredChallans.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No challans found</td></tr>
            ) : (
              filteredChallans.map((challan) => (
                <tr key={challan.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={18} color="var(--accent-primary)" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{challan.challanNumber}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{new Date(challan.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{challan.customer.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{challan.customer.businessName}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{challan.totalQuantity}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{challan.user.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: challan.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: challan.status === 'CONFIRMED' ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {challan.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    {challan.status === 'DRAFT' && (
                      <button 
                        onClick={() => handleConfirm(challan.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        <CheckCircle size={14} /> Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: 'var(--bg-secondary)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Create Draft Challan</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmitChallan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Customer</label>
                <select className="input-field" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required>
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.businessName})</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Products</label>
                  <button type="button" onClick={handleAddItem} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Row</button>
                </div>
                
                {items.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>No products added yet.</div>}
                
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <select 
                      className="input-field" 
                      style={{ marginBottom: 0, flex: 2 }} 
                      value={item.productId} 
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      className="input-field" 
                      style={{ marginBottom: 0, flex: 1 }} 
                      placeholder="Qty" 
                      value={item.quantity} 
                      min="1"
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => handleRemoveItem(index)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '0 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Save Draft Challan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;
