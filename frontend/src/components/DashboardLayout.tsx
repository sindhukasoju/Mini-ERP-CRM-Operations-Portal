import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.85rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'white' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-primary)' : 'transparent',
    textDecoration: 'none',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease',
    fontWeight: isActive ? 500 : 400,
  });

  return (
    <div className="glass-panel" style={{ width: '260px', height: '100%', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2rem 1.5rem' }}>
        <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
          ERP Portal
        </h2>
      </div>

      <div style={{ flex: 1, padding: '0 1rem' }}>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
            <LayoutDashboard size={18} style={{ marginRight: '0.75rem' }} /> Dashboard
          </NavLink>
          
          {(user.role === 'ADMIN' || user.role === 'SALES') && (
            <NavLink to="/customers" style={({ isActive }) => navItemStyle(isActive)}>
              <Users size={18} style={{ marginRight: '0.75rem' }} /> Customers
            </NavLink>
          )}

          {(user.role === 'ADMIN' || user.role === 'WAREHOUSE') && (
            <NavLink to="/products" style={({ isActive }) => navItemStyle(isActive)}>
              <Package size={18} style={{ marginRight: '0.75rem' }} /> Inventory
            </NavLink>
          )}

          {(user.role === 'ADMIN' || user.role === 'SALES') && (
            <NavLink to="/challans" style={({ isActive }) => navItemStyle(isActive)}>
              <FileText size={18} style={{ marginRight: '0.75rem' }} /> Sales Challans
            </NavLink>
          )}
        </nav>
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'white' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.role}</div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none', padding: '0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
        >
          <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
        </button>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
