import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, X, Search, Edit2, FileText } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  type: string;
  status: string;
  address: string;
  gstNumber?: string;
  followUpDate?: string;
  notes?: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState('');
  
  // Selected customer for View/Edit
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '', businessName: '', mobile: '', email: '', type: 'RETAIL', address: '',
    gstNumber: '', status: 'ACTIVE', followUpDate: '', notes: ''
  });

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      // We check for res.data.data because the backend now returns { data: [], meta: {} }
      setCustomers(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setFormData({ name: '', businessName: '', mobile: '', email: '', type: 'RETAIL', address: '', gstNumber: '', status: 'ACTIVE', followUpDate: '', notes: '' });
    setIsEditMode(false);
    setSelectedCustomerId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setFormData({
      name: customer.name,
      businessName: customer.businessName,
      mobile: customer.mobile,
      email: customer.email || '',
      type: customer.type,
      address: customer.address,
      gstNumber: customer.gstNumber || '',
      status: customer.status,
      followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '',
      notes: customer.notes || ''
    });
    setIsEditMode(true);
    setSelectedCustomerId(customer.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedCustomerId) {
        await api.put(`/customers/${selectedCustomerId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Failed to save customer', error);
      alert('Failed to save customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Customers CRM</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your client relationships, follow-ups, and notes</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={openAddModal}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by name, business, or mobile..." 
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
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Customer Info</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Contact Details</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status & Type</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Follow-up</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading CRM Data...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No customers found</td></tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{customer.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{customer.businessName}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div>{customer.mobile}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{customer.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 500 }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: customer.status === 'ACTIVE' ? 'var(--success)' : customer.status === 'LEAD' ? '#3b82f6' : 'var(--warning)' }}></span>
                        {customer.status}
                      </span>
                      <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {customer.type}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : <span style={{ color: 'var(--text-secondary)' }}>None</span>}
                    {customer.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={customer.notes}><FileText size={10} style={{display:'inline', marginRight: '4px'}}/>{customer.notes}</div>}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button onClick={() => openEditModal(customer)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Edit2 size={14} /> View / Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: 'var(--bg-secondary)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{isEditMode ? 'Customer Details & Edit' : 'Add New Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.5rem' }}>Basic Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required type="text" placeholder="Contact Name" className="input-field" style={{ marginBottom: 0 }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="text" placeholder="Business Name" className="input-field" style={{ marginBottom: 0 }} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required type="text" placeholder="Mobile Number" className="input-field" style={{ marginBottom: 0 }} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                <input type="email" placeholder="Email Address" className="input-field" style={{ marginBottom: 0 }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '1rem' }}>Business Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <select className="input-field" style={{ marginBottom: 0 }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
                <select className="input-field" style={{ marginBottom: 0 }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <input type="text" placeholder="GST No (Optional)" className="input-field" style={{ marginBottom: 0 }} value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
              </div>
              <input required type="text" placeholder="Full Address" className="input-field" style={{ marginBottom: 0 }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '1rem' }}>CRM Follow-up</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Follow-up Date</label>
                  <input type="date" className="input-field" style={{ marginBottom: 0 }} value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} />
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px'}}>Notes / Interaction History</label>
                  <textarea placeholder="Enter follow-up notes here..." className="input-field" style={{ marginBottom: 0, minHeight: '60px', resize: 'vertical' }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem 1rem' }}>Cancel</button>
                <button type="submit" className="btn-primary">{isEditMode ? 'Save Changes' : 'Create Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
